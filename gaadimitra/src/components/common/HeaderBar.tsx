import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { ArrowLeftIcon } from '../../assets/icons/Icons';
import { useTheme } from '../../theme';

interface HeaderBarProps {
  onBackPress?: () => void;
  title?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
  rightSlotClassName?: string;
  style?: StyleProp<ViewStyle>;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onBackPress,
  title,
  showBack = true,
  rightElement,
  className = '',
  rightSlotClassName = 'w-10',
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[{ backgroundColor: colors.card, borderBottomColor: colors.border }, style]}
      className={`flex-row items-center justify-between px-5 py-3 w-full ${className}`}
    >
      <View className="w-10 items-start">
        {showBack && onBackPress ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBackPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="p-1 rounded-full items-center justify-center"
          >
            <ArrowLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      {title ? (
        <Text
          style={{ color: colors.text }}
          className="text-xl font-bold text-center flex-1"
        >
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
