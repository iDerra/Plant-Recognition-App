// App.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal, // Import Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { takePictureAndGetUri, pickImageFromGallery, resizeImage } from './src/utils/camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from './src/SettingsScreen';
import { identifyPlant } from './src/utils/plantnetApi';


const HomeScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [savedApiKey, setSavedApiKey] = useState('');
  const [plantHistory, setPlantHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // For showing results
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [identificationResults, setIdentificationResults] = useState<any[]>([]); // Store results

  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth * 0.15;
  const resultImageSize = screenWidth / 4;


  useEffect(() => {
       const loadData = async () => {
      try {
        const storedApiKey = await AsyncStorage.getItem('plantnetApiKey');
        if (storedApiKey !== null) {
          setSavedApiKey(storedApiKey);
        }
        const storedHistory = await AsyncStorage.getItem('plantHistory');
        if (storedHistory !== null) {
          setPlantHistory(JSON.parse(storedHistory));
        }
      } catch (e) {
        console.error("Error loading data:", e);
        Alert.alert('Error', 'Failed to load data.');
      }
    };
    loadData();
      if (route.params?.apiKey) {
            setSavedApiKey(route.params.apiKey);
        }

  }, [route.params?.apiKey, navigation]);

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


  const handleSettingsPress = () => {
    navigation.navigate('Settings', { savedApiKey: savedApiKey });
  };

  const handleTakePicture = async () => {
    await handleImageCapture(takePictureAndGetUri);
  };

  const handleChooseFromGallery = async () => {
    await handleImageCapture(pickImageFromGallery);
  };

  const handleImageCapture = async (captureFunction: () => Promise<string | null>) => {
    setIsLoading(true);
    try {
      const uri = await captureFunction();
      if (uri) {
        const resizedImageUri = await resizeImage(uri);
        setSelectedImageUri(resizedImageUri); // Store resized image URI

        if (savedApiKey) {
          const data = await identifyPlant(resizedImageUri, savedApiKey);
          if (data && data.results && data.results.length > 0) {
            // Store the results and show the modal
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

  // NEW: Function to handle selection from the modal
  const handleResultSelection = (selectedPlant: any) => {
    if (selectedImageUri) {
      setPlantHistory(prevHistory => [
          {
              id: Date.now().toString(),
              imageUri: selectedImageUri, //Keep the resized image
              scientificName: selectedPlant.species.scientificNameWithoutAuthor,
              commonName: selectedPlant.species.commonNames ? selectedPlant.species.commonNames[0] : 'N/A',
              bestMatch: selectedPlant.species.scientificNameWithoutAuthor,  //Use scientific name
          },
          ...prevHistory.slice(0, 29),
      ]);
    }
    setModalVisible(false);
    setIdentificationResults([]);
    setSelectedImageUri(null); // Reset after use
  };

  const renderItem = ({ item }: { item: any }) => (
    // ... (same as before) ...
    <View style={styles.listItem}>
      <View style={[styles.imageContainer, { width: imageSize, height: imageSize }]}>
        <Image source={{ uri: item.imageUri }} style={styles.listItemImage} resizeMode="cover" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.scientificName}>{item.scientificName}</Text>
        <Text style={styles.commonName}>Common Name: {item.commonName}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Plant AI</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <Icon name="cog" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Take Picture" onPress={handleTakePicture} disabled={isLoading} />
        <Button title="Choose from Gallery" onPress={handleChooseFromGallery} disabled={isLoading} />
      </View>

      {isLoading && <Text>Identifying plant...</Text>}

      {/* Plant History List */}
      <FlatList
        data={plantHistory.slice(0, 10)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyListText}>No plants identified yet.</Text>}
      />

      {/* Modal for displaying identification results */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          setIdentificationResults([]);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Select the Correct Plant:</Text>
            {identificationResults.map((result, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.modalItem}
                    onPress={() => handleResultSelection(result)} //Important!
                >
                    {result.images && result.images.length > 0 && (
                        <View style={[styles.resultImageContainer, { width: resultImageSize, height: resultImageSize }]}>
                        <Image
                        source={{ uri: result.images[0].url.m }}
                        style={styles.resultImage}
                        resizeMode="cover"
                        />
                        </View>
                    )}
                    <View style={styles.modalTextContainer}>
                        <Text style={styles.modalScientificName}>{result.species.scientificNameWithoutAuthor}</Text>
                        <Text style={styles.modalCommonName}>
                            Common Name: {result.species.commonNames ? result.species.commonNames[0] : 'N/A'}
                        </Text>
                        <Text>Score: {result.score.toFixed(2)}</Text>
                    </View>

                </TouchableOpacity>
            ))}
            <Button title="Cancel" onPress={() => {setModalVisible(!modalVisible); setIdentificationResults([])}} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
);

const styles = StyleSheet.create({
 // ... (other styles) ...
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsButton: {
    padding: 5,
    paddingTop: 45,
    position: 'absolute',
    right: 10,
  },
  buttonContainer: {
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
    imageContainer: {
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  listItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  listItemImage: {
     flex: 1,
    width: undefined,
    height: undefined,
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  scientificName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commonName: {
    fontSize: 14,
  },
    emptyListText:{
     textAlign: 'center',
     marginTop: 20,
        fontSize:16
  },
  // New styles for the modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Set a width for the modal
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalItem: {
    marginBottom: 10,
    width: '100%',
    alignItems: 'center', // Center items horizontally
  },
  modalTextContainer: {
      width: "100%",
      alignItems: "center"
  },
  modalScientificName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCommonName: {
    fontSize: 14,
  },
  resultImageContainer: {
    marginTop: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  resultImage: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
});

export default App;