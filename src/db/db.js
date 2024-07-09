const mysql = require ('mysql2')

const pool = mysql.createPool({
    host:'bsto5lfrmazpndhjvuzp-mysql.services.clever-cloud.com',
    user: 'uluvvuuaszlwad9i',
    password: 'DdHsw7mLUgxTxyIOW4Bo',
    database: 'bsto5lfrmazpndhjvuzp',
    port: 3306,
    waitForConnections: true,
	connectionLimit: 100,
	queueLimit: 0,
})

module.exports = {
	conn: pool.promise()
}
