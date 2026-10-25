import React from 'react';
import { View, Text, Image } from 'react-native';
import { DriverInfo } from '../../types/navigation';
import {
  DriverAvatarPortrait,
  CheckCircleIcon,
  Car5SeaterGraphic,
} from '../../assets/icons/Icons';
import { useTheme } from '../../theme';
import { useAppSelector } from '../../store';


interface DriverSummaryCardProps {
  driver?: DriverInfo;
  className?: string;
}

export const DriverSummaryCard: React.FC<DriverSummaryCardProps> = ({
  driver,
  className = '',
}) => {
  const { colors } = useTheme();
 
  if (!driver) {
    return null;
  }
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
      className={`p-4 rounded-xl border shadow-sm flex-row items-center justify-between ${className}`}
    >
      {/* Left side: Avatar + Driver Info */}
      <View className="flex-row items-center flex-1 pr-2">
        <View className="mr-3">
          <DriverAvatarPortrait
            size={52}
            imageUrl={driver.profileImage}
            seed={driver.avatarSeed || '1'}
            bg={driver.avatarBg || '#EFF6FF'}
            showVerified={false}
          />
        </View>

        <View className="flex-1">
          <Text
            style={{ color: colors.text }}
            className="text-base font-extrabold leading-tight"
          >
            {driver.name || 'Driver Partner'}
          </Text>

          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-medium mt-0.5"
          >
            {driver.vehicleModel}
          </Text>

          {driver.pin ? (
            <View
              style={{
                backgroundColor: '#FEF3C7',
                borderColor: '#F59E0B',
              }}
              className="mt-1.5 self-start flex-row items-center rounded-md border px-2 py-1"
            >
              <Text className="text-[9px] font-extrabold uppercase tracking-wide text-amber-700 mr-1.5">
                PIN
              </Text>
              <Text className="text-[11px] font-black text-amber-900">
                {driver.pin}
              </Text>
            </View>
          ) : null}

          {driver.isVerified && (
            <View className="flex-row items-center mt-1">
              <CheckCircleIcon size={12} color="#10B981" />
              <Text className="text-[11px] font-bold text-emerald-600 ml-1">
                Verified Driver
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Right side: Car Graphic + License Plate */}
      <View className="items-center justify-center">
        <View className="w-36 h-20 items-center justify-center">
          {(() => {
            const vehicleImg =
              driver.vehicleImage ||
              (Array.isArray(driver.driverVehicleImg)
                ? driver.driverVehicleImg[0]
                : driver.driverVehicleImg);

            return vehicleImg ? (
              <Image
                source={{ uri: vehicleImg }}
                className="w-full h-full rounded-lg"
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../../assets/images/maruti_dzire_white.jpg')}
                className="w-full h-full"
                resizeMode="contain"
              />
            );
          })()}
        </View>
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="mt-1 px-2 py-0.5 rounded-md border"
        >
          <Text
            style={{ color: colors.text }}
            className="text-[10px] font-mono font-bold uppercase tracking-wider"
          >
            {driver.vehiclePlate || driver.vehicleNo || 'Not Registered'}
          </Text>
        </View>
      </View>
    </View>
  );
};
