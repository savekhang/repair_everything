import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Picker } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../env'; // Nhập biến môi trường từ file env.js

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
        const response = await axios.get(`${API_URL}/technician-categories`);
        setCategories(response.data);
      } catch (error) {
        Alert.alert('Lỗi', error.response?.data || error.message);
      }
    };
    fetchCategories();
  }, []);

  const handleTechnicianRegistration = async () => {
    if (!username || !email || !password || !phone || !specialty) {
      Alert.alert('Vui lòng điền đầy đủ thông tin và chọn chuyên ngành.');
      return;
    }

    try {
      const response = await axios.post('http:// 192.168.110.133:3000/register', {
        username,
        email,
        password,
        phone,
        account_type: 'technician',
      });

      if (response.status === 200) {
        const userId = response.data.user_id;
        await axios.post('http:// 192.168.110.133:3000/user-technician-categories', {
          user_id: userId,
          technician_category_id: specialty,
        });

        Alert.alert('Đăng ký tài khoản thành công!', 'Bạn đã đăng ký tài khoản thợ.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Đăng ký thất bại', response.data.message || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      Alert.alert('Đăng ký thất bại', error.response?.data || error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký Tài khoản Thợ</Text>
      <TextInput placeholder="Tên đăng nhập" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
      <TextInput placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TextInput placeholder="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
      <Text>Chuyên ngành:</Text>
      <Picker selectedValue={specialty} onValueChange={(itemValue) => setSpecialty(itemValue)} style={styles.input}>
        <Picker.Item label="Chọn chuyên ngành" value={null} />
        {categories.map((category) => (
          <Picker.Item key={category.id} label={category.name} value={category.id} />
        ))}
      </Picker>
      <Button title="Đăng ký" onPress={handleTechnicianRegistration} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default TechnicianRegistrationScreen;
