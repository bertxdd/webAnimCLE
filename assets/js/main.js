(function () {
  var ctx,
    lenis,
    tick,
    started = false,
    offs = [];

  function init() {
    if (started) return;
    started = true;
    gsap.registerPlugin(ScrollTrigger);
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches,
      lite = document.documentElement.classList.contains("lite");
    var $ = function (s, r) {
      return Array.prototype.slice.call((r || document).querySelectorAll(s));
    };

    if (window.Lenis && !reduce) {
      lenis = new Lenis({ lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      tick = function (t) {
        lenis.raf(t * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // everything below is scoped to one context so destroy() can revert it
    ctx = gsap.context(function () {
      // pause decorative loops while they are off-screen so the GPU only works on what you can see
      function gate(tw, trig) {
        if (!tw || reduce) return tw;
        tw.pause();
        ScrollTrigger.create({
          trigger: trig,
          start: "top bottom",
          end: "bottom top",
          onToggle: function (s) {
            s.isActive ? tw.resume() : tw.pause();
          },
          onRefresh: function (s) {
            s.isActive ? tw.resume() : tw.pause();
          },
        });
        return tw;
      }
      // bubbles
      var box = document.getElementById("bubbles");
      for (var i = 0; i < (lite ? 0 : 12); i++) {
        var b = document.createElement("span"),
          s = gsap.utils.random(8, 34);
        b.className = "bubble";
        b.style.cssText =
          "width:" +
          s +
          "px;height:" +
          s +
          "px;left:" +
          gsap.utils.random(2, 96) +
          "%;top:" +
          gsap.utils.random(5, 95) +
          "%;opacity:" +
          gsap.utils.random(0.25, 0.7);
        box.appendChild(b);
        if (!reduce)
          gsap.to(b, {
            y: gsap.utils.random(-50, -120),
            x: gsap.utils.random(-18, 18),
            duration: gsap.utils.random(3, 6),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 3,
          });
      }
      if (!reduce) {
        // floating creatures & icons
        $("[data-float]").forEach(function (el) {
          gate(
            gsap.to(el, {
              y: "+=" + el.dataset.float,
              rotation: el.classList.contains("creature") ? 1.2 : 0,
              duration: gsap.utils.random(2.4, 3.6),
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }),
            el,
          );
        });
        // wave drift
        $("[data-wave]").forEach(function (w) {
          gate(
            gsap.to(w, {
              xPercent: (w.getAttribute("data-wave") === "-1" ? 1 : -1) * -25,
              duration: 9,
              ease: "none",
              repeat: -1,
              yoyo: true,
            }),
            "#hero",
          );
        });
      }

      // depth gradient: sunlit turquoise -> abyss across the whole page
      gsap
        .timeline({
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        })
        .to("#depth .d1", { opacity: 1, ease: "none", duration: 1 })
        .to("#depth .d2", { opacity: 1, ease: "none", duration: 1 })
        .to("#depth .d3", { opacity: 1, ease: "none", duration: 1 });

      // parallax: creatures drift at their own speed (yPercent is separate from the float's y)
      if (!reduce)
        $(".creature").forEach(function (el) {
          gsap.to(el, {
            yPercent: parseFloat(el.dataset.speed) * -2,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });
      if (!reduce && document.getElementById("hero"))
        gsap.to("#hero .wrap", {
          yPercent: -12,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

      // staggered reveals
      if ($(".reveal").length)
        ScrollTrigger.batch(".reveal", {
          start: "top 88%",
          onEnter: function (els) {
            gsap.fromTo(
              els,
              { y: 50, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.9,
                stagger: 0.12,
                ease: "power3.out",
                overwrite: true,
              },
            );
          },
          onLeaveBack: function (els) {
            gsap.to(els, { y: 50, opacity: 0, duration: 0.4, overwrite: true });
          },
        });
      if ($(".reveal").length) gsap.set(".reveal", { opacity: 0, y: 50 });

      // counters (set the three data-count values on the Our work stats to your real totals)
      $("[data-count]").forEach(function (el) {
        var o = { v: 0 },
          end = parseFloat(el.dataset.count),
          dec = +(el.dataset.dec || 0),
          suf = el.dataset.suffix || "";
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: function () {
            gsap.to(o, {
              v: end,
              duration: 2,
              ease: "power2.out",
              onUpdate: function () {
                el.textContent =
                  o.v.toLocaleString(undefined, {
                    minimumFractionDigits: dec,
                    maximumFractionDigits: dec,
                  }) + suf;
              },
            });
          },
        });
      });
      // marine life cards drift at different speeds
      if (!reduce)
        $("[data-drift]").forEach(function (el) {
          gsap.to(el, {
            y: parseFloat(el.dataset.drift),
            ease: "none",
            scrollTrigger: {
              trigger: "#wildlife",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });

      function on(el, ev, fn, o) {
        el.addEventListener(ev, fn, o);
        offs.push(function () {
          el.removeEventListener(ev, fn, o);
        });
      }

      // ===== animal cards: swim animation + video modal =====
      if (!reduce)
        $(".aimg").forEach(function (el, i) {
          el._swim = gate(
            gsap.to(el, {
              x: -8,
              y: -6,
              rotation: -1.5,
              duration: gsap.utils.random(2.4, 3.4),
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: i * 0.3,
            }),
            el.closest(".acard"),
          );
        });
      if (!reduce)
        $(".athumb .bb").forEach(function (el) {
          gate(
            gsap.fromTo(
              el,
              { y: 0, opacity: 0.8 },
              {
                y: -70,
                opacity: 0,
                duration: gsap.utils.random(3, 5),
                ease: "none",
                repeat: -1,
                delay: Math.random() * 3,
              },
            ),
            "#wildlife",
          );
        });
      // underwater scene behind each animal card (light rays, seabed, swaying seagrass and coral)
      var SCENE = {
        whale: ["#0b4a5e"],
        thresher: ["#0b4a5e"],
        turtle: ["#0b4a5e"],
        manta: ["#0b4a5e"],
      };
      $(".acard").forEach(function (c) {
        var th = c.querySelector(".athumb"),
          col = SCENE[c.dataset.id],
          s = document.createElement("div");
        th.style.background = col[0];
        s.className = "scene";
        s.innerHTML =
          '<i class="caus c1"></i><i class="caus c2"></i><i class="caus c3"></i><svg class="wv" viewBox="0 0 600 40" preserveAspectRatio="none"><path d="M0 20c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0V40H0z"/></svg><svg class="wv wv2" viewBox="0 0 600 40" preserveAspectRatio="none"><path d="M0 20c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0V40H0z"/></svg><svg viewBox="0 0 300 210" preserveAspectRatio="xMidYMax slice" fill="none" stroke-linecap="round"><path d="M0 210V190C70 178 130 198 200 188S275 182 300 190V210Z" fill="rgba(3,20,28,.55)"/><g class="sg"><path d="M26 200C18 178 34 166 26 140" stroke="#2DD4BF" stroke-width="4" opacity=".7"/></g><g class="sg"><path d="M40 202C48 182 34 170 44 148" stroke="#5eead4" stroke-width="3" opacity=".6"/></g><g class="sg"><path d="M14 203V176M14 190L4 174M14 184L24 168" stroke="#fb7185" stroke-width="5" opacity=".85"/></g><g class="sg"><path d="M274 202C266 184 282 172 274 150" stroke="#2DD4BF" stroke-width="4" opacity=".55"/></g><g class="sg"><path d="M214 198V176M214 186L206 172M214 182L224 168" stroke="#a78bfa" stroke-width="5" opacity=".65"/></g></svg>';
        th.insertBefore(s, th.firstChild);
        if (!reduce) {
          var img = c.querySelector(".aimg"),
            swim = img && img._swim;
          c.addEventListener("mouseenter", function () {
            if (swim) swim.timeScale(2.2);
            if (img)
              gsap.to(img, {
                scale: 1.12,
                xPercent: -4,
                duration: 0.45,
                ease: "power2.out",
                overwrite: "auto",
              });
          });
          c.addEventListener("mouseleave", function () {
            if (swim) swim.timeScale(1);
            if (img)
              gsap.to(img, {
                scale: 1,
                xPercent: 0,
                duration: 0.6,
                ease: "power2.out",
                overwrite: "auto",
              });
          });
        }
      });

      // Paste YouTube video IDs here (the part after v= in the link). Empty = shows a "Watch on YouTube" search link instead.
      var ANIMALS = {
        whale: {
          video: "Xqlfh_MYm8I",
          bullets: [
            "Grows over 12 meters long.",
            "Light spots and stripes cover its body.",
            "Feeds on plankton.",
            "Best places to see it are Donsol Bay and Oslob. It also passes through Tubbataha Reef now and then.",
          ],
          src: "Source: Solitude World, Marine Life in the Philippines. Sightings vary with season and conditions.",
        },
        thresher: {
          video: "sTlMuWFamzs",
          bullets: [
            "A shy deep-water shark.",
            "Stuns its prey with a long, whip-like tail.",
            "Best place to see it is Malapascua Island.",
          ],
          src: "Sightings vary with season and conditions.",
        },
        turtle: {
          video: "DHp5UkP_eKQ",
          bullets: [
            "Two species, green and hawksbill, share Philippine reefs.",
            "Both are threatened by plastic.",
            "Best places to see them are Tubbataha Reef and the Verde Island Passage.",
          ],
          src: "Sightings vary with season and conditions.",
        },
        manta: {
          video: "eTqCPxbvL8w",
          bullets: [
            "A graceful filter feeder.",
            "Has huge wing-like fins.",
            "Best places to see it are Tubbataha Reef and Anilao.",
          ],
          src: "Sightings vary with season and conditions.",
        },
      };
      var modal =
          document.getElementById("mvid") && document.getElementById("modal"),
        mvid = document.getElementById("mvid"),
        lastBtn = null;
      var mdlg = modal && modal.querySelector(".mdlg"),
        closing = false;
      function fromR(r) {
        var f = mdlg.getBoundingClientRect();
        return (
          "translate(" +
          (r.left - f.left) +
          "px," +
          (r.top - f.top) +
          "px) scale(" +
          r.width / f.width +
          "," +
          r.height / f.height +
          ")"
        );
      }
      function openM(card) {
        var d = ANIMALS[card.dataset.id],
          title = card.querySelector("h3").textContent;
        document.getElementById("mtag").textContent =
          card.querySelector(".tag").textContent;
        document.getElementById("mtitle").textContent = title;
        document.getElementById("mwhere").textContent = card
          .querySelector(".where")
          .textContent.replace("Where:", "Where to look:");
        document.getElementById("mlist").innerHTML = d.bullets
          .map(function (b) {
            return "<li>" + b + "</li>";
          })
          .join("");
        document.getElementById("msrc").textContent = d.src;
        var embed = d.video
          ? '<iframe src="https://www.youtube-nocookie.com/embed/' +
            d.video +
            '?autoplay=1&rel=0&playsinline=1" title="' +
            title +
            ' video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>'
          : '<div><p style="color:var(--ice);font-weight:700">Video coming soon</p><a class="btn" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=' +
            encodeURIComponent(title + " Philippines") +
            '">Watch on YouTube</a></div>';
        document.getElementById("mwatch").href = d.video
          ? "https://www.youtube.com/watch?v=" + d.video
          : "https://www.youtube.com/results?search_query=" +
            encodeURIComponent(title + " Philippines");
        mvid.innerHTML = "";
        modal.classList.add("open");
        document.documentElement.classList.add("modal-open");
        gsap.globalTimeline.pause();
        closing = false;
        lastBtn = card;
        if (lenis) lenis.stop();
        var loadEmbed = function () {
          if (modal.classList.contains("open") && !closing)
            mvid.innerHTML = embed;
        };
        if (!reduce) {
          var r = card.getBoundingClientRect();
          mdlg.style.willChange = "transform, opacity";
          mdlg.animate(
            [
              { transform: fromR(r), opacity: 0.85 },
              { transform: "none", opacity: 1 },
            ],
            { duration: 520, easing: "cubic-bezier(.2,.85,.25,1)" },
          ).onfinish = function () {
            mdlg.style.willChange = "";
            loadEmbed();
          };
          [mvid, modal.querySelector(".minfo")].forEach(function (el, i) {
            el.animate(
              [
                { opacity: 0, transform: "translateY(16px)" },
                { opacity: 0, transform: "translateY(16px)", offset: 0.5 },
                { opacity: 1, transform: "none" },
              ],
              { duration: 800 + i * 120, easing: "ease-out" },
            );
          });
          modal.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
          card.style.visibility = "hidden";
        } else loadEmbed();
        document.getElementById("mclose").focus({ preventScroll: true });
      }
      function finishM() {
        mdlg.getAnimations().forEach(function (x) {
          x.cancel();
        });
        modal.getAnimations().forEach(function (x) {
          x.cancel();
        });
        modal.classList.remove("open");
        document.documentElement.classList.remove("modal-open");
        gsap.globalTimeline.resume();
        closing = false;
        if (lenis) lenis.start();
        if (lastBtn) {
          lastBtn.style.visibility = "";
          lastBtn.querySelector(".play").focus({ preventScroll: true });
        }
      }
      function closeM() {
        if (closing || !modal.classList.contains("open")) return;
        mvid.innerHTML = "";
        if (reduce || !lastBtn) return finishM();
        closing = true;
        var r = lastBtn.getBoundingClientRect();
        mdlg.style.willChange = "transform, opacity";
        mdlg.animate(
          [
            { transform: "none", opacity: 1 },
            { transform: fromR(r), opacity: 0.2 },
          ],
          {
            duration: 380,
            easing: "cubic-bezier(.5,0,.75,0)",
            fill: "forwards",
          },
        ).onfinish = function () {
          mdlg.style.willChange = "";
          finishM();
        };
        modal.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 380,
          fill: "forwards",
        });
      }
      if ("IntersectionObserver" in window) {
        var vio = new IntersectionObserver(
          function (es) {
            es.forEach(function (e) {
              e.target.classList.toggle("offscreen", !e.isIntersecting);
            });
          },
          { rootMargin: "120px" },
        );
        $(".acard").forEach(function (c) {
          vio.observe(c);
        });
        offs.push(function () {
          vio.disconnect();
        });
      }
      if (modal)
        $(".acard").forEach(function (c) {
          on(c.querySelector(".athumb"), "click", function () {
            openM(c);
          });
        });
      if (modal) {
        on(document.getElementById("mclose"), "click", closeM);
        on(modal, "click", function (e) {
          if (e.target === modal) closeM();
        });
        on(document, "keydown", function (e) {
          if (e.key === "Escape" && modal.classList.contains("open")) closeM();
        });
        offs.push(function () {
          if (modal.classList.contains("open")) finishM();
        });
      }

      // subtle water ripples: a small pool of rings is reused, so nothing piles up. Off over the map and while the modal is open.
      var rip = document.getElementById("ripples"),
        lastR = 0,
        lx = -99,
        ly = -99;
      function blocked(t) {
        return (
          document.documentElement.classList.contains("modal-open") ||
          (t && t.closest && t.closest(".phwrap,#modal"))
        );
      }
      if (!reduce && !lite && rip) {
        var pool = [],
          pi = 0;
        for (var k = 0; k < 8; k++) {
          var d = document.createElement("i");
          d.className = "rip";
          rip.appendChild(d);
          gsap.set(d, { opacity: 0 });
          pool.push(d);
        }
        var ripple = function (x, y, big) {
          gsap.fromTo(
            pool[pi++ % pool.length],
            { x: x, y: y, scale: 0.2, opacity: big ? 0.5 : 0.28 },
            {
              scale: big ? 5 : 2.8,
              opacity: 0,
              duration: big ? 1 : 0.9,
              ease: "power2.out",
              overwrite: true,
            },
          );
        };
        on(window, "pointermove", function (e) {
          var now = performance.now();
          if (
            e.pointerType !== "mouse" ||
            now - lastR < 140 ||
            blocked(e.target)
          )
            return;
          if (Math.hypot(e.clientX - lx, e.clientY - ly) < 36) return;
          lastR = now;
          lx = e.clientX;
          ly = e.clientY;
          ripple(e.clientX, e.clientY, false);
        });
        on(window, "pointerdown", function (e) {
          if (!blocked(e.target)) ripple(e.clientX, e.clientY, true);
        });
      }
      offs.push(function () {
        rip.innerHTML = "";
      });

      // coral reef: sway, bubbles, and a rise-into-view parallax that sells the depth
      if (!reduce) {
        $(".reef .sway").forEach(function (el, i) {
          gsap.set(el, { transformOrigin: "50% 100%" });
          gate(
            gsap.to(el, {
              rotation: gsap.utils.random(2.5, 5) * (i % 2 ? 1 : -1),
              duration: gsap.utils.random(2.2, 3.8),
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: Math.random() * 2,
            }),
            ".reef",
          );
        });
        gsap.fromTo(
          ".reef-back",
          { y: 70 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".reef",
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );
        gsap.fromTo(
          ".reef-front",
          { y: 130 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".reef",
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );
        gsap.fromTo(
          ".reef-label",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".reef",
              start: "top 85%",
              end: "top 45%",
              scrub: true,
            },
          },
        );
      }

      // preloader -> hero intro
      var pre = document.getElementById("preloader");
      if (!pre) return;
      // decode the big PNGs now, while the preloader is showing, so the first paint after it does not stall
      Array.prototype.forEach.call(document.images, function (im) {
        if (im.decode) im.decode().catch(function () {});
      });
      var cnt = document.getElementById("count"),
        n = { v: 0 };
      gsap.set(".hero-in", { y: 40, opacity: 0 });
      if (lenis) lenis.stop();
      var tl = gsap.timeline({
        onComplete: function () {
          pre.style.display = "none";
          if (lenis) lenis.start();
          // measuring every trigger forces a full layout; do it when the browser is idle, not on the transition frame
          (
            window.requestIdleCallback ||
            function (f) {
              setTimeout(f, 250);
            }
          )(
            function () {
              ScrollTrigger.refresh();
            },
            { timeout: 1500 },
          );
        },
      });
      tl.to(
        "#fill",
        {
          yPercent: 0,
          y: 0,
          duration: reduce ? 0.3 : 2.4,
          ease: "power1.inOut",
          startAt: { yPercent: 100 },
        },
        0,
      )
        .to("#fill .pw1", { xPercent: -50, duration: 2.4, ease: "none" }, 0)
        .fromTo(
          "#fill .pw2",
          { xPercent: -50 },
          { xPercent: 0, duration: 2.4, ease: "none" },
          0,
        )
        .to(
          "#fill .pw3",
          { xPercent: -50, duration: 2.4, ease: "power1.inOut" },
          0,
        )
        .to(".pl-inner", { opacity: 0, duration: 0.4 }, "+=.15")
        .to(pre, { opacity: 0, duration: 0.9, ease: "power2.out" }, "<.1")
        .to(
          ".hero-in",
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.14,
            ease: "power3.out",
          },
          "-=.35",
        );
    });
  }

  // call destroy() when the page is torn down (or from a framework's unmount hook)
  function destroy() {
    if (!started) return;
    started = false;
    if (ctx) ctx.revert(); // kills tweens, timelines and ScrollTriggers made in the context
    offs.forEach(function (f) {
      f();
    });
    offs = [];
    if (tick) gsap.ticker.remove(tick);
    if (lenis) lenis.destroy();
    var box = document.getElementById("bubbles");
    if (box) box.innerHTML = "";
    ctx = lenis = tick = null;
  }

  window.AquaSave = { init: init, destroy: destroy };
  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);
  window.addEventListener("pagehide", destroy);
})();
