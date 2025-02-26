import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env';
import { Ionicons } from '@expo/vector-icons';

const ManageAccount = () => {
  const [users, setUsers] = useState([]); // Danh sách tài khoản
  const [selectedUser, setSelectedUser] = useState(null); // Tài khoản được chọn
  const [modalVisible, setModalVisible] = useState(false); // Hiển thị modal
  const [editData, setEditData] = useState({ // Dữ liệu chỉnh sửa
    username: '',
    email: '',
    phone: '',
    password: '',
    account_type: '',
    technician_category_name: '',
  });
  const [isAddMode, setIsAddMode] = useState(false); // Chế độ thêm mới

  // Lấy danh sách tài khoản
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/admin/users`, { headers: { Authorization: token } });
      setUsers(response.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy danh sách tài khoản.');
    }
  };

  // Xác nhận xóa tài khoản
  const handleDelete = (userId) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa tài khoản này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', onPress: () => deleteUser(userId) },
    ]);
  };

  // Xóa tài khoản
  const deleteUser = async (userId) => {
    const token = await AsyncStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, { headers: { Authorization: token } });
      Alert.alert('Thành công', 'Tài khoản đã bị xóa.');
      fetchUsers(); // Cập nhật lại danh sách
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa tài khoản.');
    }
  };

  // Mở modal chỉnh sửa hoặc thêm mới
  const handleEdit = (user) => {
    if (user) {
      setSelectedUser(user);
      setEditData({
        username: user.username,
        email: user.email,
        phone: user.phone,
        password: '',
        account_type: user.account_type,
        technician_category_name: user.technician_category_name || '',
      });
      setIsAddMode(false);
    } else {
      setEditData({
        username: '',
        email: '',
        phone: '',
        password: '',
        account_type: '',
        technician_category_name: '',
      });
      setIsAddMode(true);
    }
    setModalVisible(true);
  };

  // Lưu thay đổi hoặc thêm mới
  const saveChanges = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!editData.username || !editData.email || !editData.account_type) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      if (isAddMode) {
        // Thêm tài khoản mới
        await axios.post(`${API_URL}/admin/users`, editData, { headers: { Authorization: token } });
        Alert.alert('Thành công', 'Thêm tài khoản thành công.');
      } else {
        // Cập nhật tài khoản
        await axios.put(`${API_URL}/admin/users/${selectedUser.id}`, editData, { headers: { Authorization: token } });
        Alert.alert('Thành công', 'Cập nhật tài khoản thành công.');
      }
      fetchUsers(); // Cập nhật lại danh sách
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý tài khoản</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => handleEdit(null)}>
        <Text style={styles.addButtonText}>Thêm tài khoản</Text>
      </TouchableOpacity>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <Text style={styles.userName}>{item.username}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userType}>Loại tài khoản: {item.account_type}</Text>
            {item.account_type === 'technician' && (
              <Text style={styles.userCategory}>Loại thợ: {item.technician_category_name}</Text>
            )}
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
      {/* Modal chỉnh sửa/thêm mới */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Tên người dùng"
              value={editData.username}
              onChangeText={(text) => setEditData({ ...editData, username: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editData.email}
              onChangeText={(text) => setEditData({ ...editData, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={editData.phone}
              onChangeText={(text) => setEditData({ ...editData, phone: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={editData.password}
              onChangeText={(text) => setEditData({ ...editData, password: text })}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Loại tài khoản (user/technician)"
              value={editData.account_type}
              onChangeText={(text) => setEditData({ ...editData, account_type: text })}
            />
            {editData.account_type === 'technician' && (
              <TextInput
                style={styles.input}
                placeholder="Loại thợ"
                value={editData.technician_category_name}
                onChangeText={(text) => setEditData({ ...editData, technician_category_name: text })}
              />
            )}
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
  addButton: { backgroundColor: '#31A9D4', padding: 10, borderRadius: 5, marginBottom: 10 },
  addButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  userContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 16, color: '#666' },
  userType: { fontSize: 14, color: '#333' },
  userCategory: { fontSize: 14, color: '#333', fontStyle: 'italic' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 5 },
});

export default ManageAccount;