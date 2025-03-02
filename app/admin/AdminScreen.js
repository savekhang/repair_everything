import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminScreen = ({ navigation }) => {
  const [adminToken, setAdminToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem('adminToken');
        if (token) {
          setAdminToken(token);
          console.log('Admin Token:', token);
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Lỗi khi lấy token.');
        console.error('Lỗi khi lấy token:', error);
      }
    };

    fetchToken();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý Hệ thống</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManagePost')}>
        <Ionicons name="chatbubbles-outline" size={32} color="#018ABD" />
        <Text style={styles.buttonText}>Quản lý Bài viết</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManageAccount')}>
        <Ionicons name="person-outline" size={32} color="#018ABD" />
        <Text style={styles.buttonText}>Quản lý Tài khoản</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004581',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: '#8CC7DC',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004581',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#018ABD',
    marginVertical: 10,
    width: '80%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#018ABD',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default AdminScreen;