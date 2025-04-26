import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const services = [
    { title: 'Bài viết', icon: <FontAwesome name="pencil-square-o" size={40} color="#004581" />, screen: 'Interface' },
    { title: 'Lên lịch', icon: <MaterialIcons name="event-note" size={40} color="#004581" />, screen: 'ScheduleList' }, // thêm screen ở đây
    { title: 'Tin tức', icon: <Ionicons name="newspaper-outline" size={40} color="#004581" /> },
    { title: 'Tổng đài', icon: <AntDesign name="customerservice" size={40} color="#004581" /> },
  ];

export default function ServiceScreen() {
  const navigation = useNavigation();  // Hook navigation

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle-outline" size={32} color="#31A9D4" />
        </TouchableOpacity>
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Messages')}>
            <Ionicons name="chatbubbles-outline" size={32} color="#31A9D4" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>Tất cả dịch vụ</Text>

      <View style={styles.wrapper}>
        <View style={styles.grid}>
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() => navigation.navigate(service.screen ? service.screen : '')} 
            >
              {service.icon}
              <Text style={styles.itemText}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginHorizontal: 10,
  },
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#004581',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 20,
    marginTop: 30,
    color: '#31A9D4'
  },
  wrapper: {
    marginHorizontal: 20,
    padding: 10,
    borderWidth: 0,
    borderColor: '#4CAF50',
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    width: 70,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    marginTop: 5,
  },
});
