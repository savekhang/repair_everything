import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env';
import { Ionicons } from '@expo/vector-icons';

const ManagePost = () => {
  const [posts, setPosts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

  // Lấy token từ AsyncStorage
  const getToken = async () => {
    return await AsyncStorage.getItem('adminToken');
  };
  

  // Lấy danh sách bài viết
  const fetchPosts = async () => {
    try {
      // console.log('Fetching posts...');
      const token = await getToken();
      console.log('adminToken:', token); // Kiểm tra token
      const response = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: token },
      });
      setPosts(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      //console.log('Posts fetched:', response.data);
    } catch (error) {
      // console.error('Lỗi khi lấy danh sách bài viết:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể lấy danh sách bài viết.');
    }
  };

  // Xác nhận xóa bài viết
  const handleDelete = (id) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa bài viết này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', onPress: () => deletePost(id) },
    ]);
  };

  // Xóa bài viết
  const deletePost = async (id) => {
    try {
      console.log(`Deleting post with ID: ${id}`);
      const token = await getToken();
      await axios.delete(`${API_URL}/admin/posts/${id}`, {
        headers: { Authorization: token },
      });
      Alert.alert('Thành công', 'Bài viết đã bị xóa.');
      fetchPosts(); // Cập nhật lại danh sách bài viết
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể xóa bài viết.');
    }
  };

  // Mở modal chỉnh sửa bài viết
  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditData({ title: item.title, content: item.content });
    setModalVisible(true);
  };

  // Lưu thay đổi sau khi chỉnh sửa
  const saveChanges = async () => {
    if (!selectedItem) return;
    try {
      console.log(`Updating post with ID: ${selectedItem.id}`, editData);
      const token = await getToken();
      console.log(token)
      await axios.put(
        `${API_URL}/admin/posts/${selectedItem.id}`,
        editData,
        {
          headers: { Authorization: token },
        }
      );
      Alert.alert('Thành công', 'Cập nhật bài viết thành công.');
      fetchPosts(); // Cập nhật lại danh sách bài viết
    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể cập nhật bài viết.');
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý bài viết</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <TouchableOpacity onPress={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.contentText}>{item.content}</Text>
              <Text style={styles.dateText}>Ngày tạo: {new Date(item.created_at).toLocaleString()}</Text>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Ionicons name="create-outline" size={24} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {/* Modal chỉnh sửa */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Tiêu đề"
              value={editData.title}
              onChangeText={(text) => setEditData({ ...editData, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Nội dung"
              value={editData.content}
              onChangeText={(text) => setEditData({ ...editData, content: text })}
              multiline
            />
            <Button title="Lưu" onPress={saveChanges} />
            <Button title="Hủy" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  postContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  postTitle: { fontSize: 18, fontWeight: 'bold' },
  contentText: { fontSize: 16, marginVertical: 5 },
  dateText: { fontSize: 14, color: 'gray' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 5 },
});

export default ManagePost;
