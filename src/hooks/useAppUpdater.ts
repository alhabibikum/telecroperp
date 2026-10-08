import { useState, useEffect, useCallback, useRef } from 'react';
import { isTauri } from '@tauri-apps/api/core';
import { check, type Update, type DownloadEvent } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export interface UpdateInfo {
  currentVersion: string;
  version: string;
  date?: string;
  body?: string;
}

export function useAppUpdater() {
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [downloadedBytes, setDownloadedBytes] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeUpdateRef = useRef<Update | null>(null);

  // Check for updates
  const checkForUpdates = useCallback(async (isManualCheck = false) => {
    // If not running in desktop (Tauri) environment, ignore or notify
    if (!isTauri()) {
      if (isManualCheck) {
        return {
          supported: false,
          available: false,
          message: 'অটো-আপডেট ফিচারটি শুধুমাত্র Windows Desktop অ্যাপ্লিকেশনে (.exe) কার্যকর।'
        };
      }
      return { supported: false, available: false };
    }

    try {
      setIsChecking(true);
      setErrorMessage(null);

      const update = await check();

      if (update) {
        activeUpdateRef.current = update;
        setUpdateInfo({
          currentVersion: update.currentVersion,
          version: update.version,
          date: update.date,
          body: update.body || 'নতুন ফিচার ও বাগ ফিক্স অন্তর্ভুক্ত রয়েছে।'
        });
        setShowUpdateModal(true);
        return {
          supported: true,
          available: true,
          version: update.version,
          currentVersion: update.currentVersion,
          message: `নতুন আপডেট পাওয়া গেছে: v${update.version}`
        };
      } else {
        activeUpdateRef.current = null;
        return {
          supported: true,
          available: false,
          message: 'আপনার সফটওয়্যারটি বর্তমানে সর্বশেষ ভার্সনে রয়েছে।'
        };
      }
    } catch (err: any) {
      console.error('Failed to check for updates:', err);
      const errStr = err?.message || String(err);
      setErrorMessage(errStr);
      return {
        supported: true,
        available: false,
        error: errStr,
        message: 'আপডেট চেক করতে ব্যর্থ হয়েছে। ইন্টারনেট সংযোগ চেক করুন।'
      };
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Download and auto-install with 1 click
  const installUpdateNow = useCallback(async () => {
    const update = activeUpdateRef.current;
    if (!update) {
      setErrorMessage('কোন সক্রিয় আপডেট পাওয়া যায়নি।');
      return;
    }

    try {
      setIsDownloading(true);
      setIsInstalling(false);
      setErrorMessage(null);
      setProgressPercent(0);
      setDownloadedBytes(0);
      setTotalBytes(0);
      setStatusMessage('আপডেট ডাউনলোড শুরু হচ্ছে...');

      let downloaded = 0;
      let total = 0;

      await update.downloadAndInstall((event: DownloadEvent) => {
        if (event.event === 'Started') {
          total = event.data.contentLength || 0;
          setTotalBytes(total);
          setStatusMessage('ডাউনলোড হচ্ছে...');
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength;
          setDownloadedBytes(downloaded);
          if (total > 0) {
            const percent = Math.min(100, Math.round((downloaded / total) * 100));
            setProgressPercent(percent);
            setStatusMessage(`ডাউনলোড হচ্ছে... ${percent}%`);
          } else {
            setStatusMessage(`ডাউনলোড হচ্ছে... ${(downloaded / (1024 * 1024)).toFixed(1)} MB`);
          }
        } else if (event.event === 'Finished') {
          setProgressPercent(100);
          setIsDownloading(false);
          setIsInstalling(true);
          setStatusMessage('ইনস্টলেশন শেষ হচ্ছে এবং স্বয়ংক্রিয়ভাবে রিস্টার্ট হচ্ছে...');
        }
      });

      // On macOS/Linux or if process didn't terminate automatically, relaunch
      setStatusMessage('সফটওয়্যার রিস্টার্ট হচ্ছে...');
      await relaunch();
    } catch (err: any) {
      console.error('Error during auto-update installation:', err);
      setIsDownloading(false);
      setIsInstalling(false);
      setErrorMessage(err?.message || 'আপডেট ইনস্টল করতে সমস্যা হয়েছে।');
    }
  }, []);

  const dismissModal = useCallback(() => {
    // Only dismiss if not in the middle of active download/installation
    if (!isDownloading && !isInstalling) {
      setShowUpdateModal(false);
    }
  }, [isDownloading, isInstalling]);

  // Automatically check 4 seconds after app boot
  useEffect(() => {
    if (isTauri()) {
      const timer = setTimeout(() => {
        checkForUpdates(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [checkForUpdates]);

  return {
    isTauriApp: isTauri(),
    isChecking,
    isDownloading,
    isInstalling,
    showUpdateModal,
    updateInfo,
    progressPercent,
    downloadedBytes,
    totalBytes,
    statusMessage,
    errorMessage,
    checkForUpdates,
    installUpdateNow,
    dismissModal
  };
}
