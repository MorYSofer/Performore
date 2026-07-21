/* Shared animation script for internal service pages (growth-strategy, …).
   Mirrors the motion language of scripts/main.js: GSAP + ScrollTrigger,
   transform/opacity only, reduced-motion safe. */

gsap.registerPlugin(ScrollTrigger);

const spReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mobile address-bar resizes re-measure everything; same guard as the homepage.
ScrollTrigger.config({ ignoreMobileResize: true });

// ── Nav scroll state ────────────────────────────────────────────────
(function () {
    const nav = document.querySelector("body > nav");
    if (!nav) return;
    const update = () => nav.classList.toggle("is-scrolled", window.scrollY > 44);
    window.addEventListener("scroll", update, { passive: true });
    update();
}());

// ── Hero intro ──────────────────────────────────────────────────────
(function () {
    const lines = gsap.utils.toArray(".sp-line");
    const crumbs = document.querySelector(".sp-crumbs");
    const lede = document.querySelector(".sp-lede");
    const actions = document.querySelector(".sp-actions");
    const cards = gsap.utils.toArray(".sp-card");
    const ambient = gsap.utils.toArray(".sp-ambient-label");
    if (!lines.length) return;

    if (spReduceMotion) return;

    const cardRotations = [-2.4, 2.2, -1.6];
    cards.forEach((card, i) => gsap.set(card, { rotation: cardRotations[i] || 0 }));

    gsap.set([crumbs, lede, actions], { opacity: 0, y: 22 });
    gsap.set(lines, { opacity: 0, y: 42 });
    gsap.set(cards, { opacity: 0, y: 34, scale: 0.96 });

    const tl = gsap.timeline({ delay: 0.15 });

    tl.to(crumbs, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
        .to(lines, { opacity: 1, y: 0, duration: 0.76, stagger: 0.1, ease: "power3.out" }, "-=0.25")
        .to(lede, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, "-=0.4")
        .to(actions, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.35")
        .to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.14, ease: "power3.out" }, "-=0.55")
        .add(() => {
            const floatConfigs = [
                { y: 15, x: -5, rot: -1.2, dur: 3.6, delay: 0.0 },
                { y: 19, x: 6, rot: 1.5, dur: 3.0, delay: 0.5 },
                { y: 12, x: 4, rot: -0.8, dur: 4.2, delay: 0.9 },
            ];
            cards.forEach((card, i) => {
                const c = floatConfigs[i] || floatConfigs[0];
                gsap.to(card, {
                    y: `+=${c.y}`,
                    x: `+=${c.x}`,
                    rotation: (cardRotations[i] || 0) + c.rot,
                    duration: c.dur,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: c.delay
                });
            });
            ambient.forEach((el, i) => {
                gsap.to(el, {
                    y: `+=${9 + i * 4}`,
                    x: `+=${i % 2 === 0 ? -(3 + i) : (3 + i)}`,
                    duration: 8 + i * 2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });
        });

    // Gentle parallax on the card cluster as the hero scrolls away
    gsap.to(".sp-hero-visual", {
        y: -46,
        ease: "none",
        scrollTrigger: {
            trigger: ".sp-hero",
            start: "top top",
            end: "bottom top",
            scrub: 1.4
        }
    });
}());

// ── Statement — scrubbed word reveal ────────────────────────────────
(function () {
    const body = document.querySelector(".sp-statement-body");
    if (!body) return;

    const raw = body.textContent.trim();
    body.innerHTML = raw.split(/\s+/).map(w => `<span class="sp-word">${w}</span>`).join(" ");

    if (spReduceMotion) return;

    const words = gsap.utils.toArray(".sp-word");
    const glow = document.querySelector(".sp-statement-glow");

    gsap.set(words, { opacity: 0.06, y: 18, filter: "blur(6px)" });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".sp-statement",
            start: "top 92%",
            end: "center center",
            scrub: 1.5
        }
    });

    if (glow) {
        tl.to(glow, { opacity: 1, duration: 0.25, ease: "none" }, 0)
          .to(glow, { opacity: 0, duration: 0.2, ease: "none" }, 0.82);
    }

    tl.to(words, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        ease: "none",
        stagger: { each: 0.05, ease: "none" },
        duration: 0.001
    }, 0.04);
}());

// ── Deliverables — head + row reveals ───────────────────────────────
(function () {
    const section = document.querySelector(".sp-deliver");
    if (!section || spReduceMotion) return;

    const head = section.querySelectorAll(".sp-deliver-head > *");
    const rows = gsap.utils.toArray(section.querySelectorAll(".sp-row"));

    gsap.set(head, { opacity: 0, y: 26 });
    gsap.to(head, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 74%", once: true }
    });

    rows.forEach((row) => {
        gsap.fromTo(row,
            { opacity: 0, y: 34 },
            {
                opacity: 1, y: 0, duration: 0.72, ease: "power3.out",
                scrollTrigger: { trigger: row, start: "top 88%", once: true }
            }
        );
    });
}());

// ── Process — rail draw + step activation ───────────────────────────
(function () {
    const section = document.querySelector(".sp-process");
    if (!section) return;

    const steps = gsap.utils.toArray(section.querySelectorAll(".sp-step"));
    const railFill = section.querySelector(".sp-rail-fill");
    const head = section.querySelectorAll(".sp-process-head > *");

    if (spReduceMotion) {
        steps.forEach((step) => step.classList.add("is-active"));
        if (railFill) railFill.style.transform = "scaleY(1)";
        return;
    }

    gsap.set(head, { opacity: 0, y: 26 });
    gsap.to(head, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 74%", once: true }
    });

    if (railFill) {
        gsap.to(railFill, {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
                trigger: ".sp-steps",
                start: "top 72%",
                end: "bottom 46%",
                scrub: 0.9,
                invalidateOnRefresh: true
            }
        });
    }

    steps.forEach((step) => {
        gsap.fromTo(step,
            { opacity: 0, y: 40 },
            {
                opacity: 1, y: 0, duration: 0.78, ease: "power3.out",
                scrollTrigger: { trigger: step, start: "top 86%", once: true }
            }
        );

        ScrollTrigger.create({
            trigger: step,
            start: "top 62%",
            end: "bottom 30%",
            onToggle: (self) => step.classList.toggle("is-active", self.isActive)
        });
    });
}());

// ── Metrics — tile reveal + count-up ────────────────────────────────
(function () {
    const section = document.querySelector(".sp-metrics");
    if (!section) return;

    const head = section.querySelectorAll(".sp-metrics-head > *");
    const tiles = gsap.utils.toArray(section.querySelectorAll(".sp-tile"));
    const note = section.querySelector(".sp-tiles-note");

    if (spReduceMotion) return;

    gsap.set(head, { opacity: 0, y: 26 });
    gsap.set(tiles, { opacity: 0, y: 30 });
    if (note) gsap.set(note, { opacity: 0 });

    const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 72%", once: true }
    });

    tl.to(head, { opacity: 1, y: 0, duration: 0.65, stagger: 0.09, ease: "power3.out" }, 0)
      .to(tiles, { opacity: 1, y: 0, duration: 0.72, stagger: 0.11, ease: "power3.out" }, 0.2);

    if (note) tl.to(note, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.9);

    // Count each value up from zero once its tile lands
    tl.call(() => {
        tiles.forEach((tile, i) => {
            const el = tile.querySelector("[data-count-to]");
            if (!el) return;
            const to = parseFloat(el.dataset.countTo);
            const decimals = parseInt(el.dataset.decimals || "0", 10);
            const prefix = el.dataset.prefix || "";
            const suffix = el.dataset.suffix || "";
            const obj = { v: 0 };
            gsap.to(obj, {
                v: to,
                duration: 1.1,
                ease: "power2.out",
                delay: i * 0.12,
                onUpdate: () => {
                    el.textContent = prefix + obj.v.toFixed(decimals) + suffix;
                }
            });
        });
    }, [], 0.45);
}());

// ── Generic scroll reveal for page-specific sections ────────────────
// Any element with [data-reveal] rises in when it enters the viewport.
// Optional data-reveal-delay="0.15" staggers siblings.
(function () {
    const els = gsap.utils.toArray("[data-reveal]");
    if (!els.length || spReduceMotion) return;

    els.forEach((el) => {
        gsap.fromTo(el,
            { opacity: 0, y: 32 },
            {
                opacity: 1, y: 0, duration: 0.75, ease: "power3.out",
                delay: parseFloat(el.dataset.revealDelay || "0"),
                scrollTrigger: { trigger: el, start: "top 86%", once: true }
            }
        );
    });
}());

// ── Generic bar fill — [data-bar-fill] grows from the left on enter ─
// Wrap related bars in [data-bar-group] so they trigger together;
// stagger with data-bar-delay="0.2".
(function () {
    const bars = gsap.utils.toArray("[data-bar-fill]");
    if (!bars.length || spReduceMotion) return;

    bars.forEach((bar) => {
        gsap.fromTo(bar,
            { scaleX: 0 },
            {
                scaleX: 1, transformOrigin: "left center", duration: 1.05, ease: "power3.inOut",
                delay: parseFloat(bar.dataset.barDelay || "0"),
                scrollTrigger: { trigger: bar.closest("[data-bar-group]") || bar, start: "top 84%", once: true }
            }
        );
    });
}());

// ── Book-a-call CTA reveal (reuses homepage markup) ─────────────────
(function () {
    const section = document.querySelector(".book-call-section");
    if (!section || spReduceMotion) return;

    const copy = section.querySelectorAll(".book-call-copy > *");
    const visual = section.querySelector(".book-call-visual");

    gsap.set(copy, { opacity: 0, y: 28 });
    if (visual) gsap.set(visual, { opacity: 0, y: 36, scale: 0.985 });

    gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 72%", once: true }
    })
        .to(copy, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" }, 0)
        .to(visual, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out" }, 0.2);
}());

// ── Layout-shift safety: refresh pins after images/fonts settle ─────
window.addEventListener("load", () => ScrollTrigger.refresh(true));
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh(true));
}
