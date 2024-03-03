const mysql = require("mysql");
const conn = mysql.createConnection({
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

module.exports = {
    conn: conn,
};
