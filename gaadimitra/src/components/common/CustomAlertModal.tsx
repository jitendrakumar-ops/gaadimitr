import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useTheme } from '../../theme';

export type AlertType = 'danger' | 'primary' | 'info' | 'warning';

export interface AlertOption {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  icon?: 'camera' | 'gallery' | 'phone';
}

export interface ConfirmDialogOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: AlertType;
  isDestructive?: boolean;
  icon?: 'logout' | 'delete' | 'phone' | 'camera' | 'help' | 'alert';
  cancelable?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  options?: AlertOption[];
}

interface DialogState extends ConfirmDialogOptions {
  visible: boolean;
}

type DialogListener = (state: DialogState) => void;
let globalDialogListener: DialogListener | null = null;

export const confirmDialog = {
  show: (options: ConfirmDialogOptions) => {
    if (globalDialogListener) {
      globalDialogListener({
        ...options,
        visible: true,
      });
    }
  },
  showOptions: (options: ConfirmDialogOptions) => {
    if (globalDialogListener) {
      globalDialogListener({
        ...options,
        visible: true,
      });
    }
  },
  hide: () => {
    if (globalDialogListener) {
      globalDialogListener({
        title: '',
        visible: false,
      });
    }
  },
};

export const GlobalAlertContainer: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    title: '',
  });

  const scaleValue = useRef(new Animated.Value(0.9)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    globalDialogListener = (state) => {
      setDialog(state);
    };
    return () => {
      globalDialogListener = null;
    };
  }, []);

  useEffect(() => {
    if (dialog.visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleValue.setValue(0.9);
      opacityValue.setValue(0);
    }
  }, [dialog.visible]);

  if (!dialog.visible) return null;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDialog((prev) => ({ ...prev, visible: false }));
    });
  };

  const handleConfirm = () => {
    const cb = dialog.onConfirm;
    handleClose();
    if (cb) cb();
  };

  const handleCancel = () => {
    const cb = dialog.onCancel;
    handleClose();
    if (cb) cb();
  };

  const isDestructive = dialog.isDestructive || dialog.type === 'danger';

  // Render top badge icon
  const renderBadgeIcon = () => {
    const iconType = dialog.icon || (isDestructive ? 'delete' : 'alert');
    const badgeBg = isDestructive
      ? isDark
        ? 'rgba(239, 68, 68, 0.18)'
        : '#FEE2E2'
      : isDark
        ? 'rgba(59, 130, 246, 0.18)'
        : '#EFF6FF';

    const iconColor = isDestructive ? '#EF4444' : colors.primary;

    return (
      <View
        style={{ backgroundColor: badgeBg }}
        className="w-14 h-14 rounded-full items-center justify-center self-center mb-3.5"
      >
        {iconType === 'logout' && (
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
              stroke={iconColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M16 17L21 12L16 7"
              stroke={iconColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M21 12H9"
              stroke={iconColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}

        {iconType === 'delete' && (
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 6H5H21"
              stroke={iconColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
              stroke={iconColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}

        {iconType === 'phone' && (
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Path
              d="M22 16.92V19.92C22.0011 20.1986 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2137 21.3521 21.4019C21.1468 21.5902 20.9046 21.7335 20.6407 21.8228C20.3769 21.912 20.0974 21.9452 19.82 21.92C16.7428 21.5857 13.787 20.5342 11.19 18.85C8.77382 17.3148 6.72533 15.2663 5.19 12.85C3.49997 10.2412 2.44824 7.27104 2.12 4.18C2.095 3.90357 2.12787 3.62486 2.21652 3.36173C2.30517 3.0986 2.44766 2.85686 2.63499 2.65215C2.82233 2.44744 3.05036 2.28434 3.30436 2.17333C3.55836 2.06232 3.83262 2.00588 4.11 2.00781H7.11C7.5953 1.99524 8.06579 2.16708 8.42512 2.48834C8.78445 2.80959 9.00624 3.25697 9.04 3.74C9.1027 4.64619 9.32439 5.53677 9.698 6.38C9.84504 6.70829 9.89069 7.07223 9.82902 7.42571C9.76735 7.77919 9.60117 8.10626 9.352 8.365L8.08 9.637C9.51355 12.1583 11.5817 14.2265 14.103 15.66L15.375 14.388C15.6337 14.1388 15.9608 13.9726 16.3143 13.911C16.6678 13.8493 17.0317 13.895 17.36 14.042C18.2032 14.4156 19.0938 14.6373 20 14.7C20.4884 14.7342 20.9404 14.9602 21.2638 15.3262C21.5872 15.6923 21.7578 16.1699 21.74 16.66L22 16.92Z"
              stroke={iconColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}

        {(iconType === 'alert' || iconType === 'help') && (
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="2.2" />
            <Path d="M12 8V12" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" />
            <Circle cx="12" cy="16" r="1.2" fill={iconColor} />
          </Svg>
        )}

        {iconType === 'camera' && (
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Path
              d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
              stroke={iconColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx="12" cy="13" r="4" stroke={iconColor} strokeWidth="2.2" />
          </Svg>
        )}
      </View>
    );
  };

  return (
    <Modal
      transparent
      visible={dialog.visible}
      animationType="none"
      onRequestClose={() => {
        if (dialog.cancelable !== false) handleCancel();
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          if (dialog.cancelable !== false) handleCancel();
        }}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              opacity: opacityValue,
            },
          ]}
          className="items-center justify-center px-6"
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: 14,
                transform: [{ scale: scaleValue }],
                opacity: opacityValue,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: isDark ? 0.5 : 0.2,
                shadowRadius: 20,
                elevation: 15,
              }}
              className="w-full max-w-sm p-6 border"
            >
              {renderBadgeIcon()}

              {/* Title */}
              <Text
                style={{ color: colors.text }}
                className="text-lg font-bold text-center tracking-tight"
              >
                {dialog.title}
              </Text>

              {/* Message */}
              {dialog.message ? (
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-sm font-medium text-center mt-2 leading-relaxed"
                >
                  {dialog.message}
                </Text>
              ) : null}

              {/* Multiple Options List (e.g. Photo Picker) */}
              {dialog.options && dialog.options.length > 0 ? (
                <View style={{ gap: 12 }} className="mt-6">
                  {dialog.options.map((opt, idx) => {
                    const isCancel = opt.style === 'cancel';
                    const isDestr = opt.style === 'destructive';
                    return (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.8}
                        onPress={() => {
                          handleClose();
                          opt.onPress();
                        }}
                        style={{
                          backgroundColor: isCancel
                            ? isDark
                              ? 'rgba(255,255,255,0.06)'
                              : '#F1F5F9'
                            : isDestr
                              ? '#EF4444'
                              : colors.primary,
                          borderRadius: 18,
                        }}
                        className="w-full py-3.5 px-4 items-center justify-center"
                      >
                        <Text
                          style={{
                            color: isCancel ? colors.text : '#FFFFFF',
                          }}
                          className="font-bold text-sm"
                        >
                          {opt.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                /* Standard Confirmation (2 Buttons) */
                <View style={{ gap: 14 }} className="flex-row mt-6 items-center mt-7">
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={handleCancel}
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : '#F1F5F9',
                      borderRadius: 14,
                    }}
                    className="flex-1 py-3.5 items-center justify-center"
                  >
                    <Text
                      style={{ color: colors.textSecondary }}
                      className="font-semibold text-sm"
                    >
                      {dialog.cancelText || 'Cancel'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleConfirm}
                    style={{
                      backgroundColor: isDestructive ? '#EF4444' : colors.primary,
                      borderRadius: 14,
                    }}
                    className="flex-1 py-3.5 items-center justify-center shadow-md"
                  >
                    <Text className="text-white font-bold text-sm tracking-wide">
                      {dialog.confirmText || 'Confirm'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
