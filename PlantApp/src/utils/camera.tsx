import { launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { Alert } from 'react-native';
import { requestCameraPermission } from './permissions';

export const takePictureAndGetUri = async (): Promise<string | null> => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
        return null;
    }

    const options = {
        mediaType: 'photo',
        quality: 0.5,
        saveToPhotos: true,
    };

    return new Promise((resolve) => {
        launchCamera(options, (response: ImagePickerResponse) => {
            if (response.didCancel) {
                console.log('The user cancelled the image capture');
                resolve(null);
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                Alert.alert("Error", response.errorMessage || "Unknown error when taking the photo");
                resolve(null);
            } else {
                const firstAsset = response.assets && response.assets[0];
                if (firstAsset && firstAsset.uri) {
                resolve(firstAsset.uri);
                } else {
                resolve(null);
                }
            }
        });
    });
};