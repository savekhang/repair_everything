    const express = require('express');
    const jwt = require('jsonwebtoken');
    const bodyParser = require('body-parser');
    const db = require('./db'); // Kết nối MySQL
    const cors = require('cors');

    const app = express(); // Khởi tạo app trước khi sử dụng
    app.use(cors({ origin: '*' })); // Cho phép mọi domain truy cập
    app.use(bodyParser.json());

    const SECRET_KEY = 'your_secret_key';

    const multer = require('multer');
    const path = require('path');

    // Cấu hình multer để lưu tệp vào thư mục 'app/images'
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        // Chỉnh sửa đường dẫn để lưu tệp vào thư mục 'app/images'
        cb(null, path.join(__dirname, '../app/images')); 
      },
      filename: (req, file, cb) => {
        // Chỉ lưu lại tên file gốc
        const fileName = path.basename(file.originalname); // Lấy tên file mà không có đường dẫn
        cb(null, fileName); 
      },
    });

    const upload = multer({ storage: storage });

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
    app.post('/user_register', async (req, res) => {
      const { username, email, password, phone, account_type } = req.body;

      const query = 'INSERT INTO Users (username, email, password, account_type, phone) VALUES (?, ?, ?, ?, ?)';
      db.query(query, [username, email, password, account_type, phone], (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send('Đăng ký thành công!');
      });
    });

    // Đăng ký tài khoản thợ
    app.post('/technician_register', async (req, res) => {
      const { username, email, password, phone, account_type, technician_category_name } = req.body;

      if (account_type !== 'technician') {
        return res.status(400).send('Account type must be "technician" for this registration.');
      }

      const query = 'INSERT INTO Users (username, email, password, account_type, phone, technician_category_name) VALUES (?, ?, ?, ?, ?, ?)';
      
      db.query(query, [username, email, password, account_type, phone, technician_category_name], (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send('Đăng ký thành công!');
      });
    });

    // Lấy danh sách các loại thợ
    app.get('/name_technician', async (req, res) => {
      const query = 'SELECT name FROM TechnicianCategories'; // Giả sử bạn có bảng TechnicianCategories trong cơ sở dữ liệu

      db.query(query, (err, results) => {
        if (err) {
          return res.status(500).send(err.message); // Trả về lỗi 500 nếu có lỗi xảy ra
        }
        res.json(results); // Trả về kết quả dưới dạng JSON
      });
    });

    // Đăng nhập tài khoản
    app.post('/login', (req, res) => {
      const { email, password } = req.body;

      // Kiểm tra xem email và mật khẩu đã được cung cấp
      if (!email || !password) {
        return res.status(400).send('Vui lòng nhập email và mật khẩu.');
      }

      const query = 'SELECT * FROM Users WHERE email = ?';
      db.query(query, [email], async (err, results) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        if (results.length === 0) {
          return res.status(400).send('Email không tồn tại.');
        }

        const user = results[0];

        // Kiểm tra mật khẩu (bỏ qua so sánh băm)
        // Nếu bạn đang sử dụng băm mật khẩu, hãy thay đổi dòng này
        if (user.password !== password) {
          return res.status(400).send('Mật khẩu không chính xác.');
        }

        // Tạo JWT token
        const token = jwt.sign({ id: user.id, account_type: user.account_type }, SECRET_KEY, {
          expiresIn: '1h', // Thời gian hết hạn của token
        });
        
        // Gửi lại token và thông tin người dùng
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            account_type: user.account_type,
            phone: user.phone,
            created_at: user.created_at,
            technician_category_name: user.technician_category_name,
            avatar: user.avatar // Thêm avatar vào thông tin người dùng nếu có
          },
        });
      });
    });

    // Get danh sách các bài viết kèm theo bình luận, tên người dùng và tên loại thợ
    app.get('/posts', (req, res) => {
      const query = `
          SELECT p.*, 
                u.username,
                p.technician_category_name,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'content', c.content, 'created_at', c.created_at, 'username', u2.username)) 
                  FROM Comments c 
                  JOIN Users u2 ON c.user_id = u2.id 
                  WHERE c.post_id = p.id) AS comments
          FROM Posts p
          JOIN Users u ON p.user_id = u.id`; // JOIN để lấy username từ bảng Users

      db.query(query, (err, results) => {
          if (err) {
              return res.status(500).send(err.message); // Trả về lỗi nếu có vấn đề xảy ra
          }
          res.json(results); // Trả về danh sách bài viết kèm theo bình luận dưới dạng JSON
      });
    });

    // Đăng bài viết
    app.post('/posts', authenticateToken, (req, res) => {
      const { title, content, technician_category_name } = req.body; // Thêm technician_category_name vào body
      const userId = req.user.id;

      if (req.user.account_type !== 'user') {
        return res.status(403).send('Chỉ người dùng thông thường mới có thể đăng bài.');
      }

      // Bước 1: Kiểm tra xem technician_category_name có hợp lệ hay không
      const categoryQuery = 'SELECT name FROM TechnicianCategories WHERE name = ?';
      db.query(categoryQuery, [technician_category_name], (err, results) => {
        if (err) return res.status(500).send(err.message);
        if (results.length === 0) {
          return res.status(400).send('Loại thợ không hợp lệ.');
        }

        // Bước 2: Nếu hợp lệ, thực hiện câu lệnh INSERT
        const query = 'INSERT INTO Posts (title, content, user_id, technician_category_name) VALUES (?, ?, ?, ?)';
        db.query(query, [title, content, userId, technician_category_name], (err, result) => {
          if (err) return res.status(500).send(err.message);
          res.send('Đăng bài viết thành công!');
        });
      });
    });

    // Chỉnh sửa bài viết
    app.put('/posts/:postId', authenticateToken, (req, res) => {
      const postId = req.params.postId;
      const { title, content } = req.body;
      const userId = req.user.id; // Giả sử bạn có userId từ token sau khi giải mã

      // Kiểm tra quyền sở hữu
      const checkQuery = 'SELECT user_id FROM Posts WHERE id = ?';
      db.query(checkQuery, [postId], (err, results) => {
        if (err) return res.status(500).send(err.message);

        if (results.length === 0) {
          return res.status(404).send('Bài viết không tồn tại.');
        }

        if (results[0].user_id !== userId) {
          return res.status(403).send('Bạn không có quyền chỉnh sửa bài viết này.');
        }

        // Cập nhật bài viết
        const updateQuery = 'UPDATE Posts SET title = ?, content = ? WHERE id = ?';
        db.query(updateQuery, [title, content, postId], (err, results) => {
          if (err) return res.status(500).send(err.message);

          res.send('Cập nhật bài viết thành công.');
        });
      });
    });

    // Xóa bài viết
    app.delete('/posts/:postId', authenticateToken, (req, res) => {
      const postId = req.params.postId;
      const userId = req.user.id; // Giả sử bạn có userId từ token sau khi giải mã
      console.log("Post ID:", postId);
      console.log("User ID:", userId);

      // Kiểm tra quyền sở hữu
      const checkQuery = 'SELECT user_id FROM Posts WHERE id = ?';
      db.query(checkQuery, [postId], (err, results) => {
        if (err) return res.status(500).send(err.message);

        if (results.length === 0) {
          return res.status(404).send('Bài viết không tồn tại.');
        }

        if (results[0].user_id !== userId) {
          return res.status(403).send('Bạn không có quyền xóa bài viết này.');
        }

        // Xóa bài viết
        const deleteQuery = 'DELETE FROM Posts WHERE id = ?';
        db.query(deleteQuery, [postId], (err, results) => {
          if (err) return res.status(500).send(err.message);

          res.send('Xóa bài viết thành công.');
        });
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

      // Lấy thông tin bài viết để kiểm tra loại thợ
      const queryPost = 'SELECT technician_category_name FROM Posts WHERE id = ?';
      
      db.query(queryPost, [postId], (err, results) => {
        if (err) return res.status(500).send(err.message);
        if (results.length === 0) return res.status(404).send('Bài viết không tồn tại.');

        const postCategory = results[0].technician_category_name;

        // Kiểm tra loại thợ của người dùng
        const queryUser = 'SELECT technician_category_name FROM Users WHERE id = ?';
        db.query(queryUser, [userId], (err, results) => {
          if (err) return res.status(500).send(err.message);
          if (results.length === 0) return res.status(404).send('Người dùng không tồn tại.');

          const userCategory = results[0].technician_category_name;

          // In thông tin để kiểm tra
          console.log(`Post Category: ${postCategory}, User Category: ${userCategory}`);

          if (userCategory !== postCategory) {
            return res.status(403).send('Bạn không thể bình luận vì loại thợ không phù hợp với bài viết.');
          }

          // Thêm bình luận nếu loại thợ khớp
          const query = 'INSERT INTO Comments (content, post_id, user_id) VALUES (?, ?, ?)';
          db.query(query, [content, postId, userId], (err, result) => {
            if (err) return res.status(500).send(err.message);
            res.send('Bình luận thành công!');
          });
        });
      });
    });

    //Get list messages
    app.get('/receivers', authenticateToken, (req, res) => {
      const sender_id = req.user.id; // Lấy ID người gửi từ token
    
      // Truy vấn để lấy danh sách các receiver_id và username tương ứng
      const query = `
        SELECT m.receiver_id, u.username
        FROM Messages m
        JOIN Users u ON m.receiver_id = u.id
        WHERE m.sender_id = ?
        GROUP BY m.receiver_id
      `;
    
      db.query(query, [sender_id], (err, results) => {
        if (err) {
          console.error('Database query error:', err); // Ghi log lỗi vào console để dễ debug
          return res.status(500).json({ message: 'Đã có lỗi xảy ra khi truy vấn cơ sở dữ liệu.' });
        }
    
        // Trả về danh sách các receiver_id cùng với username
        const receivers = results.map(row => ({
          receiver_id: row.receiver_id,
          username: row.username
        }));
        res.json(receivers);
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

    app.get('/messages/:receiver_id', authenticateToken, (req, res) => {
      const receiver_id = req.params.receiver_id;
      const sender_id = req.user.id;
    
      const query = `
        SELECT Messages.*, Users.username
        FROM Messages 
        JOIN Users ON Messages.receiver_id = Users.id
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
        ORDER BY Messages.created_at ASC
      `;
      
      db.query(query, [sender_id, receiver_id, receiver_id, sender_id], (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.json(results);
      });
    });
    

    // Lấy thông tin người dùng theo id
    app.get('/users/:id', authenticateToken, (req, res) => {
      const userId = req.params.id;

      const query = 'SELECT * FROM Users WHERE id = ?';
      db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).send(err.message);
        if (results.length === 0) return res.status(404).send('Người dùng không tồn tại.');

        const user = results[0];

        // Lọc bỏ các trường có giá trị NULL
        const filteredUser = {};
        Object.keys(user).forEach(key => {
          if (user[key] !== null) {
            filteredUser[key] = user[key];
          }
        });

        res.json(filteredUser);
      });
    });

    // Lấy thông tin người dùng theo ID từ token
    app.get('/user_info', authenticateToken, (req, res) => {
      const userId = req.user.id; // Lấy ID người dùng từ token đã xác thực

      const query = 'SELECT * FROM Users WHERE id = ?';
      db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).send(err.message);
        if (results.length === 0) return res.status(404).send('Người dùng không tồn tại.');

        const user = results[0];

        // Lọc bỏ các trường có giá trị NULL
        const filteredUser = {};
        Object.keys(user).forEach(key => {
          if (user[key] !== null) {
            filteredUser[key] = user[key];
          }
        });

        res.json({
          user: filteredUser
        });
      });
    });

    
    // Chỉnh sửa thông tin người dùng
    app.put('/user_info', authenticateToken, (req, res) => {
      const userId = req.user.id; // Lấy ID người dùng từ token đã xác thực
      const { username, email, phone } = req.body; // Lấy thông tin cần cập nhật từ request body

      // Kiểm tra xem ít nhất một trường có thông tin cần cập nhật
      if (!username && !email && !phone) {
        return res.status(400).send('Vui lòng cung cấp thông tin cần cập nhật.');
      }

      // Tạo câu lệnh SQL để cập nhật thông tin người dùng
      const query = 'UPDATE Users SET username = ?, email = ?, phone = ? WHERE id = ?';
      
      db.query(query, [username || null, email || null, phone || null, userId], (err, result) => {
        if (err) {
          return res.status(500).send(err.message);
        }

        if (result.affectedRows === 0) {
          return res.status(404).send('Người dùng không tồn tại.');
        }

        res.send('Cập nhật thông tin người dùng thành công.');
      });
    });

    //avatar
    app.use('/images', express.static('D:/repair_everything/repair_everything/app/images'));

    // Upload avatar
    app.post('/upload-avatar', authenticateToken, upload.single('avatar'), (req, res) => {
      if (!req.file) {
        return res.status(400).send('Vui lòng tải lên một hình ảnh.');
      }

      // Lấy tên tệp hình ảnh
      const avatarFileName = req.file.filename; // Lấy tên tệp hình ảnh từ multer

      const userId = req.user.id; // Lấy userId từ token
      const query = 'UPDATE Users SET avatar = ? WHERE id = ?';

      db.query(query, [avatarFileName, userId], (err, result) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.send('Cập nhật ảnh đại diện thành công!');
      });
    });

    app.get('/comments', authenticateToken, (req, res) => {
      const query = `SELECT c.*, u.username 
                     FROM Comments c 
                     JOIN Users u ON c.user_id = u.id`; // JOIN để lấy username từ bảng Users
    
      db.query(query, (err, results) => {
        if (err) {
          console.error('Database query error:', err); // Ghi log lỗi vào console để dễ debug
          return res.status(500).send(err.message); // Trả về lỗi nếu có vấn đề xảy ra
        }
        res.json(results); // Trả về danh sách bình luận dưới dạng JSON
      });
    });

    //ADMIN
    // dang nhap admin
    app.post('/admin/login', (req, res) => {
      const { username, password } = req.body;
  
      // Kiểm tra username và mật khẩu
      if (!username || !password) {
          return res.status(400).send('Vui lòng nhập tên đăng nhập và mật khẩu.');
      }
  
      const query = 'SELECT * FROM Users WHERE username = ? AND account_type = "admin"';
      db.query(query, [username], (err, results) => {
          if (err) {
              return res.status(500).send(err.message);
          }
          if (results.length === 0) {
              return res.status(400).send('Tài khoản không tồn tại hoặc không phải admin.');
          }
  
          const admin = results[0];
  
          // So sánh mật khẩu (chưa băm, nếu có bcrypt thì thay đổi)
          if (admin.password !== password) {
              return res.status(400).send('Mật khẩu không chính xác.');
          }
  
          // Tạo JWT token
          const token = jwt.sign({ id: admin.id, account_type: admin.account_type }, SECRET_KEY, {
              expiresIn: '2h', // Admin có thể có thời gian token dài hơn
          });
  
          // Trả về token và thông tin admin
          res.json({
              token,
              admin: {
                  id: admin.id,
                  username: admin.username,
                  email: admin.email,
                  account_type: admin.account_type,
                  phone: admin.phone,
                  created_at: admin.created_at,
              },
          });
      });
  });

  //editPost_admin
  app.put('/admin/posts/:postId', authenticateToken, (req, res) => {
    const postId = req.params.postId;
    const { title, content } = req.body;
  
    // Kiểm tra xem ít nhất một trường có thông tin cần cập nhật
    if (!title && !content) {
      return res.status(400).send('Vui lòng cung cấp thông tin cần cập nhật.');
    }
  
    // Cập nhật bài viết mà không cần kiểm tra quyền sở hữu
    const updateQuery = 'UPDATE Posts SET title = ?, content = ? WHERE id = ?';
    db.query(updateQuery, [title, content, postId], (err, results) => {
      if (err) return res.status(500).send(err.message);
  
      if (results.affectedRows === 0) {
        return res.status(404).send('Bài viết không tồn tại.');
      }
  
      res.send('Cập nhật bài viết thành công.');
    });
  });

  //Xóa bài viết_admin
  app.delete('/admin/posts/:postId', authenticateToken, (req, res) => {
    const postId = req.params.postId;
  
    // Xóa bài viết mà không cần kiểm tra quyền sở hữu
    const deleteQuery = 'DELETE FROM Posts WHERE id = ?';
    db.query(deleteQuery, [postId], (err, results) => {
      if (err) return res.status(500).send(err.message);
  
      if (results.affectedRows === 0) {
        return res.status(404).send('Bài viết không tồn tại.');
      }
  
      res.send('Xóa bài viết thành công.');
    });
  });
  
  //Thêm tài khoản
  app.post('/admin/users', authenticateToken, (req, res) => {
    const { username, email, phone, password, account_type, technician_category_name } = req.body;
  
    // Kiểm tra các trường bắt buộc
    if (!username || !email || !password || !account_type) {
      return res.status(400).send('Vui lòng cung cấp đầy đủ thông tin người dùng.');
    }
  
    // Kiểm tra loại tài khoản
    if (account_type === 'technician' && !technician_category_name) {
      return res.status(400).send('Vui lòng chọn loại thợ (technician_category_name) cho tài khoản thợ.');
    }
  
    // Tạo câu lệnh SQL để thêm tài khoản
    let query = 'INSERT INTO Users (username, email, phone, password, account_type';
    let queryParams = [username, email, phone, password, account_type];
  
    // Nếu là tài khoản thợ, thêm trường technician_category_name
    if (account_type === 'technician') {
      query += ', technician_category_name) VALUES (?, ?, ?, ?, ?, ?)';
      queryParams.push(technician_category_name);
    } else {
      query += ') VALUES (?, ?, ?, ?, ?)';
    }
  
    db.query(query, queryParams, (err, results) => {
      if (err) {
        return res.status(500).send(err.message);
      }
  
      res.send('Thêm tài khoản thành công.');
    });
});

//Sua tai khoản
app.put('/admin/users/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  const { username, email, phone, password, account_type, technician_category_name } = req.body;

  // Kiểm tra xem ít nhất một trường có thông tin cần cập nhật
  if (!username && !email && !phone && !password && !account_type) {
    return res.status(400).send('Vui lòng cung cấp thông tin cần cập nhật.');
  }

  // Kiểm tra loại tài khoản
  if (account_type === 'technician' && !technician_category_name) {
    return res.status(400).send('Vui lòng chọn loại thợ (technician_category_name) cho tài khoản thợ.');
  }

  // Tạo câu lệnh SQL để cập nhật thông tin người dùng
  let query = 'UPDATE Users SET username = ?, email = ?, phone = ?, password = ?, account_type = ?';
  let queryParams = [username || null, email || null, phone || null, password || null, account_type || null];

  // Nếu là tài khoản thợ, thêm trường technician_category_name
  if (account_type === 'technician') {
    query += ', technician_category_name = ?';
    queryParams.push(technician_category_name);
  }

  query += ' WHERE id = ?';
  queryParams.push(userId);

  db.query(query, queryParams, (err, result) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Người dùng không tồn tại.');
    }

    res.send('Cập nhật thông tin người dùng thành công.');
  });
});

//Xoa tài khoản
app.delete('/admin/users/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;

  // Xóa tài khoản mà không cần kiểm tra quyền sở hữu
  const deleteQuery = 'DELETE FROM Users WHERE id = ?';
  db.query(deleteQuery, [userId], (err, results) => {
    if (err) return res.status(500).send(err.message);

    if (results.affectedRows === 0) {
      return res.status(404).send('Người dùng không tồn tại.');
    }

    res.send('Xóa tài khoản thành công.');
  });
});

// API lấy danh sách tài khoản
app.get('/admin/users', (req, res) => {
  // Câu lệnh SQL để lấy danh sách tài khoản
  const query = `
    SELECT 
      id, 
      username, 
      email, 
      phone, 
      account_type, 
      avatar, 
      created_at, 
      technician_category_name 
    FROM Users
  `;

  // Thực thi câu lệnh SQL
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách tài khoản:', err);
      return res.status(500).send('Lỗi máy chủ nội bộ.');
    }

    // Trả về danh sách tài khoản
    res.json(results);
  });
});

    // Khởi chạy server
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
