import sockets from './sockets';

const room = sessionStorage.getItem('room');
const name = sessionStorage.getItem('name');

if (!room || !name) window.location.href = '/';

window.onload = () => {
    window.socket = io({transports: ['websocket'], upgrade: false});
    sockets.init();

    if (room) {
        socket.emit('join', { room, name });
        document.title = `Magic Maze · ${room}`;
    }
}
