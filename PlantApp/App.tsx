import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { takePictureAndGetUri } from './src/utils/camera';

const App = () => {
  const [imageSource, setImageSource] = useState<string | null>(null);

  const handleSettingsPress = () => {
    Alert.alert('Configuration', 'This is where the configuration options would go.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Plant AI</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <Icon name="cog" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Tomar Foto"
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 5,
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