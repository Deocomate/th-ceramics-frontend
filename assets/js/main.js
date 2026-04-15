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
const initProductSectionCarousels = () => {
  document.querySelectorAll("[data-product-section]").forEach((section) => {
    if (section.dataset.productCarouselInitialized === "true") {
      return;
    }
    const carousel = section.querySelector("[data-product-carousel]");
    const slides = Array.from(section.querySelectorAll("[data-product-slide]"));
    const dots = Array.from(section.querySelectorAll("[data-product-dot]"));
    if (!carousel || slides.length === 0 || dots.length === 0) {
      return;
    }
    section.dataset.productCarouselInitialized = "true";
    const setActiveDot = (activeIndex) => {
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle("bg-secondary", isActive);
        dot.classList.toggle("bg-[#656663]", !isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };
    const getSlideWidth = () => {
      var _a;
      return carousel.clientWidth || ((_a = slides[0]) == null ? void 0 : _a.getBoundingClientRect().width) || 0;
    };
    const syncActiveDot = () => {
      const slideWidth = getSlideWidth();
      if (!slideWidth) {
        return;
      }
      const activeIndex = Math.min(
        slides.length - 1,
        Math.max(0, Math.round(carousel.scrollLeft / slideWidth))
      );
      setActiveDot(activeIndex);
    };
    let scrollFrame = null;
    const handleScroll = () => {
      if (scrollFrame !== null) {
        return;
      }
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = null;
        syncActiveDot();
      });
    };
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        const slideWidth = getSlideWidth();
        if (!slideWidth) {
          return;
        }
        carousel.scrollTo({
          left: slideWidth * dotIndex,
          behavior: "smooth"
        });
      });
    });
    carousel.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", syncActiveDot);
    syncActiveDot();
  });
};
const initSharedScripts = () => {
  initProductSectionCarousels();
};
document.addEventListener("DOMContentLoaded", initSharedScripts);
