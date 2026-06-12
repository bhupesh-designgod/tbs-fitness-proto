// ── Coach Screen ──
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Send, Phone, Calendar, FileText } from 'lucide-react';
import { HeroPhoto, PillChip, SplitCTA } from '../components/ui/Components';
import { useApp } from '../context/AppContext';
import { BIKI, BIKI_CHAT_HISTORY, NEXT_CALL, CHECKIN_DUE, PHOTOS, BIKI_MESSAGES } from '../data/mockData';

export default function Coach({ onCheckIn }) {
  const { behaviorState } = useApp();
  const shouldReduce = useReducedMotion();
  const [messages, setMessages] = useState(BIKI_CHAT_HISTORY);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text, ts: 'Just now' }]);

    // Simulate typing + reply
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = BIKI_MESSAGES[behaviorState] || BIKI_MESSAGES.ON_TRACK;
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [...prev, { from: 'biki', text: reply, ts: 'Just now' }]);
    }, 1800);
  };

  return (
    <div className="pb-24">
      {/* Biki portrait hero */}
      <HeroPhoto src={PHOTOS.bikiPortrait} height={240} heavy>
        <h1 className="font-display text-[38px] font-extrabold leading-none tracking-tight text-white">
          {BIKI.name}
        </h1>
        <p className="font-body text-[13px] text-white/50 mt-1">{BIKI.title}</p>
      </HeroPhoto>

      {/* Pinned cards */}
      <div className="px-5 -mt-4 relative z-10 space-y-3">
        {/* Next call */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-4"
          style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Phone size={16} strokeWidth={1.5} className="text-white/40" />
            <span className="font-body text-[13px] text-white/50">Next call</span>
          </div>
          <p className="font-display text-[18px] font-bold text-white">{NEXT_CALL.date}</p>
          <p className="font-body text-[13px] text-white/50 mt-0.5">{NEXT_CALL.time}</p>
          <div className="flex gap-2 mt-3">
            <SplitCTA leftLabel="Reschedule" rightLabel="Join" onLeft={() => {}} onRight={() => {}} />
          </div>
        </motion.div>

        {/* Check-in due */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-4"
          style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={16} strokeWidth={1.5} className="text-white/40" />
              <span className="font-body text-[13px] text-white/50">Weekly check-in</span>
            </div>
            <PillChip active>{CHECKIN_DUE.status === 'pending' ? 'Due' : 'Sent'}</PillChip>
          </div>
          <p className="font-display text-[15px] font-bold text-white mt-2">{CHECKIN_DUE.date}</p>
          {CHECKIN_DUE.status === 'pending' && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onCheckIn}
              className="mt-3 w-full py-2.5 rounded-xl bg-gold-gradient font-body text-[14px] font-medium text-black"
            >
              Start check-in
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Chat thread */}
      <div className="px-5 mt-6">
        <div className="metallic-divider mb-4" />
        <h3 className="font-display text-[14px] font-bold text-white/50 uppercase tracking-wider mb-4">Messages</h3>

        <div className="space-y-3">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={shouldReduce ? {} : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5"
                style={{
                  background: msg.from === 'user' ? '#1A1A1A' : '#121212',
                  border: msg.from === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="font-body text-[14px] text-white/80 leading-relaxed">{msg.text}</p>
                <p className="font-body text-[10px] text-white/25 mt-1">{msg.ts}</p>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-1 px-4 py-3"
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.3)' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Chat input */}
      <div className="fixed bottom-[72px] left-0 right-0 z-20 mx-auto px-5 pb-2" style={{ maxWidth: 430 }}>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2.5"
          style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message Biki..."
            className="flex-1 bg-transparent font-body text-[14px] text-white placeholder:text-white/25 outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-gradient"
          >
            <Send size={14} strokeWidth={1.5} className="text-black" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
