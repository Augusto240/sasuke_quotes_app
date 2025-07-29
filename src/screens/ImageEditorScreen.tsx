import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator, Image, Alert, TouchableOpacity } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { getRandomQuote } from '../api/sasukeApi';
import { Quote } from '../models/Quote';
import { Ionicons } from '@expo/vector-icons';

const sharinganImage = require('../../assets/sharingan.png');

export default function ImageEditorScreen({ route, navigation }: any) {
  const { imageUri } = route.params;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [mediaPermission] = MediaLibrary.usePermissions();
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    getRandomQuote().then(setQuote);
  }, []);

  const captureView = async (): Promise<string | undefined> => {
    if (viewShotRef.current) {
      const uri = await viewShotRef.current.capture?.();
      return uri;
    }
  };

  const onShare = async () => {
    const uri = await captureView();
    if (uri && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Partilha não disponível neste dispositivo.');
    }
  };

  const onSave = async () => {
    if (!mediaPermission?.granted) {
      Alert.alert('Permissão da galeria negada.');
      return;
    }
    const uri = await captureView();
    if (uri) {
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Salvo!', 'A sua imagem foi salva na galeria.');
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={styles.viewShot}>
        <ImageBackground source={{ uri: imageUri }} style={styles.image}>
          <View style={styles.overlay}>
            {quote ? (
              <Text style={styles.quoteText}>"{quote.quote}"</Text>
            ) : (
              <ActivityIndicator color="#fff" />
            )}
          </View>
          <Image source={sharinganImage} style={styles.sharingan} />
        </ImageBackground>
      </ViewShot>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.btn} onPress={onSave}>
          <Ionicons name="save-outline" size={20} color="white" />
          <Text style={styles.btnText}>Salvar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={onShare}>
          <Ionicons name="share-social-outline" size={20} color="white" />
          <Text style={styles.btnText}>Partilhar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Ionicons name="camera-outline" size={20} color="white" />
          <Text style={styles.btnText}>Nova Foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191c26' },
  viewShot: { flex: 1 },
  image: { flex: 1, resizeMode: 'cover', justifyContent: 'flex-end' },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: 20, justifyContent: 'center', minHeight: '25%' },
  quoteText: { color: 'white', fontSize: 20, textAlign: 'center', fontStyle: 'italic' },
  sharingan: { position: 'absolute', top: 40, right: 20, width: 60, height: 60, opacity: 0.8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 20, backgroundColor: '#131936' },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e31b3a', paddingVertical: 11, paddingHorizontal: 18, borderRadius: 30 },
  btnText: { color: 'white', marginLeft: 8, fontWeight: 'bold', fontSize: 15 },
});