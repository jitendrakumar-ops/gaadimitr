import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { AlertCircleIcon } from '../../assets/icons/Icons';
import { useTheme } from '../../theme';

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
  style,
  ...rest
}) => {
  const { colors } = useTheme();
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

  const borderColor = hasError
    ? colors.error
    : isFocused
    ? colors.primary
    : colors.border;

  const backgroundColor = hasError
    ? `${colors.error}15`
    : isFocused
    ? colors.card
    : colors.input;

  return (
    <View className={`w-full mb-4 ${containerClassName}`}>
      {/* Input Label */}
      {label && (
        <Text
          style={{ color: colors.textSecondary }}
          className="text-xs font-semibold uppercase tracking-wider mb-1.5 ml-0.5"
        >
          {label}
        </Text>
      )}

      {/* Input Field Container */}
      <View
        style={{
          borderColor,
          backgroundColor,
          borderWidth: 1,
        }}
        className="flex-row items-center rounded-xl px-3.5 h-13"
      >
        {/* Left Icon */}
        {leftIcon && <View className="mr-2.5">{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          style={[{ color: colors.text }, style]}
          className="flex-1 text-base py-2.5 font-normal"
          placeholderTextColor={colors.placeholder}
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
        <View className="flex-row items-center mt-1.5 ml-1">
          <AlertCircleIcon size={13} color={colors.error} />
          <Text style={{ color: colors.error }} className="text-xs ml-1 font-medium">
            {error}
          </Text>
        </View>
      ) : helperText ? (
        <Text style={{ color: colors.placeholder }} className="text-xs mt-1 ml-1">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};
