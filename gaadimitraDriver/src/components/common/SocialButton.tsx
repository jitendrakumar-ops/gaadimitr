import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Platform,
  TouchableOpacityProps,
} from 'react-native';
import { GoogleIcon, AppleIcon } from '../../assets/icons/Icons';

export interface SocialButtonProps extends TouchableOpacityProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  disabled?: boolean;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  disabled = false,
  className = '',
  ...rest
}) => {
  // If Apple provider on Android, we can either hide or show optionally. Requirement: "Continue with Apple button on iOS"
  if (provider === 'apple' && Platform.OS !== 'ios') {
    return null;
  }

  const isGoogle = provider === 'google';
  const label = isGoogle ? 'Continue with Google' : 'Continue with Apple';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled}
      onPress={onPress}
      className={`w-full flex-row items-center justify-center h-13 px-4 mb-3 rounded-xl border border-slate-200 bg-white active:bg-slate-50 shadow-sm ${
        disabled ? 'opacity-50' : 'opacity-100'
      } ${className}`}
      {...rest}
    >
      <View className="mr-3">
        {isGoogle ? <GoogleIcon size={20} /> : <AppleIcon size={20} color="#000000" />}
      </View>
      <Text className="text-sm font-semibold text-slate-700 tracking-tight">
        {label}
      </Text>
    </TouchableOpacity>
  );
};
