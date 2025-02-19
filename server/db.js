// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'oldversion',           
  password: '123456',   
  database: 'repair_everything'
});

connection.connect((err) => {
  if (err) {
    console.error('Kết nối MySQL thất bại: ', err);
    return;
  }
  console.log('Kết nối MySQL thành công!');
});

module.exports = connection;
