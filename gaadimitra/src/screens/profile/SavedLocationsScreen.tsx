import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LocationMarkerIcon, XCloseIcon } from '../../assets/icons/Icons';
import { HeaderBar } from '../../components/common/HeaderBar';
import { useTheme } from '../../theme';
import { toast } from '../../components/common/ToastNotification';
import { confirmDialog } from '../../components/common/CustomAlertModal';

interface SavedPlace {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  label: string;
  address: string;
  isPrimary?: boolean;
}

export const SavedLocationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTag, setNewTag] = useState<'Home' | 'Work' | 'Other'>('Other');

  const handleDelete = (id: string, label: string) => {
    confirmDialog.show({
      title: 'Delete Location',
      message: `Are you sure you want to remove "${label}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
      icon: 'delete',
      onConfirm: () => {
        setPlaces((prev) => prev.filter((p) => p.id !== id));
        toast.showSuccess(`"${label}" removed successfully.`, 'Deleted');
      },
    });
  };

  const handleAddNew = () => {
    if (!newLabel.trim() || !newAddress.trim()) {
      toast.showError('Please fill in both label and address.', 'Incomplete Details');
      return;
    }
    const newPlace: SavedPlace = {
      id: `p_${Date.now()}`,
      tag: newTag,
      label: newLabel.trim(),
      address: newAddress.trim(),
    };
    setPlaces([...places, newPlace]);
    toast.showSuccess(`Location "${newLabel.trim()}" saved!`, 'Saved');
    setNewLabel('');
    setNewAddress('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 justify-between">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Navigation Bar */}
      <HeaderBar
        onBackPress={() => navigation.goBack()}
        title="Saved Locations"
        className="border-b"
        style={{ borderBottomColor: colors.border }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 28,
          flexGrow: 1,
          justifyContent: 'space-between',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-3 px-1">
            Frequently Visited Places
          </Text>

          <View className="space-y-3">
            {places.length === 0 ? (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-8 items-center justify-center my-3"
              >
                <View
                  style={{ backgroundColor: `${colors.primary}15` }}
                  className="w-14 h-14 rounded-full items-center justify-center mb-3"
                >
                  <LocationMarkerIcon size={26} color={colors.primary} />
                </View>
                <Text style={{ color: colors.text }} className="text-base font-extrabold mb-1">
                  No Saved Locations
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs text-center leading-relaxed px-4">
                  You haven't saved any locations yet. Add frequent places like Home or Work for quick booking.
                </Text>
              </View>
            ) : (
              places.map(place => (
                <View
                  key={place.id}
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  }}
                  className="rounded-xl border p-4 mb-3"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-start flex-1 mr-2">
                      <View
                        style={{ backgroundColor: `${colors.primary}18` }}
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3 mt-0.5"
                      >
                        <LocationMarkerIcon size={20} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text style={{ color: colors.text }} className="text-sm font-extrabold">
                            {place.label}
                          </Text>
                          <View
                            style={{ backgroundColor: colors.surface }}
                            className="ml-2 px-2 py-0.5 rounded-md"
                          >
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold">
                              {place.tag}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ color: colors.textSecondary }} className="text-xs font-medium mt-1 leading-relaxed">
                          {place.address}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleDelete(place.id, place.label)}
                      className="p-1"
                    >
                      <Text style={{ color: colors.error }} className="text-xs font-bold">Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Add New Location Button */}
        <View className="pt-4">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowAddModal(true)}
            style={{ backgroundColor: colors.primary }}
            className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md"
          >
            <Text className="text-white text-base font-extrabold tracking-wide">
              + Add New Location
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Location Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View style={{ backgroundColor: colors.card }} className="rounded-t-3xl p-6">
            <View style={{ borderBottomColor: colors.border }} className="flex-row items-center justify-between pb-3 border-b">
              <Text style={{ color: colors.text }} className="text-lg font-black">
                Add Saved Location
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <XCloseIcon size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View className="mt-4 space-y-4">
              {/* Tag Selector */}
              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-2">
                  Location Type
                </Text>
                <View className="flex-row">
                  {(['Home', 'Work', 'Other'] as const).map(t => (
                    <TouchableOpacity
                      key={t}
                      activeOpacity={0.75}
                      onPress={() => setNewTag(t)}
                      style={{
                        backgroundColor: newTag === t ? `${colors.primary}18` : colors.input,
                        borderColor: newTag === t ? colors.primary : colors.border,
                      }}
                      className="flex-1 py-2.5 rounded-xl border items-center justify-center mr-2"
                    >
                      <Text
                        style={{
                          color: newTag === t ? colors.primary : colors.text,
                        }}
                        className="text-xs font-extrabold"
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Label */}
              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-1.5">
                  Location Name / Label
                </Text>
                <TextInput
                  value={newLabel}
                  onChangeText={setNewLabel}
                  placeholder="e.g. My Flat, Mom's House"
                  placeholderTextColor={colors.placeholder}
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  className="border rounded-xl px-4 py-3 text-sm font-bold"
                />
              </View>

              {/* Address */}
              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-1.5">
                  Complete Address
                </Text>
                <TextInput
                  value={newAddress}
                  onChangeText={setNewAddress}
                  placeholder="e.g. Near Metro Pillar 42, Bailey Road"
                  placeholderTextColor={colors.placeholder}
                  multiline
                  numberOfLines={2}
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  className="border rounded-xl px-4 py-3 text-sm font-medium"
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleAddNew}
                style={{ backgroundColor: colors.primary }}
                className="w-full py-4 rounded-xl items-center justify-center mt-2"
              >
                <Text className="text-white text-base font-extrabold">
                  Save Address
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
