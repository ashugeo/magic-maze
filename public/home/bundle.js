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
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client/home/js/main.js":
/*!************************************!*\
  !*** ./src/client/home/js/main.js ***!
  \************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

eval("\n\nwindow.onload = init;\n\nfunction init() {\n    window.socket = io({ transports: ['websocket'], upgrade: false });\n\n    socket.on('home', function (room) {\n        if (!room.members || room.members.length === 0) {\n            $('#' + room.id).remove();\n            return;\n        }\n\n        var roomElement = document.getElementById(room.id);\n\n        if (!roomElement) {\n            roomElement = document.createElement(\"div\");\n            roomElement.id = room.id;\n            roomElement.classList.add(\"box\");\n\n            roomElement.innerHTML = '<h4>' + room.id + '</h4>\\n                <p>\\n                    <span class=\"players\">0 player</span><br>\\n                    <span class=\"bots small\">0 bot</span>\\n                </p>\\n\\n                <label for=\"nickname\">Nickname</label>\\n                <input type=\"text\" id=\"nickname\" placeholder=\"Enter a nickname\\u2026\" required>\\n\\n                <button name=\"play\">Play</button>';\n\n            $('.row').prepend(roomElement);\n        }\n\n        var botsCount = room.members.filter(function (m) {\n            return m.isBot;\n        }).length;\n        var playersCount = room.members.length - botsCount;\n\n        roomElement.querySelector('.players').innerHTML = playersCount + ' player' + (playersCount > 1 ? 's' : '');\n        roomElement.querySelector('.bots').innerHTML = botsCount + ' bot' + (botsCount > 1 ? 's' : '');\n    });\n}\n\n$(document).on('click', 'button[name=\"play\"]', function (e) {\n    e.preventDefault();\n    var room = $(e.target).parents('.box').attr('id');\n    var name = $('#nickname').val();\n\n    if (!room || !name) return;\n\n    sessionStorage.setItem('room', room);\n    sessionStorage.setItem('name', name);\n    window.location.href = '/play';\n});\n\n$(document).on('click', 'button[name=\"create\"]', function (e) {\n    e.preventDefault();\n    var room = $('#room').val();\n    var name = $('#nickname').val();\n\n    if (!room || !name) return;\n\n    sessionStorage.setItem('room', room);\n    sessionStorage.setItem('name', name);\n    window.location.href = '/play';\n});\n\n$(document).on('click', '.box.new-game', function () {\n    $('.box.new-game').replaceWith('\\n    <div class=\"box\">\\n        <label for=\"room\">Room name</label>\\n        <input type=\"text\" id=\"room\" placeholder=\"Name your room\\u2026\" required>\\n        \\n        <label for=\"nickname\">Nickname</label>\\n        <input type=\"text\" id=\"nickname\" placeholder=\"Enter a nickname\\u2026\" required>\\n\\n        <button name=\"create\">Create room</button>\\n    </div>\\n    ');\n});\n\n//# sourceURL=webpack://magic-maze/./src/client/home/js/main.js?");

/***/ }),

/***/ "./src/client/home/scss/home.scss":
/*!****************************************!*\
  !*** ./src/client/home/scss/home.scss ***!
  \****************************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__.r, __webpack_require__.p, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + \"home/main.min.css\");\n\n//# sourceURL=webpack://magic-maze/./src/client/home/scss/home.scss?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl + "../";
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/client/home/js/main.js");
/******/ 	__webpack_require__("./src/client/home/scss/home.scss");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;