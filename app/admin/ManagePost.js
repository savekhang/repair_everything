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

  const getToken = async () => {
    return await AsyncStorage.getItem('adminToken');
  };

  const fetchPosts = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: token },
      });
      setPosts(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy danh sách bài viết.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa bài viết này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', onPress: () => deletePost(id) },
    ]);
  };

  const deletePost = async (id) => {
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/admin/posts/${id}`, {
        headers: { Authorization: token },
      });
      Alert.alert('Thành công', 'Bài viết đã bị xóa.');
      fetchPosts();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa bài viết.');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditData({ title: item.title, content: item.content });
    setModalVisible(true);
  };

  const saveChanges = async () => {
    if (!selectedItem) return;
    try {
      const token = await getToken();
      await axios.put(
        `${API_URL}/admin/posts/${selectedItem.id}`,
        editData,
        { headers: { Authorization: token } }
      );
      Alert.alert('Thành công', 'Cập nhật bài viết thành công.');
      fetchPosts();
    } catch (error) {
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
                <Ionicons name="create-outline" size={24} color="#C0C0C0" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Tiêu đề"
              value={editData.title}
              onChangeText={(text) => setEditData({ ...editData, title: text })}
              placeholderTextColor="#DDE8F0"
            />
            <TextInput
              style={styles.input}
              placeholder="Nội dung"
              value={editData.content}
              onChangeText={(text) => setEditData({ ...editData, content: text })}
              multiline
              placeholderTextColor="#DDE8F0"
            />
            <Button title="Lưu" onPress={saveChanges} color="#018ABD" />
            <Button title="Hủy" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#004581' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#8CC7DC', marginBottom: 10, textAlign: 'center' },
  postContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#8CC7DC' },
  postTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  contentText: { fontSize: 16, marginVertical: 5, color: '#DDE8F0' },
  dateText: { fontSize: 14, color: '#A0C4E3' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: '#004581', padding: 20, borderRadius: 10 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 5, color: '#DDE8F0', borderColor: '#8CC7DC' },
});

export default ManagePost;