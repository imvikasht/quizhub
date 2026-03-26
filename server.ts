import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin for background cleanup
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('Firebase Admin initialized with service account.');
  } else {
    // Fallback to project ID if running in environment with default credentials
    initializeApp({
      projectId: 'gen-lang-client-0135509206'
    });
    console.log('Firebase Admin initialized with project ID (Auth deletion may require service account).');
  }
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
}

// Background Task: Cleanup Guest Accounts marked for deletion (> 24h ago)
async function cleanupGuestAccounts() {
  console.log('Running guest account cleanup check...');
  try {
    const db = getFirestore();
    const authAdmin = getAuth();
    const now = new Date();
    
    // Find users where deleteAt is less than or equal to now
    const snapshot = await db.collection('users')
      .where('deleteAt', '<=', AdminTimestamp.fromDate(now))
      .get();

    if (snapshot.empty) {
      console.log('No guest accounts to delete.');
      return;
    }

    console.log(`Found ${snapshot.size} guest accounts to delete.`);

    for (const doc of snapshot.docs) {
      const userId = doc.id;
      
      // 1. Delete Firestore User Doc
      await doc.ref.delete();
      console.log(`Deleted Firestore doc for user: ${userId}`);

      // 2. Attempt to delete Auth record (requires valid admin credentials)
      try {
        await authAdmin.deleteUser(userId);
        console.log(`Deleted Auth record for user: ${userId}`);
      } catch (authError) {
        // This fails if service account is not fully configured, but we still cleaned Firestore
        console.warn(`Could not delete Auth record for ${userId} (Service Account might be missing):`, authError instanceof Error ? authError.message : authError);
      }
    }
  } catch (error) {
    console.error('Cleanup task error:', error);
  }
}

// Run cleanup once on startup and then every hour
cleanupGuestAccounts();
setInterval(cleanupGuestAccounts, 60 * 60 * 1000);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(cors() as any);
  app.use(express.json() as any);



  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*path', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
