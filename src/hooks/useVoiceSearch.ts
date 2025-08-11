import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Speech from 'expo-speech';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import i18n from '../i18n';

export function useVoiceSearch() {
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setHasPermission(false);
    }
  };

  const startListening = async (): Promise<string> => {
    if (!hasPermission) {
      Alert.alert(i18n.t('common.error'), i18n.t('voice.noPermission'));
      return '';
    }

    setIsListening(true);
    setTranscript('');

    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          setIsListening(false);
          const mockTranscript = 'vingança'; // Exemplo
          setTranscript(mockTranscript);
          resolve(mockTranscript);
        }, 2000);
      });
    } catch (error) {
      console.error('Voice recognition error:', error);
      setIsListening(false);
      Alert.alert(i18n.t('common.error'), i18n.t('voice.error'));
      return '';
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return {
    isListening,
    hasPermission,
    transcript,
    startListening,
    stopListening,
    requestPermissions,
  };
}