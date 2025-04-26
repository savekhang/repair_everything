// Import các thư viện cần thiết
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Modal } from 'react-native';
import { API_URL } from '../../env'; // Nhập biến môi trường từ file env.js

// LoginScreen Component
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user } = response.data; // Lấy token và user từ phản hồi

      // Thêm console.log để kiểm tra token và user
      console.log('Token:', token);
      console.log('User:', user);

      if (token) {
        await AsyncStorage.setItem('token', token);

        // Lưu thông tin người dùng vào AsyncStorage
        if (user) {
          await AsyncStorage.setItem('userId', user.id.toString());
          await AsyncStorage.setItem('username', user.username);
          await AsyncStorage.setItem('email', user.email);
          await AsyncStorage.setItem('accountType', user.account_type);
          if (user.phone) {
            await AsyncStorage.setItem('phone', user.phone);
          }
          if (user.created_at) {
            await AsyncStorage.setItem('createdAt', user.created_at);
          }
          if (user.technician_category_name) {
            await AsyncStorage.setItem('technicianCategoryName', user.technician_category_name);
          }
          // Lưu trường avatar vào AsyncStorage
          if (user.avatar) {
            await AsyncStorage.setItem('avatar', user.avatar);
          }
        }

        Alert.alert('Đăng nhập thành công!', 'Chào mừng bạn đến với ứng dụng!');
        navigation.navigate('ServiceScreen');
      } else {
        Alert.alert('Lỗi', 'Không thể nhận token từ máy chủ.');
      }
    } catch (error) {
      const errorMsg = error.response?.data || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      Alert.alert('Lỗi', errorMsg);
    }
  };

  const handleAdminLogin = async () => {
    if (!username || !password) {
      Alert.alert('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
  
    try {
      const response = await axios.post(`${API_URL}/admin/login`, { username, password });
      const { token, admin } = response.data;
  
      if (token) {
        await AsyncStorage.setItem('adminToken', token);
        await AsyncStorage.setItem('adminName', admin.username);
  
        Alert.alert('Đăng nhập Admin thành công!', `Chào mừng Admin ${admin.username}`);
        setShowAdminLogin(false);
        navigation.navigate('Admin'); // Điều hướng đến giao diện Admin
      } else {
        Alert.alert('Lỗi', 'Không thể nhận token từ máy chủ.');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Repair Everything</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#DDE8F0" // Đổi màu chữ placeholder thành #DDE8F0
        value={email}
        onChangeText={setEmail}
        selectionColor="#97CBDC" // Đổi màu con trỏ chọn
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#DDE8F0" // Đổi màu chữ placeholder thành #DDE8F0
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        selectionColor="#97CBDC" // Đổi màu con trỏ chọn
      />
      
      {/* Nút Đăng nhập */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
    
      {/* Nút Đăng ký */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RegisterType')}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>
      
      {/* Nút Admin ở góc trên cùng bên phải */}
      <TouchableOpacity style={styles.adminIcon} onPress={() => setShowAdminLogin(true)}>
        <MaterialIcons name="admin-panel-settings" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Modal đăng nhập Admin */}
      <Modal visible={showAdminLogin} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.adminLoginForm}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowAdminLogin(false)}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
            <Text style={styles.adminTitle}>Admin Login</Text>

            <TextInput
              style={styles.input}
              placeholder="Admin Username"
              placeholderTextColor="#DDE8F0"
              value={username}
              onChangeText={setUsername}
            />

            <TextInput
              style={styles.input}
              placeholder="Admin Password"
              placeholderTextColor="#DDE8F0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleAdminLogin}>
              <Text style={styles.buttonText}>Admin Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#004581' },
  title: { fontSize: 24, color: '#8CC7DC', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { 
    borderWidth: 1, 
    borderColor: '#8CC7DC', 
    padding: 10, 
    marginVertical: 10, 
    borderRadius: 5, 
    color: '#DDE8F0' // Đổi màu chữ khi nhập
  },
  button: {
    backgroundColor: '#004581', // Màu nền của nút
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#018ABD', // Màu chữ trong nút
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Định vị icon admin lên góc trên bên phải
  adminIcon: {
    position: 'absolute',
    top: 50, 
    right: 20,
    zIndex: 10,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Làm mờ background
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminLoginForm: {
    width: '80%',
    backgroundColor: '#004581',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  adminTitle: { fontSize: 20, color: '#8CC7DC', fontWeight: 'bold', marginBottom: 15 },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  closeText: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },
});

export default LoginScreen;
