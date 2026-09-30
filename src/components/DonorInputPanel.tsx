import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Volume2, 
  Trash2, 
  Info, 
  Wand2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { PRESET_SCENARIOS } from '../data/mockData';
import { cyberSound } from '../utils/soundEffects';

interface DonorInputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  onParse: (text: string) => void;
  isAnalyzing: boolean;
}

export const DonorInputPanel: React.FC<DonorInputPanelProps> = ({
  inputText,
  setInputText,
  onParse,
  isAnalyzing
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [micStatusMsg, setMicStatusMsg] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const baseTextRef = useRef<string>('');
  const currentTextRef = useRef<string>(inputText);

  // Keep currentTextRef in sync with latest inputText
  useEffect(() => {
    currentTextRef.current = inputText;
  }, [inputText]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Optimized for Indian English & Hinglish accent

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setMicStatusMsg('Listening... Speak hurried Hinglish or English');
      };

      recognition.onresult = (event: any) => {
        // Collect all final and interim results from the current recognition session
        let sessionFinal = '';
        let sessionInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            const transcript = item[0].transcript;
            if (item.isFinal) {
              sessionFinal += transcript + ' ';
            } else {
              sessionInterim += transcript;
            }
          }
        }

        const base = baseTextRef.current ? baseTextRef.current.trim() : '';
        const speechPart = (sessionFinal + sessionInterim).trim();
        
        let combined = '';
        if (base && speechPart) {
          combined = `${base} ${speechPart}`;
        } else {
          combined = base || speechPart;
        }

        if (combined) {
          setInputText(combined);
          currentTextRef.current = combined;
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        if (event.error === 'not-allowed') {
          setMicStatusMsg('Mic permission denied. Using manual or preset input.');
          isListeningRef.current = false;
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // Normal pause in speech, keep listening if user hasn't explicitly stopped
          setMicStatusMsg('Listening... Take your time speaking');
        } else {
          setMicStatusMsg('Speech paused. Click mic to speak again.');
        }
      };

      recognition.onend = () => {
        // If the user did NOT click "Stop Mic", the browser ended due to silence/pause.
        // Save whatever text was spoken as the new base and seamlessly restart.
        if (isListeningRef.current) {
          baseTextRef.current = currentTextRef.current;
          try {
            recognition.start();
            setMicStatusMsg('Listening resumed... Keep speaking');
          } catch (err) {
            // If already started or browser restriction
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
          setMicStatusMsg('');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setInputText]);

  const toggleListening = () => {
    cyberSound.playClick();
    if (!speechSupported) {
      // Friendly fallback simulation
      setMicStatusMsg('Simulating voice dictation...');
      setIsListening(true);
      isListeningRef.current = true;
      const simulatedSample = "3 handi mutton biryani aur 2 handi dal bacha hai at Sun-n-Sand Juhu, around 160 people, Gate 4 kitchen alley, safe till 2:00 AM, call Chef Irfan 9820011223";
      
      const existing = currentTextRef.current.trim();
      const prefix = existing ? existing + ' ' : '';
      let charIdx = 0;
      
      const typeInterval = setInterval(() => {
        charIdx += 4;
        const newText = prefix + simulatedSample.slice(0, charIdx);
        setInputText(newText);
        currentTextRef.current = newText;
        if (charIdx >= simulatedSample.length) {
          clearInterval(typeInterval);
          setIsListening(false);
          isListeningRef.current = false;
          setMicStatusMsg('Simulated voice input captured successfully!');
          cyberSound.playRadarPing();
        }
      }, 50);
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      setMicStatusMsg('');
    } else {
      // When starting a new recording, snapshot any existing text in the box as base
      baseTextRef.current = currentTextRef.current.trim();
      isListeningRef.current = true;
      try {
        recognitionRef.current?.start();
        setMicStatusMsg('Mic active. Speak now...');
      } catch (err) {
        console.error('Failed to start speech recognition', err);
      }
    }
  };

  const handleApplyPreset = (text: string) => {
    cyberSound.playClick();
    baseTextRef.current = text;
    currentTextRef.current = text;
    setInputText(text);
    onParse(text);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    cyberSound.playRadarPing();
    onParse(inputText);
  };

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 sm:p-6 border border-emerald-500/30 relative overflow-hidden shadow-cyber-card">
      {/* Background cyber accent glow */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>1. Rushed Donor Intake Terminal</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Natural NLP
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Type or speak hurried banquet notes in mixed Hinglish / English without formatting
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {isListening && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Recording Voice...
            </span>
          )}
        </div>
      </div>

      {/* Preset Buttons - 3 One-Click Banquet Scenarios */}
      <div className="my-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            1-Click Real-World Banquet Presets:
          </span>
          <span className="text-[11px] text-slate-400">Click to instantly populate & test</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset.text)}
              className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 hover:border-emerald-500/50 transition-all duration-200 group relative flex flex-col justify-between hover:shadow-glow-emerald"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                    {preset.label.split(':')[1]?.trim() || preset.label}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {preset.urgencyHint}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-400/90 mb-1">
                  {preset.badge}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 italic font-sans">
                  "{preset.text}"
                </p>
              </div>
              <div className="mt-2 text-[10px] font-mono text-slate-400 group-hover:text-emerald-400 flex items-center gap-1">
                <span>Load Scenario</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Text Input & Speech Integration */}
      <form onSubmit={handleManualSubmit} className="relative mt-2">
        <div className="relative rounded-xl border border-slate-700/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-slate-950/80 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            placeholder='Paste hurried message here (e.g. "4 handi chicken biryani aur dal bacha hai at Grand Banquet Kandivali, 150-180 people, gate 3, safe till 1:30 AM. Call Chef Ramesh 9820198201")...'
            className="w-full bg-transparent px-4 pt-3 pb-14 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-sans leading-relaxed"
          />

          {/* Bottom Bar inside Input with Mic & Action buttons */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between border-t border-slate-800/80 pt-2 px-1">
            <div className="flex items-center gap-2">
              {/* Working Voice Input Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-glow-rose animate-pulse'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-600/50 hover:text-emerald-300'
                }`}
                title={speechSupported ? 'Click to speak using your microphone' : 'Simulate voice speech input'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    <span>Stop Mic</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Voice Input</span>
                  </>
                )}
              </button>

              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    baseTextRef.current = '';
                    currentTextRef.current = '';
                    cyberSound.playClick();
                  }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {micStatusMsg && (
                <span className="text-[11px] font-mono text-amber-300/90 hidden sm:inline">
                  {micStatusMsg}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
                {inputText.length} chars
              </span>
              <button
                type="submit"
                disabled={!inputText.trim() || isAnalyzing}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-semibold text-xs font-mono transition-all shadow-glow-emerald active:scale-95"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Extraction</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
