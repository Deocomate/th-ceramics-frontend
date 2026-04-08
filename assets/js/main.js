(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
const __variableDynamicImportRuntimeHelper = (glob, path, segs) => {
  const v = glob[path];
  if (v) {
    return typeof v === "function" ? v() : Promise.resolve(v);
  }
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(
      reject.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + path + (path.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
const initializePage = () => {
  const pageName = document.body.dataset.page;
  if (!pageName) {
    console.warn("No page name specified in data-page attribute");
    return;
  }
  __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "./pages/index.js": () => __vitePreload(() => import("./index2.js"), true ? [] : void 0), "./pages/products.js": () => __vitePreload(() => import("./products.js"), true ? [] : void 0) }), `./pages/${pageName}.js`, 3).then((module) => {
    if (module.init && typeof module.init === "function") {
      module.init();
    }
  }).catch((err) => {
    console.log(`No specific module for ${pageName} page`);
  });
};
const initMobileMenu = () => {
  const menuButton = document.getElementById("mobile-menu-button");
  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const nav = menuButton.closest("nav");
      const menu = nav.querySelector(".md\\:flex");
      if (menu) {
        menu.classList.toggle("hidden");
        menu.classList.toggle("flex");
        menu.classList.toggle("flex-col");
        menu.classList.toggle("absolute");
        menu.classList.toggle("top-16");
        menu.classList.toggle("right-0");
        menu.classList.toggle("bg-gray-900");
        menu.classList.toggle("p-4");
        menu.classList.toggle("rounded-lg");
        menu.classList.toggle("shadow-lg");
      }
    });
  }
};
const initFAQ = () => {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-button");
    const content = item.querySelector(".faq-content");
    const icon = item.querySelector(".faq-icon");
    if (button && content && icon) {
      button.addEventListener("click", () => {
        const isOpen = !content.classList.contains("hidden");
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            const otherContent = otherItem.querySelector(".faq-content");
            const otherIcon = otherItem.querySelector(".faq-icon");
            if (otherContent) otherContent.classList.add("hidden");
            if (otherIcon) {
              otherIcon.classList.add("rotate-180");
              otherIcon.classList.replace("bg-textPrimary", "bg-gray-200");
              otherIcon.classList.replace("text-white", "text-gray-500");
            }
          }
        });
        if (isOpen) {
          content.classList.add("hidden");
          icon.classList.add("rotate-180");
          icon.classList.replace("bg-textPrimary", "bg-gray-200");
          icon.classList.replace("text-white", "text-gray-500");
        } else {
          content.classList.remove("hidden");
          icon.classList.remove("rotate-180");
          icon.classList.replace("bg-gray-200", "bg-textPrimary");
          icon.classList.replace("text-gray-500", "text-white");
        }
      });
    }
  });
};
document.addEventListener("DOMContentLoaded", () => {
  initializePage();
  initMobileMenu();
  initFAQ();
});
