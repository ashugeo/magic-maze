/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is not neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/
(() => {
/*!************************************!*\
  !*** ./src/client/home/js/main.js ***!
  \************************************/
/*! unknown exports (runtime-defined) */
/*! exports [maybe provided (runtime-defined)] [unused] */
/*! runtime requirements:  */
eval("\n\nwindow.onload = init;\n\nfunction init() {\n    window.socket = io({ transports: ['websocket'], upgrade: false });\n\n    socket.on('home', function (room) {\n        if (!room.members || room.members.length === 0) {\n            $('#' + room.id).remove();\n        } else if (!$('#' + room.id)[0]) {\n            $('.row').prepend('<div class=\"box\" id=\"' + room.id + '\">\\n                <h4>' + room.id + '</h4>\\n                <p>\\n                    <span class=\"players\">0 player</span><br>\\n                    <span class=\"bots small\">0 bot</span>\\n                </p>\\n\\n                <label for=\"name\">Nickname</label>\\n                <input type=\"text\" id=\"name\" placeholder=\"Enter a nickname\\u2026\" required>\\n\\n                <button name=\"play\">Play</button>\\n            </div>');\n        }\n\n        if (!room.members) return;\n\n        var botsCount = room.members.filter(function (m) {\n            return m.isBot;\n        }).length;\n        var playersCount = room.members.length - botsCount;\n\n        $('#' + room.id + ' .players').html(playersCount + ' player' + (playersCount > 1 ? 's' : ''));\n        $('#' + room.id + ' .bots').html(botsCount + ' bot' + (botsCount > 1 ? 's' : ''));\n    });\n}\n\n$(document).on('click', 'button[name=\"play\"]', function (e) {\n    e.preventDefault();\n    var room = $(e.target).parents('.box').attr('id');\n    var name = $('#name').val();\n\n    if (!room || !name) return;\n\n    sessionStorage.setItem('room', room);\n    sessionStorage.setItem('name', name);\n    window.location.href = '/play';\n});\n\n$(document).on('click', 'button[name=\"create\"]', function (e) {\n    e.preventDefault();\n    var room = $('#room').val();\n    var name = $('#name').val();\n\n    if (!room || !name) return;\n\n    sessionStorage.setItem('room', room);\n    sessionStorage.setItem('name', name);\n    window.location.href = '/play';\n});\n\n$(document).on('click', '.box.new-game', function () {\n    $('.box.new-game').replaceWith('\\n    <div class=\"box\">\\n        <label for=\"room\">Room name</label>\\n        <input type=\"text\" id=\"room\" placeholder=\"Name your room\\u2026\" required>\\n        \\n        <label for=\"name\">Nickname</label>\\n        <input type=\"text\" id=\"name\" placeholder=\"Enter a nickname\\u2026\" required>\\n\\n        <button name=\"create\">Create room</button>\\n    </div>\\n    ');\n});\n\n//# sourceURL=webpack://magic-maze/./src/client/home/js/main.js?");
})();

(() => {
/*!****************************************!*\
  !*** ./src/client/home/scss/home.scss ***!
  \****************************************/
/*! namespace exports */
/*! export default [provided] [unused] [could be renamed] */
/*! other exports [not provided] [unused] */
/*! runtime requirements: __webpack_require__.p, __webpack_require__.* */
eval("/* unused harmony default export */ var _unused_webpack_default_export = (__webpack_require__.p + \"home/main.min.css\");\n\n//# sourceURL=webpack://magic-maze/./src/client/home/scss/home.scss?");
})();

/******/ })()
;