import sockets from './sockets';

const room = sessionStorage.getItem('room');

if (!room) window.location.href = '/';

window.onload = () => {
    window.socket = io({transports: ['websocket'], upgrade: false});
    sockets.init();

    if (room) socket.emit('join', room);

    socket.on('msg', msg => {
        console.log(msg);
    });
}
