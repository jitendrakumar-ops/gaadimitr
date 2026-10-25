import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../theme';

export interface VehicleCategory {
  id: string;
  title: string;
  capacity?: string;
  description?: string;
  image?: string | null;
  graphic?: React.ReactNode;
}

interface VehicleCardProps {
  category: VehicleCategory;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  category,
  isSelected,
  onSelect,
}) => {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);

  const hasRemoteImage = Boolean(category.image && !imageError);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(category.id)}
      style={{
        backgroundColor: isSelected ? `${colors.primary}18` : colors.card,
        borderColor: isSelected ? colors.primary : colors.border,
        borderWidth: isSelected ? 2 : 1,
      }}
      className="flex-1 rounded-xl p-4 items-center justify-between min-h-[148px] m-1.5 shadow-sm"
    >
      {/* Vehicle Graphic / Image */}
      <View className="h-16 items-center justify-center my-1 w-full">
        {hasRemoteImage ? (
          <Image
            source={{ uri: category.image as string }}
            style={{ width: 90, height: 56 }}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        ) : (
          category.graphic || (
            <View
              style={{ backgroundColor: `${colors.primary}12` }}
              className="w-16 h-12 rounded-lg items-center justify-center"
            >
              <Text style={{ color: colors.primary }} className="text-xs font-bold">
                {category.title?.charAt(0) || '🚗'}
              </Text>
            </View>
          )
        )}
      </View>

      {/* Category Info */}
      <View className="items-center mt-2">
        <Text
          numberOfLines={1}
          style={{ color: colors.text }}
          className="text-base font-bold text-center"
        >
          {category.title}
        </Text>
        {(category.capacity || category.description) && (
          <Text
            numberOfLines={1}
            style={{ color: colors.textSecondary }}
            className="text-xs font-medium mt-0.5 text-center"
          >
            {category.capacity || category.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

