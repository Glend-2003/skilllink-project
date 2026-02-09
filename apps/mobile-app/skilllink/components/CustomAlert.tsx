import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomAlertProps {
  visible: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export default function CustomAlert({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  showCancel = false,
}: CustomAlertProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-20)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(-20);
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle color="#059669" size={24} strokeWidth={2.5} />;
      case 'error':
        return <XCircle color="#dc2626" size={24} strokeWidth={2.5} />;
      case 'warning':
        return <AlertCircle color="#d97706" size={24} strokeWidth={2.5} />;
      case 'info':
      default:
        return <Info color="#2563eb" size={24} strokeWidth={2.5} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#059669';
      case 'error':
        return '#dc2626';
      case 'warning':
        return '#d97706';
      case 'info':
      default:
        return '#2563eb';
    }
  };

  const handleConfirm = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onConfirm();
    });
  };

  const handleCancel = () => {
    if (onCancel) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onCancel();
      });
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={showCancel ? handleCancel : handleConfirm}
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.overlay, 
          { 
            opacity: fadeAnim,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }
        ]}
      >
        <Animated.View
          style={[
            styles.alertContainer,
            { borderLeftColor: getBorderColor() },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.iconWrapper}>
              {getIcon()}
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {showCancel && onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                !showCancel && styles.fullWidthButton,
              ]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  alertContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  iconWrapper: {
    marginTop: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#111827',
  },
  fullWidthButton: {
    flex: 1,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
