import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';
import { apiRequest, apiUpload } from '@/lib/api';
import { adaptHistoryPoint, adaptLabReport } from '@/lib/labReportAdapter';
import { authStore } from './authStore';
import { localeStore } from './localeStore';
import { peopleStore } from './peopleStore';

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

  // Reports of whoever is currently being tracked.
  get visibleReports() {
    const personId = peopleStore.currentPersonId;
    return this.reports.filter(report => peopleStore.ownerOfReport(report.id) === personId);
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
    // The analysis can take a while; the person may be switched meanwhile.
    const personId = peopleStore.currentPersonId;
    this.isUploading = true;
    try {
      const raw = await apiUpload(`/app/lab-reports?lang=${localeStore.language}`, { fileUri: uri, fileName: name, mimeType, token: authStore.token });
      const report = adaptLabReport(raw);
      runInAction(() => {
        this.reports = [report, ...this.reports.filter(existing => existing.id !== report.id)];
        peopleStore.assignReport(report.id, personId);
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
      peopleStore.unassignReport(id);
    });
  }

  // Used when a family member is removed: hides their reports at once, then
  // deletes them on the server (best effort — a failure just leaves them there).
  async deleteReportsByIds(ids) {
    this.reports = this.reports.filter(report => !ids.includes(report.id));
    await Promise.allSettled(ids.map(id => apiRequest(`/app/lab-reports/${id}`, { method: 'DELETE', token: authStore.token })));
  }

  // Values of one indicator across all parsed reports, oldest first.
  async fetchHistory(name) {
    const raw = await apiRequest(`/app/lab-reports/results/history?name=${encodeURIComponent(name)}`, { token: authStore.token });
    const personId = peopleStore.currentPersonId;
    // The endpoint spans every report on the account; keep this person's.
    return raw.map(adaptHistoryPoint).filter(point => point.reportId === null || peopleStore.ownerOfReport(point.reportId) === personId).sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  }
}

export const labReportStore = new LabReportStore();
