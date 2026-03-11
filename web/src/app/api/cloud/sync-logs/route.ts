import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Cloud: Received logs for sync", body.length);

    const db = initAdmin();
    if (!db) {

      console.warn("Cloud: No Firebase credentials, skipping real sync.");
      return NextResponse.json({ success: true, count: body.length, mode: "mock_fallback" });
    }

    const batch = db.batch();

    body.forEach((log: any) => {

      const docRef = db.collection('student_logs').doc(String(log.id || crypto.randomUUID()));
      batch.set(docRef, { ...log, syncedAt: new Date().toISOString() }, { merge: true });
    });

    await batch.commit();
    console.log("Cloud: Successfully wrote logs to Firestore.");

    return NextResponse.json({ success: true, count: body.length, mode: "real" });
  } catch (error) {
    console.error("Cloud Sync Error:", error);
    return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 });
  }
}