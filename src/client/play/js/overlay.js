import ui from "./ui";

export default {
    alertModal: null,
    alertTimeout: null,
    alertHideTimeout: 500,

    gameOverModal: null,
    pauseModal: null,

    createAndShowModal(className, htmlContent) {
        const canvasWrap = document.getElementById("canvas-wrap");
        if (canvasWrap === null || canvasWrap === undefined) {
            return null;
        }

        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.classList.add(className);
        modal.innerHTML = htmlContent;
        canvasWrap.appendChild(modal);

        return modal;
    },

    forceCloseModal(modal) {
        if (modal !== null && modal.parentNode !== null) {
            modal.parentNode.removeChild(modal);
        }
    },

    showAlert(name) {
        this.forceCloseAlert();

        this.alertModal = this.createAndShowModal("alert-modal",
                                                     `<div class="message">${name} alerted you</div>`);
        if (this.alertModal === null)
            return;

        window.setTimeout(() => this.alertModal.classList.add("hide"), this.alertHideTimeout);

        const alertRemoveTimeout = this.alertHideTimeout + ui.getTransitionDurationForElement(this.alertModal);
        this.alertTimeout = window.setTimeout(() => this.forceCloseAlert(), alertRemoveTimeout);
    },

    forceCloseAlert() {
       this.forceCloseModal(this.alertModal);

        window.clearTimeout(this.alertTimeout);
    },

    showGameOver(message) {
        this.forceCloseGameOver();

        this.gameOverModal = this.createAndShowModal("game-over-modal",
                                                     `<div class="message">${message}</div>`);
        if (this.gameOverModal === null)
            return;

        this.gameOverModal.addEventListener('click', this.forceCloseGameOver.bind(this));
    },

    forceCloseGameOver() {
       this.forceCloseModal(this.gameOverModal);
    },

    showPause(message, callback) {
        this.forceClosePause();

        this.pauseModal = this.createAndShowModal("pause-modal",
                                                     `<div class="message">${message}</div>`);
        if (this.pauseModal === null)
            return;

        if (callback === undefined) {
            this.pauseModal.addEventListener('click', this.forceClosePause.bind(this));
        } else if (callback !== null) {
            this.pauseModal.addEventListener('click', callback);
        }
    },

    forceClosePause() {
       this.forceCloseModal(this.pauseModal);
    },
}
