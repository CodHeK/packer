const moduleMap = {
	0: function(require, module, exports) {
        "use strict";

var _main = require(1);
var _mul = require(2);
var $e = document.getElementById('app');
$e.innerHTML = "<div>\n    <h1>This is text and the sum is: </h1>\n    <h2 style=\"color: green;\">".concat((0, _main.sum)(1, 0), "</h2>\n\n    <h1>This is text and the multiplied value is:</h1>\n    <h2 style=\"color: red;\">").concat((0, _mul.mully)(1, 0), "</h2>\n</div>\n");
        },
	1: function(require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sum = void 0;
var sum = function sum(a, b) {
  var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
  return a + b + offset;
};
exports.sum = sum;
        },
	2: function(require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mully = void 0;
var mully = function mully(a, b) {
  return a * b;
};
exports.mully = mully;
        },
}


// Require Helper
const cache = {};

const requireFunc = function(requireId) {
  if (cache[requireId]) {
    return cache[requireId].exports;
  }

  const module = { exports: {} };
  cache[requireId] = module;

  moduleMap[requireId](requireFunc, module, module.exports);

  return module.exports;
};

requireFunc(0);

this.hotUpdate = function(updatedModules) {
  for(const id in updatedModules) {
    delete cache[id];

    const updatedModule = new Function('require', 'module', 'exports', updatedModules[id]);
    moduleMap[id] = updatedModule;

    requireFunc(id);

    // Re-initialize
    delete cache[0];
    requireFunc(0);
  }
};


/* This file is included in the page running the app */
(function() {
  const socket = io();

  socket.on('update', function(info) {
    // window.location.reload();
    downloadUpdatedModule(info);
  });

  function downloadUpdatedModule(info) {
    const { fileId } = info;

    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.charset = "utf-8";
    script.src =  "/hot-update/" + fileId;
    head.appendChild(script);

    setTimeout(() => head.removeChild(script));
  }
})();
