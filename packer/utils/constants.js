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
  }
})();
`;

module.exports = {
    REQUIRE_HELPER,
    INDEX_HTML,
    HMR,
    HOT_UPDATE_HELPER,
};