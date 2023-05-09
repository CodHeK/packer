const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require("url");

const Packer = require('packer');
const PackerDevServer = require('packer-dev-server');

const commands = [ '--config', 'serve' ];
const DEFAULT_CONFIG_FILE = 'packer.config.js';
const PACKAGE_JSON_FILE = 'package.json';

class PackerCLI {
  constructor() {

  }

  getSafePath(pathURL) {
    return decodeURIComponent(pathURL);
  }

  isValidCommand(cmd) {
    return commands.includes(cmd);
  }

  fetchCommand(args) {
    return args[2];
  }

  fetchCommandValue(args, cmd) {
    if(commands.includes(cmd)) {
        const customIndex = args.indexOf(`${cmd}`);
        let customValue;

        if (customIndex > -1) {
            customValue = args[customIndex + 1];
        }

        return customValue;
    }

    return null;
  }

  async load(module) {
    const moduleURL = pathToFileURL(module);
    let result = require(this.getSafePath(moduleURL.pathname));

    return result;
  }

  async run(args) {
    const cmd = this.fetchCommand(args);
    if(this.isValidCommand(cmd)) {
      if(cmd === 'serve') {
        const server = new PackerDevServer();
        const config = await this.load(DEFAULT_CONFIG_FILE);

        const packageJSONPath = pathToFileURL(PACKAGE_JSON_FILE).pathname;
        const packageDir = this.getSafePath(path.dirname(packageJSONPath));
        const buildDirPath = `${packageDir}/build`;

        server.start(packageDir, buildDirPath, config);
      }
      else {
        const configPath = this.fetchCommandValue(args, 'config') || DEFAULT_CONFIG_FILE;
        const config = await this.load(configPath);

        const packageJSONPath = pathToFileURL(PACKAGE_JSON_FILE).pathname;
        const packageDir = path.dirname(packageJSONPath);

        const pckr = new Packer();
        pckr.bundle(packageDir, config);
      }
    }
  }
};

module.exports = PackerCLI;