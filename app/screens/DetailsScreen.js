import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env';

const DetailsScreen = ({ route }) => {
  const { receiverId, receiverUsername } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState("");

  useEffect(() => {
    fetchMessages();
    fetchAccountType();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Thiếu token!');
      const response = await fetch(`${API_URL}/messages/${receiverId}`, {
        headers: { Authorization: token },
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      setError('Lỗi khi tải tin nhắn.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountType = async () => {
    const storedAccountType = await AsyncStorage.getItem('account_type');
    setAccountType(storedAccountType?.trim() || "");
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Thiếu token!');

      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ receiver_id: receiverId, content: newMessage }),
      });

      setMessages([...messages, { sender_id: 'Bạn', content: newMessage }]);
      setNewMessage('');
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.header}>Tin nhắn với {receiverUsername}</Text>

          {loading ? <Text>Đang tải...</Text> : error ? <Text>{error}</Text> : (
            <FlatList
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={item.sender_id === receiverId ? styles.receiver : styles.sender}>
                  <Text style={item.sender_id === receiverId ? {} : { color: 'white' }}>{item.content}</Text>
                </View>
              )}
              contentContainerStyle={{ flexGrow: 1 }}
              inverted
            />
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text style={{ color: 'white' }}>Gửi</Text>
            </TouchableOpacity>
          </View>

          {accountType === 'technician' && (
            <TouchableOpacity style={styles.quoteButton} onPress={() => alert('Chức năng báo giá đang phát triển')}>
              <Text style={styles.quoteButtonText}>Báo giá</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  receiver: {
    alignSelf: 'flex-start',
    backgroundColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5
  },
  sender: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 5
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#28a745',
    borderRadius: 5
  },
  quoteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ff9800',
    alignItems: 'center',
    borderRadius: 5
  },
  quoteButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
});

export default DetailsScreen;
