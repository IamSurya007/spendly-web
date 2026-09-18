'use client';

import { useState } from 'react';
import { useOrbitCompanion } from '@/hooks/useOrbitCompanion';
import { OrbitStatusBadge } from '@/components/orbit/OrbitStatusBadge';
import {
  Radio,
  Play,
  Square,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  Code2,
  Cpu,
  Trash2,
  Sparkles,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrbitDemoPage() {
  const {
    status,
    wsUrl,
    startGame,
    endGame,
    reconnect,
    disconnect,
    logs,
    clearLogs,
    lastEventSent,
    isConnected,
  } = useOrbitCompanion();

  const [customGameId, setCustomGameId] = useState<string>('chess-master-402');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received' | 'system'>('all');

  const generateRandomId = () => {
    const prefixes = ['chess', 'blitz', 'rapid', 'arena'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    setCustomGameId(`${prefix}-${num}`);
  };

  const handleStartGame = () => {
    const success = startGame(customGameId || undefined);
    if (success) {
      toast.success(`Event "game_started" sent for ${customGameId}`);
    } else {
      toast.error(`Failed to send "game_started" event. Companion offline.`);
    }
  };

  const handleEndGame = () => {
    const success = endGame(customGameId || undefined);
    if (success) {
      toast.success(`Event "game_ended" sent for ${customGameId}`);
    } else {
      toast.error(`Failed to send "game_ended" event. Companion offline.`);
    }
  };

  const copyToClipboard = (text: string, type: 'url' | 'snippet') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      toast.success('WebSocket URL copied!');
    } else {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
      toast.success('Code snippet copied!');
    }
  };

  const filteredLogs = logs.filter((log) => filterType === 'all' || log.type === filterType);

  const sampleSnippet = `'use client';
import { useOrbitCompanion } from '@/hooks/useOrbitCompanion';

export function ChessControls() {
  const { status, startGame, endGame } = useOrbitCompanion();

  return (
    <div>
      <p>Status: {status}</p>
      <button onClick={() => startGame('chess-101')}>Start Chess Session</button>
      <button onClick={() => endGame('chess-101')}>End Chess Session</button>
    </div>
  );
}`;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0D1B3E] via-[#162B5E] to-[#25468C] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
                <Cpu size={14} className="text-blue-400" />
                Local Desktop Companion Integration
              </span>
              <OrbitStatusBadge status={status} />
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Orbit Flutter Companion Demo
            </h1>
            <p className="text-blue-100/80 text-sm max-w-2xl leading-relaxed">
              Test real-time bidirectional WebSocket event synchronization between your Fiscora Next.js client and the local Flutter desktop app running on <code className="bg-white/10 px-2 py-0.5 rounded text-blue-200 font-mono text-xs">{wsUrl}</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={isConnected ? disconnect : reconnect}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isConnected
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
              }`}
            >
              {isConnected ? <WifiOff size={16} /> : <Wifi size={16} />}
              {isConnected ? 'Disconnect Companion' : 'Connect Companion'}
            </button>

            <button
              onClick={reconnect}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10"
              title="Force Reconnect"
            >
              <RefreshCw size={16} className={status === 'CONNECTING' ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Controls & Event Triggering (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Trigger Card */}
          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E4E7EF] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0D1B3E] flex items-center gap-2">
                  <Zap size={18} className="text-[#3D7FE8]" />
                  Event Dispatch Controls
                </h2>
                <p className="text-xs text-[#7B8399] mt-0.5">
                  Trigger game lifecycle events over WebSocket
                </p>
              </div>
              <OrbitStatusBadge status={status} showText={false} />
            </div>

            {/* Game ID Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#0D1B3E] uppercase tracking-wider flex items-center justify-between">
                <span>Target Game ID</span>
                <button
                  onClick={generateRandomId}
                  className="text-[#3D7FE8] hover:underline text-xs lowercase font-normal"
                >
                  Generate random
                </button>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customGameId}
                  onChange={(e) => setCustomGameId(e.target.value)}
                  placeholder="e.g. chess-101"
                  className="input-base font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                <span className="text-[11px] text-[#7B8399]">Presets:</span>
                {['chess-blitz-01', 'rapid-bullet-99', 'tournament-final'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCustomGameId(preset)}
                    className="text-[11px] bg-[#F0F2F6] hover:bg-[#EEF1F8] text-[#0D1B3E] px-2 py-0.5 rounded border border-[#E4E7EF] font-mono transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={handleStartGame}
                disabled={!isConnected}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1A7A4A] hover:bg-[#15633C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95"
              >
                <Play size={16} className="fill-current" />
                Start Chess Session
              </button>

              <button
                onClick={handleEndGame}
                disabled={!isConnected}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#C0293E] hover:bg-[#9E2032] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95"
              >
                <Square size={16} className="fill-current" />
                End Chess Session
              </button>
            </div>

            {!isConnected && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <Radio size={16} className="text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <span>
                  Companion WebSocket server is currently offline at <code className="font-mono text-amber-900 font-bold">{wsUrl}</code>. Run your Flutter desktop application or mock WebSocket server to enable event triggering.
                </span>
              </div>
            )}
          </div>

          {/* Connection Metadata Card */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0D1B3E] uppercase tracking-wider">
              Connection Settings
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#F0F2F6] rounded-xl border border-[#E4E7EF]">
                <span className="text-[#7B8399] font-medium">WS Server URL</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-[#0D1B3E] font-semibold">{wsUrl}</code>
                  <button
                    onClick={() => copyToClipboard(wsUrl, 'url')}
                    className="p-1 text-[#7B8399] hover:text-[#0D1B3E] transition-colors"
                  >
                    {copiedUrl ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#F0F2F6] rounded-xl border border-[#E4E7EF]">
                <span className="text-[#7B8399] font-medium">Env Variable</span>
                <code className="font-mono text-[#3D7FE8] font-semibold">NEXT_PUBLIC_ORBIT_WS_URL</code>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#F0F2F6] rounded-xl border border-[#E4E7EF]">
                <span className="text-[#7B8399] font-medium">Auto Reconnect</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Sparkles size={12} /> Active (Exponential Backoff)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Logs Terminal & Protocol Inspector (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-time Log Console */}
          <div className="card overflow-hidden flex flex-col h-[520px]">
            {/* Terminal Header */}
            <div className="bg-[#0D1B3E] px-5 py-3.5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-[#3D7FE8]" />
                <span className="text-white text-xs font-mono font-semibold">
                  Orbit Payload Console
                </span>
                <span className="bg-white/10 text-white/70 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {filteredLogs.length} events
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Selector */}
                <div className="flex bg-white/10 rounded-lg p-0.5 text-[11px] font-mono text-white/70">
                  {(['all', 'sent', 'received', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-2 py-0.5 rounded-md capitalize transition-colors ${
                        filterType === t ? 'bg-[#3D7FE8] text-white font-bold' : 'hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  onClick={clearLogs}
                  className="p-1 text-white/60 hover:text-rose-400 transition-colors"
                  title="Clear console logs"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 bg-[#091228] p-4 font-mono text-xs overflow-y-auto space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-2 py-12">
                  <Terminal size={32} />
                  <p className="text-xs">No WebSocket activity logs yet.</p>
                  <p className="text-[11px]">Trigger a game event or connect companion to view live events.</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border bg-black/30 space-y-1.5 transition-all animate-slide-up"
                    style={{
                      borderColor:
                        log.type === 'sent'
                          ? '#1A7A4A40'
                          : log.type === 'received'
                          ? '#3D7FE840'
                          : log.type === 'error'
                          ? '#C0293E40'
                          : '#ffffff15',
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.type === 'sent'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : log.type === 'received'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : log.type === 'error'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}
                        >
                          {log.type}
                        </span>
                        <span className="text-white/80">{log.text}</span>
                      </div>
                      <span className="text-white/40 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {log.payload && (
                      <pre className="p-2 bg-black/50 rounded text-[11px] text-blue-200 overflow-x-auto border border-white/5">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick React Implementation Reference */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0D1B3E] flex items-center gap-2">
                <Code2 size={18} className="text-[#3D7FE8]" />
                Integration Code Snippet
              </h3>
              <button
                onClick={() => copyToClipboard(sampleSnippet, 'snippet')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#3D7FE8] hover:underline"
              >
                {copiedSnippet ? (
                  <>
                    <Check size={14} className="text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Code
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#091228] p-4 rounded-xl border border-[#0D1B3E]/20 font-mono text-xs text-blue-100 overflow-x-auto">
              <pre>{sampleSnippet}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
