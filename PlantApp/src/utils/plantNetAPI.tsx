// utils/plantnetApi.ts
import axios from 'axios';
import { Buffer } from 'buffer';

// Function to simulate fs.createReadStream for React Native
const createReadStream = (uri: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      if (event.target && event.target.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const buffer = Buffer.from(arrayBuffer);
        resolve(buffer);
      } else {
        reject(new Error("Failed to read file."));
      }
    };

    fileReader.onerror = (error) => {
      reject(error);
    };

    fetch(uri)
      .then(response => response.blob())
      .then(blob => {
        fileReader.readAsArrayBuffer(blob);
      })
      .catch(reject);
  });
};

export const identifyPlant = async (imageUri: string, apiKey: string, organ: string = 'leaf') => {
  const apiUrl = 'https://my-api.plantnet.org/v2/identify/all';
  const maxResults = 3;
  const includeRelatedImages = true; // Now a simple boolean

  const formData = new FormData();
  const imageBuffer = await createReadStream(imageUri);

  formData.append('images', {
    uri: imageUri,
    name: 'image.jpg',
    type: 'image/jpeg',
    buffer: imageBuffer,
  } as any);
  formData.append('organs', organ); //Only one organ, as we are sending one image

  // Construct the URL *with all parameters except image and organ*:
  const urlWithParams = `${apiUrl}?api-key=${apiKey}&nb-results=${maxResults}&include-related-images=${includeRelatedImages}`;

  try {
    const response = await axios.post(urlWithParams, formData, { // Use the URL with params
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error(`PlantNet API error: Status code ${response.status}`);
      throw new Error(`PlantNet API returned status code ${response.status}`);
    }
  } catch (error) {
    console.error("Error identifying plant:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data || error.message);
      console.log(error.config.url) // Log the full URL being used
    }
    throw error;
  }
};