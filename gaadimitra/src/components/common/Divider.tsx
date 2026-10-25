import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  label = 'OR',
  className = '',
}) => {
  const { colors } = useTheme();

  return (
    <View className={`flex-row items-center my-6 ${className}`}>
      <View style={{ backgroundColor: colors.border }} className="flex-1 h-[1px]" />
      {label && (
        <Text
          style={{ color: colors.textSecondary }}
          className="px-3 text-xs font-semibold uppercase tracking-wider"
        >
          {label}
        </Text>
      )}
      <View style={{ backgroundColor: colors.border }} className="flex-1 h-[1px]" />
    </View>
  );
};
