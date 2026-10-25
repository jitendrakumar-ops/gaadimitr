import React from 'react';
import { View, Text } from 'react-native';
import { CarBadgeIcon } from '../../assets/icons/Icons';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  const iconSize = isLarge ? 42 : isSmall ? 26 : 34;

  return (
    <View className="items-center justify-center my-4">
      {/* Brand Icon Badge */}
      <View className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center shadow-sm mb-3">
        <CarBadgeIcon size={iconSize} color="#2563EB" />
      </View>

      {/* Brand Title */}
      <View className="flex-row items-center">
        <Text className="text-2xl font-bold tracking-tight text-slate-900">
          Gaadi<Text className="text-blue-600">Mitra</Text>
        </Text>
      </View>

      {/* Brand Tagline */}
      {showSubtitle && (
        <Text className="text-xs text-slate-500 font-medium tracking-wide mt-1 uppercase">
          Vehicle Marketplace
        </Text>
      )}
    </View>
  );
};
