// src/FavoritesScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

import { stylesApp } from './styles/AppStyles';

interface PlantItem {
  id: string;
  imageUri: string;
  scientificName: string;
  commonName: string;
    bestMatch: string;
}

const FavoritesScreen = ({ navigation }: { navigation: any }) => {
  const [favoritePlants, setFavoritePlants] = useState<PlantItem[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PlantItem[]>([]); // For search
  const [searchQuery, setSearchQuery] = useState('');
    const [fullScreenImageUri, setFullScreenImageUri] = useState<string | null>(null);
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth * 0.15;

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favoritePlants');
        if (storedFavorites !== null) {
          const favorites = JSON.parse(storedFavorites);
          setFavoritePlants(favorites);
          setFilteredPlants(favorites); // Initialize filtered list
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
        Alert.alert('Error', 'Failed to load favorites.');
      }
    };

    loadFavorites();

      //Add focus listener so that the list is updated whenever the screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
        loadFavorites();
    });
    return unsubscribe;//Unsubscribe on unmount

  }, [navigation]);

  useEffect(() => {
    // Filter plants based on search query
    const filtered = favoritePlants.filter(plant =>
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plant.commonName && plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredPlants(filtered);
  }, [searchQuery, favoritePlants]);


  const handleRemoveFavorite = (id: string) => {
    Alert.alert("Remove Favorite", "Are you sure you want to remove this plant from favorites?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const updatedFavorites = favoritePlants.filter(plant => plant.id !== id);
          setFavoritePlants(updatedFavorites);
          setFilteredPlants(updatedFavorites)
          try {
            await AsyncStorage.setItem('favoritePlants', JSON.stringify(updatedFavorites));
          } catch (error) {
            console.error("Error saving favorites:", error);
            Alert.alert('Error', 'Failed to save favorites.');
          }
        },
      },
    ]);

  };
    const handleImagePress = (uri: string) => {
    setFullScreenImageUri(uri);
    setFullScreenModalVisible(true);
  };

  const renderItem = ({ item }: { item: PlantItem }) => (
    <View style={stylesApp.listItem}>
        <TouchableOpacity onPress={() => handleImagePress(item.imageUri)}>
          <View style={[stylesApp.imageContainer, { width: imageSize, height: imageSize }]}>
            <Image source={{ uri: item.imageUri }} style={stylesApp.listItemImage} resizeMode="cover" />
          </View>
        </TouchableOpacity>

      <View style={stylesApp.textContainer}>
        <Text style={stylesApp.scientificName}>{item.scientificName}</Text>
        <Text style={stylesApp.commonName}>Common Name: {item.commonName}</Text>
      </View>

      {/* Favorite Icon (filled heart) -  Remove from Favorites */}
      <TouchableOpacity
        style={stylesApp.favoriteButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Icon name="heart" size={20} color="red" solid />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={stylesApp.container}>
      <View style={stylesApp.header}>
        <TouchableOpacity style={stylesApp.backButton} onPress={() => navigation.goBack()}>
          <Icon name="angle-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={stylesApp.headerText}>Favorite Plants</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={stylesApp.inputSearch}
        placeholder="Search favorites..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredPlants} // Use the filtered list
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={stylesApp.emptyListText}>No favorite plants yet.</Text>}
      />
        {/* Full-screen image modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={fullScreenModalVisible}
        onRequestClose={() => {
          setFullScreenModalVisible(false);
        }}
      >
        <View style={stylesApp.fullScreenContainer}>
          <Image
            source={{ uri: fullScreenImageUri }}
            style={stylesApp.fullScreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            onPress={() => setFullScreenModalVisible(false)}
          >
            <Icon name="times" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default FavoritesScreen;