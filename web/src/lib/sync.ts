import { db, StudentLog } from './db';

type SyncStatus = 'online' | 'offline' | 'syncing';

class SyncManager {
    private status: SyncStatus = 'online';
    private listeners: ((status: SyncStatus) => void)[] = [];
    private syncInterval: NodeJS.Timeout | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.status = navigator.onLine ? 'online' : 'offline';

            window.addEventListener('online', () => {
                this.updateStatus('online');
                this.sync();
            });

            window.addEventListener('offline', () => {
                this.updateStatus('offline');
            });

            this.syncInterval = setInterval(() => {
                if (this.status === 'online') {
                    this.sync();
                }
            }, 60000);
        }
    }

    public getStatus(): SyncStatus {
        return this.status;
    }

    public subscribe(listener: (status: SyncStatus) => void) {
        this.listeners.push(listener);
        listener(this.status);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private updateStatus(status: SyncStatus) {
        this.status = status;
        this.listeners.forEach(l => l(status));
    }

    public async sync() {
        if (this.status === 'offline') return;

        this.updateStatus('syncing');
        console.log("Starting sync...");

        try {

            const unsyncedLogs = await db.studentLogs.where('synced').equals(0).toArray();

            if (unsyncedLogs.length > 0) {
                console.log(`Found ${unsyncedLogs.length} unsynced logs.`);
                console.log(`Found ${unsyncedLogs.length} unsynced logs.`);

                try {
                    const { db: firestore } = await import('./firebase');
                    const { collection, addDoc } = await import('firebase/firestore');

                    for (const log of unsyncedLogs) {
                        try {
                            const { id, ...logData } = log;
                            await addDoc(collection(firestore, 'studentLogs'), {
                                ...logData,
                                syncedAt: new Date()
                            });

                            await db.studentLogs.update(log.id!, { synced: true });
                        } catch (err) {
                            console.error("Failed to sync log:", log.id, err);
                        }
                    }
                    console.log("Logs synced successfully to Firebase.");
                } catch (err) {
                    console.error("Firebase Sync Error (Check keys):", err);
                }
            }

            this.updateStatus('online');
        } catch (error) {
            console.error("Sync failed:", error);

            this.updateStatus('online');
        }
    }
}

export const syncManager = new SyncManager();