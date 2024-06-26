import '../styles/index.scss';
import './utils/polyfill';
import './utils/scroll';

import FontFaceObserver from 'fontfaceobserver';
import AutoBind from 'auto-bind';
import NormalizeWheel from 'normalize-wheel';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { each } from 'lodash';
import Stats from 'stats.js';

import Preloader from './components/Preloader';

import Home from './pages/Home';
import About from './pages/About';

gsap.registerPlugin(ScrollTrigger);

class App {
  constructor() {
    this.template = window.location.pathname;
    this.url = window.location.pathname.replace(window.location.origin, '');
    this.isLoading = false;

    if (import.meta.env.VITE_DEV_MODE) {
      this.createStats();
    }

    AutoBind(this);

    this.init();
  }

  init() {
    this.createPreloader();

    this.createPages();

    this.addEventListeners();
    this.addLinkListeners();
  }

  createPreloader() {
    this.preloader = new Preloader();

    this.preloader.once('loaded', this.onPreloaded);
  }

  createPages() {
    this.home = new Home();
    this.about = new About();

    this.pages = {
      '/': this.home,
      '/about': this.about,
    };

    if (this.template !== '/' && this.template.endsWith('/')) {
      this.template = this.template.slice(0, -1);
    }

    let page = this.pages[this.template];

    if (page === undefined) {
      page = this.home;
    }

    this.page = page;

    this.page.createPageLoader();
  }

  /**
   * Stats.
   */
  createStats() {
    this.stats = new Stats();

    this.stats.showPanel(0);

    document.body.appendChild(this.stats.dom);
  }

  /**
   * Events.
   */
  onPreloaded() {
    this.onResize();

    this.update();

    this.page.show();
  }

  onPopState() {
    this.onChange({
      url: window.location.pathname,
      push: false,
    });
  }

  async onChange({ url, push = true }) {
    if (this.url === url || this.isLoading) return;

    url = url.replace(window.location.origin, '');

    this.url = url;
    this.isLoading = true;

    const page = this.pages[url];

    page.createPageLoader();

    await this.page.hide();

    if (push) {
      window.history.pushState({}, '', url);
    }

    ScrollTrigger.getAll().forEach((t) => t.kill());

    this.template = window.location.pathname;
    this.page = page;

    this.page.show();

    this.onResize();

    this.isLoading = false;
  }

  onResize() {
    if (this.page && this.page.onResize) {
      this.page.onResize();
    }
  }

  onTouchDown(event) {}

  onTouchMove(event) {}

  onTouchUp(event) {}

  onWheel(event) {
    const normalizedWheel = NormalizeWheel(event);
  }

  /**
   * Loop.
   */
  update(time) {
    if (this.stats) {
      this.stats.begin();
    }

    if (this.page) {
      this.page.update(time);
    }

    if (this.stats) {
      this.stats.end();
    }

    window.requestAnimationFrame(this.update.bind(this));
  }

  /***
   * Listeners.
   */
  addEventListeners() {
    window.addEventListener('popstate', this.onPopState, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });

    window.addEventListener('mousedown', this.onTouchDown, {
      passive: true,
    });
    window.addEventListener('mousemove', this.onTouchMove, {
      passive: true,
    });
    window.addEventListener('mouseup', this.onTouchUp, { passive: true });

    window.addEventListener('touchstart', this.onTouchDown, {
      passive: true,
    });
    window.addEventListener('touchmove', this.onTouchMove, {
      passive: true,
    });
    window.addEventListener('touchend', this.onTouchUp, { passive: true });

    window.addEventListener('wheel', this.onWheel, { passive: true });
  }

  addLinkListeners() {
    const links = document.querySelectorAll('a');

    each(links, (link) => {
      const isLocal = link.href.indexOf(window.location.origin) > -1;
      const isAnchor = link.href.indexOf('#') > -1;

      const isNotEmail = link.href.indexOf('mailto') === -1;
      const isNotPhone = link.href.indexOf('tel') === -1;

      if (isLocal) {
        link.onclick = (event) => {
          event.preventDefault();

          if (!isAnchor) {
            this.onChange({
              url: link.href,
            });
          }
        };
      } else if (isNotEmail && isNotPhone) {
        link.rel = 'noopener';
        link.target = '_blank';
      }
    });
  }
}

new App();

// Uncomment and add website's fonts
// const font1 = new FontFaceObserver('Font1');
// const font2 = new FontFaceObserver('Font2');

// Promise.all([font1.load(), font2.load()])
//   .then(() => new App())
//   .catch(() => new App());
