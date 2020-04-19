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
eval("\n\nwindow.onload = init;\n\nfunction init() {\n    window.socket = io({ transports: ['websocket'], upgrade: false });\n\n    socket.on('stats', function (data) {\n        if (data.players === 0) {\n            $('#' + data.room).remove();\n        } else if (!$('#' + data.room)[0]) {\n            $('.row').prepend('<div class=\"box\" id=\"' + data.room + '\">\\n                <h4>' + data.room + '</h4>\\n                <p class=\"players\">0 player</p>\\n                <p class=\"bots\">0 bot</p>\\n                <button name=\"play\">Play</button>\\n            </div>');\n        }\n\n        $('#' + data.room + ' .players').html(data.players + ' player' + (data.players > 1 ? 's' : ''));\n        $('#' + data.room + ' .bots').html(data.bots + ' bot' + (data.players > 1 ? 's' : ''));\n    });\n}\n\n$(document).on('click', 'button[name=\"play\"]', function (e) {\n    e.preventDefault();\n    var room = $(e.target).parents('.box').attr('id');\n    sessionStorage.setItem('room', room);\n    window.location.href = '/play';\n});\n\n$(document).on('click', 'button[name=\"create\"]', function (e) {\n    e.preventDefault();\n    var room = $(e.target).parents('.box').find('input').val();\n    sessionStorage.setItem('room', room);\n    window.location.href = '/play';\n});\n\n//# sourceURL=webpack://magic-maze/./src/client/home/js/main.js?");
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