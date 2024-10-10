import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env'; // Nhập biến môi trường từ file env.js

const InterfaceScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState(''); // State cho tiêu đề
  const [content, setContent] = useState(''); // State cho nội dung
  const [isFormVisible, setIsFormVisible] = useState(false); // State để quản lý hiển thị form

  useEffect(() => {
    // Gọi hàm fetchPosts để lấy danh sách bài viết khi component được mount
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/posts`, {
          headers: {
            Authorization: token,
          },
        });
        setPosts(response.data);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể lấy danh sách bài viết.');
      }
    }
  };

  const handlePost = async () => {
    // Kiểm tra tiêu đề và nội dung không rỗng
    if (!title || !content) {
      Alert.alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.post(`${API_URL}/posts`, {
        title,
        content,
      }, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        Alert.alert('Thành công', 'Đăng bài viết thành công.');
        setTitle(''); // Đặt lại tiêu đề
        setContent(''); // Đặt lại nội dung
        setIsFormVisible(false); // Ẩn form sau khi đăng bài thành công
        fetchPosts(); // Gọi lại fetchPosts để làm mới danh sách bài viết
      } else {
        Alert.alert('Lỗi', response.data || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra khi đăng bài viết.');
    }
  };

  const toggleForm = () => {
    setIsFormVisible((prev) => !prev); // Chuyển đổi trạng thái hiển thị form
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách bài viết</Text>

      {/* Nút để hiển thị form đăng bài viết */}
      <Button title={isFormVisible ? "Hủy đăng bài viết" : "Đăng bài viết"} onPress={toggleForm} />

      {/* Hiển thị form đăng bài viết nếu isFormVisible là true */}
      {isFormVisible && (
        <View>
          <TextInput
            placeholder="Tiêu đề"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Nội dung"
            value={content}
            onChangeText={setContent}
            style={[styles.input, { height: 100 }]} // Chiều cao lớn hơn cho nội dung
            multiline
          />
          <Button title="Gửi bài viết" onPress={handlePost} />
        </View>
      )}

      {/* Danh sách các bài viết */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  postContainer: {
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default InterfaceScreen;
