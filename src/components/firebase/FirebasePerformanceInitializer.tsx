'use client';

import { useEffect } from 'react';
import { getPerformance } from 'firebase/performance';
import { app } from '@/lib/firebase'; // Assuming firebase.ts will export 'app'

export default function FirebasePerformanceInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined' && app) {
      // Check if app is initialized before getting performance
      try {
        getPerformance(app);
      } catch (error) {
        console.warn("Firebase Performance Monitoring could not be initialized. Ensure Firebase app is configured correctly.", error);
      }
    }
  }, []);

  return null; // This component does not render anything
}
