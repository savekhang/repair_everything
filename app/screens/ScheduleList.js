import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // <- thêm useFocusEffect
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env';

export default function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  // Lấy lịch trình của người dùng từ API
  const fetchSchedules = async () => {
    try {
      if (userId) {
        const response = await axios.get(`${API_URL}/user_schedules/${userId}`);
        setSchedules(response.data.schedules);
      } else {
        console.error('userId is not available');
      }
    } catch (error) {
      console.error('Lỗi fetch schedules:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Lấy userId từ AsyncStorage
  const getUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId !== null) {
        setUserId(storedUserId);
      }
    } catch (error) {
      console.error('Lỗi lấy userId từ AsyncStorage:', error);
    }
  };

  // Gọi getUserId khi component mount
  useEffect(() => {
    getUserId();
  }, []);

  // Gọi lại fetchSchedules mỗi khi quay lại màn hình này
  useFocusEffect(
    useCallback(() => {
      if (userId !== null) {
        setLoading(true); // bật loading khi vào lại
        fetchSchedules(); // gọi API
      }
    }, [userId]) // khi userId thay đổi, gọi lại fetchSchedules
  );

  // Hàm sort lịch
  const sortSchedules = () => {
    const sorted = [...schedules].sort((a, b) => {
      const dateA = new Date(`${a.schedule_date}T${a.start_time}`);
      const dateB = new Date(`${b.schedule_date}T${b.start_time}`);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
    setSchedules(sorted);  // Cập nhật lịch trình sau khi sắp xếp
    setSortAsc(!sortAsc);  // Thay đổi trạng thái sắp xếp
  };

  // Hàm format ngày dd/mm/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString); // Tạo đối tượng Date từ chuỗi ngày
    return date.toLocaleDateString('en-GB'); // Định dạng theo dd/mm/yyyy
  };

  // Hàm format giờ hh:mm
  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(':');
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // Định dạng giờ hh:mm
  };

  const renderSchedule = ({ item }) => (
    <View style={styles.scheduleItem}>
      <Text style={styles.date}>
        {formatDate(item.schedule_date)} - {formatTime(item.start_time)}
      </Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#004581" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={sortSchedules}>
          <MaterialIcons
            name={sortAsc ? 'arrow-upward' : 'arrow-downward'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('AddSchedule')}>
          <Ionicons name="add-circle-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {schedules.length === 0 ? (
        <View style={styles.center}>
          <Text>Chưa có lịch nào</Text>
        </View>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSchedule}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#004581' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  scheduleItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  date: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  description: { marginTop: 4, color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
