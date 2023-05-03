const { join, dirname } = require("path");
const { getFileIdForPath } = require("./file-id-mapper");

const requires = {};

const getRequiresForPath = (path) => {
  return requires[path];
};

/**
 * This babel plugin checks for all require statements, saves them, and transforms them
 * to use a number instead of a path.
 *
 * So instead of getting
 * `require('./test.js')` you will get `require(0)`.
 */
const findRequiresPlugin = (path) => (babel) => {
  requires[path] = [];

  return {
    name: "find-requires", // not required
    visitor: {
      CallExpression({ node }) {
        if (node.callee.name === "require") {
          const requiredPath = node.arguments[0].value;
          const resolvedPath = join(dirname(path), requiredPath);

          const requiredFileId = getFileIdForPath(resolvedPath);
          requires[path].push(requiredFileId);

          node.arguments[0].value = requiredFileId;
        }
      }
    }
  };
};

module.exports = {
    getRequiresForPath,
    findRequiresPlugin,
}
