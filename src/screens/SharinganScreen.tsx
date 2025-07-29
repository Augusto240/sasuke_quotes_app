import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SharinganScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        navigation.navigate('Editor', { imageUri: photo.uri });
      }
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>A permissão da câmara é necessária para usar a Visão do Sharingan.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <Ionicons name="ellipse-outline" size={80} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191c26' },
  permissionContainer: { flex: 1, backgroundColor: '#191c26', justifyContent: 'center', alignItems: 'center', padding: 20 },
  camera: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  captureButton: {
    alignItems: 'center',
  },
  permissionText: { color: '#fff', textAlign: 'center', marginBottom: 20, fontSize: 16 },
  permissionButton: { alignItems: 'center', backgroundColor: '#e31b3a', paddingVertical: 11, paddingHorizontal: 18, borderRadius: 30 },
  permissionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});