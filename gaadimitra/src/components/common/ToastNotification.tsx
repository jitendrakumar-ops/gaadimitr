import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  HeartFilledIcon,
  CopyClipboardIcon,
  ShareIcon,
} from '../../assets/icons/Icons';
import { useTheme } from '../../theme';

export type ToastType = 'success' | 'favorite' | 'copy' | 'share' | 'error' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  title?: string;
  type?: ToastType;
  onHide?: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastProps> = ({
  visible,
  message,
  title,
  type = 'success',
  onHide,
  duration = 2600,
}) => {
  const { colors, isDark } = useTheme();
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return '#EF4444'; // Vibrant Red Alert
      case 'info':
      case 'copy':
      case 'share':
        return '#3B82F6'; // Vibrant Blue Alert
      case 'favorite':
        return '#F43F5E'; // Vibrant Rose Alert
      case 'success':
      default:
        return '#22C55E'; // Vibrant Green Alert
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'error':
        return (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="2.2" />
            <Path d="M12 7V13" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
            <Circle cx="12" cy="17" r="1.2" fill="#FFFFFF" />
          </Svg>
        );
      case 'info':
        return (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="2.2" />
            <Path d="M12 17V11" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
            <Circle cx="12" cy="7.5" r="1.2" fill="#FFFFFF" />
          </Svg>
        );
      case 'copy':
        return <CopyClipboardIcon size={20} color="#FFFFFF" />;
      case 'share':
        return <ShareIcon size={20} color="#FFFFFF" />;
      case 'favorite':
        return <HeartFilledIcon size={20} color="#FFFFFF" />;
      case 'success':
      default:
        return (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 6L9 17L4 12"
              stroke="#FFFFFF"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
    }
  };

  return (
    <Animated.View
      className="absolute top-14 left-5 right-5 z-[9999] items-center"
      style={{
        transform: [{ translateY }],
        opacity,
      }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={hideToast}
        className={`flex-row ${title ? 'items-start' : 'items-center'} px-4 py-3.5 rounded-2xl w-full`}
        style={{
          backgroundColor: getBackgroundColor(),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <View className={`mr-3 ${title ? 'mt-0.5' : ''} items-center justify-center`}>
          {renderIcon()}
        </View>

        <View className="flex-1 justify-center mr-2">
          {title ? (
            <Text className="text-white text-sm font-bold tracking-tight mb-0.5">
              {title}
            </Text>
          ) : null}
          <Text
            className={`text-white ${title ? 'text-xs font-medium text-white/95' : 'text-sm font-semibold'} leading-relaxed`}
            numberOfLines={3}
          >
            {message}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={hideToast}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className={`p-1 items-center justify-center ${title ? 'mt-0.5' : ''}`}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 6L6 18M6 6L18 18"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

type ToastListener = (toast: {
  visible: boolean;
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
}) => void;

let globalToastListener: ToastListener | null = null;

export const toast = {
  show: (options: { message: string; title?: string; type?: ToastType; duration?: number }) => {
    if (globalToastListener) {
      globalToastListener({
        visible: true,
        message: options.message,
        title: options.title,
        type: options.type || 'info',
        duration: options.duration || 2800,
      });
    }
  },
  showSuccess: (message: string, title?: string, duration?: number) => {
    toast.show({ message, title, type: 'success', duration });
  },
  showError: (message: string, title?: string, duration?: number) => {
    toast.show({ message, title, type: 'error', duration });
  },
  showInfo: (message: string, title?: string, duration?: number) => {
    toast.show({ message, title, type: 'info', duration });
  },
  hide: () => {
    if (globalToastListener) {
      globalToastListener({ visible: false, message: '' });
    }
  },
};

export const GlobalToastContainer: React.FC = () => {
  const [toastState, setToastState] = React.useState<{
    visible: boolean;
    message: string;
    title?: string;
    type?: ToastType;
    duration?: number;
  }>({
    visible: false,
    message: '',
    title: '',
    type: 'success',
  });

  React.useEffect(() => {
    globalToastListener = (state) => {
      setToastState(state);
    };
    return () => {
      globalToastListener = null;
    };
  }, []);

  return (
    <ToastNotification
      visible={toastState.visible}
      message={toastState.message}
      title={toastState.title}
      type={toastState.type}
      duration={toastState.duration}
      onHide={() => setToastState((prev) => ({ ...prev, visible: false }))}
    />
  );
};
