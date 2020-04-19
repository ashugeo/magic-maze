export default {
    getById(id) {
        return document.getElementById(id);
    },

    setHTML(id, html) {
        const elem = this.getById(id);
        elem.innerHTML = html;
    },

    addEvent(id, ev, f) {
        const elem = this.getById(id);
        elem.addEventListener(ev, f);
    },

    getProperty(id, prop) {
        const elem = this.getById(id);
        if (!elem) return false;
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
    }
}
