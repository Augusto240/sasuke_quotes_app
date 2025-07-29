import Toast from 'react-native-toast-message';

export function showToast(msg: string, type: 'success' | 'info' | 'error' = 'info') {
  Toast.show({ type, text1: msg });
}