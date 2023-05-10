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
            ignored: (path) => [ 'node_modules', 'build' ].some((dir) => path.includes(dir)) 
        });

        watcher.on('change', async (path) => {
            await pckr.bundle(
                packageDir,
                config, 
                { 
                    path, 
                    callback: (fileId, filePath, updatedModule) => {
                        io.emit('update', { fileId, filePath, updatedModule: { [fileId]: updatedModule } });
                    }
                }
            );

            console.log("Build updated!");
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