import ui from "./ui";

export default {
    alertModal: null,
    alertTimeout: null,
    alertHideTimeout: 500,

    gameOverModal: null,
    pauseModal: null,

    showAlert(name) {
        this.forceCloseAlert();

        const canvasWrap = document.getElementById("game-wrap");
        if (canvasWrap === null || canvasWrap === undefined) {
            return;
        }

        this.alertModal = document.createElement("div");
        this.alertModal.classList.add("modal");
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
    },

    showGameOver(message) {
        this.forceCloseGameOver();

        const canvasWrap = document.getElementById("game-wrap");
        if (canvasWrap === null || canvasWrap === undefined) {
            return;
        }

        this.gameOverModal = document.createElement("div");
        this.gameOverModal.classList.add("modal");
        this.gameOverModal.classList.add("game-over-modal");
        this.gameOverModal.innerHTML = `<div class="message">${message}</div>`;
        canvasWrap.appendChild(this.gameOverModal);

        this.gameOverModal.addEventListener('click', this.forceCloseGameOver.bind(this));
    },

    forceCloseGameOver() {
        if (this.gameOverModal && this.gameOverModal.parentNode) {
            this.gameOverModal.parentNode.removeChild(this.gameOverModal);
        }
    },

    showPause(message, callback) {
        this.forceClosePause();

        const canvasWrap = document.getElementById("game-wrap");
        if (canvasWrap === null || canvasWrap === undefined) {
            return;
        }

        this.pauseModal = document.createElement("div");
        this.pauseModal.classList.add("modal");
        this.pauseModal.classList.add("pause-modal");
        this.pauseModal.innerHTML = `<div class="message">${message}</div>`;
        canvasWrap.appendChild(this.pauseModal);

        if (callback === undefined) {
            this.pauseModal.addEventListener('click', this.forceClosePause.bind(this));
        } else if (callback !== null) {
            this.pauseModal.addEventListener('click', callback);
        }
    },

    forceClosePause() {
        if (this.pauseModal && this.pauseModal.parentNode) {
            this.pauseModal.parentNode.removeChild(this.pauseModal);
        }
    },
}
