/* ─── CAREERS — application modal ───
   The Fillout embed is third-party and heavy, so nothing is requested until
   someone actually asks for the form. The <div data-zite-id> already sits in
   the markup; the loader script is injected on first open and picks it up.

   Deliberately load-on-open rather than on page load: it keeps the careers
   page as light as the rest of the site and means no third-party request
   fires for visitors who never open the form. */
(function () {
    "use strict";

    const modal = document.getElementById("careersModal");
    if (!modal) return;

    const panel = modal.querySelector(".crs-modal-panel");
    const embed = modal.querySelector("[data-zite-id]");
    const loading = modal.querySelector("[data-careers-loading]");
    const openers = document.querySelectorAll("[data-careers-open]");
    if (!panel || !embed || !openers.length) return;

    const EMBED_SRC = "https://server.fillout.com/embed/v2-zite/";
    let scriptInjected = false;
    let lastFocused = null;

    /* Inject the Fillout loader once, only after the modal is visible — it
       measures its container on init, which reads as 0 while display:none. */
    function loadEmbed() {
        if (scriptInjected) return;
        scriptInjected = true;

        const s = document.createElement("script");
        s.src = EMBED_SRC;
        s.async = true;
        s.onerror = function () {
            if (loading) {
                loading.textContent =
                    "The form couldn't load. Email hello@performore.co and we'll pick it up from there.";
            }
        };
        document.body.appendChild(s);

        /* Drop the placeholder as soon as Fillout mounts its iframe. */
        if (loading) {
            const obs = new MutationObserver(function () {
                if (embed.querySelector("iframe")) {
                    loading.remove();
                    obs.disconnect();
                }
            });
            obs.observe(embed, { childList: true, subtree: true });
        }
    }

    function openModal(trigger) {
        lastFocused = trigger || document.activeElement;

        /* Compensate for the vanishing scrollbar so the page behind doesn't
           shift sideways as it locks. */
        const sbw = window.innerWidth - document.documentElement.clientWidth;
        if (sbw > 0) document.body.style.paddingRight = sbw + "px";
        document.body.classList.add("crs-modal-open");

        modal.hidden = false;
        /* Next frame, so the transition has a from-state to animate out of. */
        requestAnimationFrame(function () {
            modal.classList.add("is-open");
            loadEmbed();
        });

        const closeBtn = modal.querySelector(".crs-modal-close");
        if (closeBtn) closeBtn.focus();

        document.addEventListener("keydown", onKeydown);
    }

    function closeModal() {
        modal.classList.remove("is-open");
        document.removeEventListener("keydown", onKeydown);
        document.body.classList.remove("crs-modal-open");
        document.body.style.paddingRight = "";

        const done = function () {
            modal.hidden = true;
            panel.removeEventListener("transitionend", done);
        };
        /* transitionend won't fire under reduced motion, so time it out too. */
        panel.addEventListener("transitionend", done);
        setTimeout(done, 400);

        if (lastFocused && typeof lastFocused.focus === "function") {
            lastFocused.focus();
        }
    }

    function onKeydown(e) {
        if (e.key === "Escape") {
            e.preventDefault();
            closeModal();
            return;
        }
        if (e.key !== "Tab") return;

        /* Keep tabbing inside the dialog. Once focus is in the Fillout
           iframe the browser owns it, which is fine — Escape still closes. */
        const items = panel.querySelectorAll(
            'a[href], button:not([disabled]), input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
        );
        if (!items.length) return;

        const first = items[0];
        const last = items[items.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    openers.forEach(function (btn) {
        btn.addEventListener("click", function () {
            openModal(btn);
        });
    });

    modal.querySelectorAll("[data-careers-close]").forEach(function (el) {
        el.addEventListener("click", closeModal);
    });

    /* Deep link: /careers#apply-now opens the form straight away. */
    if (window.location.hash === "#apply-now") {
        openModal(null);
    }
}());
