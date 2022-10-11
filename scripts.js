// TODO: Autoplay
// TODO: Clean up the code
// TODO: Add more control options


class Utility {
    debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    getMousePosition(e) {
        let posX = 0;
        let posY = 0;

        if (!e) {
            e = window.event;
        }

        if (e.pageX || e.pageY) {
            posX = e.pageX;
            posY = e.pageY;
        } else if (e.clientX || e.clientY) {
            posX =
                e.clientX +
                document.body.scrollLeft +
                document.documentElement.scrollLeft;
            posY =
                e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posX,
            y: posY
        };
    }

    docScrolls() {
        return {
            x: document.body.scrollLeft + document.documentElement.scrollLeft,
            y: document.body.scrollTop + document.documentElement.scrollTop
        }
    }
}


class Tilt {
    constructor(el, options) {
        this.el = el;
        this.init();
        this.settings = {
            rotate: {
                x: 20,
                y: 20,
                z: 5
            },
            translate: {
                x: 20,
                y: 20,
                z: 0
            },
            lock: false,
            speed: 1000
        }
        Object.assign(this.settings, options);
        this.utility = new Utility()
        this.bindEvents();
    }



    calculateRotation(pos, ref) {
        const percentageX = pos.x / this.bounds.width;
        const percentageY = pos.y / this.bounds.height;
        const percentageZ = pos.x / this.bounds.width;

        const rX = ref.x - percentageX * ref.x * 2;
        const rY = ref.y - percentageY * ref.y * 2;
        const rZ = ref.z - percentageZ * ref.z * 2;

        return {
            y: rX,
            x: rY * -1,
            z: rZ * -1
        };
    }

    calculateTranslation(pos, ref) {
        const percentageX = pos.x / this.bounds.width;
        const percentageY = pos.y / this.bounds.height;
        const percentageZ = pos.x / this.bounds.width;

        const tX = ref.x - percentageX * ref.x * 2;
        const tY = ref.y - percentageY * ref.y * 2;
        const tZ = ref.z - percentageZ * ref.z * 2;

        return {
            x: tX * -1,
            y: tY * -1,
            z: tZ * -1
        };
    }

    init() {
        this.bounds = this.el.getBoundingClientRect();
    }

    bindEvents() {
        let mousePos;
        let bounds = this.el.getBoundingClientRect();
        let docScrolls = this.utility.docScrolls();
        this.el.addEventListener("mousemove", (e) => {
            mousePos = this.utility.getMousePosition(e);

            const relMousePos = {
                x: mousePos.x - bounds.left - docScrolls.x,
                y: mousePos.y - bounds.top - docScrolls.y
            };

            const translation = this.calculateTranslation(
                relMousePos,
                this.settings.translate
            );
            const rotation = this.calculateRotation(
                relMousePos,
                this.settings.rotate
            );

            this.animate({
                translation,
                rotation
            });
        });

        window.addEventListener("resize", this.utility.debounce((e) => {
            this.bounds = this.el.getBoundingClientRect();
            docScrolls = this.utility.docScrolls();
        }, 250))
        window.addEventListener("scroll", this.utility.debounce((e) => {
            this.bounds = this.el.getBoundingClientRect();
            docScrolls = this.utility.docScrolls();
        }, 250))
    }

    animate(ref) {
        TweenMax.to(this.el.querySelector('img'), this.settings.speed / 1000, {
            x: ref.translation.x,
            y: ref.translation.y,
            z: ref.translation.z,
            rotationX: ref.rotation.x,
            rotationY: ref.rotation.y,
            rotationZ: ref.rotation.z,

            ease: Power1.easeOut
        });
    }
}


class Slide {
    constructor(el) {
        this.DOM = {};
        this.DOM.el = el;
        this.DOM.wrap = el.querySelector('.slide-wrapper');
        this.DOM.imgWrapper = el.querySelector('.img-wrapper');
        this.DOM.titleWrap = el.querySelector('.title-wrapper');
        this.DOM.title = el.querySelector('.inner-wrapper');
        this.config = {
            animation: {
                duration: 1,
                ease: Expo.easeInOut
            },
            tiltOptions: {
                translate: {
                    x: -10,
                    y: -10,
                    z: 5
                },
                rotate: {
                    x: 0,
                    y: 0,
                    z: 0
                }
            }
        };



        this.DOM.img = new Tilt(el, this.config.tiltOptions)

    }
    setCurrent(isCurrent = true) {
        this.DOM.el.classList[isCurrent ? 'add' : 'remove']('current');
    }
    hide(direction) {
        return this.toggle('hide', direction);
    }
    show(direction) {
        this.DOM.el.style.zIndex = 11;
        return this.toggle('show', direction);
    }
    toggle(action, direction) {
        return new Promise((resolve) => {
            if (action === 'show') {
                TweenMax.to(this.DOM.wrap, this.config.animation.duration, {
                    ease: this.config.animation.ease,
                    startAt: {
                        x: direction === 'right' ? '100%' : '-100%'
                    },
                    x: '0%'
                });
                TweenMax.to(this.DOM.titleWrap, this.config.animation.duration, {
                    ease: this.config.animation.ease,
                    startAt: {
                        x: direction === 'right' ? '-100%' : '100%',
                    },
                    x: '0%',
                });
                TweenMax.to(this.DOM.title, this.config.animation.duration, {
                    ease: this.config.animation.ease,
                    startAt: {
                        filter: `blur(30px)`,
                        opacity: 0.2
                    },
                    filter: `blur(0px)`,
                    opacity: 1
                });
            }
            if (action === 'hide') {
                TweenMax.to(this.DOM.title, this.config.animation.duration, {
                    ease: this.config.animation.ease,
                    startAt: {
                        filter: `blur(0px)`,
                        opacity: 1
                    },
                    filter: `blur(30px)`,
                    opacity: 0.2
                });
            }

            TweenMax.to(this.DOM.imgWrapper, this.config.animation.duration, {
                ease: this.config.animation.ease,
                startAt: action === 'hide' ? {} : {
                    x: direction === 'right' ? '-100%' : '100%',
                    scale: 1.1
                },
                x: '0%',
                scale: action === 'hide' ? 1.1 : 1,
                onStart: () => {
                    this.DOM.imgWrapper.style.transformOrigin = action === 'hide' ?
                        direction === 'right' ? '100% 50%' : '0% 50%' :
                        direction === 'right' ? '0% 50%' : '100% 50%';
                    this.DOM.el.style.opacity = 1;
                },
                onComplete: () => {
                    this.DOM.el.style.zIndex = 9;
                    this.DOM.el.style.opacity = action === 'hide' ? 0 : 1;
                    resolve();
                }
            });

        });
    }
}


class Navigation {
    constructor(el, settings) {
        this.DOM = {};
        this.DOM.el = el;
        this.bullets = [];
        this.settings = {
            active: 0,
            onClick: () => false
        }
        Object.assign(this.settings, settings);
        this.init()
    }
    init() {
        Array.from(this.DOM.el.querySelectorAll('.bullet'))
            .forEach(bullet => {
                this.bullets.push(bullet)
            });

        this.bullets[this.settings.active].classList.add('current')
        this.bindEvents()
    }

    bindEvents() {
        this.bullets.forEach((bullet, idx) => {
            bullet.addEventListener('click', () => {
                this.settings.onClick(idx)
            })
        })
    }

    setCurrent(idx) {
        this.bullets.forEach(bullet => {
            bullet.classList.remove('current')
        })
        this.bullets[idx].classList.add('current')
    }

}


class Slider {
    constructor(el, settings) {
        this.DOM = {};
        this.DOM.el = el;
        this.slides = [];

        this.settings = {
            currentSlide: 0,
        }
        Object.assign(this.settings, settings);
        this.init();
    }
    init() {
        this.navigation = new Navigation(document.querySelector('#navigation'), {
            active: this.settings.currentSlide,
            onClick: (idx) => this.navigate(idx)
        });
        Array.from(this.DOM.el.querySelectorAll('.slide'))
            .forEach((slide) => {
                this.slides.push(new Slide(slide))
            });
        this.slides[this.settings.currentSlide].setCurrent();
    }

    async navigate(idx) {
        if (this.isAnimating || idx === this.settings.currentSlide) return;
        this.isAnimating = true;

        const direction = idx > this.settings.currentSlide ? 'right' : 'left'

        this.navigation.setCurrent(idx)
        await Promise.all([this.slides[this.settings.currentSlide].hide(direction), this.slides[idx].show(direction)])
        this.slides[this.settings.currentSlide].setCurrent(false);
        this.settings.currentSlide = idx;
        this.slides[this.settings.currentSlide].setCurrent();
        this.isAnimating = false;

    }
}


const sliderEl = document.querySelector('#slider');
const slider = new Slider(sliderEl);

// const options = { currentSlide: 3 };
// const slider = new Slider(sliderEl, options);