import { PermissionsAndroid, Platform, Alert } from 'react-native';

/**
 * Requests camera and storage permissions on Android.  Returns `true` if granted, `false` otherwise.
 * For non-Android platforms, it assumes permissions are granted and returns `true`.
 */
export const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES, 
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            ]);

            if (
                granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
                (granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED ||
                granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
                PermissionsAndroid.RESULTS.GRANTED)
            ) {
                return true;
            } else {
                Alert.alert(
                    'Permissions Denied',
                    'Camera and storage permissions are required to use this feature.'
                );
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    } else {
        return true;
    }
};