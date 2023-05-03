const PackerCLI = require("./packer-cli");

const runCLI = async (args) => {
    const cli = new PackerCLI();

    try {
        cli.run(args);
    }
    catch(e) {
        console.log("Error running args");
        process.exit(2);
    }
};

module.exports = runCLI;