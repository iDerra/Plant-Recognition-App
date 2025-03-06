import { PermissionsAndroid, Platform, Alert } from 'react-native';

export const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera permission',
                    message: 'The app needs access to the camera to take photos.',
                    buttonNeutral: 'Ask later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
        } else {
            Alert.alert('Camera permission denied!');
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