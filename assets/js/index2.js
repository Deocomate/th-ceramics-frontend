function init() {
  console.log("Index page initialized");
  const ctaButtons = document.querySelectorAll('a[href*="services"], a[href*="contact"]');
  ctaButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      console.log("CTA clicked:", button.textContent);
    });
  });
}
export {
  init
};
