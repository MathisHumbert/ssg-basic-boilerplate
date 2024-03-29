import autoBind from 'auto-bind';
import EventEmitter from 'events';
import { each } from 'lodash';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Lenis from '@studio-freight/lenis';

import LazyLoad from '../classes/LazyLoad';
import PageLoad from '../classes/PageLoad';

import { mapEach } from '../utils/dom';

import Highlight from '../animations/Highlight';

export default class Page extends EventEmitter {
  constructor({ classes, id, element, elements, isScrollable = true }) {
    super();

    autoBind(this);

    this.classes = { ...classes };
    this.id = id;
    this.selectors = {
      element,
      elements: {
        preloaders: '[data-src]',
        pagePreloaders: '[data-page-src]',

        animationsHighlights: '[data-animation="highlight"]',

        ...elements,
      },
    };
    this.isScrollable = isScrollable;

    this.isVisible = false;
    this.imagesLoaded = false;

    this.create();
  }

  create() {
    this.animations = [];

    this.element = document.querySelector(this.selectors.element);
    this.elements = {};

    each(this.selectors.elements, (selector, key) => {
      if (
        selector instanceof window.HTMLElement ||
        selector instanceof window.NodeList
      ) {
        this.elements[key] = selector;
      } else if (Array.isArray(selector)) {
        this.elements[key] = selector;
      } else {
        this.elements[key] = this.element.querySelectorAll(selector);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = this.element.querySelector(selector);
        }
      }
    });

    this.createAnimations();
    this.createLazyloader();
    this.addEventListeners();
  }

  /**
   * Animations.
   */
  createAnimations() {
    /**
     * Highlight.
     */
    this.animationsHighlight = mapEach(
      this.elements.animationsHighlights,
      (element) => {
        return new Highlight({ element });
      }
    );

    this.animations.push(...this.animationsHighlight);
  }

  /**
   * Loaders.
   */
  createLazyloader() {
    mapEach(
      this.elements.preloaders,
      (element) =>
        new LazyLoad({
          element,
        })
    );
  }

  createPageLoader() {
    if (this.imagesLoaded) return;

    this.imagesLoaded = true;

    mapEach(
      this.elements.pagePreloaders,
      (element) => new PageLoad({ element })
    );
  }

  /**
   * Animations.
   */
  show() {
    this.lenis = new Lenis({});
    this.lenis.scrollTo(0, { immediate: true });

    this.lenis.on('scroll', ScrollTrigger.update);

    each(this.animations, (animation) => animation.createAnimation());

    this.isVisible = true;
    this.isAlreadyLoaded = true;

    gsap.set(document.documentElement, {
      backgroundColor: this.element.getAttribute('data-background'),
      color: this.element.getAttribute('data-color'),
    });

    return Promise.resolve();
  }

  hide() {
    this.isVisible = false;

    this.lenis.destroy();
    this.lenis = null;

    each(this.animations, (animation) => animation.destroyAnimation());

    return Promise.resolve();
  }

  /**
   * Events.
   */
  onResize() {
    if (!this.elements.wrapper) return;

    window.requestAnimationFrame(() => {
      each(this.animations, (animation) => {
        if (animation.onResize) {
          animation.onResize();
        }
      });
    });
  }

  /**
   * Listeners.
   */
  addEventListeners() {}

  /**
   * Loop.
   */
  update(time) {
    if (!this.isScrollable || !this.isVisible) return;

    this.lenis.raf(time);

    each(this.animations, (animation) => {
      if (animation.update) {
        animation.update(this.lenis.scroll);
      }
    });
  }
}
