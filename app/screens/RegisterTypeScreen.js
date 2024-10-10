import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const RegisterTypeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn loại tài khoản:</Text>
      <Button title="Tài khoản Người dùng" onPress={() => navigation.navigate('UserRegistration', { accountType: 'user' })} />
      <Button title="Tài khoản Thợ" onPress={() => navigation.navigate('TechnicianRegistration')} />
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
});

export default RegisterTypeScreen;
