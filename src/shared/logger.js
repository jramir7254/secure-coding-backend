const prettyjson = require('prettyjson');
const chalk = require('chalk');

const defaultOptions = {
    keysColor: 'cyan',
    stringColor: 'green',
    numberColor: 'yellow',
    dashColor: 'magenta',
    defaultIndentation: 2,
};

// ===== Color palette =====
const RED = chalk.hex('#e06c75');
const ORANGE = chalk.hex('#d19a66');
const YELLOW = chalk.hex('#e5c07b');
const GREEN = chalk.hex('#98c379');
const CYAN = chalk.hex('#56b6c2');
const BLUE = chalk.hex('#61afef');
const PURPLE = chalk.hex('#c678dd');
const WHITE = chalk.hex('#abb2bf');
const GRAY = chalk.hex('#5c6370');
const ERROR = chalk.hex('#a60f0f');

function renderData(data) {
    if (data === undefined) return '';
    if (typeof data === 'object') return '\n' + prettyjson.render(data, defaultOptions);
    return '\n' + String(data);
}

const logger = {
    info: (message, data) => console.log(BLUE(`[INFO]: ${message}`), renderData(data)),
    warn: (message, data) => console.log(YELLOW(`[WARN]: ${message}`), renderData(data)),
    error: (message, data) => console.log(RED(`[ERROR]: ${message}`), renderData(data)),
    debug: (message, data) => console.log(PURPLE(`[DEBUG]: ${message}`), renderData(data)),
    success: (message, data) => console.log(GREEN(`[SUCCESS]: ${message}`), renderData(data)),
};

module.exports = logger;
