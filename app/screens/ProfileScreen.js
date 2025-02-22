import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, FlatList, KeyboardAvoidingView, Modal, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';

const Profile = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [posts, setPosts] = useState([]);
    const [postCount, setPostCount] = useState(0);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // State to manage edit form visibility
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedImage, setSelectedImage] = useState(null); // State để lưu ảnh đã chọn
    const [modalVisible, setModalVisible] = useState(false); // State cho modal
    const [selectedPost, setSelectedPost] = useState(null); // State cho bài viết được chọn
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
      setLoading(false);
      return;
    }

    try {
      const userResponse = await axios.get(`${API_URL}/user_info`, {
        headers: { Authorization: token },
      });

      setUserInfo(userResponse.data.user);
      setAvatarUrl(userResponse.data.user.avatar 
        ? `${API_URL}/images/${userResponse.data.user.avatar}` 
        : 'http://example.com/k1.jpg'
      );

      setUsername(userResponse.data.user.username); // Set initial values for edit form
      setEmail(userResponse.data.user.email);
      setPhone(userResponse.data.user.phone);

      const postsResponse = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: token },
      });

      const userPosts = postsResponse.data.filter(post => post.user_id === userResponse.data.user.id);
      setPosts(userPosts);
      setPostCount(userPosts.length);
    } catch (error) {
      console.error('Error fetching user info:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lấy thông tin người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const shareProfile = async () => {
    if (!userInfo) return;

    try {
      const shareOptions = {
        message: `🌟 Hồ sơ của tôi 🌟\n\n` +
                 `Tên: ${userInfo.username}\n` +
                 `Email: ${userInfo.email}\n` +
                 `Số điện thoại: ${userInfo.phone || 'Không có'}\n` +
                 `Chuyên môn: ${userInfo.technician_category_name || 'Không có'}\n` +
                 `Xem hồ sơ tại: ${API_URL}/profile/${userInfo.id}`,
        url: avatarUrl,
      };

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareOptions.url, {
          dialogTitle: 'Chia sẻ hồ sơ của tôi',
          message: shareOptions.message,
        });
      } else {
        Alert.alert('Lỗi', 'Chia sẻ không khả dụng trên thiết bị này.');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chia sẻ hồ sơ.');
    }
  };

  const togglePostDetails = (postId) => {
    setSelectedPostId(selectedPostId === postId ? null : postId);
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Thông tin người dùng không có.</Text>
      </View>
    );
  }

  const handleEditProfile = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      await axios.put(`${API_URL}/user_info`, { username, email, phone }, {
        headers: { Authorization: token },
      });
      Alert.alert('Thành công', 'Cập nhật thông tin thành công.');
      setIsEditing(false); // Close the edit form
      fetchUserInfo(); // Refresh user info
    } catch (error) {
      console.error('Error updating user info:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin.');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Thông tin người dùng không có.</Text>
      </View>
    );
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
    });

    if (!result.cancelled) {
        setSelectedImage(result.uri);
    }
};

const uploadAvatar = async () => {
    if (!selectedImage) return;

    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', {
        uri: selectedImage,
        type: 'image/jpeg', 
        name: 'avatar.jpg',
    });

    try {
        const response = await axios.post(`${API_URL}/upload_avatar`, formData, {
            headers: {
                Authorization: token,
                'Content-Type': 'multipart/form-data',
            },
        });

        Alert.alert('Thành công', 'Tải lên ảnh đại diện thành công.');
        setAvatarUrl(response.data.avatarUrl);
    } catch (error) {
        console.error('Error uploading avatar:', error);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải lên ảnh đại diện.');
    }
};

const handlePickAndUpload = async () => {
  await pickImage(); // Gọi hàm chọn ảnh
  await uploadAvatar(); // Gọi hàm tải ảnh lên (nếu cần)
};

const handleEditPost = async () => {
  // Kiểm tra xem thông tin bài viết có đầy đủ không
  if (!selectedPost || !selectedPost.id || !selectedPost.title || !selectedPost.content) {
      Alert.alert('Lỗi', 'Vui lòng chắc chắn rằng thông tin bài viết đầy đủ.');
      return;
  }

  // Lấy token xác thực từ AsyncStorage
  const token = await AsyncStorage.getItem('token');
  
  try {
      console.log('Updating post:', selectedPost);
      
      // Gửi yêu cầu PUT đến API để chỉnh sửa bài viết
      const response = await axios.put(`${API_URL}/posts/${selectedPost.id}`, { title, content },
      {
          headers: { Authorization: token }, // Đảm bảo gửi token với định dạng Bearer
      });
      
      console.log('Response from post edit:', response);
      Alert.alert('Thành công', response.data);
      setModalVisible(false);
      fetchUserInfo(); // Tải lại thông tin người dùng và bài viết
  } catch (error) {
      console.error('Error editing post:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chỉnh sửa bài viết.'); // Hiển thị thông báo lỗi
  }
};


const handleDeletePost = async () => {
  // Logic để xóa bài viết
  const token = await AsyncStorage.getItem('token');
  try {
      // Gọi API xóa bài viết với selectedPost.id
      const response = await axios.delete(`${API_URL}/posts/${selectedPost.id}`, {
          headers: { Authorization: token },
      });

      Alert.alert('Thành công', response.data);
      setModalVisible(false); // Đóng modal sau khi xóa
      fetchUserInfo(); // Tải lại thông tin người dùng và bài viết
  } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa bài viết.');
  }
};

const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem('token'); // Xóa token
    Alert.alert('Thành công', 'Đăng xuất thành công.');
    // Chuyển hướng về màn hình đăng nhập
     navigation.navigate('Login');
  } catch (error) {
    console.error('Error logging out:', error);
    Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất.');
  }
};

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{postCount}</Text>
            <Text style={styles.statLabel}>Bài viết</Text>
          </View>
        </View>
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.username}>{userInfo.username}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={shareProfile}>
            <Text style={styles.shareButtonText}>Chia sẻ hồ sơ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleLogout} >
            <Text style={styles.shareButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Email: {userInfo.email}</Text>
        {userInfo.phone && <Text style={styles.infoText}>Số điện thoại: {userInfo.phone}</Text>}
        {userInfo.account_type === 'technician' && userInfo.technician_category_name && (
          <Text style={styles.infoText}>Chuyên môn: {userInfo.technician_category_name}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.statNumber}>Bài viết đã đăng</Text>
      </View>
      <FlatList
    data={posts}
    keyExtractor={(item) => item.id.toString()}
    showsVerticalScrollIndicator={false}
    renderItem={({ item }) => (
        <View style={styles.postContainer}>
            <View style={styles.postHeader}>
                <Text style={styles.postTitle} onPress={() => togglePostDetails(item.id)}>
                    {item.title}
                </Text>
                <TouchableOpacity 
                    style={styles.dotsButtonContainer} 
                    onPress={() => {
                        setSelectedPost(item);
                        setTitle(item.title); // Cập nhật tiêu đề
                        setContent(item.content); // Cập nhật nội dung
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.dotsButton}>⋮</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.postContent}>{item.content}</Text>
            <Text style={styles.postAuthor}>Người đăng: {item.username}</Text>
            <Text style={styles.postCategory}>Chuyên môn: {item.technician_category_name}</Text>
            <Text style={styles.postCategory}>Ngày đăng: {item.created_at}</Text>
            {selectedPostId === item.id && item.comments && item.comments.length > 0 && (
                <FlatList
                    data={item.comments}
                    keyExtractor={(comment) => comment.id.toString()}
                    renderItem={({ item: comment }) => (
                        <View style={styles.commentContainer}>
                            <Text style={styles.commentText}>
                                <Text style={styles.commentAuthor}>{comment.username}</Text>: {comment.content}
                            </Text>
                            <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    )}
/>

      {/* Modal for edit/delete post */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <Text style={styles.titleModalText}>Chỉnh sửa bài viết</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tiêu đề"
                            value={title} // Giá trị tiêu đề
                            onChangeText={setTitle} // Cập nhật tiêu đề
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Nội dung"
                            value={content} // Giá trị nội dung
                            onChangeText={setContent} // Cập nhật nội dung
                            multiline // Cho phép nhập nhiều dòng
                            numberOfLines={4} // Số dòng hiển thị
                        />
                        {/* <Text style={styles.modalTitle}>Chọn thao tác</Text> */}
                        <TouchableOpacity style={styles.saveButton} onPress={handleEditPost}>
                          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleDeletePost}>
                            <Text style={styles.actionButtonText}>Xóa bài viết</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
      
      {/* Modal for editing user information */}
      <Modal visible={isEditing} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsEditing(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.pickImageButton} onPress={handlePickAndUpload}>
               <Text style={styles.buttonText}>Chọn Ảnh Đại Diện</Text>
            </TouchableOpacity>
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.avatarPreview} />}
            {/* <TouchableOpacity style={styles.saveButton} onPress={uploadAvatar}>
               <Text style={styles.saveButtonText}>Tải lên ảnh đại diện</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.saveButton} onPress={handleEditProfile}>
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004581',
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    marginLeft: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 18,
    color: '#fff',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#808080',
    padding: 8,
    borderRadius: 16,
    marginRight: 8, // Thêm khoảng cách giữa nút chỉnh sửa và chia sẻ
  },
  editButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#808080',
    padding: 8, // Giảm padding để thu ngắn nút chia sẻ
    borderRadius: 16,
    alignItems: 'centerri',
    marginRight: 8,
  },
  shareButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginVertical: 4,
    fontWeight: '400',
    lineHeight: 18,
  },
  postContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  postAuthor: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  postCategory: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  commentContainer: {
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    padding: 5,
    marginTop: 5,
  },
  commentText: {
    fontSize: 14,
  },
  commentAuthor: {
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  closeButton: { alignSelf: 'flex-end' },
  closeButtonText: { fontSize: 18, color: '#007BFF' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10 },
  saveButton: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5 },
  saveButtonText: { color: '#fff', textAlign: 'center' },
  avatarPreview: { width: 100, height: 100, borderRadius: 50, marginVertical: 10 },
  pickImageButton: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5, marginBottom: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginVertical: 5,
},
actionButtonText: {
    color: '#fff',
    textAlign: 'center',
},
postHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
dotsButtonContainer: {
  padding: 5, // Để tạo không gian cho nút
},
dotsButton: {
  fontSize: 20, // Kích thước của nút ba chấm
  color: '#000',
},
titleModalText: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333',
  textAlign: 'center',
  marginBottom: 28,
},
});

export default Profile;
