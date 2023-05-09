const REQUIRE_HELPER = `const cache = {};

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
`;

const INDEX_HTML = `
<!DOCTYPE html>
<html>
  <body>
    <div id="app"></div>
  </body>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  <script src="index.js"></script>
  <script src="hmr.js"></script>
</html>
`;

const HMR = `
/* This file is included in the page running the app */
(function() {
  // create an instance of Socket.IO for listening
  // to websocket messages
  const socket = io();

  // listen for 'file-change' message
  socket.on('reload', function(msg) {
    window.location.reload();
  });
})();
`;


module.exports = {
    REQUIRE_HELPER,
    INDEX_HTML,
    HMR
};