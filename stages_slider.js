const stagesTrack = document.querySelector(".stages-slider__track");
const prevButtonStages = document.querySelector(".stages-slider__prev");
const nextButtonStages = document.querySelector(".stages-slider__next");
const dots = document.querySelectorAll(".slider--dot");

let currentSlide = 0;
const totalSlides = 5;

function updateSliderPosition() {
  if (!stagesTrack || !prevButtonStages || !nextButtonStages) {
    return;
  }

  stagesTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  prevButtonStages.disabled = currentSlide === 0;
  nextButtonStages.disabled = currentSlide === totalSlides - 1;
}

function updateDots() {
  if (!dots.length) {
    return;
  }

  dots.forEach((dot) => {
    dot.classList.remove("active");
    dot.removeAttribute("aria-current");
  });
  dots[currentSlide].classList.add("active");
  dots[currentSlide].setAttribute("aria-current", "true");
}

function goToSlide(slide) {
  currentSlide = Math.max(0, Math.min(slide, totalSlides - 1));
  updateSliderPosition();
  updateDots();
}

if (stagesTrack && prevButtonStages && nextButtonStages) {
  prevButtonStages.addEventListener("click", () => goToSlide(currentSlide - 1));
  nextButtonStages.addEventListener("click", () => goToSlide(currentSlide + 1));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goToSlide(index));
  });

  goToSlide(0);
}
