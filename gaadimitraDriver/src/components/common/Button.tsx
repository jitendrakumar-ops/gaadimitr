import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
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
  ...rest
}) => {
  const isDisabled = disabled || loading;

  // Base sizing classes
  const sizeClasses = {
    sm: 'h-10 px-4 rounded-xl',
    md: 'h-13 py-3 px-6 rounded-xl',
    lg: 'h-14 py-4 px-8 rounded-xl',
  }[size];

  // Variant styling
  const variantClasses = {
    primary: 'bg-blue-600 active:bg-blue-700 shadow-sm border border-blue-600',
    secondary: 'bg-slate-800 active:bg-slate-900',
    outline: 'bg-transparent border border-slate-300 active:bg-slate-50',
    ghost: 'bg-transparent',
  }[variant];

  // Text styling
  const textVariantClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-semibold',
    outline: 'text-slate-700 font-semibold',
    ghost: 'text-blue-600 font-semibold',
  }[variant];

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  const disabledClass = isDisabled ? 'opacity-60' : 'opacity-100';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${sizeClasses} ${variantClasses} ${disabledClass} ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#2563EB' : '#FFFFFF'}
        />
      ) : (
        <View className="flex-row items-center justify-center space-x-2">
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={`${textVariantClasses} ${textSizeClasses} tracking-wide text-center`}>
            {title}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};
