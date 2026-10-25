import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeftIcon } from '../../assets/icons/Icons';

interface HeaderBarProps {
  onBackPress?: () => void;
  title?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
  rightSlotClassName?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onBackPress,
  title,
  showBack = true,
  rightElement,
  className = '',
  rightSlotClassName = 'w-10',
}) => {
  return (
    <View
      className={`flex-row items-center justify-between px-5 py-3 w-full bg-transparent ${className}`}
    >
      <View className="w-10 items-start">
        {showBack && onBackPress ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBackPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="p-1 rounded-full items-center justify-center"
          >
            <ArrowLeftIcon size={24} color="#0F172A" />
          </TouchableOpacity>
        ) : null}
      </View>

      {title ? (
        <Text className="text-xl font-bold text-slate-900 text-center flex-1">
          {title}
        </Text>
      ) : (
        <View className="flex-1" />
      )}

      <View className={`items-end ${rightSlotClassName}`}>
        {rightElement || null}
      </View>
    </View>
  );
};
