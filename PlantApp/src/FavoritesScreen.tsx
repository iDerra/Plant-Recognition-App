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
import { confirmAndRemovePlant, toggleFavorite } from './utils/plantUtils';


interface PlantItem {
  id: string;
  imageUri: string;
  scientificName: string;
  commonName: string;
    bestMatch: string;
}

const FavoritesScreen = ({ navigation }: { navigation: any }) => {
  const [favoritePlants, setFavoritePlants] = useState<PlantItem[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PlantItem[]>([]);
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
          setFilteredPlants(favorites);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
        Alert.alert('Error', 'Failed to load favorites.');
      }
    };

    loadFavorites();
    const unsubscribe = navigation.addListener('focus', () => {
        loadFavorites();
    });
    return unsubscribe;

  }, [navigation]);

  useEffect(() => {
    const filtered = favoritePlants.filter(plant =>
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plant.commonName && plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredPlants(filtered);
  }, [searchQuery, favoritePlants]);


  const handleImagePress = (uri: string) => {
    setFullScreenImageUri(uri);
    setFullScreenModalVisible(true);
  };
  
  const handleDeleteFavorite = (id: string) => {
    confirmAndRemovePlant(id, undefined, setFavoritePlants);
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

      <TouchableOpacity
        style={stylesApp.favoriteButton}
        onPress={() => handleDeleteFavorite(item.id)}
      >
        <Icon name="heart" size={20} color="red" solid />
      </TouchableOpacity>
      <TouchableOpacity style={stylesApp.deleteButton} onPress={() => handleDeleteFavorite(item.id)}>
        <Icon name="trash" size={20} color="#ff0000" />
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

      <TextInput
        style={stylesApp.inputSearch}
        placeholder="Search favorites..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredPlants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={stylesApp.emptyListText}>No favorite plants yet.</Text>}
      />
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