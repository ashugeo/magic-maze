export default {
    getById(id) {
        return document.getElementById(id);
    },
    getByClass(className) {
        return document.getElementsByClassName(className);
    },

    setHTML(id, html) {
        const elem = this.getById(id);
        if (!elem) {
            return console.error("[setHTML] Could not find element with id", id);
        }
        elem.innerHTML = html;
    },

    addEvent(id, ev, f) {
        const elem = this.getById(id);
        if (!elem) {
            return console.error("[addEvent] Could not find element with id", id);
        }
        elem.addEventListener(ev, f);
    },

    addEventForClass(className, ev, f) {
        const elem = this.getByClass(className);
        Array.from(elem).forEach(el => el.addEventListener(ev, f));
    },

    getProperty(id, prop) {
        const elem = this.getById(id);
        if (!elem) {
            console.error("[getProperty] Could not find element with id", id);
            return undefined;
        }
        return elem[prop];
    },

    remove(id) {
        const elem = this.getById(id);
        if (!elem) {
            return console.warn("[remove] Element already removed, with id", id);
        }
        elem.remove();
    },

    addClass(id, cl) {
        const elem = this.getById(id);
        if (!elem) {
            return console.error("[addClass] Could not find element with id", id);
        }
        elem.classList.add(cl);
    },

    hasClass(id, cl) {
        const elem = this.getById(id);
        if (!elem) {
            console.error("[hasClass] Could not find element with id", id);
            return false;
        }
        return elem.classList.contains(cl);
    },

    getTransitionDurationForElement(element) {
        const transitionDurationString = window.getComputedStyle(element).transitionDuration;
        return transitionDurationString.substring(0, transitionDurationString.length - 1) * 1000;
    }
}
