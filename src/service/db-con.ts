import { createConnection, Connection, ConnectionConfig } from "mysql";

const conn:Connection = createConnection(<ConnectionConfig>{
    user: "devtest",
    host: "52.207.51.35",
    port: 3306,
    password: "4hGcAqwQPgfL$&",
    database: "infotaxsquare_academy",
});

conn.connect(function(err:Error) {
    if (err) throw err;
});

module.exports = conn;