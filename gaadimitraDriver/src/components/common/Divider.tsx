import React from 'react';
import { View, Text } from 'react-native';

interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  label = 'OR',
  className = '',
}) => {
  return (
    <View className={`flex-row items-center my-6 ${className}`}>
      <View className="flex-1 h-[1px] bg-slate-200" />
      {label && (
        <Text className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </Text>
      )}
      <View className="flex-1 h-[1px] bg-slate-200" />
    </View>
  );
};
