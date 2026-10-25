import { PermissionsAndroid, Platform, Alert } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';

const cameraOptions: CameraOptions = {
  mediaType: 'photo',
  saveToPhotos: true,
  quality: 0.8,
  maxWidth: 1280,
  maxHeight: 1280,
};

const galleryOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1280,
  maxHeight: 1280,
  selectionLimit: 1,
};

/**
 * Request camera permission explicitly
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (hasPermission) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission Required',
        message:
          'Gaadimitra Partner needs access to your camera so you can take your profile photo, vehicle pictures, and documents.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Deny',
        buttonPositive: 'Allow Camera',
      }
    );

    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission request error:', err);
    return false;
  }
};

/**
 * Request storage / media permission explicitly
 */
export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    if (Platform.Version >= 33) {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );
      if (hasPermission) return true;

      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'Photo Library Permission Required',
          message:
            'Gaadimitra Partner needs access to your photos so you can upload your driver profile photo and vehicle images.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow Access',
        }
      );
      return status === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      if (hasPermission) return true;

      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message:
            'Gaadimitra Partner needs storage access to select photos from your device.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow Access',
        }
      );
      return status === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.warn('Storage permission request error:', err);
    return true;
  }
};

/**
 * Capture photo from camera with permission check
 */
export const pickFromCamera = async (): Promise<string | null> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    Alert.alert(
      'Camera Permission Required',
      'Please allow camera permission in settings to take photos for your driver profile.'
    );
    return null;
  }

  try {
    const result: ImagePickerResponse = await launchCamera(cameraOptions);
    if (result.didCancel) return null;
    if (result.errorCode) {
      Alert.alert('Camera Error', result.errorMessage || 'Unable to open camera');
      return null;
    }
    if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
      return result.assets[0].uri;
    }
  } catch (e: any) {
    console.warn('Error launching camera:', e);
    Alert.alert('Camera Error', 'Could not open camera on this device.');
  }
  return null;
};

/**
 * Pick image from gallery with permission check
 */
export const pickFromGallery = async (): Promise<string | null> => {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) {
    Alert.alert(
      'Photo Access Required',
      'Please allow photo library permission to select photos from your device.'
    );
    return null;
  }

  try {
    const result: ImagePickerResponse = await launchImageLibrary(galleryOptions);
    if (result.didCancel) return null;
    if (result.errorCode) {
      Alert.alert('Gallery Error', result.errorMessage || 'Unable to open gallery');
      return null;
    }
    if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
      return result.assets[0].uri;
    }
  } catch (e: any) {
    console.warn('Error launching gallery:', e);
    Alert.alert('Gallery Error', 'Could not open gallery on this device.');
  }
  return null;
};
