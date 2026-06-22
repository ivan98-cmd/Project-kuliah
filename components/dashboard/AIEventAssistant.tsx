'use client';

interface AIEventAssistantProps {
  messages: Array<{ role: 'user' | 'assistant'; text: string }>;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export default function AIEventAssistant({ messages, inputValue, onInputChange, onSendMessage }: AIEventAssistantProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI Event Assistant</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">Bantuan cerdas untuk event Anda</h2>
        <p className="mt-2 text-slate-400">Tanyakan strategi event, peserta, rundown, atau laporan secara langsung.</p>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`rounded-3xl p-5 ${message.role === 'assistant' ? 'bg-slate-950/90 text-slate-100' : 'bg-slate-900/80 text-slate-200'}`}>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{message.role === 'assistant' ? 'Asisten AI' : 'Anda'}</p>
              <p className="mt-3 text-sm leading-7">{message.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Tanyakan tentang peserta, event, atau laporan"
            className="w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
          />
          <button
            type="button"
            onClick={onSendMessage}
            className="rounded-3xl bg-[#5C4BD5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7C53F2]">
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
