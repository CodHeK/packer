const Packer = require('packer');
const chokidar = require('chokidar');
var express = require('express');
var app = express();
var http = require('http').Server(app);

const io = require('socket.io')(http);

class PackerDevServer {
    constructor() {}

    async start(packageDir, buildDirPath, config) {
        const pckr = new Packer();
        const watcher = chokidar.watch(packageDir, { 
            ignored: (path) => [ 'node_modules', 'build'].some((dir) => path.includes(dir)) 
        });

        watcher.on('change', async (path) => {
            console.log(`File changed: ${path}, building ...`);

            await pckr.bundle(packageDir, config);
            
            io.emit('reload');
        });

        await pckr.bundle(packageDir, config);

        app.use('/', express.static(buildDirPath));
    
        // serve the app
        http.listen(3001, function() {
            console.log('App on port 3001');
        });
    };
};


module.exports = PackerDevServer;