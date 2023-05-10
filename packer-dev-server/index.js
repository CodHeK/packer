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

        let replacedModule = null;

        watcher.on('change', async (path) => {
            await pckr.bundle(
                packageDir,
                config, 
                { 
                    path, 
                    callback: (fileId, filePath, updatedModule) => {
                        replacedModule = updatedModule;
                        io.emit('update', { fileId, filePath });
                    }
                }
            );

            console.log("Build updated!");
        });

        await pckr.bundle(packageDir, config);

        app.use('/', express.static(buildDirPath));

        app.get('/hot-update/:fileId', function(req, res) {
            const fileId = req.params.fileId;
            if(replacedModule) {
                res.send(`hotUpdate(${JSON.stringify({ [fileId]: replacedModule })});`);
            }
        }); 
    
        // serve the app
        http.listen(3001, function() {
            console.log('App on port 3001');
        });
    };
};


module.exports = PackerDevServer;