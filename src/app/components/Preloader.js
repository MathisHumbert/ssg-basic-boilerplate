import imagesLoaded from 'imagesloaded';

import Component from '../classes/Component';

export default class Preloader extends Component {
  constructor() {
    super({
      element: '.preloader',
    });

    this.createLoader();
  }

  createLoader() {
    const preloadImages = imagesLoaded(document.querySelectorAll('img'), {
      background: true,
    });

    return new Promise((res) => {
      preloadImages.on('done', () => {
        this.onLoaded();

        res();
      });
    });
  }

  onLoaded() {
    // this.element.remove();

    this.emit('loaded');
  }
}
