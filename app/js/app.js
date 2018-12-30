import sockets from './sockets';

window.addEventListener('load', () => {
    window.socket = io({transports: ['websocket'], upgrade: false});
    sockets.init();
});
