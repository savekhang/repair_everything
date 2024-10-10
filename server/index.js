const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const db = require('./db'); // Kết nối MySQL
const cors = require('cors');

const app = express(); // Khởi tạo app trước khi sử dụng
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'your_secret_key';

// Middleware để xác thực JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token là bắt buộc.');

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send('Token không hợp lệ.');
    req.user = user;
    next();
  });
};

// Đăng ký tài khoản
app.post('/register', async (req, res) => {
  const { username, email, password, phone, account_type } = req.body;

  const query = 'INSERT INTO Users (username, email, password, account_type, phone) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [username, email, password, account_type, phone], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.send('Đăng ký thành công!');
  });
});

// Đăng nhập tài khoản
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM Users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).send(err.message);
    if (results.length === 0) return res.status(400).send('Email không tồn tại.');

    const user = results[0];
    // Kiểm tra mật khẩu (bỏ qua so sánh băm)
    if (user.password !== password) return res.status(400).send('Mật khẩu không chính xác.');

    const token = jwt.sign({ id: user.id, account_type: user.account_type }, SECRET_KEY);
    res.json({ token });
  });
});

// Đăng bài viết
app.post('/posts', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  if (req.user.account_type !== 'user') {
    return res.status(403).send('Chỉ người dùng thông thường mới có thể đăng bài.');
  }

  const query = 'INSERT INTO Posts (title, content, user_id) VALUES (?, ?, ?)';
  db.query(query, [title, content, userId], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.send('Đăng bài viết thành công!');
  });
});

// Bình luận và báo giá
app.post('/posts/:postId/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  const userId = req.user.id;

  if (req.user.account_type !== 'technician') {
    return res.status(403).send('Chỉ thợ sửa mới có thể bình luận.');
  }

  const query = 'INSERT INTO Comments (content, post_id, user_id) VALUES (?, ?, ?)';
  db.query(query, [content, postId, userId], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.send('Bình luận thành công!');
  });
});

// Mở tin nhắn sau khi chọn thợ sửa và giá
app.post('/messages', authenticateToken, (req, res) => {
  const { receiver_id, content } = req.body;
  const sender_id = req.user.id;

  const query = 'INSERT INTO Messages (sender_id, receiver_id, content) VALUES (?, ?, ?)';
  db.query(query, [sender_id, receiver_id, content], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.send('Tin nhắn đã được gửi!');
  });
});

// Khởi chạy server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
