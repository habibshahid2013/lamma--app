// app/api/subscribe/route.ts
// API endpoint to save email subscriptions to Firestore

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = 'popup' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingQuery = query(
      collection(db, 'subscribers'),
      where('email', '==', email.toLowerCase())
    );
    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      // Already subscribed - just return success
      return NextResponse.json({
        success: true,
        message: 'Already subscribed',
        alreadyExists: true,
      });
    }

    // Save new subscriber
    const docRef = await addDoc(collection(db, 'subscribers'), {
      email: email.toLowerCase(),
      source,
      subscribedAt: new Date().toISOString(),
      status: 'active',
      welcomeEmailSent: false,
    });

    console.log(`📧 New subscriber: ${email} (${source})`);

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
      subscriberId: docRef.id,
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
