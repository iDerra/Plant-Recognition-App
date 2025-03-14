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
 * Removes a plant from both the plant history and favourites (if present).
 * @param plantId The ID of the plant to remove.
 * @param setPlantHistory Optional function to update the plant history state.
 * @param setFavouritePlants Optional function to update the favourite plants state.
 */
export const removePlant = async (
    plantId: string,
    setPlantHistory: (updater: (prevHistory: PlantItem[]) => PlantItem[]) => void,
    setFavouritePlants: (updater: (prevFavourites: PlantItem[]) => PlantItem[]) => void
    ) => {
    try {
        // Remove the plant from the plant history state (if the setter function is provided).
        if (setPlantHistory) {
            setPlantHistory(prevHistory => prevHistory.filter(plant => plant.id !== plantId));
        }

        // Remove the plant from the favourite plants state (if the setter function is provided).
        if (setFavouritePlants) {
            setFavouritePlants(prevFavourites => prevFavourites.filter(plant => plant.id !== plantId));
        }

        // Remove the plant from AsyncStorage (plantHistory).
        const storedHistoryString = await AsyncStorage.getItem('plantHistory');
        if (storedHistoryString !== null) {
            const storedHistory = JSON.parse(storedHistoryString);
            const updatedHistory = storedHistory.filter((plant: PlantItem) => plant.id !== plantId);
            await AsyncStorage.setItem('plantHistory', JSON.stringify(updatedHistory));
        }

        // Remove the plant from AsyncStorage (favouritePlants).
        const storedFavouritesString = await AsyncStorage.getItem('favouritePlants');
        if (storedFavouritesString !== null) {
            const storedFavourites = JSON.parse(storedFavouritesString);
            const updatedFavourites = storedFavourites.filter((plant: PlantItem) => plant.id !== plantId);
            await AsyncStorage.setItem('favouritePlants', JSON.stringify(updatedFavourites));
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
 * @param setFavouritePlants Optional function to update the favourite plants state.
 */
export const confirmAndRemovePlant = (
    plantId: string,
    setPlantHistory?: (updater: (prevHistory: PlantItem[]) => PlantItem[]) => void,
    setFavouritePlants?: (updater: (prevFavourites: PlantItem[]) => PlantItem[]) => void
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
                    await removePlant(plantId, setPlantHistory!, setFavouritePlants!);
                },
            },
        ]
    );
};

/**
 * Toggles a plant's favourite status (adds or removes it from favourites).
 * @param plant The plant object to toggle.
 * @param setFavouritePlants Function to update the favourite plants state.
 */
export const toggleFavourite = async (
    plant: PlantItem,
    setFavouritePlants: (updater: (prevFavourites: PlantItem[]) => PlantItem[]) => void
    ) => {
    try {
        // Retrieve current favourites from AsyncStorage.
        const storedFavouritesString = await AsyncStorage.getItem('favouritePlants');
        let currentFavourites: PlantItem[] = [];

        if (storedFavouritesString !== null) {
            currentFavourites = JSON.parse(storedFavouritesString);
        }

        // Check if the plant is already a favourite.
        const isCurrentlyFavourite = currentFavourites.some(favPlant => favPlant.id === plant.id);
        let updatedFavourites: PlantItem[] = [];
        
        // If it's a favourite, remove it; otherwise, add it.
        if (isCurrentlyFavourite) {
            updatedFavourites = currentFavourites.filter(favPlant => favPlant.id !== plant.id);
        } else {
            updatedFavourites = [...currentFavourites, plant];
        }
        
        // Update the state and AsyncStorage.
        setFavouritePlants(() => updatedFavourites);
        await AsyncStorage.setItem('favouritePlants', JSON.stringify(updatedFavourites));

    } catch (error) {
        console.error("Error toggling favourite:", error);
        Alert.alert('Error', 'Failed to toggle favourite.');
    }
};