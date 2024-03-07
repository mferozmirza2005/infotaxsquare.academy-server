"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = require("mysql");
const conn = (0, mysql_1.createConnection)({
    user: "devtest",
    host: "52.207.51.35",
    port: 3306,
    password: "4hGcAqwQPgfL$&",
    database: "infotaxsquare_academy",
});
conn.connect(function (err) {
    if (err)
        throw err;
});
module.exports = conn;
