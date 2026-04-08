import "./main.js";
/* empty css      */
import Swiper from "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs";
AOS.init({ once: true, duration: 800, offset: 50 });
new Swiper(".showroomSwiper", {
  slidesPerView: "auto",
  spaceBetween: 24,
  loop: false,
  navigation: {
    nextEl: ".showroom-next",
    prevEl: ".showroom-prev"
  }
});
new Swiper(".showroomSwiper2", {
  slidesPerView: "auto",
  spaceBetween: 24,
  loop: false,
  initialSlide: 1,
  rtl: true
});
