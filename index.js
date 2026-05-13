const slider = document.querySelector(".slider");
const track = document.querySelector(".slider__track");
const counter = document.getElementById("counter");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const cards = Array.from(document.querySelectorAll(".slider__track .card"));

const CARD_GAP = 20;
const AUTOPLAY_DELAY = 4000;
const SLIDER_TRANSITION_FALLBACK = 700;

let cardsPerPage = 3;
let currentPage = 0;
let visualPage = 1;
let totalPages = 1;
let autoplayTimer = null;
let isTransitioning = false;

function loadHeroImage() {
  const heroImage = document.querySelector(".hero-image");

  if (!heroImage) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 575px)");
  let loadedSrc = "";

  const showHeroImage = () => {
    const nextSrc = mobileQuery.matches
      ? "./assets/img/375.webp"
      : "./assets/img/1920.webp";

    if (nextSrc === loadedSrc) {
      return;
    }

    heroImage.classList.remove("hero-image--loaded");

    const image = new Image();
    image.src = nextSrc;

    const reveal = () => {
      loadedSrc = nextSrc;
      heroImage.classList.add("hero-image--loaded");
    };

    if (image.decode) {
      image.decode().then(reveal).catch(reveal);
      return;
    }

    image.onload = reveal;
    image.onerror = reveal;
  };

  showHeroImage();
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", showHeroImage);
  } else {
    mobileQuery.addListener(showHeroImage);
  }
}

function duplicateRunningLines() {
  const lines = document.querySelectorAll(".running-line--content");

  lines.forEach((line) => {
    const group = line.querySelector(".running-line--group");

    if (!group || line.querySelectorAll(".running-line--group").length > 1) {
      return;
    }

    const clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    line.append(clone);
  });
}

function moveAdvertisementIntroTail() {
  const introTail = document.querySelector(".advertisements__intro-tail");
  const inlineContainer = document.querySelector(".advertisements--text__first p");
  const mobileContainer = document.querySelector(
    ".advertisements__intro-tail--after-picture p",
  );

  if (!introTail || !inlineContainer || !mobileContainer) {
    return;
  }

  const targetContainer = window.innerWidth <= 1070 ? mobileContainer : inlineContainer;

  if (introTail.parentElement !== targetContainer) {
    targetContainer.append(introTail);
  }
}

function calculateCardsPerPage() {
  if (window.innerWidth <= 758) {
    return 1;
  }

  if (window.innerWidth <= 1163) {
    return 2;
  }

  return 3;
}

function updateSlider() {
  if (!track || !cards.length || !counter) {
    return;
  }

  const cardWidth = cards[0].getBoundingClientRect().width;
  const pageOffset = visualPage * cardsPerPage * (cardWidth + CARD_GAP);
  track.style.transform = `translateX(-${pageOffset}px)`;

  const displayedCards = Math.min((currentPage + 1) * cardsPerPage, cards.length);
  counter.innerHTML = `${displayedCards} <span class="total-cards">/ ${cards.length}</span>`;
}

function updateSliderWithoutAnimation() {
  track.style.transition = "none";
  updateSlider();
  track.offsetHeight;
  track.style.transition = "";
}

function removeClonedCards() {
  track.querySelectorAll("[data-slider-clone]").forEach((clone) => clone.remove());
}

function createCardClone(card) {
  const clone = card.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  clone.inert = true;
  clone.dataset.sliderClone = "true";
  clone.querySelectorAll("a, button").forEach((element) => {
    element.setAttribute("tabindex", "-1");
  });
  return clone;
}

function rebuildLoopClones() {
  removeClonedCards();

  if (totalPages <= 1) {
    return;
  }

  const beforeClones = cards.slice(-cardsPerPage).map(createCardClone);
  const afterClones = cards.slice(0, cardsPerPage).map(createCardClone);

  track.prepend(...beforeClones);
  track.append(...afterClones);
}

function afterSlideTransition(callback) {
  let isFinished = false;

  const finish = () => {
    if (isFinished) {
      return;
    }

    isFinished = true;
    track.removeEventListener("transitionend", finish);
    if (callback) {
      callback();
    }
    isTransitioning = false;
  };

  track.addEventListener("transitionend", finish);
  setTimeout(finish, SLIDER_TRANSITION_FALLBACK);
}

function goToPage(page) {
  if (totalPages <= 1) {
    return;
  }

  if (isTransitioning) {
    return;
  }

  if (page >= totalPages) {
    currentPage = 0;
    visualPage = totalPages + 1;
    isTransitioning = true;
    updateSlider();
    afterSlideTransition(() => {
      visualPage = 1;
      updateSliderWithoutAnimation();
    });
    return;
  }

  if (page < 0) {
    currentPage = totalPages - 1;
    visualPage = 0;
    isTransitioning = true;
    updateSlider();
    afterSlideTransition(() => {
      visualPage = totalPages;
      updateSliderWithoutAnimation();
    });
    return;
  }

  currentPage = page;
  visualPage = currentPage + 1;
  isTransitioning = true;
  updateSlider();
  afterSlideTransition();
}

function recalculateLayout() {
  cardsPerPage = calculateCardsPerPage();
  totalPages = Math.ceil(cards.length / cardsPerPage);
  currentPage = currentPage % totalPages;
  visualPage = totalPages > 1 ? currentPage + 1 : currentPage;
  isTransitioning = false;
  rebuildLoopClones();
  updateSliderWithoutAnimation();
}

function startAutoplay() {
  if (!cards.length) {
    return;
  }

  clearInterval(autoplayTimer);
  autoplayTimer = setInterval(() => {
    goToPage(currentPage + 1);
  }, AUTOPLAY_DELAY);
}

function handleManualSlide(step) {
  goToPage(currentPage + step);
  startAutoplay();
}

loadHeroImage();
duplicateRunningLines();
moveAdvertisementIntroTail();
window.addEventListener("resize", moveAdvertisementIntroTail);

if (slider && track && prevButton && nextButton && cards.length) {
  prevButton.disabled = false;
  nextButton.disabled = false;

  prevButton.addEventListener("click", () => handleManualSlide(-1));
  nextButton.addEventListener("click", () => handleManualSlide(1));

  window.addEventListener("resize", recalculateLayout);
  recalculateLayout();
  startAutoplay();
}
