// src/utils/camera.ts
import { launchCamera, launchImageLibrary, ImagePickerResponse, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import ImageResizer from 'react-native-image-resizer';


export const requestCameraPermission = async () => { //No changes
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES, // For Android 13+
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, // For Android < 13
            ]);

            if (
                granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
                (granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED ||
                    granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED)
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
      return true
    }
};

export const takePictureAndGetUri = async (): Promise<string | null> => { //No changes
  const hasPermission = await requestCameraPermission();

  if (!hasPermission) {
    return null;
  }

  const options: CameraOptions = {
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


export const pickImageFromGallery = async (): Promise<string | null> => { //No changes
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
            uri,      // Original image URI
            512,      // New width
            512,      // New height
            'JPEG',   // Format (JPEG or PNG)
            70,       // Quality (0-100)
            0,       // Rotation (optional)
            undefined, // Output directory (undefined uses cache directory)
            false,     // Keep aspect ratio (true by default, but making it explicit)
            {
                //mode: 'contain', // You can specify mode: 'contain', 'cover', or 'stretch'. contain by default
                onlyScaleDown: true, // Important: prevent upscaling
            }

        );
         return response.uri; // Return the URI of the resized image
    } catch (error) {
        console.error("Error resizing image:", error);
        throw error; // Re-throw the error so the caller can handle it
    }
};