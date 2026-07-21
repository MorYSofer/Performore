/* ─────────────────────────────────────────────────────────────────────────
   Performore — Cookie consent (Google Consent Mode v2)

   Works with the inline "consent default" script that runs before Google Tag
   Manager in the <head>. This file renders the consent UI, records the choice,
   and pushes consent updates to Google + the dataLayer.

   UX: first visit shows a centred, scroll-locked modal that requires a CHOICE
   (Accept all OR Essential only — both one click). This is a compliant
   "forced choice", NOT a cookie wall: rejecting is exactly as easy as accepting
   and the visitor is never forced to accept to use the site.

   Storage: localStorage["pm_consent"] = { v, t, ad, an }
     v  = schema version   t = timestamp (ms)
     ad = advertising (0|1) an = analytics (0|1)

   GTM SIDE (do this in the GTM UI — see gtm/GTM-SETUP.md):
     • Google tags (GA4, Google Ads) honour Consent Mode automatically.
     • Non-Google tags (Meta, LinkedIn, Reddit, Microsoft) are gated on the
       `cookie_consent_update` dataLayer event / the consent_* variables below.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
    'use strict';

    var KEY = 'pm_consent';
    var VERSION = 2;
    var MAX_AGE = 1000 * 60 * 60 * 24 * 182; // re-ask after ~6 months (ICO guidance)

    var dataLayer = (window.dataLayer = window.dataLayer || []);
    function gtag() { dataLayer.push(arguments); }

    function read() {
        try { return JSON.parse(localStorage.getItem(KEY) || 'null'); }
        catch (e) { return null; }
    }
    function isFresh(s) {
        return !!(s && s.v === VERSION && typeof s.t === 'number' && (Date.now() - s.t) < MAX_AGE);
    }
    function persist(ads, analytics) {
        try {
            localStorage.setItem(KEY, JSON.stringify({
                v: VERSION, t: Date.now(), ad: ads ? 1 : 0, an: analytics ? 1 : 0
            }));
        } catch (e) {}
    }

    // Push the choice to Google (Consent Mode) + a custom event for non-Google tags.
    function applyConsent(ads, analytics) {
        gtag('consent', 'update', {
            ad_storage: ads ? 'granted' : 'denied',
            ad_user_data: ads ? 'granted' : 'denied',
            ad_personalization: ads ? 'granted' : 'denied',
            analytics_storage: analytics ? 'granted' : 'denied',
            personalization_storage: ads ? 'granted' : 'denied'
        });
        dataLayer.push({
            event: 'cookie_consent_update',
            consent_ads: ads ? 'granted' : 'denied',
            consent_analytics: analytics ? 'granted' : 'denied'
        });
    }

    // ── DOM helpers ──────────────────────────────────────────────────────
    function el(html) {
        var t = document.createElement('template');
        t.innerHTML = html.trim();
        return t.content.firstChild;
    }

    var root, overlay, fab, blocking, lastFocus;

    var COOKIE_SVG =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>' +
            '<path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/>' +
        '</svg>';

    var CLOSE_SVG =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

    function ensureRoot() {
        if (root) return root;
        root = document.createElement('div');
        root.className = 'pm-consent-root';
        document.body.appendChild(root);
        return root;
    }

    function reduceMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Load the stylesheet once, then run cb (so nothing renders unstyled).
    function ensureStyles(cb) {
        var link = document.querySelector('link[data-pm-consent]');
        if (link) {
            if (link.getAttribute('data-loaded')) { cb(); }
            else { link.addEventListener('load', cb); link.addEventListener('error', cb); }
            return;
        }
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'styles/consent.css';
        link.setAttribute('data-pm-consent', '');
        function done() { if (!link.getAttribute('data-loaded')) { link.setAttribute('data-loaded', '1'); cb(); } }
        link.onload = done;
        link.onerror = done; // fail open — still let the user choose
        document.head.appendChild(link);
        setTimeout(done, 1200); // safety net
    }

    function reveal(node) {
        if (reduceMotion()) { node.classList.add('is-in'); return; }
        requestAnimationFrame(function () { requestAnimationFrame(function () { node.classList.add('is-in'); }); });
    }

    // ── Consent modal (gate on first visit, settings when reopened) ───────
    function openConsent(isBlocking) {
        if (overlay) return;
        blocking = !!isBlocking;
        ensureStyles(buildOverlay);
    }

    function buildOverlay() {
        var saved = read() || {};
        var adsOn = saved.ad === 1;      // non-essential defaults OFF (compliant)
        var anOn = saved.an === 1;

        overlay = el(
            '<div class="pm-consent-modal' + (blocking ? ' is-gate' : '') + '" role="dialog" aria-modal="true" aria-label="Your cookie choices">' +
                '<div class="pm-consent-panel" role="document">' +
                    (blocking ? '' : '<button type="button" class="pm-panel-close" data-act="close" aria-label="Close">' + CLOSE_SVG + '</button>') +
                    '<h2 class="pm-panel-title">Cookies</h2>' +
                    '<p class="pm-panel-intro">We use cookies to run this site, understand how it’s used, and measure our marketing. Choose “Accept all”, or pick what’s on. See our <a href="cookie-policy.html">Cookie Policy</a>.</p>' +
                    '<div class="pm-panel-actions pm-panel-actions--primary">' +
                        '<button type="button" class="pm-btn pm-btn-primary" data-act="all">Accept all</button>' +
                        '<button type="button" class="pm-btn pm-btn-ghost" data-act="essential">Essential only</button>' +
                    '</div>' +
                    '<button type="button" class="pm-consent-manage" data-act="toggle" aria-expanded="' + (blocking ? 'false' : 'true') + '" aria-controls="pmDetails">Manage preferences</button>' +
                    '<div class="pm-details" id="pmDetails"' + (blocking ? '' : ' data-open') + '>' +
                        optionRow('necessary', 'Strictly necessary', 'Required for the site to work — always on.', true, true) +
                        optionRow('analytics', 'Analytics', 'Google Analytics — helps us understand how the site is used.', anOn, false) +
                        optionRow('ads', 'Advertising', 'Google Ads, Meta, LinkedIn, Reddit and Microsoft — measures our marketing.', adsOn, false) +
                        '<div class="pm-panel-actions">' +
                            '<button type="button" class="pm-btn pm-btn-ghost" data-act="save">Save my choices</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
        ensureRoot().appendChild(overlay);

        overlay.addEventListener('click', function (e) {
            if (!blocking && e.target === overlay) { closeOverlay(); return; } // backdrop dismiss (settings only)
            var hit = e.target.closest ? e.target.closest('[data-act]') : null;
            var act = hit && hit.getAttribute('data-act');
            if (act === 'all') { choose(true, true); }
            else if (act === 'essential') { choose(false, false); }
            else if (act === 'save') {
                choose(!!overlay.querySelector('#pm-opt-ads').checked,
                       !!overlay.querySelector('#pm-opt-analytics').checked);
            }
            else if (act === 'toggle') { toggleDetails(); }
            else if (act === 'close') { closeOverlay(); }
        });
        document.addEventListener('keydown', onKeydown);
        document.documentElement.classList.add('pm-consent-lock'); // lock scroll behind modal

        lastFocus = document.activeElement;
        reveal(overlay);
        var first = overlay.querySelector('.pm-btn-primary');
        if (first) first.focus();
    }

    function toggleDetails() {
        var d = overlay.querySelector('.pm-details');
        var btn = overlay.querySelector('[data-act="toggle"]');
        var open = d.hasAttribute('data-open');
        if (open) { d.removeAttribute('data-open'); btn.setAttribute('aria-expanded', 'false'); }
        else { d.setAttribute('data-open', ''); btn.setAttribute('aria-expanded', 'true'); }
    }

    function optionRow(id, name, desc, checked, disabled) {
        return '' +
            '<div class="pm-opt">' +
                '<div class="pm-opt-body">' +
                    '<span class="pm-opt-name">' + name + '</span>' +
                    '<span class="pm-opt-desc">' + desc + '</span>' +
                '</div>' +
                '<label class="pm-switch">' +
                    '<input type="checkbox" id="pm-opt-' + id + '"' + (checked ? ' checked' : '') + (disabled ? ' disabled' : '') + ' aria-label="' + name + '">' +
                    '<span class="pm-switch-track"></span>' +
                '</label>' +
            '</div>';
    }

    function onKeydown(e) {
        if (!overlay) return;
        if (e.key === 'Escape' && !blocking) { closeOverlay(); return; }
        if (e.key === 'Tab') { trapFocus(e); } // keep keyboard focus inside the modal
    }

    function trapFocus(e) {
        var f = overlay.querySelectorAll('button, input:not(:disabled), a[href]');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function closeOverlay() {
        if (!overlay) return;
        var o = overlay; overlay = null;
        document.removeEventListener('keydown', onKeydown);
        document.documentElement.classList.remove('pm-consent-lock');
        // Unlocking scroll can change scrollability / scrollbar width, which
        // shifts the layout that pinned ScrollTrigger sections were measured
        // against. Ask them to recompute so they don't leave a gap after the gate.
        if (typeof window.pmRefreshScrollTriggers === 'function') {
            window.pmRefreshScrollTriggers();
        } else if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
            window.ScrollTrigger.refresh();
        }
        o.classList.remove('is-in');
        setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 420);
        if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    }

    // ── Floating "cookie" button — reopen preferences any time ────────────
    function showFab() {
        if (fab) return;
        fab = el('<button type="button" class="pm-consent-fab" aria-label="Cookie preferences" title="Cookie preferences">' + COOKIE_SVG + '</button>');
        fab.addEventListener('click', function () { openConsent(false); });
        ensureRoot().appendChild(fab);
        reveal(fab);
    }

    // Records a choice, closes the modal, reveals the floating widget.
    function choose(ads, analytics) {
        applyConsent(ads, analytics);
        persist(ads, analytics);
        closeOverlay();
        setTimeout(showFab, reduceMotion() ? 0 : 260);
    }

    // ── "Cookie settings" link in the footer (withdraw / change any time) ─
    function addFooterLink() {
        var nav = document.querySelector('.footer-legal-nav');
        if (!nav || nav.querySelector('.pm-cookie-settings')) return;
        var a = document.createElement('a');
        a.href = '#';
        a.className = 'pm-cookie-settings';
        a.textContent = 'Cookie settings';
        a.addEventListener('click', function (e) { e.preventDefault(); openConsent(false); });
        nav.appendChild(a);
    }

    // Public API (e.g. onclick="pmConsent.open()")
    window.pmConsent = {
        open: function () { openConsent(false); },
        accept: function () { choose(true, true); }
    };

    // ── Boot ─────────────────────────────────────────────────────────────
    // The stylesheet is loaded from here (not the <head>) to keep per-page edits
    // minimal; the UI only renders once CSS is ready, so there is no flash.
    function init() {
        addFooterLink();
        if (!isFresh(read())) {
            openConsent(true);   // first visit / expired → blocking choice gate
        } else {
            ensureStyles(showFab); // already chosen → show the floating widget
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/* ───────────────────────────────────────────────────────────────────────────
   GTM CONFIGURATION CHECKLIST (one-time, in the GTM web UI):

   1. Google Ads / GA4 tags: no action needed — they respect Consent Mode v2
      via the default state set in <head> and the updates pushed above.

   2. For Meta / LinkedIn / Reddit / Microsoft tags:
        a. Create a Custom Event trigger on event name = "cookie_consent_update".
        b. Create a Data Layer Variable named "consent_ads".
        c. Add a trigger condition: consent_ads equals "granted".
        d. Fire those advertising tags on that trigger (not on All Pages / DOM
           Ready), so they only load after the visitor accepts advertising.
      (Use "consent_analytics" the same way for any non-Google analytics tags.)

   3. In GTM > Container Settings, tick "Enable consent overview" to audit which
      tags have consent checks configured.
   ─────────────────────────────────────────────────────────────────────────── */
