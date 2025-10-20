const dotenv = require("dotenv");

dotenv.config();

function _required(key) {
    const value = process.env[key];
    if (value === undefined || value === "") {
        throw new Error(`Missing _required env var: ${key}`);
    }
    return value;
}


const env = process.env.NODE_ENV || "development";
const isDev = env === "development";
const isProd = env === "production";
const isTesting = (process.env.TESTING || false) && isDev;


module.exports = {
    // App
    port: parseInt(process.env.PORT, 10) || 3001,
    env,
    isDev,
    isProd,
    isTesting,
    url: isProd ? 'https://club.epcc.acm.org' : 'http://localhost:5173',

    // Database
    db: {
        host: _required("DB_HOST"),
        user: _required("DB_USER"),
        password: _required("DB_PASS"),
        name: _required("DB_NAME"),
    },

    admin: {
        code: _required("ADMIN_CODE"),
    },

    jwt: {
        secret: _required("JWT_SECRET"),
    },

    judge0: {
        key: _required('JUDGE0_KEY')
    }
};