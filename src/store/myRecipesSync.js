import { reaction, runInAction } from 'mobx';
import { apiRequest, apiUpload } from '@/lib/api';
import { authStore } from './authStore';
import { myRecipesStore } from './myRecipesStore';

/**
 * Syncs the user's own recipes to preferences.myRecipes on the server — same
 * reconcile-or-push approach as peopleSync.js for familyMembers, so a custom
 * recipe survives a reinstall or shows up on another device on the same
 * account. A recipe's photo is uploaded to the backend lazily, here (not at
 * creation time in add-recipe.js), so creating/editing a recipe keeps working
 * fully offline — only syncing needs connectivity.
 */

const PUSH_DELAY_MS = 1500;

let lastSyncedSnapshot = null;
let pushTimer = null;

// imageUrl is a local file:// path — meaningless off this device, so it never
// goes on the wire. imageFilename (set once the photo's uploaded) does.
function serialize(recipes) {
  return recipes.map(({ imageUrl, ...rest }) => rest); // eslint-disable-line no-unused-vars
}

async function uploadPendingPhotos() {
  const pending = myRecipesStore.recipes.filter(recipe => recipe.imageUrl && !recipe.imageFilename);
  for (const recipe of pending) {
    try {
      const { filename } = await apiUpload('/app/files', { fileUri: recipe.imageUrl, fileName: 'photo.jpg', mimeType: 'image/jpeg', token: authStore.token });
      runInAction(() => {
        myRecipesStore.updateRecipe(recipe.id, { imageFilename: filename });
      });
    } catch {
      // offline or failed — retried on the next sync pass
    }
  }
}

async function pushRecipes() {
  if (!authStore.token) return false;
  await uploadPendingPhotos();
  const payload = serialize(myRecipesStore.recipes);
  try {
    await apiRequest('/app/users/me', { method: 'PUT', token: authStore.token, body: { preferences: { myRecipes: payload } } });
    runInAction(() => {
      lastSyncedSnapshot = JSON.stringify(payload);
      myRecipesStore.needsPush = false;
      myRecipesStore.hasSyncedOnce = true;
    });
    return true;
  } catch {
    return false;
  }
}

function applyServerRecipes(serverRecipes) {
  lastSyncedSnapshot = JSON.stringify(serverRecipes);
  runInAction(() => {
    // A not-yet-uploaded local photo (imageUrl) survives the replace — the
    // server never had it to begin with (serialize() strips it before push).
    const localById = new Map(myRecipesStore.recipes.map(recipe => [recipe.id, recipe]));
    myRecipesStore.recipes = serverRecipes.map(recipe => {
      const imageUrl = localById.get(recipe.id)?.imageUrl;
      return imageUrl ? { ...recipe, imageUrl } : recipe;
    });
    myRecipesStore.hasSyncedOnce = true;
  });
}

/** Reconcile with the server: upload pending local changes, otherwise take the server's list. */
export async function syncMyRecipes() {
  if (!authStore.token) return;
  let me;
  try {
    me = await apiRequest('/app/users/me', { token: authStore.token });
  } catch {
    return; // offline — try again next launch
  }
  const serverRecipes = Array.isArray(me?.preferences?.myRecipes) ? me.preferences.myRecipes : [];
  // Recipes created before the server supported this are uploaded once
  // instead of being wiped by the (empty) server list.
  const isFirstUpload = !myRecipesStore.hasSyncedOnce && serverRecipes.length === 0 && myRecipesStore.recipes.length > 0;
  if (myRecipesStore.needsPush || isFirstUpload) {
    await pushRecipes();
  } else {
    applyServerRecipes(serverRecipes);
  }
}

reaction(() => JSON.stringify(serialize(myRecipesStore.recipes)), snapshot => {
  if (snapshot === lastSyncedSnapshot) return;
  myRecipesStore.needsPush = true;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushRecipes();
  }, PUSH_DELAY_MS);
});
