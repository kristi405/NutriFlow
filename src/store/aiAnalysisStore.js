import * as FileSystem from 'expo-file-system';
import { makeAutoObservable } from 'mobx';
import { apiUpload } from '@/lib/api';
import { authStore } from './authStore';
import { persistStore } from './persist';

const ANALYSES_DIR = `${FileSystem.documentDirectory}ai-analyses/`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(ANALYSES_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(ANALYSES_DIR, { intermediates: true });
}

class AiAnalysisStore {
  analyses = [];
  isUploading = false;
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.aiAnalyses', ['analyses']);
  }

  get sortedAnalyses() {
    return [...this.analyses].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // Sends the source PDF to the backend, which reads it with an AI model and
  // generates a report PDF back — we then pull that report down and keep it
  // on-device so "Recent analyses" works offline after the initial upload.
  async uploadAnalysis({ uri, name, mimeType }) {
    this.isUploading = true;
    try {
      const data = await apiUpload('/ai/analyses', {
        fileUri: uri,
        fileName: name,
        mimeType: mimeType ?? 'application/pdf',
        token: authStore.token
      });

      await ensureDir();
      const localUri = `${ANALYSES_DIR}${data.id}.pdf`;
      await FileSystem.downloadAsync(data.pdfUrl, localUri);

      this.analyses = [...this.analyses, {
        id: data.id,
        fileName: name,
        createdAt: data.createdAt ?? new Date().toISOString(),
        localUri,
        summary: data.summary ?? null
      }];
      return this.analyses[this.analyses.length - 1];
    } finally {
      this.isUploading = false;
    }
  }

  async removeAnalysis(id) {
    const entry = this.analyses.find(a => a.id === id);
    this.analyses = this.analyses.filter(a => a.id !== id);
    if (entry?.localUri) {
      await FileSystem.deleteAsync(entry.localUri, { idempotent: true });
    }
  }
}

export const aiAnalysisStore = new AiAnalysisStore();
