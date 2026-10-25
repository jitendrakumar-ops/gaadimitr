import { PermissionsAndroid, Platform, NativeModules } from 'react-native';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import { storageService } from '../services/storage';

declare const process: any;

export const GOOGLE_MAPS_API_KEY =
  (typeof process !== 'undefined' && (process.env?.MAP_KEY || process.env?.GOOGLE_MAPS_API_KEY)) ||
  'AIzaSyBeGZHlLJ9zoKsrB_W60MmYlumItxaZrmI';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodedAddress {
  fullAddress: string;
  shortLocation: string;
  city: string;
  state: string;
  postalCode?: string;
  coordinates: Coordinates;
}

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

const dynamicCoordinatesCache = new Map<string, Coordinates>();

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const fine = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    const coarse = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
    if (fine || coarse) return true;

    const res = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);
    return (
      res[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
      res[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
};

export const reverseGeocodeCoordinates = async (
  latitude: number,
  longitude: number
): Promise<GeocodedAddress> => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    if (data.status === 'OK' && data.results?.[0]) {
      const first = data.results[0];
      const comps = first.address_components || [];
      const getVal = (...types: string[]) =>
        comps.find((c: any) => types.some((t) => c.types.includes(t)))?.long_name || '';

      const sub = getVal('sublocality_level_1', 'sublocality', 'neighborhood');
      const loc = getVal('locality', 'administrative_area_level_2');
      const state = getVal('administrative_area_level_1');
      const shortLocation =
        sub && loc && sub !== loc ? `${sub}, ${loc}` : sub || loc || state || 'Current Location';

      const result: GeocodedAddress = {
        fullAddress: first.formatted_address || shortLocation,
        shortLocation,
        city: loc,
        state,
        postalCode: getVal('postal_code'),
        coordinates: { latitude, longitude },
      };

      dynamicCoordinatesCache.set(shortLocation.toLowerCase(), { latitude, longitude });
      storageService.setObject('user_selected_coords', { latitude, longitude });
      return result;
    }
  } catch (err) {
    console.warn('Reverse geocode error:', err);
  }

  return {
    fullAddress: 'Current Location',
    shortLocation: 'Current Location',
    city: '',
    state: '',
    coordinates: { latitude, longitude },
  };
};

export const detectCurrentLocationWithGps = async (): Promise<GeocodedAddress> => {
  await requestLocationPermission();

  // 1. Primary: react-native-geolocation-service
  try {
    const pos = await new Promise<GeoPosition>((resolve, reject) => {
      Geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
        forceRequestLocation: true,
        showLocationDialog: true,
      });
    });

    if (pos?.coords) {
      return reverseGeocodeCoordinates(pos.coords.latitude, pos.coords.longitude);
    }
  } catch (err) {
    console.warn('Geolocation service error, trying native module:', err);
  }

  // 2. Secondary fallback: Native DeviceLocationModule
  if (NativeModules?.DeviceLocationModule?.getCurrentPosition) {
    try {
      const pos = await NativeModules.DeviceLocationModule.getCurrentPosition();
      if (pos?.latitude && pos?.longitude) {
        return reverseGeocodeCoordinates(pos.latitude, pos.longitude);
      }
    } catch {}
  }

  // 3. Stored coordinates fallback
  const saved = storageService.getObject<Coordinates>('user_selected_coords');
  if (saved?.latitude && saved?.longitude) {
    return reverseGeocodeCoordinates(saved.latitude, saved.longitude);
  }

  return {
    fullAddress: 'Current Location',
    shortLocation: 'Current Location',
    city: '',
    state: '',
    coordinates: { latitude: 0, longitude: 0 },
  };
};

export const searchPlacesWithGoogle = async (query: string): Promise<PlacePrediction[]> => {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query.trim()
      )}&components=country:in&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    if (data.status === 'OK' && Array.isArray(data.predictions)) {
      return data.predictions.map((p: any) => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.structured_formatting?.main_text || p.description,
        secondaryText: p.structured_formatting?.secondary_text || '',
      }));
    }
  } catch {}
  return [];
};

export const getPlaceCoordinates = async (
  placeId: string,
  fallbackAddress?: string
): Promise<Coordinates | null> => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?place_id=${encodeURIComponent(
        placeId
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location;
      const coords = { latitude: lat, longitude: lng };
      if (fallbackAddress) dynamicCoordinatesCache.set(fallbackAddress.trim().toLowerCase(), coords);
      storageService.setObject('user_selected_coords', coords);
      return coords;
    }
  } catch {}

  return fallbackAddress ? geocodeAddress(fallbackAddress) : null;
};

export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  if (!address?.trim()) return null;
  const key = address.trim().toLowerCase();
  if (dynamicCoordinatesCache.has(key)) return dynamicCoordinatesCache.get(key)!;

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location;
      const coords = { latitude: lat, longitude: lng };
      dynamicCoordinatesCache.set(key, coords);
      storageService.setObject('user_selected_coords', coords);
      return coords;
    }
  } catch {}

  return null;
};

export const getCityCoordinates = (cityName: string): Coordinates => {
  if (cityName) {
    const cached = dynamicCoordinatesCache.get(cityName.trim().toLowerCase());
    if (cached) return cached;
  }
  const saved = storageService.getObject<Coordinates>('user_selected_coords');
  if (saved?.latitude && saved?.longitude) return saved;
  return { latitude: 28.6139, longitude: 77.209 };
};
