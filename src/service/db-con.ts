import mysql, { Connection } from "mysql";

const conn:Connection = mysql.createConnection({
    host: "52.207.51.35",
    user: "devtest",
    password: "4hGcAqwQPgfL$&",
    port: 3306,
    database: "infotaxsquare_academy",
});


conn.connect(function(err:Error) {
    if (err) throw err;
});

export default conn;