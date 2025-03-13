import React, { useState, useEffect } from 'react';
import { View, Text, Image, Alert, TouchableOpacity, FlatList, Dimensions, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { takePictureAndGetUri, pickImageFromGallery, resizeImage } from './src/utils/camera';
import SettingsScreen from './src/SettingsScreen';
import { identifyPlant } from './src/utils/plantnetApi';
import FavoritesScreen from './src/FavoritesScreen';
import LoadingDots from './src/components/LoadingDots'; 
import { stylesApp } from './src/styles/AppStyles';
import { confirmAndRemovePlant, toggleFavorite } from './src/utils/plantUtils';

const HomeScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [savedApiKey, setSavedApiKey] = useState('');
  const [plantHistory, setPlantHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [identificationResults, setIdentificationResults] = useState<any[]>([]);
  const [fullScreenImageUri, setFullScreenImageUri] = useState<string | null>(null);
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);
  const [favoritePlants, setFavoritePlants] = useState<any[]>([]);

  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth * 0.15;
  const resultImageSize = screenWidth / 4;

  // useEffect hook to load data from AsyncStorage when the component mounts or when the navigation focus changes,
  // or the apiKey param in route changes.
  useEffect(() => {
      const loadData = async () => {
      try {
        // Retrieve the API key, plant history, and favorite plants from AsyncStorage.
        const storedApiKey = await AsyncStorage.getItem('plantnetApiKey');
        if (storedApiKey !== null) {
          setSavedApiKey(storedApiKey);
        }
        const storedHistory = await AsyncStorage.getItem('plantHistory');
        if (storedHistory !== null) {
          setPlantHistory(JSON.parse(storedHistory));
        }
        const storedFavorites = await AsyncStorage.getItem('favoritePlants');
        if (storedFavorites !== null) {
            setFavoritePlants(JSON.parse(storedFavorites));
        }
      } catch (e) {
        console.error("Error loading data:", e);
        Alert.alert('Error', 'Failed to load data.');
      }
    };
    loadData();

    // Subscribe to the 'focus' event to reload data when the screen comes into focus.
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    // If the API key is passed as a parameter, update the state.
    if (route.params?.apiKey) {
          setSavedApiKey(route.params.apiKey);
    }

  }, [route.params?.apiKey, navigation]);

  // useEffect hook to save the plant history to AsyncStorage whenever it changes.
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('plantHistory', JSON.stringify(plantHistory));
      } catch (e) {
        console.error("Error saving plant history:", e);
        Alert.alert('Error', 'Failed to save plant history.');
      }
    };
    if(plantHistory.length > 0){
        saveData();
    }
  }, [plantHistory]);

  // useEffect hook to save favorite plants whenever the favoritePlants state changes.
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem('favoritePlants', JSON.stringify(favoritePlants));
      } catch (e) {
        console.error("Error saving favorites:", e);
        Alert.alert('Error', 'Failed to save favorites.');
      }
    };

    if(favoritePlants.length > 0){
        saveFavorites();
    }
    }, [favoritePlants]);

  const handleSettingsPress = () => {
    navigation.navigate('Settings', { savedApiKey: savedApiKey });
  };

  const handleTakePicture = async () => {
    await handleImageCapture(takePictureAndGetUri);
  };

  const handleChooseFromGallery = async () => {
    await handleImageCapture(pickImageFromGallery);
  };

  const handleFavoritesPress = () => {
    navigation.navigate('Favorites');
  };

  // Generic function to handle image capture, either from the camera or gallery.
  const handleImageCapture = async (captureFunction: () => Promise<string | null>) => {
    setIsLoading(true);
    try {
      const uri = await captureFunction();
      if (uri) {
        const resizedImageUri = await resizeImage(uri);
        setSelectedImageUri(resizedImageUri);

        if (savedApiKey) {
          const data = await identifyPlant(resizedImageUri, savedApiKey);
          if (data && data.results && data.results.length > 0) {
            
            setIdentificationResults(data.results);
            setModalVisible(true);
          } else {
            Alert.alert("Error", "Could not identify plant.");
          }
        } else {
          Alert.alert("Error", "API Key not found. Please set it in Settings.");
        }
      }
    } catch (error) {
      console.error("Error capturing or identifying plant:", error);
      Alert.alert("Error", "Failed to capture or identify plant.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the selection of a plant from the identification results.
  const handleResultSelection = (selectedPlant: any) => {
    if (selectedImageUri) {
      // Update the plant history with the selected plant's information.
      setPlantHistory(prevHistory => [
          {
              id: Date.now().toString(),
              imageUri: selectedImageUri,
              scientificName: selectedPlant.species.scientificNameWithoutAuthor,
              commonName: selectedPlant.species.commonNames ? selectedPlant.species.commonNames[0] : 'N/A',
              bestMatch: selectedPlant.species.scientificNameWithoutAuthor,
          },
          ...prevHistory.slice(0, 29), // Keep only the 30 most recent entries.
      ]);
    }
    setModalVisible(false);
    setIdentificationResults([]);
    setSelectedImageUri(null);
  };

  const handleDeletePlant = (id: string) => {
    confirmAndRemovePlant(id, setPlantHistory, setFavoritePlants);
  };

  const handleImagePress = (uri: string) => {
    setFullScreenImageUri(uri);
    setFullScreenModalVisible(true);
  };

  const handleToggleFavorite = async (plant: any) => {  
    toggleFavorite(plant, setFavoritePlants);
  };

  // Function to render each item in the plant history list.
  const renderItem = ({ item }: { item: any }) => {
    const isFavorite = favoritePlants.some(favPlant => favPlant.id === item.id);

    return (
      <View style={stylesApp.listItem}>
        {/* TouchableOpacity to open the full-screen image modal. */}
        <TouchableOpacity onPress={() => handleImagePress(item.imageUri)}>
          <View style={[stylesApp.imageContainer, { width: imageSize, height: imageSize }]}>
            <Image source={{ uri: item.imageUri }} style={stylesApp.listItemImage} resizeMode="cover" />
          </View>
        </TouchableOpacity>

        {/* Display the scientific and common names of the plant. */}
        <View style={stylesApp.textContainer}>
          <Text style={stylesApp.scientificName}>{item.scientificName}</Text>
          <Text style={stylesApp.commonName}>Common Name: {item.commonName}</Text>
        </View>

        {/* TouchableOpacity to toggle the favorite status of the plant. */}
        <TouchableOpacity style={stylesApp.favoriteButton} onPress={() => handleToggleFavorite(item)}>
          <Icon name="heart" size={20} color={isFavorite ? 'red' : 'black'} solid={isFavorite}/>
        </TouchableOpacity>

        {/* TouchableOpacity to delete the plant from the history. */}
        <TouchableOpacity style={stylesApp.deleteButton} onPress={() => handleDeletePlant(item.id)}>
          <Icon name="trash" size={20} color="#ff0000" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={stylesApp.container}>
      {/* Header section with navigation buttons and title. */}
      <View style={stylesApp.header}>
        <TouchableOpacity style={stylesApp.favoritesButtonHeader} onPress={handleFavoritesPress}>
          <Icon name="heart" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={stylesApp.headerText}>Plant AI</Text>
        <TouchableOpacity style={stylesApp.settingsButton} onPress={handleSettingsPress}>
          <Icon name="cog" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Buttons for taking a picture and choosing from the gallery. */}
      <View style={stylesApp.buttonContainer}>
        <TouchableOpacity style={stylesApp.tinyButton} onPress={handleTakePicture} disabled={isLoading}>
          <Icon name="camera" size={24} color="#ddd" />
        </TouchableOpacity>
        <TouchableOpacity style={stylesApp.tinyButton} onPress={handleChooseFromGallery} disabled={isLoading}>
          <Icon name="image" size={24} color="#ddd" />
        </TouchableOpacity>
      </View>

      {/* Display loading dots when the identification is in progress. */}
      {isLoading && <LoadingDots />}

      {/* FlatList to display the plant identification history. */}
      <FlatList
        data={plantHistory.slice(0, 10)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={stylesApp.emptyListText}>No plants identified yet.</Text>}
      />

      {/* Modal for displaying plant identification results. */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          setIdentificationResults([]);
        }}
      >
        <View style={stylesApp.centeredView}>
          <View style={stylesApp.modalView}>
            <Text style={stylesApp.modalTitle}>Select the Correct Plant:</Text>

            {/* Map through the identification results and display each option. */}
            {identificationResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={stylesApp.modalItem}
                onPress={() => handleResultSelection(result)}
              >   
                {/* Display the image for the result, if available. */}
                {result.images && result.images.length > 0 && (
                  <View style={[stylesApp.resultImageContainer, { width: resultImageSize, height: resultImageSize }]}>
                    <Image
                      source={{ uri: result.images[0].url.m }}
                      style={stylesApp.resultImage}
                      resizeMode="cover"
                    />
                  </View>
                )}

                {/* Display the scientific name, common name, and score for each result. */}
                <View style={stylesApp.modalTextContainer}>
                  <Text style={stylesApp.modalScientificName}>{result.species.scientificNameWithoutAuthor}</Text>
                  <Text style={stylesApp.modalCommonName}>
                    Common Name: {result.species.commonNames ? result.species.commonNames[0] : 'N/A'}
                  </Text>
                  <Text>Score: {result.score.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Button to cancel and close the modal. */}
            <TouchableOpacity style={[stylesApp.button, stylesApp.buttonCancel]} onPress={() => {setModalVisible(!modalVisible); setIdentificationResults([])}}>
              <Text style={stylesApp.textStyle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal for displaying the full-screen image. */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={fullScreenModalVisible}
        onRequestClose={() => {
          setFullScreenModalVisible(false);
        }}
      >
        <View style={stylesApp.fullScreenContainer}>
          {/* Display the full-screen image. */}
          <Image
            source={{ uri: fullScreenImageUri }}
            style={stylesApp.fullScreenImage}
            resizeMode="contain"
          />
          {/* Button to close the full-screen image modal. */}
          <TouchableOpacity onPress={() => setFullScreenModalVisible(false)}>
            <Icon name="times" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};


// Main App component using Stack Navigator for navigation.
const Stack = createStackNavigator();

const App = () => (
  // NavigationContainer to manage the app's navigation state.
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;