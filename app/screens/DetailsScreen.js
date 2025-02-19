import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env'; // Đảm bảo rằng đường dẫn này là chính xác

const DetailsScreen = ({ route }) => {
  const { receiverId } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [receiverUsername, setReceiverUsername] = useState(''); // Thêm state để lưu username của người nhận

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
          setError('Không có token xác thực. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/messages/${receiverId}`, {
          headers: { Authorization: token },
        });
        console.log(response.data);

        // Lưu username của người nhận từ dữ liệu trả về
        if (response.data.length > 0) {
          setReceiverUsername(response.data[0].username);
        }

        // Sắp xếp tin nhắn theo thời gian tạo
        const sortedMessages = response.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setMessages(sortedMessages);
      } catch (err) {
        setError('Đã có lỗi xảy ra khi lấy tin nhắn.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [receiverId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const token = await AsyncStorage.getItem('token');
        const sender_id = await AsyncStorage.getItem('user_id'); // Lấy user_id từ AsyncStorage

        await axios.post(`${API_URL}/messages`,
          {
            sender_id,
            receiver_id: receiverId,
            content: newMessage,
          },
          {
            headers: { Authorization: token },
          }
        );

        // Thêm tin nhắn mới vào danh sách
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Date.now(), content: newMessage, sender_id, created_at: new Date() }, // Thêm id tạm thời
        ]);
        setNewMessage('');
        Keyboard.dismiss(); // Đóng bàn phím sau khi gửi tin nhắn
      } catch (err) {
        setError('Đã có lỗi xảy ra khi gửi tin nhắn.');
      }
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.sender_id === receiverId ? styles.receiver : styles.sender]}>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageDate}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100} // Điều chỉnh giá trị này nếu cần
    >
      <Text style={styles.header}>Tin nhắn với: {receiverUsername || 'Người dùng'}</Text>
      {messages.length > 0 ? (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())} // Xử lý khi id không tồn tại
          renderItem={renderMessage}
        />
      ) : (
        <Text>Không có tin nhắn để hiển thị.</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Nhập tin nhắn..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#004581',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    maxWidth: '75%',
  },
  sender: {
    backgroundColor: '#d1f0d1',
    alignSelf: 'flex-end',
  },
  receiver: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  messageContent: {
    fontSize: 16,
  },
  messageDate: {
    fontSize: 12,
    color: 'gray',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DetailsScreen;
