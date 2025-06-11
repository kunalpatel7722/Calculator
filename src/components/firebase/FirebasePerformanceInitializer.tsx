'use client';

import { useEffect } from 'react';
import { getPerformance } from 'firebase/performance';
import { app } from '@/lib/firebase'; 

export default function FirebasePerformanceInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (app) {
        try {
          getPerformance(app);
          // console.log("Firebase Performance Monitoring initialized."); // Optional: for debugging
        } catch (error) {
          console.warn("Firebase Performance Monitoring could not be initialized. Ensure Firebase app is configured correctly and the 'firebase/performance' module is available.", error);
        }
      } else {
        console.warn(
          "Firebase app object is not available. Performance Monitoring will not be enabled. " +
          "This usually means Firebase initialization failed in src/lib/firebase.ts, likely due to missing or incorrect .env configuration. " +
          "Please check your Firebase project credentials in the .env file."
        );
      }
    }
  }, []);

  return null; // This component does not render anything
}
