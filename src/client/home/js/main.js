window.onload = init;

function init() {
    window.socket = io({transports: ['websocket'], upgrade: false});
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
