import { launchCamera, launchImageLibrary, ImagePickerResponse, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import { Alert } from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import { requestCameraPermission } from './permissions';

export const takePictureAndGetUri = async (): Promise<string | null> => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
        return null;
    }

    const options: CameraOptions = {
        mediaType: 'photo',
        quality: 0.5,
        saveToPhotos: false,
    };

    return new Promise((resolve) => {
        launchCamera(options, (response: ImagePickerResponse) => {
            if (response.didCancel) {
                console.log('The user cancelled the image capture');
                resolve(null);
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                Alert.alert('Error', response.errorMessage || 'Unknown error when taking the photo');
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


export const pickImageFromGallery = async (): Promise<string | null> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
        return null;
    }

    const options: ImageLibraryOptions = {
        mediaType: 'photo',
        quality: 0.5,
    };

    return new Promise((resolve) => {
        launchImageLibrary(options, (response: ImagePickerResponse) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
                resolve(null);
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                Alert.alert("Error", response.errorMessage || "Unknown error picking image");
                resolve(null);
            } else {
                const firstAsset = response.assets && response.assets[0];
                if(firstAsset && firstAsset.uri) {
                    resolve(firstAsset.uri);
                } else {
                    resolve(null)
                }
            }
        });
    });
};


export const resizeImage = async (uri: string): Promise<string> => {
    try {
        const response = await ImageResizer.createResizedImage(
            uri,      
            512,      
            512,      
            'JPEG',   
            70,       
            0,       
            undefined, 
            false,     
        );
        return response.uri;
    } catch (error) {
        console.error("Error resizing image:", error);
        throw error;
    }
};