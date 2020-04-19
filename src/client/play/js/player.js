import game from './game';
import ui from './ui';

export default {
    allActions: [],
    role: '',

    setRoles(roles) {
        // Save my role in window.role
        this.role = roles;

        if (game.players.length === 1) {
            this.allActions = roles;
            // First role in shuffled array
            this.role = roles[0];

            let html = `<p>Current action: <span id="currentAction">${this.role}</span></p>
            <button id="nextAction">Next action</button>`;
            ui.setHTML('roles', html);

            ui.addEvent('nextAction', 'click', (e) => {
                if (ui.hasClass(e.srcElement.id, 'disabled')) return;
                this.nextAction();
            });
        }
    },

    nextAction() {
        let i = this.allActions.indexOf(this.role);
        i = i + 1 === this.allActions.length ? 0 : i + 1;
        this.role = this.allActions[i];

        ui.setHTML('currentAction', this.role);
    }
}
