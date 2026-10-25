import { PermissionsAndroid, Platform, NativeModules } from 'react-native';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';

export const GOOGLE_MAPS_API_KEY = 'AIzaSyBeGZHlLJ9zoKsrB_W60MmYlumItxaZrmI';

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



/**
 * Request OS Location Permission (Android / iOS)
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'GaadiMitra Location Access',
          message:
            'GaadiMitra needs your live GPS location to find nearby verified drivers and vehicles for quick ride booking.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow GPS',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission request error:', err);
      return false;
    }
  }

  return false;
};

/**
 * Reverse Geocode GPS coordinates using Google Geocoding API with MAP_KEY
 */
export const reverseGeocodeCoordinates = async (
  latitude: number,
  longitude: number
): Promise<GeocodedAddress> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const firstResult = data.results[0];
      const components = firstResult.address_components || [];

      let sublocality = '';
      let locality = '';
      let administrativeArea = '';
      let postalCode = '';

      for (const comp of components) {
        const types: string[] = comp.types || [];
        if (types.includes('sublocality') || types.includes('neighborhood')) {
          sublocality = comp.long_name;
        } else if (types.includes('locality')) {
          locality = comp.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          administrativeArea = comp.long_name;
        } else if (types.includes('postal_code')) {
          postalCode = comp.long_name;
        }
      }

      const primaryArea = sublocality || locality || 'Current Location';
      const cityOrState = locality || administrativeArea || 'Patna';
      const shortLocation = `${primaryArea}, ${cityOrState}`;

      return {
        fullAddress: firstResult.formatted_address || shortLocation,
        shortLocation,
        city: locality || cityOrState,
        state: administrativeArea,
        postalCode,
        coordinates: { latitude, longitude },
      };
    }
  } catch (error) {
    console.warn('Google Reverse Geocoding API error:', error);
  }

  // Fallback if network/offline
  return {
    fullAddress: 'Patna Junction, Patna, Bihar, India',
    shortLocation: 'Patna Junction, Patna',
    city: 'Patna',
    state: 'Bihar',
    coordinates: { latitude, longitude },
  };
};

/**
 * Get device current location with GPS permission check and reverse geocoding
 */
export const detectCurrentLocationWithGps = async (): Promise<Coordinates> => {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    console.warn('Location permission not granted');
    return { latitude: 0, longitude: 0 };
  }

  // 1. Primary: react-native-geolocation-service
  try {
    const pos = await new Promise<GeoPosition>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (error) => {
          console.warn('Geolocation service error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        }
      );
    });

    if (pos?.coords) {
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    }
  } catch (err) {
    console.warn('Geolocation service failed, trying native DeviceLocationModule:', err);
  }

  // 2. Secondary fallback: Native DeviceLocationModule
  if (NativeModules?.DeviceLocationModule?.getCurrentPosition) {
    try {
      const pos = await NativeModules.DeviceLocationModule.getCurrentPosition();
      if (pos?.latitude && pos?.longitude) {
        return {
          latitude: pos.latitude,
          longitude: pos.longitude,
        };
      }
    } catch (nativeErr) {
      console.warn('DeviceLocationModule error:', nativeErr);
    }
  }

  // Fallback if both fail
  return { latitude: 0, longitude: 0 };
};

/**
 * Builds Google Static Map URL with user location & driver markers
 */
export const buildGoogleStaticMapUrl = (
  center: Coordinates,
  drivers: { latitude: number; longitude: number; label?: string }[],
  zoom = 14,
  width = 600,
  height = 400
): string => {
  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
  const sizeParam = `size=${width}x${height}&scale=2`;
  const centerParam = `center=${center.latitude},${center.longitude}&zoom=${zoom}`;
  const mapTypeParam = 'maptype=roadmap';

  // User location marker (Blue)
  const userMarker = `markers=color:blue%7Clabel:U%7C${center.latitude},${center.longitude}`;

  // Drivers markers (Red/Orange)
  const driverMarkers = drivers
    .map(
      (d, i) =>
        `markers=color:red%7Clabel:${d.label || (i + 1)}%7C${d.latitude},${d.longitude}`
    )
    .join('&');

  const keyParam = `key=${GOOGLE_MAPS_API_KEY}`;

  return `${baseUrl}?${centerParam}&${sizeParam}&${mapTypeParam}&${userMarker}&${driverMarkers}&${keyParam}`;
};
