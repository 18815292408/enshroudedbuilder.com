/* assets/ads.js - Adsterra Native Banner + Social Bar (zero build, config driven).
 * Consent gated: nothing is requested from the ad network until dh-ga-consent === 'allowed'.
 * Public API: window.__ADS.{init,getConfig,setConfig,shouldShow,loadNative,loadAllNative,loadSocialBar,unloadSocialBar,throttleCheck,isMobile,onConsentChange,notifyConsentChange}
 */
(function () {
  'use strict';

  var CONFIG_URL = '/assets/ads-config.json?v=20261019-1';
  var CONSENT_KEY = 'dh-ga-consent';
  var NATIVE_ATTR = 'data-ads-native';
  var SOCIAL_ATTR = 'data-adsterra-social';
  var SOCIAL_HOLDER_ID = 'ads-social-holder';

  var config = null;
  var configPromise = null;
  var inited = false;
  var nativeLoaded = false;
  var socialLoaded = false;

  function isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(navigator.userAgent || '');
  }

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function consentAllowed() { return readConsent() === 'allowed'; }

  function shouldShow() {
    return !!(config && config.enabled === true && consentAllowed());
  }

  function getConfig() { return config; }

  function setConfig(patch) {
    config = Object.assign({}, config || {}, patch || {});
    return config;
  }

  function throttleCheck(key, ms) {
    var now = Date.now();
    var storageKey = '__ads_throttle_' + key;
    try {
      var last = Number(localStorage.getItem(storageKey) || 0);
      if (last && now - last < ms) return false;
      localStorage.setItem(storageKey, String(now));
    } catch (e) { /* storage unavailable: fail open */ }
    return true;
  }

  function bannerElement() {
    return document.getElementById('ga-banner') || document.getElementById('consent');
  }

  /* Keeps the Social Bar holder clear of the consent banner (reads offsetHeight + 12). */
  function avoidOverlap() {
    var holder = document.getElementById(SOCIAL_HOLDER_ID);
    if (!holder) return;
    var banner = bannerElement();
    var lift = 0;
    if (banner && !banner.hasAttribute('hidden') && banner.offsetHeight > 0) lift = banner.offsetHeight + 12;
    holder.style.bottom = lift > 0 ? lift + 'px' : '0px';
  }

  function makeScript(src, marker) {
    var el = document.createElement('script');
    el.async = true;
    el.setAttribute('data-cfasync', 'false');
    el.setAttribute(marker, '1');
    el.src = src;
    return el;
  }

  function loadConfig() {
    if (config) return Promise.resolve(config);
    if (configPromise) return configPromise;
    configPromise = fetch(CONFIG_URL, { cache: 'no-store', credentials: 'omit' })
      .then(function (res) { return res.json(); })
      .then(function (json) { config = json; return config; })
      .catch(function () { configPromise = null; return null; });
    return configPromise;
  }

  /* Native Banner: one unit per page, loaded with the page (async, never deferred).
     Deferred ad scripts measurably hurt timings on content sites, so the slot reserves its
     height instead and the script goes out as soon as consent allows. */
  function loadNative() {
    if (nativeLoaded) return false;
    if (!shouldShow()) return false;
    var container = document.getElementById(config.native.containerId);
    if (!container) return false;
    nativeLoaded = true;
    var el = makeScript(config.native.invokeJs, NATIVE_ATTR);
    if (container.parentNode) container.parentNode.insertBefore(el, container);
    else document.body.appendChild(el);
    return true;
  }

  function loadAllNative() {
    if (nativeLoaded) return true;
    if (!shouldShow()) return false;
    if (!document.querySelector('.ads-native')) return false;
    return loadNative();
  }

  /* Social Bar: throttled to one load per minute, holder un-hidden before the script lands. */
  function loadSocialBar() {
    if (socialLoaded) return false;
    if (!shouldShow()) return false;
    var ms = (config.socialBar && config.socialBar.throttleMs) || 60000;
    if (!throttleCheck('social-bar', ms)) return false;
    var holder = document.getElementById(SOCIAL_HOLDER_ID);
    if (holder) holder.removeAttribute('hidden');
    socialLoaded = true;
    /* Social Bar lives just before </body>, once per page. */
    document.body.appendChild(makeScript(config.socialBar.invokeJs, SOCIAL_ATTR));
    avoidOverlap();
    return true;
  }

  function unloadSocialBar() {
    var loaded = document.querySelectorAll('script[' + SOCIAL_ATTR + ']');
    for (var i = 0; i < loaded.length; i += 1) {
      if (loaded[i].parentNode) loaded[i].parentNode.removeChild(loaded[i]);
    }
    var holder = document.getElementById(SOCIAL_HOLDER_ID);
    if (holder) holder.setAttribute('hidden', '');
    socialLoaded = false;
    avoidOverlap();
    return true;
  }

  function onConsentChange(choice) {
    if (choice === 'allowed') {
      loadConfig().then(function () { loadAllNative(); loadSocialBar(); });
    } else {
      unloadSocialBar();
    }
  }

  function notifyConsentChange() {
    onConsentChange(consentAllowed() ? 'allowed' : 'denied');
  }

  function watchBanner() {
    var banner = bannerElement();
    if (!banner) return;
    window.addEventListener('resize', avoidOverlap);
    if (window.MutationObserver) {
      new MutationObserver(avoidOverlap).observe(banner, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
    }
  }

  function init() {
    if (inited) return Promise.resolve(config);
    inited = true;
    watchBanner();
    avoidOverlap();
    if (!consentAllowed()) return Promise.resolve(null); /* denied: no network request at all */
    return loadConfig().then(function () { loadAllNative(); loadSocialBar(); return config; });
  }

  window.__ADS = {
    init: init,
    getConfig: getConfig,
    setConfig: setConfig,
    shouldShow: shouldShow,
    loadNative: loadNative,
    loadAllNative: loadAllNative,
    loadSocialBar: loadSocialBar,
    unloadSocialBar: unloadSocialBar,
    throttleCheck: throttleCheck,
    isMobile: isMobile,
    onConsentChange: onConsentChange,
    notifyConsentChange: notifyConsentChange,
    loadConfig: loadConfig
  };
  window.notifyConsentChange = notifyConsentChange;

  /* A visitor who granted earlier gets ads without another click; denied visitors load nothing. */
  if (consentAllowed()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
    else init();
  }
  window.addEventListener('load', function () { avoidOverlap(); });
})();
