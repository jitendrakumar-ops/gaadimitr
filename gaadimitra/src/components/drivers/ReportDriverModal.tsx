import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ShieldAlertIcon,
  XCloseIcon,
  PhoneIcon,
} from '../../assets/icons/Icons';
import { useTheme } from '../../theme';

export interface ReportDriverModalProps {
  visible: boolean;
  driverName: string;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
}

const REPORT_REASONS = [
  'Demanding extra fare / Cash dispute',
  'Rude or unprofessional behavior',
  'Vehicle dirty / AC not switched on',
  'Reckless or unsafe driving',
  'Driver cancelled after agreeing',
  'Wrong vehicle or driver mismatch',
  'Other safety / service issue',
];

export const ReportDriverModal: React.FC<ReportDriverModalProps> = ({
  visible,
  driverName,
  onClose,
  onSubmit,
}) => {
  const { colors } = useTheme();
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState<string>('');

  const handleSubmit = () => {
    onSubmit(selectedReason, details);
    setDetails('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1"
        />

        <View
          style={{ backgroundColor: colors.card }}
          className="rounded-t-3xl pt-2.5 pb-7 px-5 max-h-[88%] shadow-2xl"
        >
          {/* Top Indicator handle */}
          <View
            style={{ backgroundColor: colors.border }}
            className="w-10 h-1 rounded-full self-center mb-3"
          />

          {/* Modal Header */}
          <View
            style={{ borderBottomColor: colors.border }}
            className="flex-row items-center justify-between pb-3.5 border-b"
          >
            <View className="flex-row items-center flex-1">
              <View
                style={{ backgroundColor: `${colors.error}20` }}
                className="w-9.5 h-9.5 rounded-xl items-center justify-center mr-3"
              >
                <ShieldAlertIcon size={20} color={colors.error} />
              </View>
              <View className="flex-1">
                <Text
                  style={{ color: colors.text }}
                  className="text-lg font-extrabold"
                >
                  Report Driver
                </Text>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-xs font-medium mt-0.5"
                  numberOfLines={1}
                >
                  Reporting {driverName}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ backgroundColor: colors.surface }}
              className="p-1.5 rounded-full"
            >
              <XCloseIcon size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Guidance Alert */}
            <View
              style={{
                backgroundColor: `${colors.error}15`,
                borderColor: `${colors.error}40`,
              }}
              className="px-3.5 py-2.5 rounded-xl border mb-4"
            >
              <Text
                style={{ color: colors.error }}
                className="text-xs leading-relaxed font-medium"
              >
                Your report is anonymous. Our safety team will review this driver's profile within 2 hours.
              </Text>
            </View>

            {/* Section label */}
            <Text
              style={{ color: colors.textSecondary }}
              className="text-xs font-bold uppercase tracking-wider mb-2.5 mt-1"
            >
              Select Reason
            </Text>

            {/* List of reason chips/radios */}
            <View className="mb-4">
              {REPORT_REASONS.map(reason => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    activeOpacity={0.75}
                    onPress={() => setSelectedReason(reason)}
                    style={{
                      backgroundColor: isSelected ? `${colors.primary}18` : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }}
                    className="flex-row items-center py-3 px-3.5 rounded-xl border mb-2"
                  >
                    <View
                      style={{
                        borderColor: isSelected ? colors.primary : colors.border,
                      }}
                      className="w-4.5 h-4.5 rounded-full border-2 items-center justify-center mr-3"
                    >
                      {isSelected && (
                        <View
                          style={{ backgroundColor: colors.primary }}
                          className="w-2 h-2 rounded-full"
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        color: isSelected ? colors.primary : colors.text,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                      className="text-xs flex-1"
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Additional details input */}
            <Text
              style={{ color: colors.textSecondary }}
              className="text-xs font-bold uppercase tracking-wider mb-2 mt-1"
            >
              Additional Details (Optional)
            </Text>
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Provide more context so our safety team can take swift action..."
              placeholderTextColor={colors.placeholder}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              }}
              className="border rounded-xl px-3.5 py-2.5 text-xs min-h-[70px] mb-3.5"
            />

            {/* 24x7 Safety Helpline banner */}
            <View
              style={{
                backgroundColor: `${colors.primary}15`,
                borderColor: `${colors.primary}35`,
              }}
              className="flex-row items-center p-3 rounded-xl border mb-2.5"
            >
              <PhoneIcon size={16} color={colors.primary} />
              <Text
                style={{ color: colors.primary }}
                className="text-[11px] ml-2 flex-1 leading-relaxed"
              >
                Need immediate help? Call 24x7 Safety Helpline: <Text className="font-extrabold">1800-GAADI-CARE</Text>
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={{ borderTopColor: colors.border }}
            className="flex-row items-center pt-3 border-t"
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="flex-1 py-3.5 rounded-xl border items-center justify-center mr-2"
            >
              <Text style={{ color: colors.text }} className="text-sm font-bold">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              style={{ backgroundColor: colors.error }}
              className="flex-[1.6] py-3.5 rounded-xl items-center justify-center shadow-sm ml-2"
            >
              <Text className="text-sm font-bold text-white">
                Submit Report
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
