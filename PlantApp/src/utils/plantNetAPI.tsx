import axios from 'axios';
import { Buffer } from 'buffer';

/**
 * Creates a readable stream from a file URI and returns a Buffer.
 * @param uri The URI of the file.
 * @returns A Promise that resolves with a Buffer containing the file data.
 */
const createReadStream = (uri: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      if (event.target && event.target.result) {
        // Convert the ArrayBuffer to a Buffer.
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

    // Fetch the file as a blob, then read it as an ArrayBuffer.
    fetch(uri)
      .then(response => response.blob())
      .then(blob => {
        fileReader.readAsArrayBuffer(blob);
      })
      .catch(reject);
  });
};

/**
 * Identifies a plant using the PlantNet API.
 * @param imageUri The URI of the plant image.
 * @param apiKey Your PlantNet API key.
 * @param organ The organ of the plant being identified (default: 'leaf').
 * @returns A Promise that resolves with the PlantNet API response data.
 * @throws An error if the API request fails.
 */
export const identifyPlant = async (imageUri: string, apiKey: string, organ: string = 'leaf') => {
  const apiUrl = 'https://my-api.plantnet.org/v2/identify/all';
  const maxResults = 3; // Limit the number of results.
  const includeRelatedImages = true; // Request response with plant images

  const formData = new FormData();
  const imageBuffer = await createReadStream(imageUri);

  // Append the image to the FormData.  The 'as any' cast is a workaround
  // for type inconsistencies between react-native's FormData and the browser FormData.
  formData.append('images', {
    uri: imageUri,
    name: 'image.jpg',
    type: 'image/jpeg',
    buffer: imageBuffer,
  } as any);
  formData.append('organs', organ);

  // Construct the full API URL with query parameters.
  const urlWithParams = `${apiUrl}?api-key=${apiKey}&nb-results=${maxResults}&include-related-images=${includeRelatedImages}`;

  try {
    // Make the API request using axios.
    const response = await axios.post(urlWithParams, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      return response.data; // Return the API response data.
    } else {
      console.error(`PlantNet API error: Status code ${response.status}`);
      throw new Error(`PlantNet API returned status code ${response.status}`);
    }
  } catch (error) {
    console.error("Error identifying plant:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data || error.message);
      console.log(error.config.url)
    }
    throw error;
  }
};