import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator, Image, Alert, TouchableOpacity } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import Toast from 'react-native-toast-message';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { getRandomQuote } from '../api/sasukeApi';
import { Quote } from '../models/Quote';
import { Ionicons } from '@expo/vector-icons';

const stickers = {
  sharingan: require('../../assets/images/sharingan.png'),
  rinnegan: require('../../assets/images/rinnegan.png'),
  uchiha: require('../../assets/images/uchiha.png'),
};

export default function ImageEditorScreen({ route, navigation }: any) {
  const { imageUri } = route.params;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [activeSticker, setActiveSticker] = useState<keyof typeof stickers>('sharingan');
  
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);
  const position = useSharedValue({ x: 0, y: 0 });
  const savedPosition = useSharedValue({ x: 0, y: 0 });
  
  const [mediaPermission] = MediaLibrary.usePermissions();
  const viewShotRef = useRef<ViewShot>(null);

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      position.value = {
        x: e.translationX + savedPosition.value.x,
        y: e.translationY + savedPosition.value.y,
      };
    })
    .onEnd(() => {
      savedPosition.value = { x: position.value.x, y: position.value.y };
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotateGesture = Gesture.Rotation()
    .onUpdate((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const composedGesture = Gesture.Simultaneous(dragGesture, pinchGesture, rotateGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: position.value.x },
      { translateY: position.value.y },
      { scale: scale.value },
      { rotateZ: `${(rotation.value / Math.PI) * 180}deg` },
    ],
  }));

  const fetchNewQuote = async () => {
    setQuote(null);
    setQuote(await getRandomQuote());
  };

  useEffect(() => { fetchNewQuote(); }, []);

  const onShare = async () => {
    const uri = await viewShotRef.current?.capture?.();
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
    const uri = await viewShotRef.current?.capture?.();
    if (uri) {
      await MediaLibrary.saveToLibraryAsync(uri);
      Toast.show({ type: 'success', text1: 'Salvo na galeria!' });
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.95 }} style={styles.viewShot}>
        <ImageBackground source={{ uri: imageUri }} style={styles.image}>
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.stickerContainer, animatedStyle]}>
              <Image source={stickers[activeSticker]} style={styles.sticker} />
            </Animated.View>
          </GestureDetector>
          <View style={styles.quoteOverlay}>
            {quote ? (
              <Text style={[styles.quoteText, { color: textColor }]}>"{quote.quote}"</Text>
            ) : (
              <ActivityIndicator color="#fff" />
            )}
          </View>
        </ImageBackground>
      </ViewShot>

      <View style={styles.controlsContainer}>
        <View style={styles.stickerSelector}>
          {Object.keys(stickers).map((key) => (
            <TouchableOpacity key={key} onPress={() => setActiveSticker(key as keyof typeof stickers)}>
              <Image source={stickers[key as keyof typeof stickers]} style={[styles.stickerPreview, activeSticker === key && styles.activeSticker]} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.colorPalette}>
          <TouchableOpacity style={[styles.colorButton, { backgroundColor: '#FFFFFF' }]} onPress={() => setTextColor('#FFFFFF')} />
          <TouchableOpacity style={[styles.colorButton, { backgroundColor: '#e31b3a' }]} onPress={() => setTextColor('#e31b3a')} />
          <TouchableOpacity style={[styles.colorButton, { backgroundColor: '#6b3e9e' }]} onPress={() => setTextColor('#6b3e9e')} />
        </View>
        <TouchableOpacity style={styles.controlButton} onPress={fetchNewQuote}>
          <Ionicons name="refresh" size={24} color="white" />
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
  container: { flex: 1, backgroundColor: '#101010' },
  viewShot: { flex: 1 },
  image: { flex: 1, resizeMode: 'cover' },
  stickerContainer: { position: 'absolute', top: '25%', left: '40%' },
  sticker: { width: 80, height: 80 },
  quoteOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: 20, justifyContent: 'center', minHeight: '25%' },
  quoteText: { fontFamily: 'Uchiha', fontSize: 24, textAlign: 'center', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#181818' },
  stickerSelector: { flexDirection: 'row', gap: 10 },
  stickerPreview: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  activeSticker: { borderColor: '#e31b3a' },
  colorPalette: { flexDirection: 'row', alignItems: 'center' },
  colorButton: { width: 30, height: 30, borderRadius: 15, marginHorizontal: 5, borderWidth: 2, borderColor: '#fff' },
  controlButton: { padding: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 20, backgroundColor: '#181818', borderTopWidth: 1, borderTopColor: '#27272a' },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e31b3a', paddingVertical: 11, paddingHorizontal: 18, borderRadius: 30 },
  btnText: { color: 'white', marginLeft: 8, fontWeight: 'bold', fontSize: 15 },
});