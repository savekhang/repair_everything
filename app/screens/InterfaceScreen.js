import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env'; // Nhập biến môi trường từ file env.js
import CheckBox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons từ thư viện vector-icons

const InterfaceScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]); // State để lưu danh sách loại thợ
  const [selectedCategory, setSelectedCategory] = useState(''); // State để lưu loại thợ được chọn
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };

    fetchUserId();
    fetchPosts();
    fetchCategories();
    fetchComments();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/name_technician`);
      setCategories(response.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy danh sách loại thợ.');
    }
  };

  const fetchPosts = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/posts`, {
          headers: { Authorization: token },
        });
        const sortedPosts = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts(sortedPosts);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể lấy danh sách bài viết.');
      }
    }
  };

  const fetchComments = async () => {
    const token = await AsyncStorage.getItem('token'); // Lấy token từ AsyncStorage
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/comments`, {
          headers: {
            Authorization: token,
          },
        });
        setComments(response.data); // Lưu dữ liệu bình luận vào state
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }
  };  

  const handlePost = async () => {
    if (!title || !content || !selectedCategory) {
      Alert.alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const endpoint = editingPostId ? `${API_URL}/posts/${editingPostId}` : `${API_URL}/posts`;
    const method = editingPostId ? 'put' : 'post';

    try {
      const response = await axios[method](endpoint, { title, content, technician_category_name: selectedCategory }, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Thành công', editingPostId ? 'Cập nhật bài viết thành công.' : 'Đăng bài viết thành công.');
        setTitle('');
        setContent('');
        setSelectedCategory(''); // Reset lại loại thợ được chọn
        setIsFormVisible(false);
        setEditingPostId(null);
        fetchPosts();
      } else {
        Alert.alert('Lỗi', response.data || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra.');
    }
  };

  const handleEditPost = (post) => {
    setTitle(post.title);
    setContent(post.content);
    setSelectedCategory(post.technician_category_name); // Set loại thợ khi chỉnh sửa
    setEditingPostId(post.id);
    setIsFormVisible(true);
  };

  const handleDeletePost = async (postId) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        Alert.alert('Thành công', 'Xóa bài viết thành công.');
        fetchPosts();
      } else {
        Alert.alert('Lỗi', response.data || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra.');
    }
  };

  const handleComment = async (postId) => {
    if (!commentContent) {
      Alert.alert('Vui lòng điền nội dung bình luận.');
      return;
    }

    const token = await AsyncStorage.getItem('token');

    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comments`, { content: commentContent }, {
        headers: { Authorization: token },
      });

      if (response.status === 200) {
        //Alert.alert('Thành công', 'Bình luận thành công.');
        setCommentContent('');
        fetchPosts();
      } else {
        Alert.alert('Lỗi', response.data || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra.');
    }
  };

  const toggleForm = () => {
    setTitle('');
    setContent('');
    setSelectedCategory(''); 
    setEditingPostId(null);
    setIsFormVisible((prev) => !prev);
  };

  const togglePostDetails = (postId) => {
    setSelectedPostId(prevId => (prevId === postId ? null : postId));
  }; 

  const handleCheckboxChange = (comment) => {
    const receiverId = comment.id; 
    console.log('receiver_id:', receiverId);
    console.log('comment:', comment);
    navigation.navigate('DetailsScreen', { receiverId });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100} // Điều chỉnh giá trị này nếu cần
    >
      <View style={styles.headerContainer}>
        {/* Sử dụng Ionicons để hiển thị icon */}
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle-outline" size={32} color="#31A9D4" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Messages')}>
          <Ionicons name="chatbubbles-outline" size={32} color="#31A9D4" />
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, {color: '#CCE5FF'}]}>Danh sách bài viết</Text>
      <TouchableOpacity style={styles.button} onPress={toggleForm}>
        <Text style={[styles.title, {color: '#CCE5FF'}]}>{isFormVisible ? "Hủy" : "Đăng bài viết"}</Text>
      </TouchableOpacity>

      {isFormVisible && (
        <ScrollView>
          <View>
            <TextInput
              placeholder="Tiêu đề"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#fff" // Màu chữ của placeholder
              style={[styles.input, {color: '#fff'}, { height: 40 }]}
            />
            <TextInput
              placeholder="Nội dung"
              value={content}
              onChangeText={setContent}
              placeholderTextColor="#fff" // Màu chữ của placeholder
              style={[styles.input, {color: '#fff'}, { height: 100 }]}
              multiline
            />
            <Picker
              selectedValue={selectedCategory}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              itemStyle={{ color: '#fff' }} // Đổi màu chữ cho các mục trong Picker
            >
              <Picker.Item label="Chọn loại thợ" value="" />
              {categories.map((category) => (
                <Picker.Item key={category.name} label={category.name} value={category.name} />
              ))}
            </Picker>
            <TouchableOpacity style={styles.button} onPress={handlePost}>
              <Text style={[styles.title, {color: '#CCE5FF'}]}>{editingPostId ? "Cập nhật" : "Đăng bài viết"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {!isFormVisible && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.postTitle} onPress={() => togglePostDetails(item.id)}>
                  {item.title}
                </Text>
                <Text style={styles.categoryText}>{item.technician_category_name}</Text>
              </View>
              <Text style={styles.usernameText}>Người đăng: {item.username}</Text>
              <Text style={styles.contentText}>{item.content}</Text>
              <Text style={styles.dateText}>Được tạo lúc: {new Date(item.created_at).toLocaleString()}</Text>

              {selectedPostId === item.id && ( 
                <>
                  {item.user_id === userId ? (
                    <View style={styles.buttonContainer}>
                      <Button title="Chỉnh sửa" onPress={() => handleEditPost(item)} />
                      <Button title="Xóa" onPress={() => handleDeletePost(item.id)} />
                    </View>
                  ) : (
                    <View>
                      <TextInput
                        placeholder="Viết bình luận..."
                        value={commentContent}
                        onChangeText={setCommentContent}
                        style={[styles.input, { height: 60 }]}
                        multiline
                      />
                      <Button title="Gửi bình luận" onPress={() => handleComment(item.id)} />
                    </View>
                  )}
                </>
              )}

              {selectedPostId === item.id && item.comments && item.comments.length > 0 && (
                <FlatList
                data={item.comments}
                keyExtractor={(comment) => comment.id.toString()}
                renderItem={({ item: comment }) => (
                  <View style={styles.commentContainer}>
                    {/* Đặt nội dung bình luận và checkbox trong cùng một hàng */}
                    <View style={styles.commentRow}>
                      <Text style={styles.commentText}>
                        <Text style={styles.commentAuthor}>{comment.username}</Text>: {comment.content}
                      </Text>
                      <TouchableOpacity onPress={() => handleCheckboxChange(comment.id)}>
                        <CheckBox
                          value={comment.isChecked}
                          onValueChange={() => handleCheckboxChange(comment)} // Truyền comment vào hàm
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</Text>
                  </View>
                )}
              />
              
              )}
            </View>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#004581', // Đổi nền thành màu
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  postContainer: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postTitle: {
    width: '60%', // Chỉ chiếm 60% chiều rộng
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  usernameText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  categoryText: {
    fontSize: 14,
    color: '#007AFF',
  },
  contentText: {
    fontSize: 16,
    color: '#555',
    marginVertical: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  commentContainer: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentAuthor: {
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 10,
  },
  commentText: {
    flex: 1,  // Để văn bản tự động chiếm khoảng trống còn lại
  },
  commentDate: {
    color: 'gray',
    fontSize: 12,
  },
  headerContainer: {
    flexDirection: 'row',         // Xếp các phần tử theo hàng ngang
    justifyContent: 'space-between', // Đẩy các nút về hai phía của container
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#004581',
},
iconButton: {
  padding: 4,
},
});

export default InterfaceScreen;
