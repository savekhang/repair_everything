// CameraPermission.js
import { Camera } from "expo-camera";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const requestCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Quyền truy cập", "Bạn cần cấp quyền truy cập Camera!");
  }
};

export { requestCameraPermission };
