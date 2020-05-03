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
        return elem[prop];
    },

    setAttribute(id, attr, value) {
        const elem = this.getById(id);
        elem.setAttribute(attr, value); 
    },

    remove(id) {
        const elem = this.getById(id);
        elem.remove();
    },

    addClass(id, cl) {
        const elem = this.getById(id);
        elem.classList.add(cl);
    },

    hasClass(elOrID, cl) {
        const elem = typeof elOrID === 'string' ? this.getById(id) : elOrID;
        return elem.classList && elem.classList.contains(cl) ? true : false;
    }
}
