import { File, Paths } from 'expo-file-system';

// expo-image-picker's result lives under the OS-managed Caches directory,
// which iOS/Android may purge at any time — by the time a later async step
// (like uploading on save) reads it, the file can already be gone ("No such
// file or directory"). Copying it into our own document directory right
// after picking makes it durable for as long as we hold onto it. The
// timestamped name also keeps expo-image from serving a stale picture cached
// under a reused URI.
export function persistPickedImage(pickedUri, prefix) {
  const destination = new File(Paths.document, `${prefix}-${Date.now()}.jpg`);
  new File(pickedUri).copy(destination);
  return destination.uri;
}
