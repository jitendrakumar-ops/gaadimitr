import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useTheme } from '../../theme';

interface OtpInputProps {
  length?: number;
  value: string;
  onChangeOtp: (otp: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChangeOtp,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChangeText = (text: string, index: number) => {
    const cleanDigit = text.replace(/\D/g, '');

    // If pasted multi-digit OTP
    if (cleanDigit.length > 1) {
      const fullOtp = cleanDigit.slice(0, length);
      onChangeOtp(fullOtp);
      const nextFocus = Math.min(fullOtp.length, length - 1);
      inputsRef.current[nextFocus]?.focus();
      return;
    }

    const currentDigits = [...digits];
    currentDigits[index] = cleanDigit.slice(-1);
    const newOtp = currentDigits.join('');
    onChangeOtp(newOtp);

    // Auto-focus next input if a digit was entered
    if (cleanDigit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move focus backward if current box is empty
        inputsRef.current[index - 1]?.focus();
        const currentDigits = [...digits];
        currentDigits[index - 1] = '';
        onChangeOtp(currentDigits.join(''));
      }
    }
  };

  return (
    <View className="flex-row justify-between items-center w-full my-6">
      {Array.from({ length }).map((_, index) => {
        const isFocused = focusedIndex === index;
        const hasValue = Boolean(digits[index]);

        return (
          <View
            key={index}
            style={{
              borderColor: isFocused ? colors.primary : colors.border,
              borderWidth: isFocused ? 2 : 1,
              backgroundColor: isFocused ? colors.card : hasValue ? colors.surface : colors.input,
            }}
            className="w-12 h-14 rounded-xl items-center justify-center"
          >
            <TextInput
              ref={ref => {
                inputsRef.current[index] = ref;
              }}
              value={digits[index] || ''}
              onChangeText={text => handleChangeText(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!disabled}
              textAlign="center"
              style={{ color: colors.text }}
              className="text-xl font-bold w-full h-full p-0"
              selectTextOnFocus
            />
          </View>
        );
      })}
    </View>
  );
};
