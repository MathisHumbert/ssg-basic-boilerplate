import gsap from 'gsap';

import Component from './Component';

export default class PageLoad extends Component {
  constructor({ element }) {
    super({ element });

    this.createLoader();
  }

  createLoader() {
    const src = img.getAttribute('data-page-src');

    if (src) {
      this.element.src = src;
      this.element.onload = () => {
        gsap.fromTo(this.element, { autoAlpha: 0 }, { autoAlpha: 1 });
      };
    }
  }
}
