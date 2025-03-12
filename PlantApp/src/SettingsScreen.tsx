import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Props {
  onSave: (apiKey: string) => void;
  savedApiKey: string;
  navigation: any; // Add navigation prop
  route: any;
}

const SettingsScreen: React.FC<Props> = ({ onSave, navigation, route }) => {
  const [apiKey, setApiKey] = useState('');
  const savedApiKey = route.params?.savedApiKey;

  useEffect(() => {
    setApiKey(savedApiKey);  // Load savedApiKey immediately
  }, [savedApiKey]);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('plantnetApiKey', apiKey);
      onSave(apiKey);
      Alert.alert('Success', 'API key saved successfully!');
      navigation.navigate('Home', { apiKey: apiKey }); // Navigate back to the previous screen
    } catch (e) {
      console.error("Error saving API key:", e);
      Alert.alert('Error', 'Failed to save API key.');
    }
  };

  const handleBackPress = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.outerContainer}> {/* Contenedor externo */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Pl@ntNet API Key</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="angle-left" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter your API key"
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry={false}
        />
        <View style={styles.buttonContainer}> {/* Contenedor para los botones */}
          <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={handleSave}>
            <Text style={styles.textStyle}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={() => navigation.goBack()} // Use navigation.goBack()
          >
            <Text style={styles.textStyle}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1, // El contenedor externo ahora ocupa toda la pantalla
    backgroundColor: '#fff', // Opcional: un fondo blanco
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
  backButton: {
    padding: 5,
    paddingTop: 45,
    position: 'absolute', // Position absolutely
    left: 10,         // 10 pixels from the right edge
  },
  container: {
    //flex: 1,   <-- REMOVE THIS.  We're controlling layout with outerContainer.
    marginTop: 75,
    //justifyContent: 'center', <-- No longer needed; we use buttonContainer
    alignItems: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
    borderRadius: 5,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row', // Alinea los botones horizontalmente
    justifyContent: 'space-around', // Espacio entre los botones
    width: '100%', // Ocupa todo el ancho disponible
  },
  button: {
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    marginTop: 10,
    width: '40%', // Ajusta el ancho de los botones, deja espacio entre ellos.
  },
  buttonSave: {
    backgroundColor: "#30C536",
  },
  buttonCancel: {
    backgroundColor: "#FD1A01",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
});

export default SettingsScreen;