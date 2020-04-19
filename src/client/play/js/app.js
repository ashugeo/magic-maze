import sockets from './sockets';

const room = sessionStorage.getItem('room');

if (!room) window.location.href = '/';

window.onload = () => {
    window.socket = io({transports: ['websocket'], upgrade: false});
    sockets.init();

<<<<<<< HEAD
    if (room) socket.emit('join', room);
=======
    if (room) {
        socket.emit('join', { room, name });
        document.title = `Magic Maze · ${room}`;
    }
>>>>>>> dev

    socket.on('msg', msg => {
        console.log(msg);
    });
}
