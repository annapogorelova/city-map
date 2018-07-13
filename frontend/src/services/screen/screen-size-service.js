export default class ScreenSizeService {
    isExtraSmall() {
        return this.getWindowWidth() < 768;
    }

    isSmall() {
        const windowWidth = this.getWindowWidth();
        return windowWidth >= 768 && windowWidth < 992;
    }

    isMedium() {
        const windowWidth = this.getWindowWidth();
        return windowWidth >= 992 && windowWidth < 1200;
    }

    isLarge() {
        return this.getWindowWidth() > 1200;
    }

    getWindowWidth() {
        return window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
    }

    isTouchDevice() {
        const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');

        if (("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            return true;
        }


        const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return window.matchMedia(query).matches;
    }
}