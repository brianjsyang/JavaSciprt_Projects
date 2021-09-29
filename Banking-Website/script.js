'use strict';

/**
 * Query Selectors
 */
const header = document.querySelector('.header');
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');
const nav = document.querySelector('.nav');

const openModal = function (e) {
  e.preventDifault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// /////////////////////////////////////////////////// //
/**
 * * Smooth Scroll to Selected Section *
 * 1. "Learn More" label.
 * 2. Page Navigation
 *
 * Event Propagation
 * TODO very useful to add one event handler for all relevant elements.
 * 1. Add event listener to common parent element.
 * 2. Determine what element triggered the event. (e.target)
 */
btnScrollTo.addEventListener('click', function () {
  section1.scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();

  // Matching strategy to avoid click event on parent element
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

// /////////////////////////////////////////////////// //
/**
 * * Tabbed Componenets *
 * 1. Each tabs need "click" event listener
 * 1-1. Attach event handler to parent element
 */
tabsContainer.addEventListener('click', function (e) {
  // Determine which tab is clicked
  const clicked = e.target.closest('.operations__tab');

  if (!clicked) return;

  // Active Tab: first remove all active tab ... add to one active
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  clicked.classList.add('operations__tab--active');

  // Active Content
  tabsContent.forEach(t => t.classList.remove('operations__content--active'));
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

// /////////////////////////////////////////////////// //
/**
 * * Fade Out Effect on Menu *
 * -- Event Deligation --
 */
const handleHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target; // Hovered element
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};

// Passing an argument into handler
nav.addEventListener('mouseover', handleHover.bind(0.5));
nav.addEventListener('mouseout', handleHover.bind(1));

// /////////////////////////////////////////////////// //
/**
 * * Sticky Navigation *
 * Using "scroll" event is very inefficient
 * ? Implement using "intersection observer API"
 */
const navHeight = nav.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const obs = new IntersectionObserver(stickyNav, {
  root: null, // current view port
  threshold: 0, // 0% of header is visible ... trigger function
  rootMargin: `-${navHeight}px`, // px amount offset ... usually height of the element
});
obs.observe(header);

// /////////////////////////////////////////////////// //
/**
 * * Section Automatically Scrolls into View *
 * Remove "hidden" class as viewport approaches section
 */
// Reveal Sections
const allSections = document.querySelectorAll('.section');

const revealSection = function (entries, obs) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  entry.target.classList.remove('section--hidden');

  // Stop observing for performance
  obs.unobserve(entry.target);
};

const sectionObs = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.3,
});
allSections.forEach(function (section) {
  sectionObs.observe(section);
  section.classList.add('section--hidden');
});

// /////////////////////////////////////////////////// //
/**
 * * Lazy Loading of Images (Performance Optimization) *
 * As approaching the img, replace low-res image to high-res one.
 * Also remove blur.
 */
// Only select images with replacing high-res img
const imgTargets = document.querySelectorAll('img[data-src');

const loadImg = function (entries, obs) {
  const [entry] = entries;

  // only call function when intersecting
  if (!entry.isIntersecting) return;

  // Replace src img with high-res img (data-src).
  entry.target.src = entry.target.dataset.src;
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });
  obs.unobserve(entry.target);
};

const imgObs = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px', // starting loading images early.
});
imgTargets.forEach(img => imgObs.observe(img));

// /////////////////////////////////////////////////// //
/**
 * * Slider Components *
 */
const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const btnRight = document.querySelector('.slider__btn--right');
  const btnLeft = document.querySelector('.slider__btn--left');
  const dotContainer = document.querySelector('.dots');

  const maxSlides = slides.length - 1;
  let currSlide = 0;

  // Useful Functions ...
  const createDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class ="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const goToSlide = function (slide) {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };

  const nextSlide = function () {
    if (currSlide === maxSlides) currSlide = 0;
    else currSlide++;

    goToSlide(currSlide);
    activateDot(currSlide);
  };

  const prevSlide = function () {
    if (currSlide === 0) currSlide = maxSlides;
    else currSlide--;

    goToSlide(currSlide);
    activateDot(currSlide);
  };

  // initialize
  goToSlide(0);
  createDots();
  activateDot(0);

  // Event Handlers
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  document.addEventListener('keydown', function (e) {
    e.key === 'ArrowLeft' && prevSlide();
    e.key === 'ArrowRight' && nextSlide();
  });

  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      const { slideIndex } = e.target.dataset.slide;

      console.log(slideIndex);

      goToSlide(slideIndex);
      activateDot(currSlide);
    }
  });
};
slider();
