import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  CheckCircleIcon,
  HeartFilledIcon,
  CopyClipboardIcon,
  AlertCircleIcon,
  ShareIcon,
} from '../../assets/icons/Icons';

export type ToastType = 'success' | 'favorite' | 'copy' | 'share' | 'error' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide?: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  onHide,
  duration = 2600,
}) => {
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

  const renderIcon = () => {
    switch (type) {
      case 'favorite':
        return <HeartFilledIcon size={18} color="#F43F5E" />;
      case 'copy':
        return <CopyClipboardIcon size={18} color="#38BDF8" />;
      case 'share':
        return <ShareIcon size={18} color="#60A5FA" />;
      case 'error':
        return <AlertCircleIcon size={18} color="#EF4444" />;
      case 'success':
      default:
        return <CheckCircleIcon size={18} color="#34D399" />;
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
        activeOpacity={0.9}
        onPress={hideToast}
        className="flex-row items-center bg-slate-900 px-4 py-3 rounded-xl border border-slate-700 max-w-[96%] shadow-2xl"
      >
        <View className="mr-3">{renderIcon()}</View>
        <Text className="text-slate-50 text-xs font-bold leading-relaxed flex-shrink" numberOfLines={2}>
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

