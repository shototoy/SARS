import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Send, UserCircle2, MoreVertical, Phone, Video, Paperclip, Smile, ChevronLeft } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { profileImgUrl } from '../lib/db';
import dayjs from 'dayjs';

export default function MessagesView({ user, users, messages, onSendMessage, initialSelectedUserId, onBack }) {
  const colors = useTheme();
  const selectedUser = useMemo(() => users.find(u => u.id == initialSelectedUserId), [users, initialSelectedUserId]);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  const chatMessages = useMemo(() => {
    if (!selectedUser) return [];
    return messages
      .filter(m =>
        (m.sender_id == user.id && m.receiver_id == selectedUser.id) ||
        (m.sender_id == selectedUser.id && m.receiver_id == user.id)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [messages, selectedUser, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = () => {
    if (!text.trim() || !selectedUser) return;
    onSendMessage({ receiverId: selectedUser.id, content: text });
    setText('');
  };

  if (!selectedUser) return null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white dark:bg-gray-950">
      { }
      <div className="flex items-center justify-between border-b border-gray-50 p-4 dark:border-gray-900 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-brand transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="h-12 w-12 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
            <img src={profileImgUrl(selectedUser.username)} className="h-full w-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
            <div className="hidden h-full w-full items-center justify-center font-black text-brand text-lg uppercase">{selectedUser.username[0]}</div>
          </div>
          <div>
            <p className="text-base font-black leading-tight">{selectedUser.full_name || selectedUser.username}</p>
            <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Active Now</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-3 text-gray-400 hover:text-brand transition-colors"><Phone size={20} /></button>
          <button className="p-3 text-gray-400 hover:text-brand transition-colors"><Video size={20} /></button>
          <button className="p-3 text-gray-400 hover:text-brand transition-colors"><MoreVertical size={20} /></button>
        </div>
      </div>

      { }
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        {chatMessages.map((m, i) => {
          const isMe = m.sender_id === user.id;
          const prevMsg = chatMessages[i - 1];
          const showAvatar = !isMe && (!prevMsg || prevMsg.sender_id !== m.sender_id);

          return (
            <div key={m.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMe && (
                <div className="h-7 w-7 flex-shrink-0">
                  {showAvatar && (
                    <div className="h-full w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      <img src={profileImgUrl(selectedUser.username)} className="h-full w-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
                      <div className="hidden h-full w-full items-center justify-center font-black text-[10px] text-brand uppercase">{selectedUser.username[0]}</div>
                    </div>
                  )}
                </div>
              )}
              <div className="max-w-[75%] space-y-1">
                <div
                  className={`rounded-[20px] px-4 py-2 text-sm font-bold shadow-sm ${isMe
                    ? 'rounded-br-none bg-brand text-white'
                    : 'rounded-bl-none bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}
                  style={isMe ? { backgroundColor: colors.main } : {}}
                >
                  {m.content}
                </div>
                <p className={`text-[9px] font-bold text-gray-400 ${isMe ? 'text-right' : 'text-left'}`}>
                  {dayjs(m.timestamp).format('HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      { }
      <div className="p-4 pb-12 bg-white dark:bg-gray-950 shrink-0">
        <div className="flex items-center gap-2 rounded-3xl bg-gray-50 p-1.5 pl-4 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <button className="text-gray-400 hover:text-brand transition-colors"><Paperclip size={18} /></button>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent py-2 text-sm font-bold outline-none"
          />
          <button className="p-2 text-gray-400 hover:text-brand transition-colors"><Smile size={18} /></button>
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg transition-all active:scale-90 disabled:opacity-50`}
            style={{ backgroundColor: colors.main }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function X({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12" /><path d="m6 6 12 12" /></svg>
  );
}

function MessageSquare({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  );
}
