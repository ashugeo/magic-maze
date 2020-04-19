window.onload = init;

function init() {
    window.socket = io({transports: ['websocket'], upgrade: false});

    socket.on('stats', data => {
        if (data.players === 0) {
            $(`#${data.room}`).remove();
        } else if (!$(`#${data.room}`)[0]) {
            $('.row').prepend(`<div class="box" id="${data.room}">
                <h4>${data.room}</h4>
                <p class="players">0 player</p>
                <p class="bots">0 bot</p>
                <button name="play">Play</button>
            </div>`);
        }

        $(`#${data.room} .players`).html(`${data.players} player${data.players > 1 ? 's' : ''}`);
        $(`#${data.room} .bots`).html(`${data.bots} bot${data.players > 1 ? 's' : ''}`);
    });
}

$(document).on('click', 'button[name="play"]', e => {
    e.preventDefault();
    const room = $(e.target).parents('.box').attr('id');
    sessionStorage.setItem('room', room);
    window.location.href = '/play';
});

$(document).on('click', 'button[name="create"]', e => {
    e.preventDefault();
    const room = $(e.target).parents('.box').find('input').val();
    sessionStorage.setItem('room', room);
    window.location.href = '/play';
});
