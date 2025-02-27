import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminScreen = ({ navigation }) => {
  const [adminToken, setAdminToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem('adminToken'); // Lấy token từ AsyncStorage
        if (token) {
          setAdminToken(token);
          console.log('Admin Token:', token); // In token ra console
        } else {
          navigation.replace('Login'); // Nếu không có token, chuyển về trang đăng nhập
        }
      } catch (error) {
        console.error('Lỗi khi lấy token:', error);
      }
    };

    fetchToken();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Quản lý bài viết</Text>
      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ManagePost')}>
        <Ionicons name="chatbubbles-outline" size={32} color="#31A9D4" />
      </TouchableOpacity>
      <Text>Quản lý tài khoản</Text>
      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ManageAccount')}>
        <Ionicons name="person-outline" size={32} color="#31A9D4" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconButton: { margin: 20 },
});

export default AdminScreen;
