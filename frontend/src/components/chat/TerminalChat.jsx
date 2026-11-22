import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Hash,
  Users,
  Shield,
  Clock,
  Sparkles,
  MessageSquare,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Distinct sender colors for group chat members (like WhatsApp)
const SENDER_COLORS = [
  '#0052cc', // Blue
  '#059669', // Emerald
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#db2777', // Pink
  '#ca8a04', // Amber
  '#2563eb', // Royal Blue
];

const getSenderColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length];
};

export function TerminalChat() {
  const {
    channels,
    activeChannelId,
    setActiveChannelId,
    chatMessages,
    sendChatMessage,
    members,
    currentUser,
    currentOrg,
    tabClientId,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendChatMessage(inputMessage.trim());
    setInputMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[620px]">
        
        {/* Left: Channels & Roster (3 cols) */}
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Team Channels
              </span>
              <div className="space-y-1">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                      ch.id === activeChannelId
                        ? 'bg-blue-50 text-[#0052cc] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ch.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Roster */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Team Roster ({members.length})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {members.map((m) => (
                  <div key={m.id || m.userId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{ backgroundColor: getSenderColor(m.name || 'Member') }}
                        >
                          {(m.name || 'M').slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-slate-700 truncate max-w-[130px]">
                        {m.name}
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Feed & Input (9 cols) */}
        <div className="md:col-span-9 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-xs overflow-hidden">
          
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#0052cc]" />
              <span className="font-bold text-sm text-[#172b4d]">{activeChannel?.name}</span>
              <span className="text-slate-400 text-xs hidden sm:inline">
                - {activeChannel?.topic || activeChannel?.description || 'Team discussions'}
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync</span>
            </span>
          </div>

          {/* Messages Stream (WhatsApp Group Chat Style) */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/40">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0052cc] flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm mb-1">
                  Welcome to #{activeChannel?.name}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  This is the start of the #{activeChannel?.name} team channel. Send a message to collaborate in real-time with your team!
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const currentUserIdStr = (currentUser?.id || currentUser?._id)?.toString();
                const msgUserIdStr = (msg.userId || msg.senderId)?.toString();

                // Differentiate outgoing (sent from this active tab/client) vs incoming (received from peers)
                let isMe = false;
                if (msg.senderClientId && tabClientId) {
                  isMe = msg.senderClientId === tabClientId;
                } else if (currentUserIdStr && msgUserIdStr) {
                  isMe = currentUserIdStr === msgUserIdStr;
                }

                const senderName = msg.userName || msg.username || msg.senderName || 'Team Member';
                const senderAvatar = msg.userAvatar || msg.avatar || msg.senderAvatar;
                const senderRole = msg.role || 'member';
                const timeString = msg.timestamp || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

                return (
                  <div
                    key={msg.id || msg._id || Math.random()}
                    className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Incoming: Sender Avatar */}
                    {!isMe && (
                      <div className="shrink-0 mb-1">
                        {senderAvatar ? (
                          <img
                            src={senderAvatar}
                            alt={senderName}
                            className="w-7 h-7 rounded-full object-cover shadow-2xs border border-slate-200"
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-2xs"
                            style={{ backgroundColor: getSenderColor(senderName) }}
                          >
                            {senderName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* WhatsApp-Style Message Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2 rounded-2xl shadow-xs transition-shadow ${
                        isMe
                          ? 'bg-[#d9fdd3] text-slate-900 border border-[#bbf7d0] rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {/* Group Chat Sender Header: ALWAYS clearly identifies the sender name */}
                      <div className="flex items-center justify-between gap-3 pb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-bold text-xs"
                            style={{ color: isMe ? '#065f46' : getSenderColor(senderName) }}
                          >
                            {senderName}
                          </span>
                          {isMe ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                              You
                            </span>
                          ) : (
                            senderRole && senderRole !== 'member' && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-[#0052cc] border border-blue-100">
                                {senderRole}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Message Content */}
                      <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                        {msg.text}
                      </p>

                      {/* Timestamp & Status Indicator */}
                      <div className="flex items-center justify-end gap-1 text-[10px] font-mono pt-1 text-slate-400">
                        <span className={isMe ? 'text-emerald-700' : 'text-slate-400'}>
                          {timeString}
                        </span>
                        {isMe && (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message #${activeChannel?.name || 'general'}...`}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0052cc] rounded-xl"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
