export default {
    getById(id) {
        return document.getElementById(id);
    },
    getByClass(className) {
        return document.getElementsByClassName(className);
    },

    setHTML(id, html) {
        const elem = this.getById(id);
        elem.innerHTML = html;
    },

    addEvent(id, ev, f) {
        const elem = this.getById(id);
        elem.addEventListener(ev, f);
    },

    addEventForClass(className, ev, f) {
        const elem = this.getByClass(className);
        Array.from(elem).forEach(el => el.addEventListener(ev, f));
    },

    getProperty(id, prop) {
        const elem = this.getById(id);
        return elem[prop];
    },

    remove(id) {
        const elem = this.getById(id);
        elem.remove();
    },

    addClass(id, cl) {
        const elem = this.getById(id);
        elem.classList.add(cl);
    },

    hasClass(id, cl) {
        const elem = this.getById(id);
        return elem.classList.contains(cl);
    },

    getTransitionDurationForElement(element) {
        const transitionDurationString = window.getComputedStyle(element).transitionDuration;
        return transitionDurationString.substring(0, transitionDurationString.length - 1) * 1000;
    }
}
