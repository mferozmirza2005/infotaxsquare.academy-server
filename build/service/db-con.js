import mysql from "mysql";
const conn = mysql.createConnection({
    host: "52.207.51.35",
    user: "devtest",
    password: "4hGcAqwQPgfL$&",
    port: 3306,
    database: "infotaxsquare_academy",
});
conn.connect(function (err) {
    if (err)
        throw err;
});
export default conn;
