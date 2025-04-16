import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Image, StyleSheet, ScrollView } from "react-native";
import { Camera } from "expo-camera";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig"; // Đảm bảo bạn đã cấu hình Firebase

const CaptureScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [images, setImages] = useState([]); // Lưu danh sách ảnh đã chụp
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert("Lỗi", "Không thể mở camera!");
      return;
    }

    if (images.length < 5) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        setImages([...images, photo.uri]);
      } catch (error) {
        Alert.alert("Lỗi", "Chụp ảnh thất bại. Vui lòng thử lại!");
      }
    } else {
      Alert.alert("Thông báo", "Bạn đã chụp đủ 5 tấm ảnh!");
    }
  };

  const uploadImages = async () => {
    if (images.length === 0) {
      Alert.alert("Lỗi", "Bạn chưa chụp ảnh nào để tải lên!");
      return;
    }

    try {
      const urls = [];
      for (let i = 0; i < images.length; i++) {
        const response = await fetch(images[i]);
        const arrayBuffer = await response.arrayBuffer(); // Sử dụng arrayBuffer thay vì blob
        const storageRef = ref(storage, `faces/image_${Date.now()}_${i}.jpg`);
        await uploadBytes(storageRef, new Uint8Array(arrayBuffer)); // Chuyển đổi thành Uint8Array
        const downloadURL = await getDownloadURL(storageRef);
        urls.push(downloadURL);
      }

      Alert.alert("Tải lên thành công!", `Đường dẫn ảnh:\n${urls.join("\n")}`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải ảnh lên Firebase. Hãy thử lại!");
    }
  };

  if (hasPermission === null) {
    return <Text>Đang yêu cầu quyền truy cập...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Bạn chưa cấp quyền truy cập camera!</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.camera} />
      <View style={styles.controls}>
        <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
          <Text style={styles.buttonText}>📸 Chụp ảnh ({images.length}/5)</Text>
        </TouchableOpacity>
        {images.length === 5 && (
          <TouchableOpacity onPress={uploadImages} style={styles.uploadButton}>
            <Text style={styles.buttonText}>🚀 Tải ảnh lên Firebase</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView horizontal style={styles.imagePreview}>
        {images.map((img, index) => (
          <Image key={index} source={{ uri: img }} style={styles.previewImage} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 10,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  imagePreview: {
    position: "absolute",
    bottom: 100,
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  previewImage: {
    width: 60,
    height: 60,
    marginRight: 5,
    borderRadius: 5,
  },
});

export default CaptureScreen;
