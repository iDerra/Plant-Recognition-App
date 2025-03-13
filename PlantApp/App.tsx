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
  Platform,
  ScrollView,
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


  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const storedApiKey = await AsyncStorage.getItem('plantnetApiKey');
        if (storedApiKey !== null) {
          setSavedApiKey(storedApiKey);
        }
      } catch (e) {
        console.error("Error loading API key:", e);
        Alert.alert('Error', 'Failed to load API key.');
      }
    };
    loadApiKey();
    //Added this
    if (route.params?.apiKey) {
        setSavedApiKey(route.params.apiKey);
    }

    const testApiKey = async () => {
      if (savedApiKey) { //Only if Key exist
        try {
          const testUrl = `https://my-api.plantnet.org/v2/identify/all?api-key=${savedApiKey}&organs=leaf`; //Simplified URL for testing
          const response = await fetch(testUrl);
          console.log("Test API Response Status:", response.status);
          const data = await response.json(); //Try get the data
          console.log("Test API Response Data:", data);
        } catch (error) {
          console.error("Test API Error:", error);
        }
    }
    };

  testApiKey(); // Call the test function

    if (route.params?.apiKey) {
      setSavedApiKey(route.params.apiKey);
    }
  }, [route.params?.apiKey]); //  Key change:  Listen for changes to route.params?.apiKey

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
    setPlantData(null); // Clear previous results
    try {
      const uri = await pickImageFromGallery(); // Call pickImageFromGallery
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
      console.error("Error picking image from gallery:", error);
      Alert.alert("Error", "Failed to pick image from gallery.");
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
          <Button
            title="Take Picture"
            onPress={handleTakePicture}
            disabled={isLoading}
          />
        </View>
        <Button title="Choose from Gallery" onPress={handleChooseFromGallery} disabled={isLoading} />
        {imageSource && (
          <Image
            source={{ uri: imageSource }}
            style={styles.image}
            resizeMode="contain"
          />
        )}

        {isLoading && <Text>Identifying plant...</Text>}

        {plantData && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Identification Results:</Text>
            <Text>Best Match: {plantData.bestMatch}</Text>
             {plantData.results.map((result: any, index: number) => (
                <View key={index} style={styles.resultItem}>
                  <Text>Species: {result.species.scientificNameWithoutAuthor}</Text>
                  <Text>Score: {result.score.toFixed(2)}</Text>
                </View>
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const Stack = createStackNavigator();

const App = () => {

    const handleSaveApiKey = (apiKey: string) => { // Define onSave here
        setSavedApiKey(apiKey);
      };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        {/* Pass onSave to SettingsScreen */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
          initialParams={{ onSave: handleSaveApiKey }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

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
  },
  image: {
    width: '80%',
    height: 300,
    alignSelf: 'center',
    marginBottom: 20,
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
    resultItem:{
      marginBottom:15,
    },
});

export default App;