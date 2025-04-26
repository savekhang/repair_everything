import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '../../env'; // nếu bạn tách env.js ra như trước

// ✅ Hàm format date đúng local
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0'); // tháng từ 0-11
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ Hàm format time
const formatTime = (date) => {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}:00`;
};

export default function AddSchedule() {
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(parseInt(id));
        }
      } catch (error) {
        console.error('Không lấy được user_id:', error);
      }
    };
    fetchUserId();
  }, []);

  const handleCreateSchedule = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy tài khoản người dùng.');
      return;
    }

    try {
      const formattedDate = formatDate(scheduleDate); // dùng hàm tự định dạng
      const formattedTime = formatTime(startTime);

      await axios.post(`${API_URL}/create_schedule`, {
        user_id: userId,
        schedule_date: formattedDate,
        start_time: formattedTime,
        description: description
      });

      Alert.alert('Thành công', 'Đã tạo lịch thành công!');
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi tạo lịch:', error);
      Alert.alert('Thất bại', 'Tạo lịch thất bại, kiểm tra lại dữ liệu.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Chọn ngày */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={styles.inputText}>{formatDate(scheduleDate)}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={scheduleDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setScheduleDate(selectedDate);
          }}
        />
      )}

      {/* Chọn giờ */}
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
        <Text style={styles.inputText}>{`${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`}</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) setStartTime(selectedTime);
          }}
        />
      )}

      {/* Mô tả công việc */}
      <TextInput
        placeholder="Mô tả công việc"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      {/* Nút tạo lịch */}
      <TouchableOpacity style={styles.button} onPress={handleCreateSchedule}>
        <Text style={styles.buttonText}>Tạo lịch</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#004581' },
  input: { 
    borderWidth: 1, 
    borderColor: '#fff', 
    padding: 14, 
    marginBottom: 16, 
    borderRadius: 8, 
    justifyContent: 'center', 
    backgroundColor: '#004581',  // Đặt nền của input là trắng
  },
  inputText: { 
    color: '#fff', // Màu chữ của các input là đen để dễ nhìn
    fontSize: 16 
  },
  button: { backgroundColor: '#004581', padding: 16, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});
