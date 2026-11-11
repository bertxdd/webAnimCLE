const ANIMAL_VIDEOS = {
  "whale-shark": "https://www.youtube.com/watch?v=PXEoFoqB27k",
  "thresher-shark": "https://www.youtube.com/watch?v=sTlMuWFamzs",
  "sea-turtle": "https://www.youtube.com/watch?v=DHp5UkP_eKQ",
  "manta-ray": "https://www.youtube.com/watch?v=eTqCPxbvL8w",
};

/* To use your own transparent PNGs, drop them in assets/images/graphics/animals/
   and change the img value below (for example 'whale-shark.png'). */
const ANIMALS = [
  {
    id: "whale-shark",
    img: "whaleshark.png",
    name: "Whale shark",
    tag: "The largest fish in the sea",
    where: "Donsol Bay, Oslob, Tubbataha",
    d: 8,
    scale: 1.25, // <-- IMAGE SIZE for this animal. 1 = normal, 1.5 = bigger, 0.8 = smaller
    blurb:
      "A gentle plankton feeder with a spotted back, and a favorite for divers.",
    facts: [
      "Grows over 12 meters long.",
      "Light spots and stripes cover its body.",
      "Feeds on plankton.",
      "Best places to see it are Donsol Bay and Oslob. It also passes through Tubbataha Reef now and then.",
    ],
  },
  {
    id: "thresher-shark",
    img: "threshershark.png",
    name: "Thresher shark",
    tag: "The shark with a whip tail",
    where: "Malapascua Island",
    d: 6.5,
    scale: 1.25, // <-- IMAGE SIZE for this animal. 1 = normal, 1.5 = bigger, 0.8 = smaller
    blurb:
      "A shy deep-water shark that stuns its prey with a long, whip-like tail.",
    facts: [
      "Uses its tail to stun prey.",
      "Most often seen early in the morning, when it rises from deep water to clean and feed.",
      "The Philippines is one of the best places in the world to meet one, especially at Malapascua Island.",
    ],
  },
  {
    id: "sea-turtle",
    img: "seaturtle.png",
    name: "Green and hawksbill turtles",
    tag: "Reef grazers at risk",
    where: "Tubbataha Reef, Verde Island Passage",
    d: 9,
    scale: 1.25, // <-- IMAGE SIZE for this animal. 1 = normal, 1.5 = bigger, 0.8 = smaller
    blurb:
      "Two turtle species share Philippine reefs, and both are threatened by plastic.",
    facts: [
      "The green turtle is large and round. The hawksbill is known for its sharp-edged shell.",
      "Tubbataha Reef is a UNESCO World Heritage Site and a good place to find them.",
      "Turtles can mistake floating plastic for food, which is why shoreline cleanups matter.",
    ],
  },
  {
    id: "manta-ray",
    img: "mantaray.png",
    name: "Manta ray",
    tag: "Gentle giant of the reef",
    where: "Tubbataha Reef, Anilao",
    d: 7.5,
    scale: 1.25,
    blurb: "A graceful filter feeder with huge wing-like fins.",
    facts: [
      "Feeds mainly on plankton.",
      "Harmless to people, and sometimes curious enough to approach divers.",
      "Seen at dive sites such as Tubbataha Reef and Anilao.",
    ],
  },
];

(() => {
  const grid = document.querySelector("#animal-grid");
  if (!grid) return;
  const base = "assets/images/graphics/animals/";
  grid.innerHTML = ANIMALS.map(
    (
      a,
      i,
    ) => `<button class="animal" style="--i:${i};--d:${a.d}s;--s:${a.scale || 1}" data-id="${a.id}" aria-label="${a.name}. Open video and details">
    <div class="stage"><i style="left:12%;animation-delay:0s"></i><i style="left:34%;animation-delay:1.6s"></i><i style="left:62%;animation-delay:.8s"></i><i style="left:84%;animation-delay:2.4s"></i>
    <div class="art"><img src="${base}${a.img}" alt="" width="591" height="827" loading="lazy"></div>
    <span class="play" aria-hidden="true"><svg viewBox="0 0 24 24" width="20"><path d="M8 5v14l11-7z" fill="#08232a"/></svg></span></div>
    <div class="animal-body"><span class="tag">${a.tag}</span><h3>${a.name}</h3><p class="muted">${a.blurb}</p><small class="where">Where: ${a.where}</small></div></button>`,
  ).join("");

  const modal = document.createElement("div");
  modal.className = "animal-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML =
    '<div class="am-card"><button class="am-close" aria-label="Close">×</button><div class="am-video"></div><div class="am-info"></div></div>';
  document.body.appendChild(modal);
  const vid = modal.querySelector(".am-video"),
    info = modal.querySelector(".am-info"),
    closeBtn = modal.querySelector(".am-close");
  let opener = null;

  const ytId = (u) =>
    ((u || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/) ||
      [])[1];
  /* Morph animation: the card grows into the modal and shrinks back on close. */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const card = modal.querySelector(".am-card");
  let closing = false;
  const from = (r) => {
    const f = card.getBoundingClientRect();
    return `translate(${r.left - f.left}px,${r.top - f.top}px) scale(${r.width / f.width},${r.height / f.height})`;
  };
  const open = (id, btn) => {
    const a = ANIMALS.find((x) => x.id === id),
      yt = ytId(ANIMAL_VIDEOS[id]);
    opener = btn;
    vid.innerHTML = yt
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0" title="${a.name} video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
      : `<div class="am-empty"><img src="${base}${a.img}" alt=""><p>Video coming soon.</p></div>`;
    if (!yt)
      console.warn(
        `No YouTube link for "${id}". Paste one in ANIMAL_VIDEOS in assets/js/animals.js`,
      );
    info.innerHTML = `<span class="tag">${a.tag}</span><h3>${a.name}</h3><p class="muted">Where to look: ${a.where}</p><ul>${a.facts.map((f) => `<li>${f}</li>`).join("")}</ul><small class="muted">Source: Solitude World, Marine Life in the Philippines. Sightings vary with season and conditions.</small>`;
    modal.classList.add("open");
    closing = false;
    if (!reduce && btn) {
      const r = btn.getBoundingClientRect();
      card.animate(
        [
          { transform: from(r), opacity: 0.85 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 600, easing: "cubic-bezier(.2,.85,.25,1)" },
      );
      [vid, info].forEach((el, i) =>
        el.animate(
          [
            { opacity: 0, transform: "translateY(16px)" },
            { opacity: 0, transform: "translateY(16px)", offset: 0.5 },
            { opacity: 1, transform: "none" },
          ],
          { duration: 800 + i * 120, easing: "ease-out" },
        ),
      );
      modal.animate(
        [
          { backgroundColor: "rgba(4,18,22,0)" },
          { backgroundColor: "rgba(4,18,22,.9)" },
        ],
        { duration: 450 },
      );
      btn.style.visibility = "hidden";
    }
    closeBtn.focus({ preventScroll: true });
  };
  const finish = () => {
    card.getAnimations().forEach((x) => x.cancel());
    modal.getAnimations().forEach((x) => x.cancel());
    modal.classList.remove("open");
    closing = false;
    if (opener) {
      opener.style.visibility = "";
      opener.focus({ preventScroll: true });
    }
  };
  const close = () => {
    if (closing || !modal.classList.contains("open")) return;
    vid.innerHTML = "";
    if (reduce || !opener) return finish();
    closing = true;
    const r = opener.getBoundingClientRect();
    card.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: from(r), opacity: 0.2 },
      ],
      { duration: 450, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" },
    ).onfinish = finish;
    modal.animate(
      [
        { backgroundColor: "rgba(4,18,22,.9)" },
        { backgroundColor: "rgba(4,18,22,0)" },
      ],
      { duration: 450, fill: "forwards" },
    );
  };
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".animal");
    if (b) open(b.dataset.id, b);
  });
  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });

  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.2 },
  );
  grid.querySelectorAll(".animal").forEach((c) => io.observe(c));
})();
