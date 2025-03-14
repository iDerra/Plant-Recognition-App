import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

import { stylesApp } from './styles/AppStyles';
import { confirmAndRemovePlant } from './utils/plantUtils';


interface PlantItem {
  id: string;
  imageUri: string;
  scientificName: string;
  commonName: string;
  bestMatch: string;
}

const FavouritesScreen = ({ navigation }: { navigation: any }) => {
  const [favouritePlants, setFavouritePlants] = useState<PlantItem[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PlantItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fullScreenImageUri, setFullScreenImageUri] = useState<string | null>(null);
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth * 0.15;

  // useEffect hook to load favourite plants from AsyncStorage when the component mounts or regains focus.
  useEffect(() => {
    const loadFavourites = async () => {
      try {
        const storedFavourites = await AsyncStorage.getItem('favouritePlants');
        if (storedFavourites !== null) {
          const favourites = JSON.parse(storedFavourites);
          setFavouritePlants(favourites);
          setFilteredPlants(favourites);
        }
      } catch (error) {
        console.error("Error loading favourites:", error);
        Alert.alert('Error', 'Failed to load favourites.');
      }
    };

    loadFavourites();
    const unsubscribe = navigation.addListener('focus', () => {
        loadFavourites();
    });
    return unsubscribe;

  }, [navigation]);

  // useEffect hook to filter the plants based on the search query.
  useEffect(() => {
    const filtered = favouritePlants.filter(plant =>
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plant.commonName && plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredPlants(filtered);
  }, [searchQuery, favouritePlants]);

  // Function to handle pressing on an image to view it in full screen.
  const handleImagePress = (uri: string) => {
    setFullScreenImageUri(uri);
    setFullScreenModalVisible(true);
  };
  
  const handleDeleteFavourite = (id: string) => {
    confirmAndRemovePlant(id, undefined, setFavouritePlants);
  };

  // Function to render each item in the FlatList.
  const renderItem = ({ item }: { item: PlantItem }) => (
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

      {/* TouchableOpacity to remove the plant from favourites (shows a filled heart). */}
      <TouchableOpacity style={stylesApp.favouriteButton} onPress={() => handleDeleteFavourite(item.id)}>
        <Icon name="heart" size={20} color="red" solid />
      </TouchableOpacity>

      {/* TouchableOpacity to delete the plant from favourites (shows a trash icon). */}
      <TouchableOpacity style={stylesApp.deleteButton} onPress={() => handleDeleteFavourite(item.id)}>
        <Icon name="trash" size={20} color="#ff0000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={stylesApp.container}>
      {/* Header section with back button and title. */}
      <View style={stylesApp.header}>
        <TouchableOpacity style={stylesApp.backButton} onPress={() => navigation.goBack()}>
          <Icon name="angle-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={stylesApp.headerText}>Favourite Plants</Text>
      </View>

      {/* TextInput for searching favourite plants. */}
      <TextInput
        style={[stylesApp.inputSearch]}
        placeholder="Search favourites..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* FlatList to display the (filtered) favourite plants. */}
      <FlatList
        data={filteredPlants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={stylesApp.emptyListText}>No favourite plants yet.</Text>}
      />

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

export default FavouritesScreen;