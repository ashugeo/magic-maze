import sockets from './sockets';

const room = sessionStorage.getItem('room');
const name = sessionStorage.getItem('name');

if (!room) window.location.href = '/';

window.onload = () => {
    window.socket = io({transports: ['websocket'], upgrade: false});
    sockets.init();

    if (room) socket.emit('join', { room, name });

    socket.on('msg', msg => {
        console.log(msg);
    });
}
