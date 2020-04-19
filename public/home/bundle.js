/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__("./src/client/home/js/main.js");
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/client/home/js/main.js":
/*!************************************!*\
  !*** ./src/client/home/js/main.js ***!
  \************************************/
/*! other exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements:  */
/***/ (function() {

"use strict";
eval("\n\nwindow.onload = init;\n\nfunction init() {\n    window.socket = io({ transports: ['websocket'], upgrade: false });\n\n    socket.on('stats', function (data) {\n        if (data.players === 0) {\n            $('#' + data.room).remove();\n        } else if (!$('#' + data.room)[0]) {\n            $('.row').prepend('<div class=\"box\" id=\"' + data.room + '\">\\n                <h4>' + data.room + '</h4>\\n                <p class=\"players\">0 player</p>\\n                <p class=\"bots\">0 bot</p>\\n                <button name=\"play\">Play</button>\\n            </div>');\n        }\n\n        $('#' + data.room + ' .players').html(data.players + ' player' + (data.players > 1 ? 's' : ''));\n        $('#' + data.room + ' .bots').html(data.bots + ' bot' + (data.players > 1 ? 's' : ''));\n    });\n}\n\n$(document).on('click', 'button[name=\"play\"]', function (e) {\n    e.preventDefault();\n    var room = $(e.target).parents('.box').attr('id');\n    sessionStorage.setItem('room', room);\n    window.location.href = '/play';\n});\n\n$(document).on('click', 'button[name=\"create\"]', function (e) {\n    e.preventDefault();\n    var room = $(e.target).parents('.box').find('input').val();\n    sessionStorage.setItem('room', room);\n    window.location.href = '/play';\n});\n\n//# sourceURL=webpack:///./src/client/home/js/main.js?");

/***/ })

/******/ });