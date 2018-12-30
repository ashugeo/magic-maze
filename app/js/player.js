import game from './game';

export default {
    $currentAction: null,
    $roles: null,
    allActions: [],
    role: '',

    init() {
        this.$roles = document.getElementById('roles');
    },

    setRoles(roles) {
        // Save my role in window.role
        this.role = roles;

        if (game.players === 1) {
            this.allActions = roles;
            // First role in shuffled array
            this.role = roles[0];

            let text = `<p>Current action: <span id="currentAction">${this.role}</span></p>
            <button id="nextAction">Next action</button>`;
            this.$roles.innerHTML = text;

            document.getElementById('nextAction').addEventListener('click', (e) => {
                if (e.path[0].classList.contains('disabled')) return;
                this.nextAction();
            });

            this.$currentAction = document.getElementById('currentAction');
        } else {
            // Display role
            let text = '<p>Authorized actions: ';
            for (let i in roles) {
                i = parseInt(i);
                text += roles[i];
                if (roles[i + 1]) text += ', ';
            }
            text += '.</p>'

            this.$roles.innerHTML = text;
        }
    },

    nextAction() {
        let i = this.allActions.indexOf(this.role);
        i = i + 1 === this.allActions.length ? 0 : i + 1;
        this.role = this.allActions[i];

        this.$currentAction.innerHTML = this.role;
    }
}
