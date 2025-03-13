// App.tsx (or HomeScreen.tsx)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { takePictureAndGetUri, pickImageFromGallery } from './src/utils/camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from './src/SettingsScreen';
import { identifyPlant } from './src/utils/plantNetAPI';

const HomeScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [savedApiKey, setSavedApiKey] = useState('');
  const [plantData, setPlantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth * 0.8;
  const resultImageSize = screenWidth / 4; // Smaller images for results

  useEffect(() => {
        const loadApiKey = async () => {
            try {
                const storedApiKey = await AsyncStorage.getItem('plantnetApiKey');
                if (storedApiKey !== null) {
                    setSavedApiKey(storedApiKey);
                }
            } catch (error) {
                console.error('Error al cargar la clave de API:', error);
                Alert.alert('Error', 'No se pudo cargar la clave de API.');
            }
        };

        loadApiKey();

        if (route.params?.apiKey) {
            setSavedApiKey(route.params.apiKey);
        }
    }, [route.params?.apiKey, navigation]);


  const handleSettingsPress = () => {
    navigation.navigate('Settings', { savedApiKey: savedApiKey });
  };

  const handleTakePicture = async () => {
    setIsLoading(true);
    setPlantData(null);
    try {
      const uri = await takePictureAndGetUri();
      if (uri) {
        setImageSource(uri);
        if (savedApiKey) {
          const data = await identifyPlant(uri, savedApiKey);
          setPlantData(data);
        } else {
          Alert.alert("Error", "API Key not found. Please set it in Settings.");
        }
      }
    } catch (error) {
      console.error("Error taking picture or identifying plant:", error);
      Alert.alert("Error", "Failed to take picture or identify plant.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseFromGallery = async () => {
    setIsLoading(true);
    setPlantData(null);
    try {
      const uri = await pickImageFromGallery();
      if (uri) {
        setImageSource(uri);
        if (savedApiKey) {
          const data = await identifyPlant(uri, savedApiKey);
          setPlantData(data);
        } else {
          Alert.alert("Error", "API Key not found. Please set it in Settings.");
        }
      }
    } catch (error) {
      console.error("Error picking image or identifying plant:", error);
      Alert.alert("Error", "Failed to pick image or identify plant.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        {imageSource && (
          <View style={[styles.imageContainer, { width: imageSize, height: imageSize }]}>
            <Image
              source={{ uri: imageSource }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {isLoading && <Text>Identifying plant...</Text>}

        {/* Display Results WITH Images */}
        {plantData && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Identification Results:</Text>
            <Text>Best Match: {plantData.bestMatch}</Text>
            {plantData.results.map((result: any, index: number) => (
              <View key={index} style={styles.resultItem}>
                <Text>Species: {result.species.scientificNameWithoutAuthor}</Text>
                <Text>Score: {result.score.toFixed(2)}</Text>
                {/* Display Result Image */}
                {result.images && result.images.length > 0 && (
                  <View style={[styles.resultImageContainer, { width: resultImageSize, height: resultImageSize }]}>
                    <Image
                      source={{ uri: result.images[0].url.m }} // Use medium size ('m')
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
  },
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
  image: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
  resultsContainer: {
    margin: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    marginBottom: 15,
  },
  resultImageContainer: { // Style for the result image container
    marginTop: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  resultImage: { // Style for the result image
    flex: 1,
    width: undefined, // Important
    height: undefined, // Important
  },
});

export default App;