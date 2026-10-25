import React from 'react';
import { View } from 'react-native';
import { CelebrationCheckGraphic } from '../../assets/icons/Icons';

interface CelebrationBadgeProps {
  size?: number;
  className?: string;
}

export const CelebrationBadge: React.FC<CelebrationBadgeProps> = ({
  size = 110,
  className = '',
}) => {
  return (
    <View className={`items-center justify-center my-2 ${className}`}>
      <CelebrationCheckGraphic size={size} />
    </View>
  );
};
