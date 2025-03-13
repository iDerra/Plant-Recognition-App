// SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
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

  useEffect(() => {
    setApiKey(savedApiKey);
  }, [savedApiKey]);

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

  const handleBackPress = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={stylesSettings.outerContainer}>
    <View style={stylesApp.header}>
      <Text style={stylesApp.headerText}>Pl@ntNet API Key</Text>
      <TouchableOpacity style={stylesApp.backButton} onPress={handleBackPress}>
        <Icon name="angle-left" size={28} color="#fff" />
      </TouchableOpacity>
    </View>

    <View style={stylesSettings.container}>
      <TextInput
        style={stylesSettings.input}
        placeholder="Enter your API key"
        value={apiKey}
        onChangeText={setApiKey}
        secureTextEntry={false}
      />
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
    </View>
  </View>
  );
};

export default SettingsScreen;