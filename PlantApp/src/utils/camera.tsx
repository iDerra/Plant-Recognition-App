import { launchCamera, launchImageLibrary, ImagePickerResponse, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import { Alert } from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import { requestCameraPermission } from './permissions';

/**
 * Takes a picture using the device camera and returns the URI of the captured image.
 * @returns A Promise that resolves with the image URI (string) or null if canceled or an error occurred.
 */
export const takePictureAndGetUri = async (): Promise<string | null> => {
    // Request camera and storage permissions.
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
        return null;
    }

    // Configuration options for the camera.
    const options: CameraOptions = {
        mediaType: 'photo',
        quality: 1.0,
        saveToPhotos: false, // Do not save to the photo library automatically.
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

/**
 * Opens the image gallery and allows the user to pick an image.
 * @returns A Promise that resolves with the image URI (string) or null if canceled or an error occurred.
 */
export const pickImageFromGallery = async (): Promise<string | null> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
        return null;
    }

    // Options for the image library.
    const options: ImageLibraryOptions = {
        mediaType: 'photo',
        quality: 1.0,
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

/**
 * Resizes an image to a specified width, height, and quality.
 * @param uri The URI of the image to resize.
 * @returns A Promise that resolves with the URI of the resized image.
 * @throws An error if resizing fails.
 */
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