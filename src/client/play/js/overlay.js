import ui from "./ui";

export default {
    alertModal: null,
    alertTimeout: null,
    alertHideTimeout: 500,

    showAlert(name) {
        this.forceCloseAlert();

        const canvasWrap = document.getElementById("canvas-wrap");
        if (canvasWrap === null || canvasWrap === undefined) {
            return;
        }

        this.alertModal = document.createElement("div");
        this.alertModal.classList.add("alert-modal");
        this.alertModal.innerHTML = `<div class="message">${name} alerted you</div>`;
        canvasWrap.appendChild(this.alertModal);

        window.setTimeout(() => this.alertModal.classList.add("hide"), this.alertHideTimeout);

        const alertRemoveTimeout = this.alertHideTimeout + ui.getTransitionDurationForElement(this.alertModal);
        this.alertTimeout = window.setTimeout(() => this.forceCloseAlert(), alertRemoveTimeout);
    },

    forceCloseAlert() {
        if (this.alertModal !== null && this.alertModal.parentNode !== null) {
            this.alertModal.parentNode.removeChild(this.alertModal);
        }

        window.clearTimeout(this.alertTimeout);
    }
}
