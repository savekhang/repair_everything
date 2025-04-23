import React, { useState, useEffect, useRef } from 'react';
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
  Keyboard,
  Alert,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const DetailsScreen = ({ route }) => {
  const { receiverId, receiverUsername } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState('');

  const flatListRef = useRef();

  useEffect(() => {
    fetchMessages();
    fetchAccountType();
  }, []);

  useEffect(() => {
    // Scroll xuống cuối khi có tin nhắn mới
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

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
    setAccountType(storedAccountType?.trim() || '');
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

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error.message);
    }
  };

  const handleSendLocation = () => {
    Alert.alert(
      'Gửi vị trí',
      'Bạn có muốn gửi vị trí hiện tại của bạn?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => sendLocation(),
        },
      ],
      { cancelable: true }
    );
  };

  const sendLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Bạn cần cho phép truy cập vị trí để sử dụng tính năng này!');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const locationMessage = `Vị trí của tôi: https://www.google.com/maps?q=${latitude},${longitude}`;

      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Thiếu token!');

      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ receiver_id: receiverId, content: locationMessage }),
      });

      fetchMessages();
    } catch (error) {
      console.error('Lỗi gửi định vị:', error.message);
      alert('Không thể gửi vị trí.');
    }
  };

  const renderItem = ({ item }) => {
    const isReceiver = item.sender_id === receiverId;
    const linkRegex = /(https?:\/\/[^\s]+)/g;

    const formattedMessage = item.content.split(linkRegex).map((part, index) => {
      if (linkRegex.test(part)) {
        return (
          <Text
            key={index}
            style={{ color: '#1e90ff', textDecorationLine: 'underline' }}
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });

    return (
      <View style={isReceiver ? styles.receiver : styles.sender}>
        <Text style={isReceiver ? {} : { color: 'white' }}>{formattedMessage}</Text>
        <Text style={[styles.time, isReceiver ? styles.timeReceiver : styles.timeSender]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {!isReceiver && item.seen && (
          <Text style={styles.seenText}>Đã xem</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.header}>{receiverUsername}</Text>

          {loading ? (
            <Text>Đang tải...</Text>
          ) : error ? (
            <Text>{error}</Text>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 10 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              onContentSizeChange={() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }}
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
            <TouchableOpacity onPress={handleSendLocation} style={styles.locationButton}>
              <Ionicons name="location-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text style={{ color: 'white' }}>Gửi</Text>
            </TouchableOpacity>
          </View>

          {accountType === 'technician' && (
            <TouchableOpacity
              style={styles.quoteButton}
              onPress={() => alert('Chức năng báo giá đang phát triển')}
            >
              <Text style={styles.quoteButtonText}>Báo giá</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#004581' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#BEDEDF' },
  receiver: {
    alignSelf: 'flex-start',
    backgroundColor: '#BEDEDF',
    padding: 12,
    marginVertical: 4,
    borderRadius: 20,
    maxWidth: '80%',
  },
  sender: {
    alignSelf: 'flex-end',
    backgroundColor: '#255EA8',
    padding: 12,
    marginVertical: 4,
    borderRadius: 20,
    maxWidth: '80%',
  },
  time: {
    fontSize: 10,
    marginTop: 4,
  },
  timeSender: {
    color: '#e0e0e0',
    textAlign: 'right',
  },
  timeReceiver: {
    color: '#555',
    textAlign: 'left',
  },
  seenText: {
    fontSize: 10,
    color: '#b0e0e6',
    marginTop: 2,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  sendButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#1a73e8',
    borderRadius: 20,
    marginLeft: 8,
  },
  quoteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ff9800',
    alignItems: 'center',
    borderRadius: 20,
  },
  quoteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  locationButton: {
    padding: 12,
    backgroundColor: '#1a73e8',
    borderRadius: 20,
    marginLeft: 0,
  },
});

export default DetailsScreen;
