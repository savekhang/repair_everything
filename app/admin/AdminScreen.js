import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AdminScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Quan ly bai viet</Text>
      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ManagePost')}>
        <Ionicons name="chatbubbles-outline" size={32} color="#31A9D4" />
      </TouchableOpacity>
      <Text>Quan ly tai khoan</Text>
      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ManageAccount')}>
        <Ionicons name="person-outline" size={32} color="#31A9D4" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconButton: { margin: 20 },
});

export default AdminScreen;
