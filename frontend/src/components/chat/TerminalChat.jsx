import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Hash,
  Users,
  Shield,
  Clock,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[600px]">
        
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
                Team Roster
              </span>
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-700">{m.name}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
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
                - {activeChannel?.topic}
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ● Live Sync
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#172b4d]">{msg.username}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-blue-100 text-[#0052cc]">
                      {msg.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">[{msg.timestamp}]</span>
                </div>

                <p className="text-slate-700 leading-relaxed pt-0.5">
                  {msg.text}
                </p>
              </div>
            ))}
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
              placeholder={`Message #${activeChannel?.name}...`}
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
