const mysql = require ('mysql2')

const pool = mysql.createPool({
    host:'127.0.0.1',
    user: 'root',
    password: 'holanda',
    database: 'hotel_codo_a_codo',
    port: 3306,
    waitForConnections: true,
	connectionLimit: 100,
	queueLimit: 0,
})

module.exports = {
	conn: pool.promise()
}