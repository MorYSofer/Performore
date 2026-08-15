/* Inline script block 1 extracted from / */
gsap.registerPlugin(ScrollTrigger);

// ── Hero intro timeline ────────────────────────────────────────────────────
const baseRotations = [-3, 2, 4, -2, 1.5];
const growthCards = gsap.utils.toArray(".growth-card");

growthCards.forEach((card, i) => {
    gsap.set(card, { rotation: baseRotations[i] });
});

const leftCards = [growthCards[0], growthCards[2]];
const rightCards = [growthCards[1], growthCards[3], growthCards[4]];

gsap.set(leftCards, { x: -36, opacity: 0 });
gsap.set(rightCards, { x: 36, opacity: 0 });

const heroTl = gsap.timeline({ delay: 0.2 });

heroTl
    .to(".hero-line", { y: 0, opacity: 1, duration: 0.76, stagger: 0.1, ease: "power3.out" })
    .to(".hero-actions", { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, "-=0.3")
    .to(leftCards, { x: 0, opacity: 1, duration: 0.9, stagger: 0.14, ease: "power3.out" }, "-=0.55")
    .to(rightCards, { x: 0, opacity: 1, duration: 0.9, stagger: 0.14, ease: "power3.out" }, "<0.08")
    .add(() => {
        const floatConfigs = [
            { y: 16, x: -4, rot: -1.4, dur: 3.4, delay: 0.0 },
            { y: 13, x: 5, rot: -0.9, dur: 3.8, delay: 0.25 },
            { y: 20, x: -6, rot: 1.6, dur: 2.9, delay: 0.8 },
            { y: 22, x: 7, rot: 2.2, dur: 2.7, delay: 1.1 },
            { y: 11, x: 4, rot: -0.7, dur: 4.4, delay: 0.55 },
        ];

        growthCards.forEach((card, i) => {
            const c = floatConfigs[i];
            gsap.to(card, {
                y: `+=${c.y}`,
                x: `+=${c.x}`,
                rotation: baseRotations[i] + c.rot,
                duration: c.dur,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: c.delay
            });
        });

        document.querySelectorAll(".ambient-label").forEach((el, i) => {
            gsap.to(el, {
                y: `+=${10 + i * 4}`,
                x: `+=${i % 2 === 0 ? -(3 + i) : (3 + i)}`,
                duration: 8 + i * 2.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
    });

gsap.timeline({
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.6
    }
})
    .to(leftCards, { x: "-=28", y: "-=18", ease: "none" }, 0)
    .to(rightCards, { x: "+=28", y: "-=12", ease: "none" }, 0);

// Growth trajectory — draw forward while scrolling down, rewind on scroll back.
const trajectoryShell = document.querySelector(".growth-trajectory-shell");
const trajectoryHead = document.querySelector(".growth-trajectory-head");
const trajectoryFrame = document.querySelector(".growth-chart-frame");
const trajectoryArea = document.querySelector(".growth-area");
const trajectoryAxis = document.querySelector(".growth-axis");
const trajectoryPaths = gsap.utils.toArray(".growth-path");
const trajectoryPoints = gsap.utils.toArray(".growth-point");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (trajectoryShell && trajectoryPaths.length && !reduceMotion) {
    trajectoryPaths.forEach((path) => {
        const pathLength = path.getTotalLength();
        gsap.set(path, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength
        });
    });

    gsap.set(trajectoryArea, {
        opacity: 0,
        y: 16,
        clipPath: "inset(0 100% 0 0)"
    });
    gsap.set(trajectoryPoints, { opacity: 0, scale: 0.86, transformOrigin: "center" });

    gsap.timeline({
        scrollTrigger: {
            trigger: ".growth-trajectory",
            start: "top 88%",
            end: "bottom 42%",
            scrub: 1.05,
            invalidateOnRefresh: true
        }
    })
        .fromTo(trajectoryShell,
            { opacity: 0, y: 34, scale: 0.985 },
            { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "none" },
            0
        )
        .fromTo(trajectoryHead,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.18, ease: "none" },
            0.08
        )
        .fromTo(trajectoryFrame,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.22, ease: "none" },
            0.1
        )
        .to(trajectoryPaths, { strokeDashoffset: 0, duration: 0.78, ease: "none" }, 0.2)
        .to(trajectoryArea, {
            opacity: 1,
            y: 0,
            clipPath: "inset(0 0% 0 0)",
            duration: 0.78,
            ease: "none"
        }, 0.2)
        .to(trajectoryPoints, {
            opacity: 1,
            scale: 1,
            duration: 0.28,
            stagger: 0.08,
            ease: "none"
        }, 0.56)
        .fromTo(trajectoryAxis,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.22, ease: "none" },
            0.56
        );
}

// Statement — cinematic scrubbed word reveal
(function () {
    const stmtBody = document.querySelector(".statement-body");
    if (!stmtBody) return;

    // split into individual word spans
    const raw = stmtBody.textContent.trim();
    stmtBody.innerHTML = raw.split(/\s+/).map(w =>
        `<span class="stmt-word">${w}</span>`
    ).join(' ');

    const words = gsap.utils.toArray(".stmt-word");
    const glow  = document.querySelector(".statement-glow");

    // start every word invisible + slightly lifted + blurred
    gsap.set(words, { opacity: 0.06, y: 18, filter: "blur(6px)" });
    if (glow) gsap.set(glow, { opacity: 0 });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".statement-section",
            start: "top 92%",
            end:   "center center",
            scrub: 1.5,
        }
    });

    // ambient glow fades in as first words appear, out near the end
    if (glow) {
        tl.to(glow, { opacity: 1, duration: 0.25, ease: "none" }, 0)
          .to(glow, { opacity: 0, duration: 0.2,  ease: "none" }, 0.82);
    }

    // words light up sequentially — opacity, y, and blur clear together
    tl.to(words, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        ease: "none",
        stagger: { each: 0.04, ease: "none" },
        duration: 0.001,
    }, 0.04);
}());

// Growth pillars — hover-reveal interaction
(function () {
    const section = document.querySelector(".pillars-section");
    if (!section || section.hidden || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const card = section.querySelector(".pillars-card");
    const title = section.querySelector(".pillars-title");
    const diagram = section.querySelector(".pillars-diagram");
    const svg = section.querySelector(".pillars-svg");
    const pillarDetails = gsap.utils.toArray(section.querySelectorAll(".pillar-detail"));
    const nodes = [
        section.querySelector(".pn-top"),
        section.querySelector(".pn-right"),
        section.querySelector(".pn-left"),
        section.querySelector(".pn-bottom")
    ].filter(Boolean);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeIndex = -1;

    if (!card || !title || !diagram || !svg) return;

    if (!title.querySelector(".pillars-title-word")) {
        title.innerHTML = title.textContent.trim().split(/\s+/).map((word) =>
            `<span class="pillars-title-word">${word}</span>`
        ).join(" ");
    }

    const titleWords = gsap.utils.toArray(title.querySelectorAll(".pillars-title-word"));
    const svgLabels = gsap.utils.toArray(svg.querySelectorAll("text"));
    const staticStrokes = gsap.utils.toArray(svg.querySelectorAll("line:not([style*='animation']), path:not([style*='animation'])"));

    // Node order: top=MediaBuying(0), right=CreativeStrategy(1), left=DataAnalysis(2), bottom=BusinessOutcomes(3)
    function setActivePillar(index) {
        if (index === activeIndex) return;
        activeIndex = index;
        nodes.forEach((node, i) => node.classList.toggle("is-active", i === index));
        pillarDetails.forEach((detail, i) => detail.classList.toggle("is-active", i === index));
    }

    // Hover wiring — each node reveals its corresponding left-panel card
    nodes.forEach((node, i) => {
        node.addEventListener("mouseenter", () => setActivePillar(i));
    });

    // First pillar active on load
    setActivePillar(0);

    if (reduceMotion) {
        gsap.set([...titleWords, diagram, ...svgLabels], { autoAlpha: 1, clearProps: "transform,filter" });
        return;
    }

    // Scroll-reveal (no pin — section scrolls normally)
    gsap.set(titleWords, { autoAlpha: 0, y: 34, filter: "blur(8px)" });
    gsap.set(diagram, { autoAlpha: 0, y: 44, scale: 0.955, transformOrigin: "50% 50%" });
    gsap.set(svgLabels, { autoAlpha: 0, y: 8 });

    staticStrokes.forEach((stroke) => {
        if (typeof stroke.getTotalLength !== "function") return;
        try {
            const length = stroke.getTotalLength();
            if (Number.isFinite(length) && length > 0) {
                gsap.set(stroke, { strokeDasharray: length, strokeDashoffset: length });
            }
        } catch (e) {}
    });

    gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 72%", once: true }
    })
        .to(titleWords, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.62, stagger: 0.055, ease: "power3.out" }, 0)
        .to(diagram, { autoAlpha: 1, y: 0, scale: 1, duration: 0.82, ease: "power3.out" }, 0.18)
        .to(staticStrokes, { strokeDashoffset: 0, duration: 0.9, stagger: 0.018, ease: "power2.inOut" }, 0.36)
        .to(svgLabels, { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.035, ease: "power2.out" }, 0.52);
}());

const navLinks = gsap.utils.toArray(".nav-links a[data-nav-link]");
const navNotch = document.querySelector(".nav-notch");
const navContainer = document.querySelector(".nav-links");
const navSections = gsap.utils.toArray("[data-nav-section]");
let currentNavValue = "";
let navFrame = null;

function moveNavNotch(link) {
    if (!link || !navNotch || !navContainer) return;
    const navRect = navContainer.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    navNotch.style.width = `${linkRect.width}px`;
    navNotch.style.transform = `translate3d(${linkRect.left - navRect.left}px, 0, 0)`;
    navNotch.style.opacity = "1";
}

function setActiveNav(value) {
    if (!value || value === currentNavValue) return;
    currentNavValue = value;
    navLinks.forEach((link) => {
        const isActive = link.dataset.navLink === value;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
        if (isActive) moveNavNotch(link);
    });
}

function updateActiveNav() {
    navFrame = null;
    const viewportAnchor = window.innerHeight * 0.42;
    let bestSection = navSections[0];
    let bestDistance = Infinity;

    navSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height * 0.28 - viewportAnchor);
        if (rect.bottom > 90 && rect.top < window.innerHeight && distance < bestDistance) {
            bestDistance = distance;
            bestSection = section;
        }
    });

    setActiveNav(bestSection?.dataset.navSection);
}

function requestNavUpdate() {
    if (navFrame) return;
    navFrame = requestAnimationFrame(updateActiveNav);
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        setActiveNav(link.dataset.navLink);
    });
});

window.addEventListener("scroll", requestNavUpdate, { passive: true });
window.addEventListener("resize", () => {
    const activeLink = navLinks.find((link) => link.dataset.navLink === currentNavValue);
    moveNavNotch(activeLink);
    requestNavUpdate();
});

setActiveNav("home");
requestNavUpdate();

const proofMetrics = gsap.utils.toArray(".proof-metric");
const proofTrack = document.querySelector(".proof-metrics");
const proofWindow = document.querySelector(".proof-window");
const proofSection = document.querySelector(".proof-section");

function setActiveProofMetric(index) {
    proofMetrics.forEach((metric, metricIndex) => {
        metric.classList.toggle("is-active", metricIndex === index);
    });
}

if (proofSection && !proofSection.hidden && proofTrack && proofWindow && proofMetrics.length) {
    const getProofOffset = (index) => {
        const metric = proofMetrics[index];
        return -metric.offsetTop - (metric.offsetHeight / 2) + (proofWindow.offsetHeight / 2);
    };

    gsap.set(proofTrack, { y: () => getProofOffset(0) });

    const proofTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: proofSection,
            start: "top top",
            end: () => `+=${window.innerHeight * (proofMetrics.length - 1)}`,
            pin: ".proof-pin",
            scrub: 0.85,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                const activeIndex = Math.min(
                    proofMetrics.length - 1,
                    Math.round(self.progress * (proofMetrics.length - 1))
                );
                setActiveProofMetric(activeIndex);
            }
        }
    });

    proofMetrics.slice(1).forEach((_, index) => {
        proofTimeline.to(proofTrack, {
            y: () => getProofOffset(index + 1),
            ease: "none",
            duration: 1
        });
    });

    ScrollTrigger.addEventListener("refreshInit", () => {
        setActiveProofMetric(0);
        // Re-centre the metric track on every refresh so font/resize reflow
        // can't leave the results panel misaligned.
        gsap.set(proofTrack, { y: getProofOffset(0) });
    });
}

const logoCloudSection = document.querySelector(".logo-cloud-section");

if (logoCloudSection) {
    const logoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                logoCloudSection.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.24 });

    logoObserver.observe(logoCloudSection);
}

document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
        const nextItem = button.closest(".faq-item");
        const shouldOpen = !nextItem.classList.contains("is-open");

        document.querySelectorAll(".faq-item").forEach((item) => {
            const isNext = shouldOpen && item === nextItem;
            item.classList.toggle("is-open", isNext);
            item.querySelector(".faq-question").setAttribute("aria-expanded", String(isNext));
        });
    });
});

// ── Services Section ────────────────────────────────────────────
(function () {
    const SVC_DATA = [
        {
            title: "Growth Strategy",
            url: "/growth-strategy",
            image: "design_components/SVG - ABSTRACTS - 110 UNITS/21.svg",
            icon: "design_components/SVG - ABSTRACTS - 110 UNITS/35.svg",
            badge1: { num: "50+", lbl: "BRANDS<br>GROWN", icon: "design_components/SVG - ABSTRACTS - 110 UNITS/95.svg" },
            badge2: { num: "18%", lbl: "LEAD CLOSE<br>RATE", icon: "design_components/SVG - ABSTRACTS - 110 UNITS/38.svg" },
        },
        {
            title: "Algorithm Training",
            url: "/algorithm-training",
            image: "design_components/SVG - ABSTRACTS - 110 UNITS/64.svg",
            icon: "design_components/SVG - ABSTRACTS - 110 UNITS/10.svg",
            badge1: { num: "24/7", lbl: "REAL-TIME<br>SIGNALS", icon: "design_components/SVG - ABSTRACTS - 110 UNITS/108.svg" },
            badge2: { num: "3.2×", lbl: "TARGETING<br>LIFT", icon: "design_components/SVG - ABSTRACTS - 110 UNITS/21.svg" },
        },
        {
            title: "Creative Strategy",
            url: "/creative-strategy",
            image: "design_components/SVG - ABSTRACTS - 110 UNITS/38.svg",
            icon: "design_components/SVG - ABSTRACTS - 110 UNITS/73.svg",
            badge1: { num: "+340%", lbl: "CTR<br>UPLIFT", icon: "design_components/SVG - ABSTRACTS - 110 UNITS/102.svg" },
            badge2: { num: "94.6%", lbl: "CONFIDENCE<br>LEVEL", icon: "design_components/SVG - ABSTRACTS - 110 UNITS/17.svg" },
        },
        {
            title: "Media Buying",
            url: "/media-buying",
            image: "design_components/SVG - ABSTRACTS - 110 UNITS/10.svg",
            icon: "design_components/SVG - ABSTRACTS - 110 UNITS/64.svg",
            badge1: { num: "4.8×", lbl: "ROAS<br>AVERAGE", icon: "design_components/SVG - ABSTRACTS - 110 UNITS/81.svg" },
            badge2: { num: "$84k", lbl: "MANAGED<br>SPEND", icon: "design_components/SVG - ABSTRACTS - 110 UNITS/49.svg" },
        },
        {
            title: "SEO & GEO",
            url: "/seo-geo",
            image: "design_components/SVG - ABSTRACTS - 110 UNITS/56.svg",
            icon: "design_components/SVG - ABSTRACTS - 110 UNITS/88.svg",
            badge1: { num: "+182%", lbl: "ORGANIC<br>SESSIONS", icon: "design_components/SVG - ABSTRACTS - 110 UNITS/44.svg" },
            badge2: { num: "34%", lbl: "SHARE OF<br>SEARCH", icon: "design_components/SVG - ABSTRACTS - 110 UNITS/29.svg" },
        },
    ];

    const AUTO_MS = 4000;
    let activeIdx = 0;
    let isPaused  = false;
    let svcTimer  = null;

    const namesEl   = document.getElementById("svcNames");
    const imgsEl    = document.getElementById("svcCardImgs");
    const badgeIcon1 = document.getElementById("svcBadgeIcon1");
    const badgeIcon2 = document.getElementById("svcBadgeIcon2");
    if (!namesEl || !imgsEl) return;

    // Build images
    SVC_DATA.forEach((svc, i) => {
        const img = document.createElement("img");
        img.src       = svc.image;
        img.alt       = svc.title;
        img.className = "svc-card-img" + (i === 0 ? " is-active" : "");
        img.loading   = "lazy";
        img.decoding  = "async";
        imgsEl.appendChild(img);
    });

    // Build name items — services with a page become links, the rest stay buttons
    SVC_DATA.forEach((svc, i) => {
        const isLink = Boolean(svc.url);
        const item = document.createElement(isLink ? "a" : "button");
        if (isLink) {
            item.href = svc.url;
        } else {
            item.type = "button";
            item.setAttribute("aria-pressed", i === 0 ? "true" : "false");
        }
        item.className = "svc-name-item" + (i === 0 ? " is-active" : "");
        item.innerHTML = `<span class="svc-name-icon" aria-hidden="true"><img src="${svc.icon}" alt="" loading="lazy" decoding="async"></span><span class="svc-name-text">${svc.title}</span>` +
            (isLink ? `<span class="svc-name-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></span>` : "");
        item.addEventListener("mouseenter", () => svcSwitch(i));
        if (!isLink) item.addEventListener("click", () => svcSwitch(i));
        namesEl.appendChild(item);
    });

    // Init badges for first service
    updateBadges(0);

    function updateBadges(idx) {
        const s = SVC_DATA[idx];
        if (badgeIcon1 && s.badge1 && s.badge1.icon) badgeIcon1.src = s.badge1.icon;
        if (badgeIcon2 && s.badge2 && s.badge2.icon) badgeIcon2.src = s.badge2.icon;
    }

    function svcSwitch(newIdx) {
        if (newIdx === activeIdx) return;
        const items = namesEl.querySelectorAll(".svc-name-item");
        const imgs  = imgsEl.querySelectorAll(".svc-card-img");

        items[activeIdx].classList.remove("is-active");
        if (items[activeIdx].tagName === "BUTTON") items[activeIdx].setAttribute("aria-pressed", "false");
        imgs[activeIdx].classList.remove("is-active");

        items[newIdx].classList.add("is-active");
        if (items[newIdx].tagName === "BUTTON") items[newIdx].setAttribute("aria-pressed", "true");
        imgs[newIdx].classList.add("is-active");

        activeIdx = newIdx;
        updateBadges(newIdx);
        restartTimer();
    }

    function restartTimer() {
        clearInterval(svcTimer);
        svcTimer = setInterval(() => {
            if (!isPaused) svcSwitch((activeIdx + 1) % SVC_DATA.length);
        }, AUTO_MS);
    }

    namesEl.addEventListener("mouseenter", () => { isPaused = true;  });
    namesEl.addEventListener("mouseleave", () => { isPaused = false; });

    restartTimer();
}());

// ── Page-load intro: PERFORMORE curtain ──────────────────────────────
(function () {
    const curtain = document.getElementById("themeCurtain");
    const overlay = document.getElementById("curtainTextOverlay");
    const HOLD    = 1500; // ms the text stays visible
    const RISE    = 620;  // ms the curtain takes to lift
    const EASE    = "cubic-bezier(0.76, 0, 0.24, 1)";

    const WORD     = "PERFORMORE";
    const GRADIENT = "linear-gradient(90deg, #e8e0ff 0%, #818cf8 30%, #4f7af4 62%, #1de8b5 100%)";
    const SUB      = "Senior Growth Thinking";

    // Cover the screen immediately — no transition flash
    curtain.style.transition = "none";
    curtain.style.background = "#000000";
    curtain.style.transform  = "scaleY(1)";

    // Build PERFORMORE with blurred stagger
    const wordEl = document.createElement("div");
    wordEl.className = "curtain-word curtain-word-performore";

    WORD.split("").forEach((char, i) => {
        const span = document.createElement("span");
        span.className    = "curtain-letter";
        span.textContent  = char;

        const pct = (i / (WORD.length - 1)) * 100;
        span.style.backgroundImage      = GRADIENT;
        span.style.backgroundSize       = `${WORD.length * 100}% 100%`;
        span.style.backgroundPosition   = `${pct}% 0`;
        span.style.webkitBackgroundClip = "text";
        span.style.webkitTextFillColor  = "transparent";
        span.style.backgroundClip       = "text";
        span.style.animationDelay       = `${i * 0.035}s`;

        wordEl.appendChild(span);
    });

    const subEl       = document.createElement("div");
    subEl.className   = "curtain-sub";
    subEl.textContent = SUB;
    subEl.style.color = "rgba(255,255,255,0.28)";

    overlay.appendChild(wordEl);
    overlay.appendChild(subEl);
    overlay.style.opacity = "1";

    // After HOLD ms: fade text, then lift curtain
    setTimeout(() => {
        overlay.style.transition = "opacity 0.25s ease";
        overlay.style.opacity    = "0";

        curtain.style.transition = `transform ${RISE}ms ${EASE}`;
        curtain.style.transform  = "scaleY(0)";

        setTimeout(() => { overlay.innerHTML = ""; }, 300);
    }, HOLD);
}());

/* Inline script block 2 extracted from / */
if (typeof ScrollTrigger !== 'undefined') {
    // Mobile address-bar show/hide changes 100vh and constantly re-measures
    // pins, which can leave a pinned section overlapping its neighbours.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Pin positions depend on the height of everything above each pinned
    // section. Recompute them after every event that can shift that layout:
    // images finishing (load) and web fonts swapping in (fonts.ready).
    // `load` and `fonts.ready` usually fire within a few ms of each other, so
    // debounce them into a SINGLE refresh — two back-to-back refreshes made the
    // pinned Creative Loop tear down and rebuild twice, which showed up as the
    // section "loading twice" and briefly leaving a gap before the next one.
    let refreshTimer;
    const refreshTriggers = () => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 180);
    };
    window.addEventListener('load', refreshTriggers);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(refreshTriggers);
    }

    // Let other modules (e.g. the cookie-consent modal, which locks/unlocks page
    // scroll) ask pinned sections to recompute after they change the layout.
    window.pmRefreshScrollTriggers = refreshTriggers;
}

// ── Nav scroll state ────────────────────────────────────────────────
(function () {
    const nav = document.querySelector('body > nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 44);
    window.addEventListener('scroll', update, { passive: true });
    update();
}());

(function() {
    const cards = document.querySelectorAll('[data-glow-card]');

    cards.forEach(card => {
        const hue    = card.getAttribute('data-glow-hue')    || '220';
        const spread = card.getAttribute('data-glow-spread') || '200';
        card.style.setProperty('--base',   hue);
        card.style.setProperty('--spread', spread);

        const blob = card.querySelector('.gc-blob');

        card.addEventListener('mouseenter', function() {
            if (blob) blob.style.opacity = '0.65';
        });
        card.addEventListener('mouseleave', function() {
            if (blob) blob.style.opacity = '0';
            card.style.setProperty('--x', '-9999');
            card.style.setProperty('--y', '-9999');
        });
    });

    document.addEventListener('pointermove', function(e) {
        const xp = (e.clientX / window.innerWidth).toFixed(4);

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x',  x.toFixed(2));
            card.style.setProperty('--y',  y.toFixed(2));
            card.style.setProperty('--xp', xp);

            const blob = card.querySelector('.gc-blob');
            if (blob) {
                blob.style.left = x + 'px';
                blob.style.top  = y + 'px';
            }
        });
    });
}());

// ── Growth Components bento — scroll-driven alive animation ─────────────────
(function () {
    const section = document.querySelector('.gc-section');
    if (!section) return;

    const headerEl    = section.querySelector('.gc-header');
    const itemA       = section.querySelector('.gc-item-a');
    const itemB       = section.querySelector('.gc-item-b');
    const itemC       = section.querySelector('.gc-item-c');
    const itemD       = section.querySelector('.gc-item-d');

    // Reduced motion: skip to final state immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        [headerEl, itemA, itemB, itemC, itemD]
            .forEach(el => el && gsap.set(el, { opacity: 1, clearProps: 'transform' }));
        return;
    }

    // ── Widget element references ──────────────────────────────────────────
    const fBars        = itemA.querySelectorAll('.gc-fbar');
    const abFills      = itemB.querySelectorAll('.gc-ab-fill');
    const abRates      = itemB.querySelectorAll('.gc-ab-rate');
    const abConf       = itemB.querySelector('.gc-ab-conf');
    const eventVals    = itemC.querySelectorAll('.gc-event-val');
    const dMetricVals  = itemD.querySelectorAll('.gc-metric-val');
    const dChartPaths  = itemD.querySelectorAll('.gc-chart path');

    // ── Store numeric targets before zeroing ──────────────────────────────
    const abRateTargets  = Array.from(abRates).map(el => parseFloat(el.textContent));
    const abConfTarget   = parseFloat(abConf.textContent);
    const eventTargets   = Array.from(eventVals).map(el => parseFloat(el.textContent));
    const dCountData     = [
        { fmt: v => '$' + Math.round(v),       to: 42  },
        { fmt: v => '$' + Math.round(v),       to: 840 },
        { fmt: v => v.toFixed(1) + 'mo',       to: 3.2 },
    ];

    // ── Set all initial GSAP states ────────────────────────────────────────
    gsap.set(headerEl, { opacity: 0, y: 32 });
    gsap.set(itemA,    { opacity: 0, x: -56, scale: 0.93 });
    gsap.set(itemB,    { opacity: 0, y: -46, scale: 0.93 });
    gsap.set(itemC,    { opacity: 0, x:  56, scale: 0.93 });
    gsap.set(itemD,    { opacity: 0, y:  46, scale: 0.93 });

    // Widget initial states
    gsap.set(fBars,       { scaleY: 0, transformOrigin: 'bottom center' });
    gsap.set(abFills,     { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(abRates,     { opacity: 0 });
    gsap.set(abConf,      { opacity: 0 });
    gsap.set(eventVals,   { opacity: 0 });
    gsap.set(dMetricVals, { opacity: 0 });

    // SVG line chart draw setup
    const linePath = dChartPaths[0];
    const areaPath = dChartPaths[1];
    if (linePath) {
        const len = linePath.getTotalLength();
        gsap.set(linePath, { strokeDasharray: len, strokeDashoffset: len });
    }
    if (areaPath) gsap.set(areaPath, { opacity: 0 });

    // ── Counter helper ─────────────────────────────────────────────────────
    function countUp(el, to, fmt, delay) {
        const obj = { v: 0 };
        gsap.to(el,  { opacity: 1, duration: 0.22, delay });
        gsap.to(obj, {
            v: to, duration: 0.85, ease: 'power2.out', delay,
            onUpdate: () => { el.textContent = fmt(obj.v); }
        });
    }

    // ── Master entrance + data-life timeline ──────────────────────────────
    const E = 'cubic-bezier(0.23, 1, 0.32, 1)';

    const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 68%', once: true }
    });

    // 0: header slides up
    tl.to(headerEl, { opacity: 1, y: 0, duration: 0.65, ease: E }, 0);

    // 1: cards fly in from their natural directions
    tl.to(itemA, { opacity: 1, x: 0,           scale: 1, duration: 0.80, ease: E }, 0.10);
    tl.to(itemB, { opacity: 1, y: 0,           scale: 1, duration: 0.75, ease: E }, 0.20);
    tl.to(itemC, { opacity: 1, x: 0,           scale: 1, duration: 0.75, ease: E }, 0.28);
    tl.to(itemD, { opacity: 1, y: 0,           scale: 1, duration: 0.75, ease: E }, 0.35);

    // 2: Card A — funnel bars rise from the baseline, left to right
    tl.to(fBars, {
        scaleY: 1, duration: 0.50, ease: 'power3.out',
        stagger: { each: 0.06, from: 0 }
    }, 0.72);

    // 3: Card B — loser bar first, winner bar after (satisfying reveal order)
    tl.to(abFills[0], { scaleX: 1, duration: 0.44, ease: 'power2.out' }, 0.80);
    tl.to(abFills[1], { scaleX: 1, duration: 0.62, ease: 'power2.out' }, 0.88);

    // 4: Card D — SVG line draws itself left-to-right, area fills in after
    if (linePath) {
        tl.to(linePath, { strokeDashoffset: 0, duration: 1.10, ease: 'power2.inOut' }, 0.82);
    }
    if (areaPath) {
        tl.to(areaPath, { opacity: 1, duration: 0.65, ease: 'power2.out' }, 1.24);
    }

    // 6: Number counters fire as cards settle
    tl.call(() => {
        // Card B — A/B rates then confidence
        abRateTargets.forEach((to, i) => {
            countUp(abRates[i], to, v => v.toFixed(1) + '%', i * 0.14);
        });
        countUp(abConf, abConfTarget, v => v.toFixed(1) + '%', 0.30);

        // Card C — event percentages cascade
        eventTargets.forEach((to, i) => {
            countUp(eventVals[i], to, v => v.toFixed(1) + '%', i * 0.12);
        });

        // Card D — metric values
        dCountData.forEach((d, i) => {
            if (dMetricVals[i]) countUp(dMetricVals[i], d.to, d.fmt, i * 0.12);
        });

    }, [], 0.75);

    // 7: Post-entrance — each card floats with its own rhythm and personality
    tl.call(() => {
        const floatCfg = [
            { el: itemA, y: -7,  rot:  0.35, dur: 4.2, delay: 0.0 },
            { el: itemB, y: -9,  rot: -0.44, dur: 3.8, delay: 0.5 },
            { el: itemC, y: -6,  rot:  0.28, dur: 4.6, delay: 0.9 },
            { el: itemD, y: -8,  rot: -0.32, dur: 3.6, delay: 1.3 },
        ];
        floatCfg.forEach(f => {
            gsap.to(f.el, {
                y: `+=${f.y}`, rotation: f.rot,
                duration: f.dur, repeat: -1, yoyo: true,
                ease: 'sine.inOut', delay: f.delay,
            });
        });
    }, [], 1.4);

}());

// ── The Creative Loop ───────────────────────────────────────────
(function () {
    const section = document.querySelector(".cl-section");
    if (!section || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const stage     = section.querySelector(".cl-stage");
    const orbit     = section.querySelector(".cl-orbit");
    const rings     = section.querySelector(".cl-orbit-rings");
    const ticksWrap = section.querySelector(".cl-orbit-ticks");
    const left      = section.querySelector(".cl-title-left");
    const right     = section.querySelector(".cl-title-right");
    const kicker    = section.querySelector(".cl-kicker");
    const flow      = section.querySelector(".cl-flow");
    const steps     = gsap.utils.toArray(section.querySelectorAll(".cl-step"));
    const nodes     = section.querySelectorAll(".cl-step-node");
    const returnTag = section.querySelector(".cl-flow-return");
    if (!stage || !orbit || !rings || !flow || !steps.length) return;

    // Build the radial gauge ticks (top dome, open at the bottom)
    const SVGNS   = "http://www.w3.org/2000/svg";
    const N       = 46;
    const SPAN    = 270;            // total arc degrees
    const START   = -SPAN / 2;      // centred on top, 0deg = straight up
    const ticks   = [];
    for (let i = 0; i < N; i++) {
        const deg = START + (SPAN * i) / (N - 1);
        const rad = (deg - 90) * Math.PI / 180;       // -90 so 0deg points up
        const r1 = 92, r2 = 101;
        const line = document.createElementNS(SVGNS, "line");
        line.setAttribute("x1", (110 + r1 * Math.cos(rad)).toFixed(2));
        line.setAttribute("y1", (110 + r1 * Math.sin(rad)).toFixed(2));
        line.setAttribute("x2", (110 + r2 * Math.cos(rad)).toFixed(2));
        line.setAttribute("y2", (110 + r2 * Math.sin(rad)).toFixed(2));
        ticksWrap.appendChild(line);
        ticks.push(line);
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const orbitWidth = () => Math.min(Math.max(window.innerWidth * 0.2, 180), 260);

    // Static fallback: small screens or reduced motion → plain stacked layout
    if (reduceMotion || window.innerWidth < 1024) {
        section.classList.add("is-static");
        gsap.set(ticks, { opacity: 1 });

        if (!reduceMotion) {
            // keep the orbit crown alive (spin + CSS core/dot pulse)
            section.classList.add("is-loop-open");
            gsap.to(rings, {
                rotation: "+=360",
                duration: 9,
                repeat: -1,
                ease: "none",
                svgOrigin: "110 110"
            });

            // reveal each stage as it scrolls in, and light its node while centred
            steps.forEach((step) => {
                gsap.from(step, {
                    opacity: 0,
                    y: 24,
                    duration: 0.6,
                    ease: "power3.out",
                    scrollTrigger: { trigger: step, start: "top 88%", once: true }
                });
                ScrollTrigger.create({
                    trigger: step,
                    start: "top 62%",
                    end: "bottom 48%",
                    onToggle: (self) => step.classList.toggle("is-hot", self.isActive)
                });
            });
        }
        return;
    }

    // Circuit svg: rail down through the 7 nodes, return path up the
    // right edge, closing the loop back into stage 01
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "cl-flow-svg");
    svg.setAttribute("aria-hidden", "true");
    // fixed-in-space gradient: the pulse changes hue as it travels
    // (blue signal stages → purple creative stages → teal growth stages)
    const defs = document.createElementNS(SVGNS, "defs");
    const grad = document.createElementNS(SVGNS, "linearGradient");
    grad.setAttribute("id", "clFlowGrad");
    grad.setAttribute("gradientUnits", "userSpaceOnUse");
    grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0"); grad.setAttribute("y2", "1");
    [["0%", "#7d9bfa"], ["48%", "#d266f0"], ["100%", "#2be8b9"]].forEach(([off, col]) => {
        const stop = document.createElementNS(SVGNS, "stop");
        stop.setAttribute("offset", off);
        stop.setAttribute("stop-color", col);
        grad.appendChild(stop);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);
    const track = document.createElementNS(SVGNS, "path");
    track.setAttribute("class", "cl-flow-track");
    const comet = document.createElementNS(SVGNS, "path");
    comet.setAttribute("class", "cl-flow-comet");
    comet.setAttribute("stroke", "url(#clFlowGrad)");
    const arrow = document.createElementNS(SVGNS, "path");
    arrow.setAttribute("class", "cl-flow-arrow");
    svg.append(track, comet, arrow);
    flow.prepend(svg);

    const COMET_LEN = 90;
    let circuitLen = 0;
    let downLens   = [];   // arc length from the start to each node
    let downLegEnd = 0;    // arc length at the last node
    let cometTween = null;
    let activeStep = -1;

    const setActive = (idx) => {
        if (idx === activeStep) return;
        activeStep = idx;
        steps.forEach((s, i) => s.classList.toggle("is-hot", i === idx));
    };

    let orbitIsLive = false;
    let cometIsLive = false;

    // offsetLeft/offsetTop chain ignores the reveal transforms on the
    // steps, so the circuit stays put while they slide in
    const nodeCenter = (n) => {
        let el = n, x = 0, y = 0;
        while (el && el !== flow) {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.offsetParent;
        }
        // node is top:50% + translateY(-50%), so y already lands on centre
        return { x: x + n.offsetWidth / 2, y };
    };

    const buildCircuit = () => {
        const fr = flow.getBoundingClientRect();
        if (!fr.width || !fr.height) return;
        const pts = Array.from(nodes, nodeCenter);
        const x   = pts[0].x;
        const y0  = pts[0].y;
        const yN  = pts[pts.length - 1].y;
        const rx  = fr.width - 1;
        const by  = fr.height - 2;
        const ty  = Math.max(2, y0 - 28);
        const rad = 18;
        const gap = 8;   // the return path stops just above node 01
        const d =
            `M ${x} ${y0} L ${x} ${by - rad} Q ${x} ${by} ${x + rad} ${by} ` +
            `L ${rx - rad} ${by} Q ${rx} ${by} ${rx} ${by - rad} ` +
            `L ${rx} ${ty + rad} Q ${rx} ${ty} ${rx - rad} ${ty} ` +
            `L ${x + rad} ${ty} Q ${x} ${ty} ${x} ${ty + rad} ` +
            `L ${x} ${y0 - gap}`;
        svg.setAttribute("viewBox", `0 0 ${fr.width} ${fr.height}`);
        grad.setAttribute("y2", fr.height);
        track.setAttribute("d", d);
        comet.setAttribute("d", d);
        arrow.setAttribute("d", `M ${x - 4.5} ${y0 - gap - 6} L ${x + 4.5} ${y0 - gap - 6} L ${x} ${y0 - gap + 1} Z`);
        circuitLen = track.getTotalLength();
        downLens   = pts.map((p) => p.y - y0);
        downLegEnd = yN - y0;
        track.style.strokeDasharray = circuitLen;
        comet.style.strokeDasharray = `${COMET_LEN} ${circuitLen - COMET_LEN}`;

        // Signal pulse travelling the circuit, lighting each stage it passes
        if (cometTween) cometTween.kill();
        gsap.set(comet, { strokeDashoffset: 0 });
        cometTween = gsap.to(comet, {
            strokeDashoffset: `-=${circuitLen}`,
            duration: circuitLen / 150,
            repeat: -1,
            ease: "none",
            paused: !cometIsLive,
            onUpdate() {
                const t = -parseFloat(gsap.getProperty(comet, "strokeDashoffset"));
                const head = (((t + COMET_LEN) % circuitLen) + circuitLen) % circuitLen;
                let idx = -1;
                if (head <= downLegEnd + 12) {
                    for (let i = 0; i < downLens.length; i++) {
                        if (downLens[i] <= head + 6) idx = i;
                    }
                } else if (head > circuitLen - 26) {
                    idx = 0;
                }
                setActive(idx);
            }
        });
    };

    // Initial (centred) state
    gsap.set(stage, { xPercent: -50, yPercent: -50 });
    gsap.set(orbit, { width: 0, opacity: 0, scale: 0.55, transformOrigin: "50% 50%" });
    gsap.set(ticks, { opacity: 0 });
    gsap.set(kicker, { opacity: 0, y: 14 });
    gsap.set(steps, { opacity: 0, x: 30 });
    gsap.set(returnTag, { opacity: 0 });
    gsap.set(arrow, { opacity: 0 });
    buildCircuit();

    const orbitSpin = gsap.to(rings, {
        rotation: "+=360",
        duration: 8.5,
        repeat: -1,
        ease: "none",
        svgOrigin: "110 110",
        paused: true
    });

    const ORBIT_LIVE_PROGRESS = 0.24;
    const COMET_LIVE_PROGRESS = 0.93;   // circuit fully drawn → signal starts circulating
    const setOrbitLive = (isLive) => {
        if (orbitIsLive === isLive) return;
        orbitIsLive = isLive;
        section.classList.toggle("is-loop-open", isLive);
        if (isLive) {
            orbitSpin.play();
        } else {
            orbitSpin.pause();
        }
    };
    const setCometLive = (isLive) => {
        if (cometIsLive === isLive) return;
        cometIsLive = isLive;
        section.classList.toggle("is-loop-live", isLive);
        if (cometTween) {
            if (isLive) cometTween.play();
            else cometTween.pause();
        }
        if (!isLive) setActive(-1);
    };
    const syncLive = (progress, active) => {
        setOrbitLive(active && progress > ORBIT_LIVE_PROGRESS);
        setCometLive(active && progress > COMET_LIVE_PROGRESS);
    };

    const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.7}`,
            pin: ".cl-pin",
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: buildCircuit,
            onUpdate: self => syncLive(self.progress, true),
            onRefresh: self => syncLive(self.progress, self.isActive),
            onLeave: () => syncLive(0, false),
            onLeaveBack: () => syncLive(0, false)
        }
    });

    // Phase 1 — title splits, orbit opens between the words
    tl.to(orbit, { width: orbitWidth, opacity: 1, scale: 1, duration: 0.30 }, 0);
    tl.to(left,  { x: -10, duration: 0.30 }, 0);
    tl.to(right, { x: 10,  duration: 0.30 }, 0);

    // Phase 2 — gauge ticks light up as the loop turns
    tl.to(ticks, { opacity: 1, stagger: { each: 0.006, from: "center" }, duration: 0.26 }, 0.26);

    // Phase 3 — whole unit slides left, the rail draws down through
    // the seven stages as they fade in
    tl.to(stage, { left: "22%", scale: 0.62, ease: "power2.inOut", duration: 0.40 }, 0.60);
    tl.to(kicker, { opacity: 1, y: 0, duration: 0.22 }, 0.66);
    tl.fromTo(track,
        { strokeDashoffset: () => circuitLen },
        { strokeDashoffset: () => circuitLen - (downLegEnd + 24), ease: "none", duration: 0.34 }, 0.70);
    tl.to(steps, { opacity: 1, x: 0, duration: 0.26, stagger: 0.036 }, 0.72);

    // Phase 4 — the return path closes the loop back into stage 01
    tl.to(track, { strokeDashoffset: 0, ease: "power1.inOut", duration: 0.26 }, 1.06);
    tl.to(returnTag, { opacity: 1, duration: 0.16 }, 1.20);
    tl.to(arrow, { opacity: 1, duration: 0.10 }, 1.32);
}());
