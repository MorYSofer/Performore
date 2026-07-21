/* ═══════════════════════════════════════════════════════════════
   Mobile navigation — hamburger + fullscreen menu
   Self-contained, no dependencies. Included on every page.
   Builds the menu from the existing .nav-links DOM so each page
   inherits the correct hrefs and "current" states automatically.
   Styling lives in styles/nav.css; only active ≤740px.
═══════════════════════════════════════════════════════════════ */
(function () {
    "use strict";

    const BREAKPOINT = 740;

    function init() {
        const nav = document.querySelector("body > nav");
        if (!nav) return;
        const navLinks = nav.querySelector(".nav-links");
        if (!navLinks) return;
        if (nav.querySelector(".nav-burger")) return; // already built

        /* ── Hamburger button ── */
        const burger = document.createElement("button");
        burger.className = "nav-burger";
        burger.type = "button";
        burger.setAttribute("aria-label", "Open menu");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-controls", "mnav");
        burger.innerHTML = "<span></span><span></span>";
        nav.appendChild(burger);

        /* ── Overlay shell ── */
        const overlay = document.createElement("div");
        overlay.className = "mnav";
        overlay.id = "mnav";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "Menu");

        const list = document.createElement("nav");
        list.className = "mnav-links";
        list.setAttribute("aria-label", "Mobile navigation");

        let order = 0;
        const stagger = (el) => el.style.setProperty("--i", String(order++));

        const cleanTitle = (titleEl, fallback) => {
            if (!titleEl) return fallback;
            const clone = titleEl.cloneNode(true);
            const tag = clone.querySelector(".nav-services-tag");
            if (tag) tag.remove();
            return clone.textContent.trim() || fallback;
        };

        Array.from(navLinks.children).forEach((li) => {
            if (li.classList.contains("nav-notch")) return;

            if (li.classList.contains("nav-services")) {
                const trigger = li.querySelector(".nav-services-trigger");
                const group = document.createElement("div");
                group.className = "mnav-group";

                const head = document.createElement("a");
                head.className = "mnav-link mnav-group-head";
                head.href = trigger ? trigger.getAttribute("href") : "#services";
                head.textContent = trigger
                    ? (trigger.childNodes[0] ? trigger.childNodes[0].textContent.trim() : "Services") || "Services"
                    : "Services";
                stagger(head);
                group.appendChild(head);

                const sub = document.createElement("div");
                sub.className = "mnav-sub";
                li.querySelectorAll(".nav-services-panel .nav-services-item").forEach((item) => {
                    const badge = item.querySelector(".nav-services-badge");
                    const accent = badge ? badge.style.getPropertyValue("--svc-accent") : "";
                    const title = cleanTitle(item.querySelector(".nav-services-title"), "Service");
                    const isLink = item.tagName.toLowerCase() === "a" && !item.classList.contains("is-current");

                    const el = document.createElement(isLink ? "a" : "span");
                    el.className = "mnav-sub-link" + (isLink ? "" : " is-current");
                    if (isLink) {
                        el.href = item.getAttribute("href");
                    } else {
                        el.setAttribute("aria-current", "page");
                    }

                    const dot = document.createElement("span");
                    dot.className = "mnav-dot";
                    if (accent) dot.style.setProperty("--svc-accent", accent.trim());
                    el.appendChild(dot);
                    el.appendChild(document.createTextNode(title));
                    stagger(el);
                    sub.appendChild(el);
                });
                group.appendChild(sub);
                list.appendChild(group);
            } else {
                const a = li.querySelector("a");
                if (!a) return;
                const el = document.createElement("a");
                el.className = "mnav-link";
                el.href = a.getAttribute("href");
                el.textContent = a.textContent.trim();
                stagger(el);
                list.appendChild(el);
            }
        });

        overlay.appendChild(list);

        /* ── CTA (clone the real one so Cal.com booking still fires) ── */
        const origCta = nav.querySelector(".nav-right .cta") || nav.querySelector(".cta");
        if (origCta) {
            const foot = document.createElement("div");
            foot.className = "mnav-foot";
            const cta = origCta.cloneNode(true);
            cta.classList.add("mnav-cta");
            cta.removeAttribute("id");
            foot.appendChild(cta);
            overlay.appendChild(foot);
        }

        document.body.appendChild(overlay);

        /* ── Behaviour ── */
        const docEl = document.documentElement;
        let lastFocus = null;

        const lockScroll = (on) => {
            docEl.style.overflow = on ? "hidden" : "";
            document.body.style.overflow = on ? "hidden" : "";
        };

        const isOpen = () => document.body.classList.contains("mnav-open");

        const open = () => {
            if (isOpen()) return;
            lastFocus = document.activeElement;
            document.body.classList.add("mnav-open");
            burger.setAttribute("aria-expanded", "true");
            burger.setAttribute("aria-label", "Close menu");
            lockScroll(true);
            const first = overlay.querySelector(".mnav-link");
            if (first) setTimeout(() => first.focus({ preventScroll: true }), 80);
        };

        const close = () => {
            if (!isOpen()) return;
            document.body.classList.remove("mnav-open");
            burger.setAttribute("aria-expanded", "false");
            burger.setAttribute("aria-label", "Open menu");
            lockScroll(false);
            if (lastFocus && typeof lastFocus.focus === "function") {
                lastFocus.focus({ preventScroll: true });
            }
        };

        burger.addEventListener("click", () => (isOpen() ? close() : open()));

        // tapping any destination closes the menu
        overlay.addEventListener("click", (e) => {
            if (e.target.closest("a.mnav-link, a.mnav-sub-link, .mnav-cta")) close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && isOpen()) close();
        });

        // basic focus trap
        overlay.addEventListener("keydown", (e) => {
            if (e.key !== "Tab" || !isOpen()) return;
            const items = overlay.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
            if (!items.length) return;
            const firstEl = items[0];
            const lastEl = items[items.length - 1];
            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > BREAKPOINT && isOpen()) close();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
