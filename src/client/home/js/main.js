window.onload = init;

function init() {
    window.socket = io({transports: ['websocket'], upgrade: false});

<<<<<<< HEAD
    socket.on('stats', data => {
        if (data.players === 0) {
            $(`#${data.room}`).remove();
        } else if (!$(`#${data.room}`)[0]) {
            $('.row').prepend(`<div class="box" id="${data.room}">
                <h4>${data.room}</h4>
                <p class="players">0 player</p>
                <p class="bots">0 bot</p>
=======
    socket.on('home', room => {
        if (!room.members || room.members.length === 0) {
            $(`#${room.id}`).remove();
        } else if (!$(`#${room.id}`)[0]) {
            $('.row').prepend(`<div class="box" id="${room.id}">
                <h4>${room.id}</h4>
                <p>
                    <span class="players">0 player</span><br>
                    <span class="bots small">0 bot</span>
                </p>

                <label for="name">Nickname</label>
                <input type="text" id="nickname" placeholder="Enter a nickname…" required>

>>>>>>> dev
                <button name="play">Play</button>
            </div>`);
        }

<<<<<<< HEAD
        $(`#${data.room} .players`).html(`${data.players} player${data.players > 1 ? 's' : ''}`);
        $(`#${data.room} .bots`).html(`${data.bots} bot${data.players > 1 ? 's' : ''}`);
=======
        if (!room.members) return;

        const botsCount = room.members.filter(m => m.isBot).length;
        const playersCount = room.members.length - botsCount;

        $(`#${room.id} .players`).html(`${playersCount} player${playersCount > 1 ? 's' : ''}`);
        $(`#${room.id} .bots`).html(`${botsCount} bot${botsCount > 1 ? 's' : ''}`);
>>>>>>> dev
    });
}

$(document).on('click', 'button[name="play"]', e => {
    e.preventDefault();
    const room = $(e.target).parents('.box').attr('id');
<<<<<<< HEAD
=======
    const name = $('#nickname').val();

    if (!room || !name) return;

>>>>>>> dev
    sessionStorage.setItem('room', room);
    window.location.href = '/play';
});

$(document).on('click', 'button[name="create"]', e => {
    e.preventDefault();
<<<<<<< HEAD
    const room = $(e.target).parents('.box').find('input').val();
=======
    const room = $('#room').val();
    const name = $('#nickname').val();

    if (!room || !name) return;

>>>>>>> dev
    sessionStorage.setItem('room', room);
    window.location.href = '/play';
});
<<<<<<< HEAD
=======

$(document).on('click', '.box.new-game', () => {
    $('.box.new-game').replaceWith(`
    <div class="box">
        <label for="room">Room name</label>
        <input type="text" id="room" placeholder="Name your room…" required>
        
        <label for="name">Nickname</label>
        <input type="text" id="nickname" placeholder="Enter a nickname…" required>

        <button name="create">Create room</button>
    </div>
    `);
});
>>>>>>> dev
