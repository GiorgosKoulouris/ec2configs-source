const mysql = require('mysql');

const dbConfig = {
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};

var dbPool = mysql.createPool(dbConfig);
dbPool.getConnection((err, connection) => {
    if (err) throw err;
    connection.release();
})

exports.dbPool = dbPool;