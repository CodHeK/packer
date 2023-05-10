const Babel = require("@babel/standalone");
const { pathToFileURL } = require("url");
const fs = require('fs');
const path = require('path');
const { getFileIdForPath, getPathFromFileId, resetState } = require("./utils/file-id-mapper");
const { findRequiresPlugin, getRequiresForPath } = require("./utils/get-requires");
const { REQUIRE_HELPER, INDEX_HTML, HMR, HOT_UPDATE_HELPER } = require('./utils/constants');

class Packer {
    constructor() {
    }

    getSafePath(pathURL) {
        return decodeURIComponent(pathURL);
    }

    async readFile(filePath) {
        return new Promise((resolve, reject) => {
            const pathURL = pathToFileURL(filePath);
            const reader = fs.createReadStream(this.getSafePath(pathURL.pathname), { encoding: 'utf8' });

            reader.on('data', (chunk) => resolve(chunk));
            reader.on('error', (chunk) => reject(`ERROR: \n\n${chunk}`));
        });
    }

    isExcluded(filePath) {
        const EXCLUDED_PATTERNS = [
            /node_modules/,
            /package.json/,
            /packer.config.js/,
            /package-lock.json/,
            /.git*/,
            /build/
        ];

        return EXCLUDED_PATTERNS.some((p) => p.test(filePath));
    } 

    async parse(dir) {
        const files = [];
        const stack = [ dir ];

        while(stack.length > 0) {
            const currentItem = stack.pop();

            if(this.isExcluded(currentItem)) {
                continue;
            }

            if(fs.statSync(currentItem).isDirectory()) {
                fs.readdirSync(currentItem).forEach(file => {
                    const child = this.getSafePath(path.join(currentItem, file));
                    stack.push(child);
                });
            }
            else {
                files.push(currentItem);
            }
        }

        const fileMap = new Map();
        for(const fp of files) {
            try {
                const contents = await this.readFile(fp); 
                fileMap.set(fp, contents);
            }
            catch(e) {
                console.log(`Error reading file: ${fp}`);
            }
        }

        return fileMap;
    }

    transform(filePath, code) {
        const fileId = getFileIdForPath(filePath);
        const { code: transpiledCode } = Babel.transform(code, {
            presets: ["env"],
            plugins: [findRequiresPlugin(filePath)]
        });
        
        return { fileId, transpiledCode };
    }

    bundleWrapper(fileMap, transpiledFiles, moduleMap, filePath) {
        const code = fileMap.get(filePath);
        
        const { fileId, transpiledCode } = this.transform(filePath, code);

        const requires = getRequiresForPath(filePath);

        moduleMap[fileId] = `${transpiledCode}`;

        // Transpiled code is in, now wrap it in a function
        transpiledFiles[fileId] = `function(require, module, exports) {
        ${transpiledCode}
        }`;
        requires.forEach((requireId) => {
            const requirePath = getPathFromFileId(requireId);
            this.bundleWrapper(fileMap, transpiledFiles, moduleMap, requirePath).finalBundle;
        });

        let finalBundle = "const moduleMap = {";
        Object.keys(transpiledFiles).forEach((id) => {
            finalBundle += `\n\t`;
            finalBundle += `${id}: ${transpiledFiles[id]}`;
            finalBundle += ",";
        });
        finalBundle += "\n}"

        finalBundle += "\n\n\n// Require Helper";
        finalBundle += `\n${HMR}`;

        finalBundle += `\n${REQUIRE_HELPER}`;
        finalBundle += `\n${HOT_UPDATE_HELPER}`;
        
        return { finalBundle, moduleMap };
    }

    writeFile(data, path) {
        const writeStream = fs.createWriteStream(path);
        writeStream.write(data);
        writeStream.end();
    }

    storeOutput(bundledOutput, packageDir, outputConfig) {
        const outputPath = `${packageDir}/build`;

        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }

        const outputFilePath = path.join(outputPath, outputConfig.filename);
        this.writeFile(bundledOutput, outputFilePath);

        const outputFilePathHTML = path.join(outputPath, 'index.html');
        this.writeFile(INDEX_HTML, outputFilePathHTML);
    }

    async bundle(packageDir, config, update = undefined) {
        resetState();

        const { entry, output } = config;

        const entryFilePath = this.getSafePath(pathToFileURL(entry).pathname);
        packageDir = this.getSafePath(packageDir);

        const fileMap = await this.parse(packageDir);
        const { finalBundle: bundledOutput, moduleMap } = this.bundleWrapper(fileMap, {}, {}, entryFilePath);

        this.storeOutput(bundledOutput, packageDir, output);

        if(update) {
            const { path, callback } = update;
            const fileId = getFileIdForPath(path);

            callback(fileId, path, moduleMap[fileId]);
        }

        return Promise.resolve();
    }
};

module.exports = Packer;