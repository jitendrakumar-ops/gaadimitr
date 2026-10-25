import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  Platform,
  StyleProp,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textClassName?: string;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  className = '',
  textClassName = '',
  textStyle,
  style,
  ...rest
}) => {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  // Base sizing classes
  const sizeClasses = {
    sm: 'h-10 px-4 rounded-xl',
    md: 'h-13 px-6 rounded-xl',
    lg: 'h-14 px-8 rounded-xl',
  }[size];

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 1 },
          text: { color: '#FFFFFF' },
          spinner: '#FFFFFF',
        };
      case 'secondary':
        return {
          container: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
          text: { color: colors.text },
          spinner: colors.text,
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 },
          text: { color: colors.text },
          spinner: colors.primary,
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 0 },
          text: { color: colors.primary },
          spinner: colors.primary,
        };
    }
  };

  const currentStyles = getVariantStyles();
  const disabledStyle = isDisabled ? { opacity: 0.6 } : {};

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[currentStyles.container, disabledStyle, style]}
      className={`flex-row items-center justify-center ${sizeClasses} ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={currentStyles.spinner}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text
            style={[
              currentStyles.text,
              {
                includeFontPadding: false,
                textAlignVertical: 'center',
                transform: [{ translateY: Platform.OS === 'android' ? -1.5 : -1 }],
              },
              textStyle,
            ]}
            className={`font-semibold ${textSizeClasses} tracking-wide text-center ${textClassName}`}
          >
            {title}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};
