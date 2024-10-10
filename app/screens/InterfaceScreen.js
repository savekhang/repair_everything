import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env'; // Nhập biến môi trường từ file env.js

const InterfaceScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Lấy token từ AsyncStorage và lấy danh sách bài viết
    const fetchPosts = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/post`, { // Sửa ở đây: sử dụng template literals
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

    fetchPosts();
  }, []);

  const handlePost = () => {
    // Điều hướng đến màn hình đăng bài
    navigation.navigate('PostJobScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách bài viết</Text>
      <Button title="Đăng bài viết" onPress={handlePost} />
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
