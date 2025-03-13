import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface PlantItem {
    id: string;
    imageUri: string;
    scientificName: string;
    commonName: string;
    bestMatch: string;
}
export const removePlant = async (
    plantId: string,
    setPlantHistory: (updater: (prevHistory: PlantItem[]) => PlantItem[]) => void,
    setFavoritePlants: (updater: (prevFavorites: PlantItem[]) => PlantItem[]) => void
    ) => {
    try {
    if (setPlantHistory) {
        setPlantHistory(prevHistory => prevHistory.filter(plant => plant.id !== plantId));
    }

    if (setFavoritePlants) {
        setFavoritePlants(prevFavorites => prevFavorites.filter(plant => plant.id !== plantId));
    }

    const storedHistoryString = await AsyncStorage.getItem('plantHistory');
    if (storedHistoryString !== null) {
        const storedHistory = JSON.parse(storedHistoryString);
        const updatedHistory = storedHistory.filter((plant: PlantItem) => plant.id !== plantId);
        await AsyncStorage.setItem('plantHistory', JSON.stringify(updatedHistory));
    }

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

export const toggleFavorite = async (
    plant: PlantItem,
    setFavoritePlants: (updater: (prevFavorites: PlantItem[]) => PlantItem[]) => void
    ) => {
    try {
        const storedFavoritesString = await AsyncStorage.getItem('favoritePlants');
        let currentFavorites: PlantItem[] = [];

        if (storedFavoritesString !== null) {
            currentFavorites = JSON.parse(storedFavoritesString);
        }
        const isCurrentlyFavorite = currentFavorites.some(favPlant => favPlant.id === plant.id);
        let updatedFavorites: PlantItem[] = [];

        if (isCurrentlyFavorite) {
            updatedFavorites = currentFavorites.filter(favPlant => favPlant.id !== plant.id);
        } else {
            updatedFavorites = [...currentFavorites, plant];
        }

        setFavoritePlants(() => updatedFavorites);
        await AsyncStorage.setItem('favoritePlants', JSON.stringify(updatedFavorites));

    } catch (error) {
        console.error("Error toggling favorite:", error);
        Alert.alert('Error', 'Failed to toggle favorite.');
    }
};