import React from 'react';
import { View, Text } from 'react-native';
import { InfoCircleOutlineIcon } from '../../assets/icons/Icons';
import { useTheme } from '../../theme';

interface InfoNoteBoxProps {
  title?: string;
  subtitle: string;
  className?: string;
}

export const InfoNoteBox: React.FC<InfoNoteBoxProps> = ({
  title,
  subtitle,
  className = '',
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
      className={`p-4 rounded-xl border flex-row items-start ${className}`}
    >
      <View className="mr-3 mt-0.5">
        <InfoCircleOutlineIcon size={20} color={colors.textSecondary} />
      </View>
      <View className="flex-1">
        {title ? (
          <Text
            style={{ color: colors.text }}
            className="text-sm font-bold leading-snug"
          >
            {title}
          </Text>
        ) : null}
        <Text
          style={{ color: colors.textSecondary }}
          className={`text-xs font-normal leading-relaxed ${title ? 'mt-0.5' : ''}`}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
};
