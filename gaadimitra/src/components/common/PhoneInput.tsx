import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { PhoneIcon, AlertCircleIcon, CheckCircleIcon } from '../../assets/icons/Icons';
import { INDIAN_PHONE_REGEX } from '../../utils/validation';

export interface PhoneInputProps {
  label?: string;
  countryCode?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  onCountryPress?: () => void;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label = 'Mobile Number',
  countryCode = '+91',
  value,
  onChangeText,
  error,
  placeholder = '98765 43210',
  onCountryPress,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const cleanDigits = value.replace(/\D/g, '');
  const isValidLength = cleanDigits.length === 10;
  const isIndianValid = isValidLength && INDIAN_PHONE_REGEX.test(cleanDigits);
  const hasError = Boolean(error);

  const borderClass = hasError
    ? 'border-red-500 bg-red-50'
    : isFocused
    ? 'border-blue-600 bg-white'
    : 'border-slate-200 bg-slate-50';

  return (
    <View className="w-full mb-4">
      {/* Field Label */}
      <View className="flex-row items-center justify-between mb-1.5 ml-0.5">
        <Text className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {label}
        </Text>
        {cleanDigits.length > 0 && (
          <Text className="text-xs text-slate-400 font-medium">
            {cleanDigits.length}/10
          </Text>
        )}
      </View>

      {/* Input container */}
      <View
        className={`flex-row items-center border rounded-xl h-13 overflow-hidden ${borderClass}`}
      >
        {/* Country Code Selector Badge */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCountryPress}
          disabled={!onCountryPress || disabled}
          className="flex-row items-center bg-slate-100 px-3.5 h-full border-r border-slate-200"
        >
          <Text className="text-base mr-1.5">🇮🇳</Text>
          <Text className="text-sm font-semibold text-slate-800 tracking-tight">
            {countryCode}
          </Text>
        </TouchableOpacity>

        {/* Input Field */}
        <View className="flex-1 flex-row items-center px-3.5">
          <PhoneIcon size={18} color={isFocused ? '#2563EB' : '#94A3B8'} />
          <TextInput
            className="flex-1 text-base text-slate-900 ml-2.5 py-2.5 font-medium tracking-wide"
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={11} // allows space formatted 10 digits
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            editable={!disabled}
          />

          {/* Validation Status Indicator */}
          {isIndianValid ? (
            <View className="ml-1">
              <CheckCircleIcon size={16} color="#10B981" />
            </View>
          ) : null}
        </View>
      </View>

      {/* Error / Validation helper */}
      {hasError ? (
        <View className="flex-row items-center mt-1.5 ml-1">
          <AlertCircleIcon size={13} color="#EF4444" />
          <Text className="text-xs text-red-500 ml-1 font-medium">{error}</Text>
        </View>
      ) : (
        <Text className="text-[11px] text-slate-400 mt-1 ml-1">
          Enter 10-digit Indian mobile number (without +91)
        </Text>
      )}
    </View>
  );
};
