import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import {
  ShareIcon,
  HeartOutlineIcon,
  HeartFilledIcon,
  CopyClipboardIcon,
  ShieldAlertIcon,
  BanIcon,
  CheckCircleIcon,
} from '../../assets/icons/Icons';

export interface ActionDropdownMenuProps {
  visible: boolean;
  onClose: () => void;
  driverName: string;
  vehiclePlate?: string;
  isFavorite?: boolean;
  onShare: () => void;
  onToggleFavorite: () => void;
  onCopyContact: () => void;
  onReport: () => void;
  onBlock?: () => void;
  anchorTop?: number;
  anchorRight?: number;
}

export const ActionDropdownMenu: React.FC<ActionDropdownMenuProps> = ({
  visible,
  onClose,
  driverName,
  vehiclePlate,
  isFavorite = false,
  onShare,
  onToggleFavorite,
  onCopyContact,
  onReport,
  onBlock,
  anchorTop = Platform.OS === 'ios' ? 60 : 54,
  anchorRight = 16,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.88);
      opacityAnim.setValue(0);
      translateYAnim.setValue(-10);
    }
  }, [visible]);

  const handleAction = (callback: () => void) => {
    onClose();
    setTimeout(() => {
      callback();
    }, 120);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Full screen backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-slate-900/35"
      >
        {/* Floating Popover Container */}
        <Animated.View
          className="absolute w-[270px] bg-white rounded-xl border border-slate-200 py-2 px-1.5 shadow-2xl"
          style={{
            top: anchorTop,
            right: anchorRight,
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          }}
          onStartShouldSetResponder={() => true}
          onTouchEnd={e => e.stopPropagation()}
        >
          {/* Mini Driver Header Banner inside Dropdown */}
          <View className="flex-row items-center justify-between px-3 py-2">
            <View className="flex-1 mr-1.5">
              <Text className="text-sm font-extrabold text-slate-900" numberOfLines={1}>
                {driverName}
              </Text>
              {vehiclePlate ? (
                <Text className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5" numberOfLines={1}>
                  {vehiclePlate}
                </Text>
              ) : null}
            </View>
            <View className="p-0.5">
              <CheckCircleIcon size={14} color="#10B981" />
            </View>
          </View>

          <View className="h-[1px] bg-slate-100 my-1" />

          {/* Action List */}
          <View className="py-0.5">
            {/* 1. Share Profile */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction(onShare)}
              className="flex-row items-center px-2.5 py-2 rounded-xl my-0.5"
            >
              <View className="w-8.5 h-8.5 rounded-xl bg-blue-50 items-center justify-center mr-2.5">
                <ShareIcon size={17} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-800">Share Profile</Text>
                <Text className="text-[10px] font-medium text-slate-400 mt-0.5">WhatsApp, SMS, or Link</Text>
              </View>
            </TouchableOpacity>

            {/* 2. Add / Remove Favorite */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction(onToggleFavorite)}
              className="flex-row items-center px-2.5 py-2 rounded-xl my-0.5"
            >
              <View className={`w-8.5 h-8.5 rounded-xl items-center justify-center mr-2.5 ${isFavorite ? 'bg-rose-100' : 'bg-rose-50'}`}>
                {isFavorite ? (
                  <HeartFilledIcon size={17} color="#E11D48" />
                ) : (
                  <HeartOutlineIcon size={17} color="#E11D48" />
                )}
              </View>
              <View className="flex-1">
                <Text className={`text-xs font-bold ${isFavorite ? 'text-rose-600' : 'text-slate-800'}`}>
                  {isFavorite ? 'Saved in Favorites' : 'Add to Favorites'}
                </Text>
                <Text className="text-[10px] font-medium text-slate-400 mt-0.5">
                  {isFavorite ? 'Tap to remove favorite' : 'Quick access for future rides'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* 3. Copy Driver Info */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction(onCopyContact)}
              className="flex-row items-center px-2.5 py-2 rounded-xl my-0.5"
            >
              <View className="w-8.5 h-8.5 rounded-xl bg-emerald-50 items-center justify-center mr-2.5">
                <CopyClipboardIcon size={17} color="#16A34A" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-800">Copy Contact Info</Text>
                <Text className="text-[10px] font-medium text-slate-400 mt-0.5">Phone number & vehicle plate</Text>
              </View>
            </TouchableOpacity>

            <View className="h-[1px] bg-slate-100 my-1" />

            {/* 4. Report Driver */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction(onReport)}
              className="flex-row items-center px-2.5 py-2 rounded-xl my-0.5"
            >
              <View className="w-8.5 h-8.5 rounded-xl bg-amber-50 items-center justify-center mr-2.5">
                <ShieldAlertIcon size={17} color="#D97706" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-800">Report Driver</Text>
                <Text className="text-[10px] font-medium text-slate-400 mt-0.5">Fare dispute or behavior</Text>
              </View>
            </TouchableOpacity>

            {/* 5. Block Driver */}
            {onBlock && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleAction(onBlock)}
                className="flex-row items-center px-2.5 py-2 rounded-xl my-0.5"
              >
                <View className="w-8.5 h-8.5 rounded-xl bg-red-50 items-center justify-center mr-2.5">
                  <BanIcon size={17} color="#DC2626" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-red-600">
                    Block Driver
                  </Text>
                  <Text className="text-[10px] font-medium text-slate-400 mt-0.5">Hide from nearby search</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};
