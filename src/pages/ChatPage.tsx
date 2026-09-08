import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Send, Sparkles, AlertTriangle, Mic } from 'lucide-react';
import { Button } from '../components/Button';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { EmergencyFAB } from '../components/EmergencyFAB';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isAction?: boolean;
}

export default function ChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hi there. I'm CareMate. How can I help you coordinate care today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    triggerAIResponse(userMsg.text);
  };

  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false);
      const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: "Voice message (0:08)" };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      triggerAIResponse("voice input received");
    } else {
      setIsRecording(true);
      // Automatically stop recording after 3 seconds for demo purposes
      setTimeout(() => {
        setIsRecording(false);
        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: "I need someone to help my dad with his physical therapy exercises next week." };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        triggerAIResponse(userMsg.text);
      }, 3000);
    }
  };

  const triggerAIResponse = (userText: string) => {
    setTimeout(() => {
      let aiResponse = "";
      let isAction = false;

      const lowerInput = userText.toLowerCase();
      
      if (lowerInput.includes('emergency') || lowerInput.includes('chest pain') || lowerInput.includes('fall')) {
        aiResponse = "It sounds like this might be a medical emergency. I cannot provide medical diagnoses. Please call emergency services immediately.";
      } else if (messages.length === 1) {
        aiResponse = "I can certainly help you find a caregiver. What days of the week and roughly what hours do you need someone?";
      } else if (messages.length === 3) {
        aiResponse = "Got it. Tuesdays and Thursdays from 9am to 3pm. Does your mother have any specific needs, like mobility assistance or medication management?";
      } else {
        aiResponse = "I've found some excellent caregivers who match your schedule and requirements. Would you like to review them now?";
        isAction = true;
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: aiResponse, isAction }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-surface-50 relative">
      <EmergencyFAB />
      
      <header className="flex items-center justify-between p-4 bg-white border-b border-surface-200 shrink-0 sticky top-0 z-10 min-h-[72px]">
        <button onClick={() => navigate(-1)} className="p-2 -ms-2 text-text-700 hover:text-text-900 rounded-full hover:bg-surface-50 rtl:rotate-180">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
          <span className="font-semibold text-text-900">{t('home.chat_title')}</span>
          <span className="text-xs text-text-500 flex items-center">
            <Sparkles className="w-3 h-3 me-1 text-primary-500" />
            AI Coordinator
          </span>
        </div>
        <div className="w-24"></div> {/* Spacer for FAB */}
      </header>

      <div className="bg-orange-50 p-3 text-xs text-orange-800 flex items-start px-4 shrink-0 border-b border-orange-100">
        <AlertTriangle className="w-4 h-4 me-2 shrink-0 mt-0.5" />
        <p>{t('chat.disclaimer')}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={cn(
              "max-w-[85%] rounded-2xl p-4",
              msg.sender === 'user' 
                ? "bg-primary-600 text-white rounded-ee-sm ms-auto" 
                : "bg-white border border-surface-200 text-text-900 rounded-es-sm me-auto"
            )}
          >
            <p className="text-[15px] leading-relaxed">{msg.text}</p>
            {msg.isAction && (
              <div className="mt-4">
                <Button size="sm" className="w-full" onClick={() => navigate('/results')}>
                  See Matches
                </Button>
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <div className="bg-white border border-surface-200 rounded-2xl rounded-es-sm p-4 w-16 me-auto">
            <div className="flex gap-1 justify-center h-4 items-center">
              <div className="w-2 h-2 bg-surface-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-surface-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-surface-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-surface-200 shrink-0 pb-safe">
        <div className="flex items-center gap-2 relative">
          <button
            onClick={handleMicClick}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all",
              isRecording 
                ? "bg-red-500 text-white animate-pulse" 
                : "bg-surface-100 text-text-600 hover:bg-surface-200"
            )}
          >
            <Mic className="w-5 h-5" />
          </button>
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "Listening..." : t('chat.placeholder')}
              disabled={isRecording}
              className="flex-1 h-14 ps-5 pe-12 rounded-full border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-50"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping || isRecording}
              className="absolute end-2 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-surface-200"
            >
              <Send className="w-4 h-4 rtl:-scale-x-100" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
