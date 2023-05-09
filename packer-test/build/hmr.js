
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
