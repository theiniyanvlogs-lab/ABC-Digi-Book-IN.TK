import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause,
  Camera, RotateCcw, Settings, X, Trash2, LockKeyhole
} from 'lucide-react';
import { ALPHABET, ACTIVATION_CODES } from './constants';
import {
  KEYS, getValue, setValue, removeValue, getBool, getNum, getFingerprint, isActivatedForThisDevice
} from './storage';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isActivatedForThisDevice());
  const [activationInput, setActivationInput] = useState('');
  const [activationError, setActivationError] = useState('');

  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    Math.min(Math.max(getNum(KEYS.currentIndex, 0), 0), ALPHABET.length - 1),
  );
  const [isMuted, setIsMuted] = useState<boolean>(() => getBool(KEYS.isMuted, false));
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [babyPhoto, setBabyPhoto] = useState<string | null>(() => getValue(KEYS.babyPhoto) || null);
  const [speechRate, setSpeechRate] = useState<number>(() => getNum(KEYS.speechRate, 0.85));
  const [speechPitch, setSpeechPitch] = useState<number>(() => {
    const saved = getNum(KEYS.speechPitch, 1.15);
    return Math.max(0.8, saved);
  });
  const [showSettings, setShowSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => getValue(KEYS.selectedVoiceURI));
  const [speechSupported] = useState<boolean>(
    typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
  );
  const [speechReady, setSpeechReady] = useState<boolean>(() => getBool(KEYS.speechUnlocked, false));
  const [speechStatus, setSpeechStatus] = useState<string>('');

  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentItem = useMemo(() => ALPHABET[currentIndex], [currentIndex]);

  useEffect(() => { if (isUnlocked) setValue(KEYS.currentIndex, String(currentIndex)); }, [currentIndex, isUnlocked]);
  useEffect(() => { if (isUnlocked) setValue(KEYS.isMuted, String(isMuted)); }, [isMuted, isUnlocked]);
  useEffect(() => { if (isUnlocked) setValue(KEYS.speechRate, String(speechRate)); }, [speechRate, isUnlocked]);
  useEffect(() => { if (isUnlocked) setValue(KEYS.speechPitch, String(speechPitch)); }, [speechPitch, isUnlocked]);
  useEffect(() => { if (isUnlocked && selectedVoiceURI) setValue(KEYS.selectedVoiceURI, selectedVoiceURI); }, [selectedVoiceURI, isUnlocked]);
  useEffect(() => { if (isUnlocked && babyPhoto) setValue(KEYS.babyPhoto, babyPhoto); }, [babyPhoto, isUnlocked]);
  useEffect(() => { setValue(KEYS.speechUnlocked, String(speechReady)); }, [speechReady]);

  useEffect(() => {
    if (!speechSupported || !isUnlocked) return;
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (availableVoices.length > 0 && !selectedVoiceURI) {
        const femaleLike = availableVoices.find(v =>
          /female|zira|samantha|karen|susan|anna|victoria|google us english|en-us/i.test(v.name)
        );
        const preferred = femaleLike || availableVoices.find(v => v.default) || availableVoices[0];
        if (preferred) setSelectedVoiceURI(preferred.voiceURI);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    const t1 = window.setTimeout(updateVoices, 300);
    const t2 = window.setTimeout(updateVoices, 1000);
    const t3 = window.setTimeout(updateVoices, 2000);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoiceURI, speechSupported, isUnlocked]);

  const speak = useCallback((text: string) => {
    if (!speechSupported || isMuted || !isUnlocked || !speechReady) return false;

    try {
      window.speechSynthesis.cancel();

      const attemptSpeak = (delay: number) => {
        window.setTimeout(() => {
          try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speechRate;
            utterance.pitch = Math.max(0.8, speechPitch);
            utterance.volume = 1;

            if (selectedVoiceURI) {
              const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
              if (voice) utterance.voice = voice;
            }

            utterance.onstart = () => setSpeechStatus('Speaking...');
            utterance.onend = () => setSpeechStatus('');
            utterance.onerror = () => setSpeechStatus('Voice blocked on this device/app');

            window.speechSynthesis.speak(utterance);
          } catch {}
        }, delay);
      };

      attemptSpeak(0);
      attemptSpeak(120);

      return true;
    } catch {
      setSpeechStatus('Voice not available');
      return false;
    }
  }, [speechSupported, isMuted, speechRate, speechPitch, selectedVoiceURI, voices, isUnlocked, speechReady]);

  const unlockSpeech = useCallback(() => {
    if (!speechSupported) {
      setSpeechStatus('Voice not supported on this device');
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(' ');
      utterance.volume = 0;
      utterance.rate = 1;
      utterance.pitch = 1;

      if (selectedVoiceURI) {
        const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
        if (voice) utterance.voice = voice;
      }

      utterance.onend = () => {
        setSpeechReady(true);
        setSpeechStatus('Voice ready');
      };

      utterance.onerror = () => {
        setSpeechReady(true);
        setSpeechStatus('Voice initialized');
      };

      window.speechSynthesis.speak(utterance);

      window.setTimeout(() => {
        setSpeechReady(true);
        setSpeechStatus('Voice ready');
      }, 400);
    } catch {
      setSpeechReady(true);
      setSpeechStatus('Voice ready');
    }
  }, [speechSupported, selectedVoiceURI, voices]);

  const handleActivate = () => {
    const code = activationInput.trim().toUpperCase();
    if (!code) {
      setActivationError('Please enter activation code.');
      return;
    }
    if (!ACTIVATION_CODES.includes(code as (typeof ACTIVATION_CODES)[number])) {
      setActivationError('Invalid code.');
      return;
    }
    const currentDeviceId = getFingerprint();
    setValue(KEYS.activationCode, code);
    setValue(KEYS.deviceId, currentDeviceId);
    setIsUnlocked(true);
    setActivationError('');
  };

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % ALPHABET.length);
  }, []);
  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + ALPHABET.length) % ALPHABET.length);
  }, []);
  const handleFromStarting = useCallback(() => {
    setCurrentIndex(0);
    setIsAutoPlaying(true);
    speak(`${ALPHABET[0].letter} is for ${ALPHABET[0].word}`);
  }, [speak]);

  useEffect(() => {
    if (!isUnlocked || !speechReady) return;
    speak(`${currentItem.letter} is for ${currentItem.word}`);
  }, [currentItem.letter, currentItem.word, speak, isUnlocked, speechReady]);

  useEffect(() => {
    if (!isUnlocked) return;
    if (isAutoPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % ALPHABET.length);
      }, 4000);
    } else if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [isAutoPlaying, isUnlocked]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') setBabyPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setBabyPhoto(null);
    removeValue(KEYS.babyPhoto);
  };

  const selectedVoice = voices.find(voice => voice.voiceURI === selectedVoiceURI);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-rose-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border-[8px] border-indigo-300 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
              <LockKeyhole size={40} className="text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-indigo-600">INTK Kids Alphabet</h1>
          <p className="mt-3 text-gray-600 font-semibold">
            Welcome! Enter your family activation code one time on this device.
          </p>

          <input
            type="text"
            value={activationInput}
            onChange={(e) => {
              setActivationInput(e.target.value.toUpperCase());
              setActivationError('');
            }}
            placeholder="INTK-KID-0000"
            className="mt-6 w-full px-5 py-4 rounded-2xl border-4 border-indigo-200 text-center text-lg font-bold tracking-wide focus:outline-none focus:border-indigo-400"
          />

          {activationError && (
            <p className="mt-3 text-rose-600 font-bold">{activationError}</p>
          )}

          <button
            onClick={handleActivate}
            className="mt-6 w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-xl font-bold shadow-lg"
          >
            Unlock App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between p-4 md:p-8 font-['Comic_Sans_MS',_cursive,_sans-serif]">
      <div className="w-full max-w-4xl flex flex-col items-center gap-2 text-center">
        <motion.h1
          key={currentItem.word}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-7xl font-bold text-rose-500 flex flex-wrap items-center justify-center gap-3"
        >
          {currentItem.word} <span className="text-5xl md:text-8xl">{currentItem.emoji}</span>
        </motion.h1>
        {speechStatus && (
          <p className="text-sm font-bold text-indigo-500">{speechStatus}</p>
        )}
      </div>

      <div className="flex-1 w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 py-8">
        <motion.div className="relative group w-full max-w-sm aspect-square bg-white rounded-[40px] shadow-2xl border-[12px] border-yellow-400 overflow-hidden flex items-center justify-center">
          {babyPhoto ? (
            <>
              <img src={babyPhoto} alt="Baby" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute bottom-3 right-3 flex gap-2 z-20">
                <label className="cursor-pointer px-4 py-2 bg-white/90 rounded-full shadow-lg font-bold text-sm">
                  Change
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                <button onClick={handleRemovePhoto} className="px-4 py-2 bg-rose-500 text-white rounded-full shadow-lg font-bold text-sm flex items-center gap-1">
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </>
          ) : (
            <label className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400 p-8 text-center cursor-pointer">
              <Camera size={64} />
              <p className="text-xl font-bold">Click to add your baby's photo!</p>
              <p className="text-sm">Saved on this device only</p>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          )}
        </motion.div>

        <motion.div
          key={currentItem.letter}
          className={`w-full max-w-sm aspect-square rounded-[40px] shadow-2xl border-[12px] border-yellow-400 flex items-center justify-center bg-gradient-to-br ${currentItem.color}`}
        >
          <span className="text-[150px] md:text-[240px] font-bold text-white drop-shadow-lg">
            {currentItem.letter}
          </span>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center gap-6">
        {!speechReady && (
          <button
            onClick={unlockSpeech}
            className="w-full max-w-md py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl text-lg md:text-xl font-bold shadow-lg"
          >
            Tap here once to enable female voice 🔊
          </button>
        )}

        <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div className="h-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${((currentIndex + 1) / ALPHABET.length) * 100}%` }} />
        </div>

        <p className="text-2xl font-semibold text-indigo-600">
          Letter {currentIndex + 1} of {ALPHABET.length}
        </p>

        <div className="flex flex-wrap justify-center gap-4 pb-4">
          <button onClick={handleFromStarting} className="flex items-center gap-2 px-6 py-4 bg-purple-500 text-white rounded-full text-xl md:text-2xl font-bold shadow-lg">
            <RotateCcw size={28} /> From Start
          </button>
          <button onClick={handlePrev} className="flex items-center gap-2 px-6 py-4 bg-cyan-400 text-white rounded-full text-xl md:text-2xl font-bold shadow-lg">
            <ChevronLeft size={28} /> Previous
          </button>
          <button onClick={() => speak(`${currentItem.letter} is for ${currentItem.word}`)} className="flex items-center gap-2 px-6 py-4 bg-rose-400 text-white rounded-full text-xl md:text-2xl font-bold shadow-lg">
            <Volume2 size={28} /> Speak
          </button>
          <button onClick={() => setIsMuted(prev => !prev)} className={`flex items-center gap-2 px-6 py-4 ${isMuted ? 'bg-gray-400' : 'bg-amber-400'} text-white rounded-full text-xl md:text-2xl font-bold shadow-lg`}>
            {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />} {isMuted ? 'Muted' : 'Mute'}
          </button>
          <button onClick={() => setIsAutoPlaying(prev => !prev)} className={`flex items-center gap-2 px-6 py-4 ${isAutoPlaying ? 'bg-indigo-400' : 'bg-emerald-400'} text-white rounded-full text-xl md:text-2xl font-bold shadow-lg`}>
            {isAutoPlaying ? <Pause size={28} /> : <Play size={28} />} {isAutoPlaying ? 'Pause' : 'Auto Play'}
          </button>
          <button onClick={handleNext} className="flex items-center gap-2 px-6 py-4 bg-emerald-400 text-white rounded-full text-xl md:text-2xl font-bold shadow-lg">
            Next <ChevronRight size={28} />
          </button>
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-6 py-4 bg-slate-500 text-white rounded-full text-xl md:text-2xl font-bold shadow-lg">
            <Settings size={28} /> Voice Settings
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[40px] p-6 md:p-8 w-full max-w-md shadow-2xl relative border-[8px] border-indigo-400">
              <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
                <X size={28} className="text-gray-500" />
              </button>

              <h2 className="text-2xl md:text-3xl font-bold text-indigo-600 mb-8 flex items-center gap-3">
                <Settings size={28} /> Female Voice Settings
              </h2>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-lg md:text-xl font-bold text-gray-700 block">Select Voice</label>
                  <select value={selectedVoiceURI} onChange={(e) => setSelectedVoiceURI(e.target.value)} className="w-full p-4 bg-gray-100 rounded-2xl border-4 border-indigo-200 text-base md:text-lg font-bold text-gray-700">
                    {voices.length === 0 ? (
                      <option value="">No voices available yet</option>
                    ) : (
                      voices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))
                    )}
                  </select>
                  {selectedVoice && (
                    <p className="text-sm text-gray-500 font-semibold">
                      Current: {selectedVoice.name} ({selectedVoice.lang})
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      const femaleLike = voices.find(v =>
                        /female|zira|samantha|karen|susan|anna|victoria|google us english|en-us/i.test(v.name)
                      );
                      if (femaleLike) {
                        setSelectedVoiceURI(femaleLike.voiceURI);
                        setSpeechStatus('Female voice selected');
                      } else if (voices[0]) {
                        setSelectedVoiceURI(voices[0].voiceURI);
                        setSpeechStatus('Default voice selected');
                      }
                    }}
                    className="w-full py-4 rounded-3xl border-4 border-pink-300 bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold text-xl flex items-center justify-center gap-3"
                  >
                    👩 Female Voice
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-lg md:text-xl font-bold text-gray-700">Speed (Rate)</label>
                    <span className="text-base md:text-lg font-mono bg-gray-100 px-3 py-1 rounded-lg">{speechRate.toFixed(1)}x</span>
                  </div>
                  <input type="range" min="0.7" max="1.2" step="0.1" value={speechRate} onChange={(e) => setSpeechRate(parseFloat(e.target.value))} className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-lg md:text-xl font-bold text-gray-700">Tone (Pitch)</label>
                    <span className="text-base md:text-lg font-mono bg-gray-100 px-3 py-1 rounded-lg">{speechPitch.toFixed(1)}</span>
                  </div>
                  <input type="range" min="0.8" max="1.6" step="0.1" value={speechPitch} onChange={(e) => setSpeechPitch(parseFloat(e.target.value))} className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                </div>

                <button onClick={() => { unlockSpeech(); window.setTimeout(() => speak('Hello! I am your female voice.'), 250); }} className="w-full py-4 bg-indigo-500 text-white rounded-2xl text-lg md:text-xl font-bold shadow-lg">
                  <Volume2 size={24} /> Test Female Voice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
