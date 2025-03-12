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
  Platform, // Import Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { takePictureAndGetUri } from './src/utils/camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from './src/SettingsScreen';

const HomeScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [savedApiKey, setSavedApiKey] = useState('');

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

    if (route.params?.apiKey) {
      setSavedApiKey(route.params.apiKey);
    }
  }, [route.params?.apiKey]);

  const handleSettingsPress = () => {
    navigation.navigate('Settings', { savedApiKey: savedApiKey });
  };

  return (
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
          onPress={async () => {
            const uri = await takePictureAndGetUri();
            if (uri) {
              setImageSource(uri);
            }
          }}
        />
      </View>
      {imageSource && (
        <Image
          source={{ uri: imageSource }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center', // Center content horizontally
    alignItems: 'center', // Center content vertically
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center', // Ensure text itself is centered
  },
  settingsButton: {
    padding: 5,
    paddingTop: 45,
    position: 'absolute', // Position absolutely
    right: 10,         // 10 pixels from the right edge

  },
  buttonContainer: {
    margin: 20,
  },
  image: {
    flex: 1,
    width: '80%',
    alignSelf: 'center',
  },
});

export default App;