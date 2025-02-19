import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env'; // Nhập biến môi trường từ file env.js

const MessagesScreen = () => {
  const [receivers, setReceivers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Gọi API để lấy danh sách receiver_id và username
    const fetchReceivers = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${API_URL}/receivers`, {
          headers: {
            Authorization: token
          },
        });
        setReceivers(response.data);
      } catch (error) {
        console.error('Error fetching receivers:', error);
      }
    };

    fetchReceivers();
  }, []);

  const handlePress = (receiver_id) => {
    navigation.navigate('DetailsScreen', { receiverId: receiver_id });
  };

  const renderReceiver = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item.receiver_id)} style={styles.receiverContainer}>
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách tin nhắn</Text>
      <FlatList
        data={receivers}
        keyExtractor={(item) => item.receiver_id.toString()}
        renderItem={renderReceiver}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#004581',
    },
    header: {
      fontSize: 26,
      fontWeight: 'bold',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      color: '#fff',
    },
    listContainer: {
      padding: 16,
    },
    receiverContainer: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    username: {
      fontSize: 18,
      fontWeight: '500',
      color: '#fff', // Màu xanh tương tự Instagram
    },
  });

export default MessagesScreen;


