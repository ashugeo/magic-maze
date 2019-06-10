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
/******/ 		__webpack_require__("./src/client/home/js/main.js");
/******/ 		return __webpack_require__("./src/client/home/scss/home.scss");
/******/ 	};
/******/ 	// initialize runtime
/******/ 	runtime(__webpack_require__);
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
eval("\n\nwindow.onload = init;\n\nfunction init() {\n    window.socket = io({ transports: ['websocket'], upgrade: false });\n\n    document.getElementById('play').addEventListener('click', function (e) {\n        sessionStorage.setItem('room', 'room1');\n        window.location.href = '/play';\n    });\n}\n\n//# sourceURL=webpack:///./src/client/home/js/main.js?");

/***/ }),

/***/ "./src/client/home/scss/home.scss":
/*!****************************************!*\
  !*** ./src/client/home/scss/home.scss ***!
  \****************************************/
/*! other exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements: module, __webpack_require__.p, __webpack_require__ */
/***/ (function(module, __unusedexports, __webpack_require__) {

eval("module.exports = __webpack_require__.p + \"home/main.css\";\n\n//# sourceURL=webpack:///./src/client/home/scss/home.scss?");

/***/ })

/******/ },
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ 	"use strict";
/******/ 
/******/ 	/* webpack/runtime/publicPath */
/******/ 	!function() {
/******/ 		__webpack_require__.p = "";
/******/ 	}();
/******/ 	
/******/ }
);