const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require("url");

const Packer = require('packer');

const commands = [ 'config' ];
const DEFAULT_CONFIG_FILE = 'packer.config.js';
const PACKAGE_JSON_FILE = 'package.json';

class PackerCLI {
  constructor() {

  }

  getSafePath(pathURL) {
    return decodeURIComponent(pathURL);
  }

  fetchCommandValue(cmd) {
    if(commands.includes(cmd)) {
        const customIndex = process.argv.indexOf(`--${cmd}`);
        let customValue;

        if (customIndex > -1) {
            customValue = process.argv[customIndex + 1];
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
    const configPath = this.fetchCommandValue('config') || DEFAULT_CONFIG_FILE;
    const config = await this.load(configPath);

    const packageJSONPath = pathToFileURL(PACKAGE_JSON_FILE).pathname;
    const packageDir = path.dirname(packageJSONPath);

    const pckr = new Packer();
    pckr.bundle(packageDir, config);
  }
};

module.exports = PackerCLI;