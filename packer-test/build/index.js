const moduleMap = {
	0: function(require, module, exports) {
        "use strict";

var _main = require(1);
console.log((0, _main.sum)(1, 2));
        },
	1: function(require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sum = void 0;
var sum = function sum(a, b) {
  return a + b;
};
exports.sum = sum;
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
