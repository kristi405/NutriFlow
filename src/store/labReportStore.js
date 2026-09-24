import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';
import { apiRequest, apiUpload } from '@/lib/api';
import { adaptHistoryPoint, adaptLabReport } from '@/lib/labReportAdapter';
import { authStore } from './authStore';
import { localeStore } from './localeStore';

/**
 * Lab reports live on the server (private to the user); nothing is cached on
 * the device. Uploading blocks until the backend's Gemini parse finishes — a
 * report that couldn't be parsed still comes back, with isFailed set.
 */
class LabReportStore {
  // Full reports (with results) fetched for the detail screen, so the
  // indicator page opened from it can read them without another request.
  detailCache = new Map();
  reports = [];
  isLoading = false;
  isUploading = false;
  hasError = false;

  constructor() {
    makeAutoObservable(this, { detailCache: false }, { autoBind: true });
    // Replaced the old on-device-only analyses store.
    AsyncStorage.removeItem('nutriflow.aiAnalyses').catch(() => {});
  }

  async loadReports() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const rawList = await apiRequest('/app/lab-reports', { token: authStore.token });
      runInAction(() => {
        this.reports = rawList.map(adaptLabReport);
      });
    } catch {
      runInAction(() => {
        this.hasError = true;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async uploadReport({ uri, name, mimeType }) {
    this.isUploading = true;
    try {
      const raw = await apiUpload(`/app/lab-reports?lang=${localeStore.language}`, { fileUri: uri, fileName: name, mimeType, token: authStore.token });
      const report = adaptLabReport(raw);
      runInAction(() => {
        this.reports = [report, ...this.reports.filter(existing => existing.id !== report.id)];
      });
      return report;
    } finally {
      runInAction(() => {
        this.isUploading = false;
      });
    }
  }

  async fetchReport(id) {
    const report = adaptLabReport(await apiRequest(`/app/lab-reports/${id}`, { token: authStore.token }));
    this.detailCache.set(String(id), report);
    return report;
  }

  async deleteReport(id) {
    await apiRequest(`/app/lab-reports/${id}`, { method: 'DELETE', token: authStore.token });
    runInAction(() => {
      this.reports = this.reports.filter(report => report.id !== id);
    });
  }

  // Values of one indicator across all parsed reports, oldest first.
  async fetchHistory(name) {
    const raw = await apiRequest(`/app/lab-reports/results/history?name=${encodeURIComponent(name)}`, { token: authStore.token });
    return raw.map(adaptHistoryPoint).sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  }
}

export const labReportStore = new LabReportStore();
