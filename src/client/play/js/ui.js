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

    addHTML(id, html) {
        const elem = this.getById(id);
        elem.innerHTML += html;
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
            console.error("[getProperty] Could not find element with id", id, prop);
            return undefined;
        }
        return elem[prop];
    },

    getAttribute(id, attr) {
        const elem = this.getById(id);
        if (!elem) {
            console.error("[getAttribute] Could not find element with id", id, attr);
            return undefined;
        }
        return elem.getAttribute(attr);
    },

    setAttribute(id, attr, value) {
        const elem = this.getById(id);
        if (!elem) {
            return console.error("[setAttribute] Could not find element with id", id, attr);
        }
        elem.setAttribute(attr, value);
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
            return console.error("[addClass] Could not find element with id", id, cl);
        }
        elem.classList.add(cl);
    },

    removeClass(id, classes) {
        const elem = this.getById(id);
        if (!elem) {
            return console.error("[removeClass] Could not find element with id", id, classes);
        }
        classes.split(' ').forEach(cl => elem.classList.remove(cl));
    },

    toggleClass(id, cl) {
        if (this.hasClass(id, cl)) this.removeClass(id, cl);
        else this.addClass(id, cl);
    },

    hasClass(elOrID, cl) {
        const elem = typeof elOrID === 'string' ? this.getById(elOrID) : elOrID;
        if (!elem) {
            console.error("[hasClass] Could not find element", elOrID, cl);
            return false;
        }
        return elem.classList && elem.classList.contains(cl);
    },

    moveToEnd(elOrID) {
        const elem = typeof elOrID === 'string' ? this.getById(elOrID) : elOrID;
        if (!elem) {
            return console.error("[moveToEnd] Could not find element", elOrID);
        }
        if (elem) elem.parentElement.innerHTML = elem.parentElement.innerHTML.replace(elem.outerHTML, '') + elem.outerHTML;
    },

    getTransitionDurationForElement(element) {
        const transitionDurationString = window.getComputedStyle(element).transitionDuration;
        return transitionDurationString.substring(0, transitionDurationString.length - 1) * 1000;
    }
}
