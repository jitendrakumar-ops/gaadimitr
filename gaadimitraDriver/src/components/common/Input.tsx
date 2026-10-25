import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { AlertCircleIcon } from '../../assets/icons/Icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  helperText?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  helperText,
  containerClassName = '',
  onFocus,
  onBlur,
  secureTextEntry,
  editable,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const hasError = Boolean(error);

  const borderClass = hasError
    ? 'border-red-500 bg-red-50'
    : isFocused
      ? 'border-blue-600 bg-white'
      : 'border-slate-200 bg-slate-50';

  return (
    <View className={`w-full mb-4 ${containerClassName}`}>
      {/* Input Label */}
      {label && (
        <Text className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 ml-1">
          {label}
        </Text>
      )}

      {/* Input Field Container */}
      <View
        className={`flex-row items-center border rounded-xl px-4 h-13 ${borderClass}`}
      >
        {/* Left Icon */}
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          className="flex-1 text-base text-slate-900 py-2 font-normal"
          placeholderTextColor="#94A3B8"
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          editable={editable !== undefined ? editable : !disabled}
          {...rest}
        />

        {/* Right Icon / Toggle */}
        {rightIcon && (
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!onRightIconPress}
            onPress={onRightIconPress}
            className="p-1 -mr-1"
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {hasError ? (
        <View className="flex-row items-center mt-2 ml-1">
          <AlertCircleIcon size={13} color="#EF4444" />
          <Text className="text-xs text-red-500 ml-1 font-medium">{error}</Text>
        </View>
      ) : helperText ? (
        <Text className="text-xs text-slate-400 mt-1 ml-1">{helperText}</Text>
      ) : null}
    </View>
  );
};

