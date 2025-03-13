import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

import { stylesSettings } from './styles/SettingsStyles';
import { stylesApp } from './styles/AppStyles';

interface Props {
  navigation: any;
  route: any;
}

const SettingsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [apiKey, setApiKey] = useState('');
  const savedApiKey = route.params?.savedApiKey;

  // useEffect hook to set the API key state when the savedApiKey changes.
  useEffect(() => {
    setApiKey(savedApiKey);
  }, [savedApiKey]);

  // Function to handle saving the API key to AsyncStorage.
  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('plantnetApiKey', apiKey);
      Alert.alert('Success', 'API key saved successfully!');
      navigation.navigate('Home', { apiKey: apiKey });
    } catch (e) {
      console.error("Error saving API key:", e);
      Alert.alert('Error', 'Failed to save API key.');
    }
  };

  // Function to handle the back button press.
  const handleBackPress = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={stylesSettings.outerContainer}>
      {/* Header section with title and back button. */}
      <View style={stylesApp.header}>
        <Text style={stylesApp.headerText}>Pl@ntNet API Key</Text>
        <TouchableOpacity style={stylesApp.backButton} onPress={handleBackPress}>
          <Icon name="angle-left" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={stylesSettings.container}>
        {/* TextInput for entering the API key. */}
        <TextInput
          style={stylesSettings.input}
          placeholder="Enter your API key"
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry={false}
        />
        {/* Container for the Save and Cancel buttons. */}
        <View style={stylesSettings.buttonContainer}>
          <TouchableOpacity style={[stylesApp.button, stylesApp.buttonSave]} onPress={handleSave}>
            <Text style={stylesApp.textStyle}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[stylesApp.button, stylesApp.buttonCancel]}
            onPress={() => navigation.goBack()}
          >
            <Text style={stylesApp.textStyle}>Cancel</Text>
          </TouchableOpacity>
        </View>
        {/* PlantNet logo. */}
        <Image 
          source={require('./components/powered-by-plantnet-light.png')}
          style={stylesSettings.image}
          resizeMode="contain"
        />
        {/* Informational text about the PlantNet API. */}
        <Text style={stylesSettings.info}>The image-based plant species identification service used, is based on the Pl@ntNet recognition API, regularly updated and accessible through the site https://my.plantnet.org/</Text>
      </View>
  </View>
  );
};

export default SettingsScreen;