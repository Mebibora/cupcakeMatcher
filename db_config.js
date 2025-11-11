const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cupcakeMatcher'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
  console.log('Connected to MySQL Database: cupcakeMatcher');
});

module.exports = db;
