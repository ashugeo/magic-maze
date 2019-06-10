window.onload = init;

function init() {
    window.socket = io({transports: ['websocket'], upgrade: false});

    document.getElementById('play').addEventListener('click', e => {
        sessionStorage.setItem('room', 'room1');
        window.location.href = '/play';
    });
}
