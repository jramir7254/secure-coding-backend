// @ts-nocheck
const chalk = require('chalk');
const stripAnsi = require('strip-ansi');
const { colorize, color } = require('json-colorizer');

const isProd = process.env.NODE_ENV === 'production';

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
const RISK = chalk.bgRed.white.bold;

// ===== JSON colors =====
const colors = {
    StringKey: color.red,
    StringLiteral: color.green,
    NumberLiteral: color.yellow,
    BooleanLiteral: color.magenta,
    NullLiteral: color.red,
    Brace: color.white,
    Colon: color.gray,
    Comma: color.gray,
};

// ===== Colorize message by level =====
function colorizeLevel(level, message) {
    switch (level) {
        case 'RISK':
            return {
                level: chalk.bgRed.white.bold('RISK'),
                msg: RISK(`‼ ${message}`),
            };
        case 'error':
            return { level: ERROR('error'), msg: ERROR.bold(message) };
        case 'warn':
            return { level: YELLOW('warn'), msg: YELLOW(message) };
        case 'success':
            return { level: GREEN('success'), msg: GREEN(message) };
        case 'debug':
            return { level: PURPLE('debug'), msg: PURPLE(message) };
        case 'info':
        default:
            return { level: CYAN(level), msg: CYAN(message) };
    }
}

// ===== Core print function =====
function printLog(level, message, meta = {}) {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const { level: coloredLevel, msg } = colorizeLevel(level, message);

    const base = `[${WHITE(timestamp)}] [${coloredLevel}]: ${msg}`;

    let output = base;
    if (Object.keys(meta).length) {
        const pretty = ['debug', 'error'].includes(level);
        const metaStr = colorize(meta, { colors, pretty, indent: pretty ? 4 : 0 });
        output += ' ' + metaStr;
    }

    if (level === 'error') {
        console.error(output);
    } else if (level === 'warn') {
        console.warn(output);
    } else {
        console.log(output);
    }
}



// ===== Exported logger =====
const logger = {
    risk: (msg, meta) => printLog("RISK", msg, meta),
    error: (msg, meta) => printLog("error", msg, meta),
    warn: (msg, meta) => printLog("warn", msg, meta),
    success: (msg, meta) => printLog("success", msg, meta),
    info: (msg, meta) => printLog("info", msg, meta),
    debug: (msg, meta) => printLog("debug", msg, meta),
};

module.exports = logger;
