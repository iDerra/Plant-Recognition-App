import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface PlantItem {
    id: string;
    imageUri: string;
    scientificName: string;
    commonName: string;
    bestMatch: string;
}

/**
 * Removes a plant from both the plant history and favorites (if present).
 * @param plantId The ID of the plant to remove.
 * @param setPlantHistory Optional function to update the plant history state.
 * @param setFavoritePlants Optional function to update the favorite plants state.
 */
export const removePlant = async (
    plantId: string,
    setPlantHistory: (updater: (prevHistory: PlantItem[]) => PlantItem[]) => void,
    setFavoritePlants: (updater: (prevFavorites: PlantItem[]) => PlantItem[]) => void
    ) => {
    try {
        // Remove the plant from the plant history state (if the setter function is provided).
        if (setPlantHistory) {
            setPlantHistory(prevHistory => prevHistory.filter(plant => plant.id !== plantId));
        }

        // Remove the plant from the favorite plants state (if the setter function is provided).
        if (setFavoritePlants) {
            setFavoritePlants(prevFavorites => prevFavorites.filter(plant => plant.id !== plantId));
        }

        // Remove the plant from AsyncStorage (plantHistory).
        const storedHistoryString = await AsyncStorage.getItem('plantHistory');
        if (storedHistoryString !== null) {
            const storedHistory = JSON.parse(storedHistoryString);
            const updatedHistory = storedHistory.filter((plant: PlantItem) => plant.id !== plantId);
            await AsyncStorage.setItem('plantHistory', JSON.stringify(updatedHistory));
        }

        // Remove the plant from AsyncStorage (favoritePlants).
        const storedFavoritesString = await AsyncStorage.getItem('favoritePlants');
        if (storedFavoritesString !== null) {
            const storedFavorites = JSON.parse(storedFavoritesString);
            const updatedFavorites = storedFavorites.filter((plant: PlantItem) => plant.id !== plantId);
            await AsyncStorage.setItem('favoritePlants', JSON.stringify(updatedFavorites));
        }
    } catch (error) {
        console.error("Error removing plant:", error);
        Alert.alert('Error', 'Failed to remove plant.');
    }
};

/**
 * Prompts the user to confirm the deletion of a plant, then removes it.
 * @param plantId The ID of the plant to remove.
 * @param setPlantHistory Optional function to update the plant history state.
 * @param setFavoritePlants Optional function to update the favorite plants state.
 */
export const confirmAndRemovePlant = (
    plantId: string,
    setPlantHistory?: (updater: (prevHistory: PlantItem[]) => PlantItem[]) => void,
    setFavoritePlants?: (updater: (prevFavorites: PlantItem[]) => PlantItem[]) => void
    ) => {
    Alert.alert(
        "Delete Plant",
        "Are you sure you want to delete this plant?",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await removePlant(plantId, setPlantHistory!, setFavoritePlants!);
                },
            },
        ]
    );
};

/**
 * Toggles a plant's favorite status (adds or removes it from favorites).
 * @param plant The plant object to toggle.
 * @param setFavoritePlants Function to update the favorite plants state.
 */
export const toggleFavorite = async (
    plant: PlantItem,
    setFavoritePlants: (updater: (prevFavorites: PlantItem[]) => PlantItem[]) => void
    ) => {
    try {
        // Retrieve current favorites from AsyncStorage.
        const storedFavoritesString = await AsyncStorage.getItem('favoritePlants');
        let currentFavorites: PlantItem[] = [];

        if (storedFavoritesString !== null) {
            currentFavorites = JSON.parse(storedFavoritesString);
        }

        // Check if the plant is already a favorite.
        const isCurrentlyFavorite = currentFavorites.some(favPlant => favPlant.id === plant.id);
        let updatedFavorites: PlantItem[] = [];
        
        // If it's a favorite, remove it; otherwise, add it.
        if (isCurrentlyFavorite) {
            updatedFavorites = currentFavorites.filter(favPlant => favPlant.id !== plant.id);
        } else {
            updatedFavorites = [...currentFavorites, plant];
        }
        
        // Update the state and AsyncStorage.
        setFavoritePlants(() => updatedFavorites);
        await AsyncStorage.setItem('favoritePlants', JSON.stringify(updatedFavorites));

    } catch (error) {
        console.error("Error toggling favorite:", error);
        Alert.alert('Error', 'Failed to toggle favorite.');
    }
};