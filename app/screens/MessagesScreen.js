import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env';

const MessagesScreen = () => {
  const [receivers, setReceivers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchReceivers();
  }, []);

  const fetchReceivers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token!');

      const response = await axios.get(`${API_URL}/receivers`, {
        headers: { Authorization: token },
      });

      setReceivers(response.data);
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách tin nhắn:', error.response?.data || error.message);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Thiếu token!');

      const response = await axios.get(`${API_URL}/search?username=${searchText}`, {
        headers: { Authorization: token },
      });

      setSearchResult(response.data);
      setErrorMessage('');
    } catch (error) {
      setSearchResult(null);
      setErrorMessage(error.response?.data?.message || 'Lỗi tìm kiếm');
    }
  };

  const handlePress = (receiverId, receiverUsername) => {
    navigation.navigate('DetailsScreen', { receiverId, receiverUsername });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách tin nhắn</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm người dùng..."
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {searchResult && (
        <TouchableOpacity onPress={() => handlePress(searchResult.receiver_id, searchResult.username)} style={styles.searchResult}>
          <Text style={styles.username}>{searchResult.username}</Text>
        </TouchableOpacity>
      )}

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <FlatList
        data={receivers}
        keyExtractor={(item) => item.receiver_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item.receiver_id, item.username)} style={styles.receiverContainer}>
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#004581' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  searchContainer: { flexDirection: 'row', marginBottom: 10 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, color: '#fff' },
  searchButton: { padding: 10, backgroundColor: '#007bff', borderRadius: 5, marginLeft: 5 },
  searchButtonText: { color: 'white', fontWeight: 'bold' },
  searchResult: { padding: 10, backgroundColor: '#0284c7', marginTop: 5, borderRadius: 5 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 10 },
  receiverContainer: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  username: { fontSize: 18, color: '#fff' },
});

export default MessagesScreen;
