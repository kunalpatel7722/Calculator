'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ChatbotButton with SSR turned off as it's client-side interactive
const ChatbotButton = dynamic(() => import('@/components/shared/ChatbotButton'), {
  ssr: false, 
});

export default function DynamicChatbotButtonWrapper() {
  return <ChatbotButton />;
}
