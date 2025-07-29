import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator, Image, Alert, TouchableOpacity, PanResponder, Animated } from 'react-native';
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
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [sharinganPosition, setSharinganPosition] = useState({ x: 0, y: 0 });
  
  const [mediaPermission] = MediaLibrary.usePermissions();
  const viewShotRef = useRef<ViewShot>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        setSharinganPosition({ x: gesture.dx, y: gesture.dy });
      },
    })
  ).current;

  const fetchNewQuote = async () => {
    setQuote(null);
    const newQuote = await getRandomQuote();
    setQuote(newQuote);
  };

  useEffect(() => {
    fetchNewQuote();
  }, []);

  const captureView = async (): Promise<string | undefined> => {
    return viewShotRef.current?.capture?.();
  };

  const onShare = async () => {
    const uri = await captureView();
    if (uri && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Partilha não disponível.');
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
          <Animated.View style={[styles.sharinganContainer, { transform: [{ translateX: sharinganPosition.x }, { translateY: sharinganPosition.y }] }]} {...panResponder.panHandlers}>
            <Image source={sharinganImage} style={styles.sharingan} />
          </Animated.View>
          <View style={styles.overlay}>
            {quote ? (
              <Text style={[styles.quoteText, { color: textColor }]}>"{quote.quote}"</Text>
            ) : (
              <ActivityIndicator color="#fff" />
            )}
          </View>
        </ImageBackground>
      </ViewShot>

      <View style={styles.controlsContainer}>
        <View style={styles.colorPalette}>
          <TouchableOpacity style={[styles.colorButton, { backgroundColor: '#FFFFFF' }]} onPress={() => setTextColor('#FFFFFF')} />
          <TouchableOpacity style={[styles.colorButton, { backgroundColor: '#e31b3a' }]} onPress={() => setTextColor('#e31b3a')} />
          <TouchableOpacity style={[styles.colorButton, { backgroundColor: '#FFD700' }]} onPress={() => setTextColor('#FFD700')} />
        </View>
        <TouchableOpacity style={styles.controlButton} onPress={fetchNewQuote}>
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
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
  quoteText: { fontSize: 20, textAlign: 'center', fontStyle: 'italic', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  sharinganContainer: { position: 'absolute', top: 40, right: 20 },
  sharingan: { width: 60, height: 60, opacity: 0.8 },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#131936' },
  colorPalette: { flexDirection: 'row', alignItems: 'center' },
  colorButton: { width: 30, height: 30, borderRadius: 15, marginHorizontal: 5, borderWidth: 2, borderColor: '#fff' },
  controlButton: { padding: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 20, backgroundColor: '#131936', borderTopWidth: 1, borderTopColor: '#252f69' },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e31b3a', paddingVertical: 11, paddingHorizontal: 18, borderRadius: 30 },
  btnText: { color: 'white', marginLeft: 8, fontWeight: 'bold', fontSize: 15 },
});