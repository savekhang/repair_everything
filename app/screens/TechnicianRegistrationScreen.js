import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_URL } from '../../env';

const TechnicianRegistrationScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/name_technician`);
        setCategories(response.data);
      } catch (error) {
        Alert.alert('Lỗi', error.response?.data || error.message);
      }
    };
    fetchCategories();
  }, []);

  const handleTechnicianRegistration = async () => {
    if (!username || !email || !password || !phone || !specialty) {
      Alert.alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }
  
    try {
      const response = await axios.post(`${API_URL}/technician_register`, {
        username,
        email,
        password,
        phone,
        account_type: 'technician',
        technician_category_name: specialty,
      });
  
      console.log(response.status); // Kiểm tra phản hồi từ server
  
      if (response.status === 200) {
        Alert.alert('Đăng ký thành công!', 'Bạn đã đăng ký tài khoản thợ.');
        navigation.navigate('Capture'); // Điều hướng sau khi đăng ký thành công
      } else {
        Alert.alert('Đăng ký thất bại', response.data.message || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Đăng ký thất bại', error.response?.data || error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký Tài khoản Thợ</Text>
      <TextInput placeholder="Tên đăng nhập" value={username} onChangeText={setUsername} style={styles.input} placeholderTextColor="#DDE8F0" />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} placeholderTextColor="#DDE8F0" />
      <TextInput placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholderTextColor="#DDE8F0" />
      <TextInput placeholder="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} placeholderTextColor="#DDE8F0" />

      {/* Picker với màu nền và màu chữ cải thiện */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={specialty}
          onValueChange={(itemValue) => setSpecialty(itemValue)}
          style={styles.picker}
          dropdownIconColor="#DDE8F0" // Màu icon dropdown
        >
          <Picker.Item label="Chọn nghiệp vụ:" value={null} color="#000000" />
          {categories.map((category) => (
          <Picker.Item key={category.id} label={category.name} value={category.name} color="#000000" />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleTechnicianRegistration}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#004581',
  },
  title: {
    fontSize: 24,
    color: '#8CC7DC',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#8CC7DC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#DDE8F0',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#8CC7DC',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#004581', // Nền giống các input khác
  },
  picker: {
    color: '#000000', // Màu chữ trong Picker
  },
  button: {
    backgroundColor: '#004581',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#018ABD',
  },
  buttonText: {
    color: '#018ABD',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TechnicianRegistrationScreen;