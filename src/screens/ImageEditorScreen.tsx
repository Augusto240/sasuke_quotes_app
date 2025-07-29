import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator, Image, Alert, TouchableOpacity, PanResponder, Animated } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import Toast from 'react-native-toast-message';
import { getRandomQuote } from '../api/sasukeApi';
import { Quote } from '../models/Quote';
import { Ionicons } from '@expo/vector-icons';

const overlays = [
  { name: 'Sharingan', img: require('../../assets/sharingan.png') },
  { name: 'Rinnegan', img: require('../../assets/rinnegan.png') },
  { name: 'Uchiha', img: require('../../assets/images/uchiwa.png') },
];

export default function ImageEditorScreen({ route, navigation }: any) {
  const { imageUri } = route.params;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [selectedOverlay, setSelectedOverlay] = useState(overlays[0].img);

  const pan = useRef(new Animated.ValueXY()).current;
  const [mediaPermission] = MediaLibrary.usePermissions();
  const viewShotRef = useRef<ViewShot>(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => { pan.extractOffset(); },
    })
  ).current;

  const fetchNewQuote = async () => {
    setQuote(null);
    setQuote(await getRandomQuote());
  };

  useEffect(() => { fetchNewQuote(); }, []);

  const captureView = async (): Promise<string | undefined> => viewShotRef.current?.capture?.();

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
      Toast.show({ type: 'success', text1: 'Salvo na galeria!' });
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.95 }} style={styles.viewShot}>
        <ImageBackground source={{ uri: imageUri }} style={styles.image}>
          <Animated.View style={[styles.overlayContainer, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]} {...panResponder.panHandlers}>
            <Image source={selectedOverlay} style={styles.overlayImg} />
          </Animated.View>
          <View style={styles.fraseBg}>
            {quote ? (
              <Text style={[styles.quoteText, { color: textColor }]}>"{quote.quote}"</Text>
            ) : (
              <ActivityIndicator color="#fff" />
            )}
          </View>
        </ImageBackground>
      </ViewShot>
      <View style={styles.stickerBar}>
        {overlays.map(o => (
          <TouchableOpacity key={o.name} onPress={() => setSelectedOverlay(o.img)} style={[styles.stickerBtn, selectedOverlay === o.img && styles.stickerBtnActive]}>
            <Image source={o.img} style={{ width: 32, height: 32, opacity: selectedOverlay === o.img ? 1 : 0.6 }} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.controlsBar}>
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
  container: { flex: 1, backgroundColor: '#191c26' },
  viewShot: { flex: 1 },
  image: { flex: 1, resizeMode: 'cover', justifyContent: 'flex-end', borderRadius: 24 },
  overlayContainer: { position: 'absolute', top: 60, right: 30 },
  overlayImg: { width: 70, height: 70, opacity: 0.93 },
  fraseBg: { backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 16, margin: 16, padding: 20, justifyContent: 'center', minHeight: 70 },
  quoteText: { fontSize: 20, textAlign: 'center', fontStyle: 'italic', textShadowColor: '#000', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  stickerBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: '#131936', padding: 10 },
  stickerBtn: { padding: 6, borderRadius: 8 },
  stickerBtnActive: { backgroundColor: '#e31b3a33' },
  controlsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#131936' },
  colorPalette: { flexDirection: 'row', alignItems: 'center' },
  colorButton: { width: 30, height: 30, borderRadius: 15, marginHorizontal: 5, borderWidth: 2, borderColor: '#fff' },
  controlButton: { padding: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 20, backgroundColor: '#131936', borderTopWidth: 1, borderTopColor: '#252f69' },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e31b3a', paddingVertical: 11, paddingHorizontal: 18, borderRadius: 30 },
  btnText: { color: 'white', marginLeft: 8, fontWeight: 'bold', fontSize: 15 },
});