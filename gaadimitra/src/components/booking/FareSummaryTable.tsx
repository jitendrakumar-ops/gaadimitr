import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

interface FareSummaryTableProps {
  totalAgreedFare: number;
  tokenAmount: number;
  tokenLabel?: string; // 'Booking Token (Pay Now)' or 'Token Paid'
  className?: string;
}

export const FareSummaryTable: React.FC<FareSummaryTableProps> = ({
  totalAgreedFare = 1500,
  tokenAmount = 200,
  tokenLabel = 'Booking Token (Pay Now)',
  className = '',
}) => {
  const { colors } = useTheme();
  const remainingAmount = Math.max(0, totalAgreedFare - tokenAmount);

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
      className={`p-4 rounded-xl border shadow-sm ${className}`}
    >
      <Text style={{ color: colors.text }} className="text-sm font-extrabold mb-3">
        Fare Summary
      </Text>

      {/* Row 1: Total Agreed Fare */}
      <View
        style={{ borderBottomColor: colors.border }}
        className="flex-row items-center justify-between py-1.5 border-b"
      >
        <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">
          Total Agreed Fare
        </Text>
        <Text style={{ color: colors.text }} className="text-sm font-extrabold">
          ₹{totalAgreedFare.toLocaleString('en-IN')}
        </Text>
      </View>

      {/* Row 2: Token Paid / Pay Now */}
      <View
        style={{ borderBottomColor: colors.border }}
        className="flex-row items-center justify-between py-1.5 border-b"
      >
        <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">
          {tokenLabel}
        </Text>
        <Text className="text-sm font-extrabold text-emerald-600">
          ₹{tokenAmount.toLocaleString('en-IN')}
        </Text>
      </View>

      {/* Row 3: Remaining After Ride */}
      <View className="flex-row items-center justify-between py-1.5 pt-2">
        <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">
          Remaining After Ride
        </Text>
        <Text style={{ color: colors.text }} className="text-sm font-extrabold">
          ₹{remainingAmount.toLocaleString('en-IN')}
        </Text>
      </View>
    </View>
  );
};
