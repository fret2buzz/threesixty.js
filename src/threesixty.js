import Events from './threesixty/events';

class ThreeSixty {
  #options = null;
  #index = 0;

  #loopTimeoutId = null;
  #looping = false;

  #events = null;
  #sprite = false;

  constructor(container, options) {
    this.container = container;

    this.#options = Object.assign({
      width: 300,
      height: 300,
      aspectRatio: 0,
      count: 0,
      perRow: 0,
      speed: 100,
      dragTolerance: 10,
      swipeTolerance: 10,
      draggable: true,
      swipeable: true,
      keys: true,
      inverted: false
    }, options);

    this.#options.swipeTarget = this.#options.swipeTarget || this.container;

    this.#sprite = !Array.isArray(this.#options.image);
    if (!this.sprite) {
      this.#options.count = this.#options.image.length;
    }

    Object.freeze(this.#options);

    this.#events = new Events(this, this.#options);

    this._windowResizeListener = this._windowResizeListener.bind(this);

    this._initContainer();
  }

  get isResponsive() {
    return this.#options.aspectRatio > 0;
  }

  get containerWidth() {
    return this.isResponsive ? this.container.clientWidth : this.#options.width;
  }

  get containerHeight() {
    return this.isResponsive
      ? this.container.clientWidth * this.#options.aspectRatio
      : this.#options.height;
  }

  get index() {
    return this.#index;
  }

  get looping() {
    return this.#looping;
  }

  get sprite() {
    return this.#sprite;
  }

  next() {
    this.goto(this.#options.inverted ? this.#index - 1 : this.#index + 1);
  }

  prev() {
    this.goto(this.#options.inverted ? this.#index + 1 : this.#index - 1);
  }

  goto(index) {
    this.#index = (this.#options.count + index) % this.#options.count;

    this._update();
  }

  play (reversed) {
    if (this.looping) {
      return;
    }

    this._loop(reversed);
    this.#looping = true;
  }

  stop () {
    if (!this.looping) {
      return;
    }

    global.clearTimeout(this.#loopTimeoutId);
    this.#looping = false;
  }

  toggle(reversed) {
    this.looping ? this.stop() : this.play(reversed);
  }

  destroy() {
    this.stop();

    this.#events.destroy();

    this.container.style.width = '';
    this.container.style.height = '';
    this.container.style.backgroundImage = '';
    this.container.style.backgroundPositionX = '';
    this.container.style.backgroundPositionY = '';
    this.container.style.backgroundSize = '';

    if (this.isResponsive) {
      window.removeEventListener('resize', this._windowResizeListener);
    }
  }

  _loop(reversed) {
    reversed ? this.prev() : this.next();

    this.#loopTimeoutId = global.setTimeout(() => {
      this._loop(reversed);
    }, this.#options.speed);
  }

  _update () {
    if (this.sprite) {
      this.container.style.backgroundPositionX = -(this.#index % this.#options.perRow) * this.containerWidth + 'px';
      this.container.style.backgroundPositionY = -Math.floor(this.#index / this.#options.perRow) * this.containerHeight + 'px';
    } else {
      // this.container.style.backgroundImage = `url("${this.#options.image[this.#index]}")`;
      this.grid.style.transform = 'translateX(' + -(this.#index * this.containerWidth) + 'px)';
    }
  }

  _windowResizeListener() {
    this.container.className = 'm-loading';
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
        this.container.style.height = this.containerHeight + 'px';
        this._update()
        this.container.className = '';
    }, 250);
  }

  _initContainer() {
    if (!this.isResponsive) {
      this.container.style.width = this.containerWidth + 'px';
    }
    this.container.style.height = this.containerHeight + 'px';

    if (this.sprite) {
      this.container.style.backgroundImage = `url("${this.#options.image}")`;

      const cols = this.#options.perRow;
      const rows = Math.ceil(this.#options.count / this.#options.perRow);
      this.container.style.backgroundSize = (cols * 100) + '% ' + (rows * 100) + '%';
    } else {
      var fragment = new DocumentFragment();
      this.grid = document.createElement('div');
      this.grid.className = 'threesixty-grid';
      this.container.className = 'm-loading';
      fragment.appendChild(this.grid);
      this.#options.image.forEach(el => {
        var image = document.createElement('img');
        image.className = 'threesixty-image';
        image.src = el;
        image.setAttribute('loading', 'lazy');
        image.setAttribute('alt', ' ');
        this.grid.appendChild(image);
      });
      this.container.appendChild(fragment);

      const images = this.#options.image.map(this.preload);
      Promise.all(images).then((eee) => {
        console.log(eee, 'loaded');
        this.container.className = '';
      }).catch(err => {
        console.log(err);
      });
    }

    if (this.isResponsive) {
      window.addEventListener('resize', this._windowResizeListener);
    }

    this._update();
  }

  preload(src) {
    return new Promise(function(resolve, reject) {
      const img = new Image();
      img.onload = function() {
        console.log(src);
        resolve(img);
      }
      img.onerror = reject;
      img.src = src;
    });
  }
}

export default ThreeSixty;
