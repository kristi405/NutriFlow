import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const PICKER_OPTIONS = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 };

// Picker results live in the cache dir, which the OS may purge — copy the photo
// into the document directory so it survives. A fresh file name per photo also
// keeps expo-image from serving the previous picture from its URI cache.
function persistPhoto(pickedUri) {
  const destination = new File(Paths.document, `profile-photo-${Date.now()}.jpg`);
  new File(pickedUri).copy(destination);
  return destination.uri;
}

export function deletePhoto(uri) {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Already gone — nothing to clean up.
  }
}

// Resolves to the stored photo's URI, null if the user cancelled, or throws
// { code: 'permission' } when the permission was denied.
export async function pickProfilePhoto(source) {
  const permission = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw Object.assign(new Error('permission denied'), { code: 'permission' });
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS) : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled || !result.assets[0]) return null;
  return persistPhoto(result.assets[0].uri);
}
