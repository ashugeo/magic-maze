window.onload = init;

function init() {
    window.socket = io({transports: ['websocket'], upgrade: false});

    socket.on('home', data => {
        if (data.members.length === 0) {
            $(`#${data.id}`).remove();
        } else if (!$(`#${data.id}`)[0]) {
            $('.row').prepend(`<div class="box" id="${data.id}">
                <h4>${data.id}</h4>
                <p>
                    <span class="players">0 player</span><br>
                    <span class="bots small">0 bot</span>
                </p>

                <label for="name">Nickname</label>
                <input type="text" id="name" placeholder="Enter a nickname…" required>

                <button name="play">Play</button>
            </div>`);
        }

        const botsCount = data.members.filter(m => m.isBot).length;
        const playersCount = data.members.length - botsCount;

        $(`#${data.id} .players`).html(`${playersCount} player${playersCount > 1 ? 's' : ''}`);
        $(`#${data.id} .bots`).html(`${botsCount} bot${botsCount > 1 ? 's' : ''}`);
    });
}

$(document).on('click', 'button[name="play"]', e => {
    e.preventDefault();
    const room = $(e.target).parents('.box').attr('id');
    const name = $('#name').val();

    if (!room || !name) return;

    sessionStorage.setItem('room', room);
    sessionStorage.setItem('name', name);
    window.location.href = '/play';
});

$(document).on('click', 'button[name="create"]', e => {
    e.preventDefault();
    const room = $('#room').val();
    const name = $('#name').val();

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
        
        <label for="name">Nickname</label>
        <input type="text" id="name" placeholder="Enter a nickname…" required>

        <button name="create">Create room</button>
    </div>
    `);
});