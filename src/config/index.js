
const env = require("./env");
const moduleAlias = require("module-alias");
const path = require("path");

const root = path.resolve(process.cwd(), "src");

moduleAlias.addAliases({
    "@middleware": path.join(root, "middleware"),
    "@shared": path.join(root, "shared"),
    "@config": path.join(root, "config"),
});

module.exports = {
    ...env,
};