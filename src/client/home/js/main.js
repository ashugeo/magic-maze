window.onload = init;

function init() {
    window.socket = io({transports: ['websocket'], upgrade: false});

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

                <label for="nickname">Nickname</label>
                <input type="text" id="nickname" placeholder="Enter a nickname…" required>

                <button name="play">Play</button>
            </div>`);
        }

        if (!room.members) return;

        const botsCount = room.members.filter(m => m.isBot).length;
        const playersCount = room.members.length - botsCount;

        $(`#${room.id} .players`).html(`${playersCount} player${playersCount > 1 ? 's' : ''}`);
        $(`#${room.id} .bots`).html(`${botsCount} bot${botsCount > 1 ? 's' : ''}`);
    });
}

$(document).on('click', 'button[name="play"]', e => {
    e.preventDefault();
    const room = $(e.target).parents('.box').attr('id');
    const name = $('#nickname').val();

    if (!room || !name) return;

    sessionStorage.setItem('room', room);
    sessionStorage.setItem('name', name);
    window.location.href = '/play';
});

$(document).on('click', 'button[name="create"]', e => {
    e.preventDefault();
    const room = $('#room').val();
    const name = $('#nickname').val();

    if (!room || !name) return;

    sessionStorage.setItem('room', room);
    sessionStorage.setItem('name', name);
    window.location.href = '/play';
});

$(document).on('click', '.box.new-game', () => {
    $('.box.new-game').replaceWith(`
    <div class="box">
        <label for="room">Room name</label>
        <input type="text" id="room" placeholder="Name your room…" required>
        
        <label for="nickname">Nickname</label>
        <input type="text" id="nickname" placeholder="Enter a nickname…" required>

        <button name="create">Create room</button>
    </div>
    `);
});
