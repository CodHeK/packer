const HOT_UPDATE_HELPER = `this.hotUpdate = function(updatedModules) {
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
`;

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
initWS();
`;

const INDEX_HTML = `
<!DOCTYPE html>
<html>
  <body>
    <div id="app"></div>
  </body>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  <script src="index.js"></script>
</html>
`;


const HMR = `
const initWS = function() {
  const socket = io();

  socket.on('update', function(info) {
    window.hotUpdate(info.updatedModule);
  });
}
`

module.exports = {
    REQUIRE_HELPER,
    INDEX_HTML,
    HMR,
    HOT_UPDATE_HELPER,
};