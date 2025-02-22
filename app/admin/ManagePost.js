import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env';
import { Ionicons } from '@expo/vector-icons';

const ManagePostScreen = () => {
  const [posts, setPosts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/posts`, { headers: { Authorization: token } });
      setPosts(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch {
      Alert.alert('Lỗi', 'Không thể lấy danh sách bài viết.');
    }
  };

  const handleDelete = (id, type) => {
    Alert.alert('Xác nhận', `Bạn có chắc muốn xóa ${type === 'post' ? 'bài viết' : 'bình luận'} này?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', onPress: () => deleteItem(id, type) },
    ]);
  };

  const deleteItem = async (id, type) => {
    const token = await AsyncStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/${type === 'post' ? 'posts' : 'comments'}/${id}`, { headers: { Authorization: token } });
      Alert.alert('Thành công', `${type === 'post' ? 'Bài viết' : 'Bình luận'} đã bị xóa.`);
      fetchPosts();
    } catch {
      Alert.alert('Lỗi', 'Không thể xóa.');
    }
  };

  const handleEdit = (item, type) => {
    setSelectedItem({ ...item, type });
    setEditData({ title: item.title || '', content: item.content });
    setModalVisible(true);
  };

  const saveChanges = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!selectedItem) return;
    try {
      await axios.put(`${API_URL}/${selectedItem.type === 'post' ? 'posts' : 'comments'}/${selectedItem.id}`, editData, { headers: { Authorization: token } });
      Alert.alert('Thành công', 'Cập nhật thành công.');
      fetchPosts();
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật.');
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
              <TouchableOpacity onPress={() => handleEdit(item, 'post')}>
                <Ionicons name="create-outline" size={24} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id, 'post')}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
            {selectedItem?.id === item.id && (
              <FlatList
                data={item.comments}
                keyExtractor={(c) => c.id.toString()}
                renderItem={({ item: comment }) => (
                  <View style={styles.commentContainer}>
                    <Text style={styles.commentText}>{comment.username}: {comment.content}</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity onPress={() => handleEdit(comment, 'comment')}>
                        <Ionicons name="create-outline" size={20} color="green" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(comment.id, 'comment')}>
                        <Ionicons name="trash-outline" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedItem?.type === 'post' && (
              <TextInput style={styles.input} placeholder="Tiêu đề" value={editData.title} onChangeText={(text) => setEditData({ ...editData, title: text })} />
            )}
            <TextInput style={styles.input} placeholder="Nội dung" value={editData.content} onChangeText={(text) => setEditData({ ...editData, content: text })} multiline />
            <Button title="Lưu" onPress={saveChanges} />
            <Button title="Hủy" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  postContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  postTitle: { fontSize: 18, fontWeight: 'bold' },
  contentText: { fontSize: 16, marginVertical: 5 },
  dateText: { fontSize: 14, color: 'gray' },
  commentContainer: { paddingLeft: 15, marginTop: 5 },
  commentText: { fontSize: 14, color: 'gray' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 5 },
});

export default ManagePostScreen;