import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LocationPermissionNavigationProp } from '../../types/navigation';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Button } from '../../components/common/Button';
import {
  LocationMarkerIcon,
  SearchIcon,
  ChevronRightIcon,
} from '../../assets/icons/Icons';
import {
  detectCurrentLocationWithGps,
  searchPlacesWithGoogle,
  getPlaceCoordinates,
  geocodeAddress,
  PlacePrediction,
} from '../../utils/mapConfig';
import { useTheme } from '../../theme';
import { storageService } from '../../services/storage';

export const LocationPermissionScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<LocationPermissionNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placePredictions, setPlacePredictions] = useState<PlacePrediction[]>([]);

  // Dynamic Google Places autocomplete search with debounce (no static/default list)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setPlacePredictions([]);
      setIsSearchingPlaces(false);
      return;
    }

    setIsSearchingPlaces(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlacesWithGoogle(searchQuery.trim());
        setPlacePredictions(results);
      } catch (err) {
        console.warn('Google Places autocomplete search error:', err);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAllowLocation = async () => {
    setIsLoading(true);
    try {
      const geoResult = await detectCurrentLocationWithGps();
      setIsLoading(false);
      if (geoResult?.shortLocation && geoResult.shortLocation !== 'Current Location') {
        storageService.setString('user_selected_city', geoResult.shortLocation);
        navigation.replace('HomeDashboard', {
          selectedCity: geoResult.shortLocation,
        });
      } else {
        // If GPS couldn't resolve text address, prompt user to search or confirm
        setIsModalVisible(true);
      }
    } catch (error) {
      setIsLoading(false);
      setIsModalVisible(true);
    }
  };

  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    const cityName = prediction.description;
    setIsModalVisible(false);
    setSearchQuery('');
    setPlacePredictions([]);
    storageService.setString('user_selected_city', cityName);

    // Resolve and save coordinates dynamically
    getPlaceCoordinates(prediction.placeId, cityName);

    navigation.replace('HomeDashboard', {
      selectedCity: cityName,
    });
  };

  const handleCustomCitySubmit = async () => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.trim();
      setIsModalVisible(false);
      setSearchQuery('');
      setPlacePredictions([]);
      storageService.setString('user_selected_city', query);

      geocodeAddress(query);

      navigation.replace('HomeDashboard', {
        selectedCity: query,
      });
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 justify-between">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Header with Back Navigation */}
      <HeaderBar onBackPress={() => navigation.goBack()} />

      {/* Middle Illustration & Text */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-6 items-center justify-center">
          <Image
            source={require('../../assets/images/4th.png')}
            style={{ width: 220, height: 220 }}
            resizeMode="contain"
          />
        </View>

        <Text style={{ color: colors.text }} className="text-2xl font-extrabold tracking-tight text-center">
          Find vehicles near you
        </Text>

        <Text style={{ color: colors.textSecondary }} className="text-sm font-normal text-center mt-2.5 leading-relaxed max-w-[280px]">
          Allow location access to see available drivers around your current location.
        </Text>
      </View>

      {/* Bottom CTAs */}
      <View className="px-6 pb-8 space-y-3">
        <Button
          title={isLoading ? 'Detecting GPS Location...' : 'Allow Location'}
          variant="primary"
          size="lg"
          loading={isLoading}
          disabled={isLoading}
          onPress={handleAllowLocation}
          className="w-full"
        />

        <View className="mt-3">
          <Button
            title="Choose Location Manually"
            variant="outline"
            size="lg"
            disabled={isLoading}
            onPress={() => setIsModalVisible(true)}
            className="w-full"
          />
        </View>
      </View>

      {/* Dynamic Searchable Location Selector Modal via Google Places API */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/50"
        >
          <View style={{ backgroundColor: colors.card }} className="rounded-t-3xl p-6 max-h-[85%]">
            {/* Modal Header */}
            <View
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between pb-3 border-b"
            >
              <View>
                <Text style={{ color: colors.text }} className="text-lg font-bold">
                  Select Your Pickup Location
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                  Search live on Google Maps by city, area, or landmark
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setSearchQuery('');
                  setPlacePredictions([]);
                }}
                style={{ backgroundColor: colors.surface }}
                className="p-1.5 rounded-full"
              >
                <Text style={{ color: colors.textSecondary }} className="font-bold text-sm">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Live Search Input Bar */}
            <View
              style={{
                borderColor: colors.border,
                backgroundColor: colors.input,
              }}
              className="my-3 flex-row items-center border rounded-xl px-3.5 h-12"
            >
              <SearchIcon size={18} color={colors.placeholder} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search city, station, airport, area..."
                placeholderTextColor={colors.placeholder}
                returnKeyType="search"
                onSubmitEditing={handleCustomCitySubmit}
                autoCorrect={false}
                style={{ color: colors.text }}
                className="flex-1 ml-2.5 text-sm font-semibold h-full p-0"
              />
              {isSearchingPlaces ? (
                <ActivityIndicator size="small" color={colors.primary} className="mr-1" />
              ) : searchQuery.length > 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setPlacePredictions([]);
                  }}
                  className="p-1"
                >
                  <Text style={{ color: colors.placeholder }} className="text-xs font-bold">✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Quick Option: Use Current GPS Location */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleAllowLocation}
              disabled={isLoading}
              style={{
                backgroundColor: `${colors.primary}15`,
                borderColor: `${colors.primary}30`,
              }}
              className="flex-row items-center p-3 mb-3 rounded-xl border"
            >
              <View style={{ backgroundColor: colors.primary }} className="w-8 h-8 rounded-full items-center justify-center mr-2.5">
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <LocationMarkerIcon size={16} color="#FFFFFF" />
                )}
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.primary }} className="text-xs font-bold">
                  {isLoading ? 'Detecting GPS Location via Google Maps...' : 'Use Current GPS Location'}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-[11px]">
                  Detect live GPS coordinates & reverse geocode
                </Text>
              </View>
            </TouchableOpacity>

            {/* Scrollable Live Results List */}
            {searchQuery.trim().length >= 2 ? (
              <ScrollView
                className="mt-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {isSearchingPlaces && placePredictions.length === 0 ? (
                  <View className="py-8 items-center justify-center">
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-2">
                      Searching Google Maps...
                    </Text>
                  </View>
                ) : placePredictions.length === 0 ? (
                  <View className="py-6 items-center justify-center px-4">
                    <Text style={{ color: colors.textSecondary }} className="text-xs text-center mb-3">
                      No Google Maps results found for "{searchQuery.trim()}".
                    </Text>
                    <TouchableOpacity
                      onPress={handleCustomCitySubmit}
                      style={{ backgroundColor: colors.primary }}
                      className="px-5 py-2.5 rounded-xl"
                    >
                      <Text className="text-white text-xs font-bold">Use "{searchQuery.trim()}" directly</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1">
                      Google Maps Suggestions
                    </Text>
                    {placePredictions.map(pred => (
                      <TouchableOpacity
                        key={pred.placeId}
                        activeOpacity={0.7}
                        onPress={() => handleSelectPrediction(pred)}
                        style={{ borderBottomColor: colors.border }}
                        className="flex-row items-center py-3 px-2 border-b rounded-lg"
                      >
                        <View
                          style={{ backgroundColor: `${colors.primary}15` }}
                          className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        >
                          <LocationMarkerIcon size={16} color={colors.primary} />
                        </View>
                        <View className="flex-1 pr-2">
                          <Text style={{ color: colors.text }} className="text-sm font-bold" numberOfLines={1}>
                            {pred.mainText}
                          </Text>
                          {pred.secondaryText ? (
                            <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5" numberOfLines={1}>
                              {pred.secondaryText}
                            </Text>
                          ) : null}
                        </View>
                        <ChevronRightIcon size={14} color={colors.textSecondary} />
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            ) : (
              <View className="py-8 items-center justify-center px-4">
                <Text style={{ color: colors.textSecondary }} className="text-xs text-center leading-relaxed">
                  Type 2 or more characters to search any city, landmark, or area in India live on Google Maps.
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};
