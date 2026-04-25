import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, AlertTriangle, Users, MapPin, Zap, RefreshCw, ChevronRight } from 'lucide-react';
import type { GameScenario } from './types';
import { analyzePilaImage } from './services/geminiService';

// Components
const LoadingOverlay = () => {
  const messages = [
    "Locating the end of the line...",
    "Bribing the guard with skyflakes...",
    "Identifying the 'Singit-king'...",
    "Measuring the heat index...",
    "Listening to Tita's complaints...",
    "Scanning for Senior Citizen priority lane...",
    "Negotiating with tricycle drivers..."
  ];
  
  const [index, setIndex] = useState(0);
  
  React.useEffect(() => {
    const itv = setInterval(() => {
      setIndex(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(itv);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mb-8"
      >
        <RefreshCw size={64} className="text-manila-yellow" />
      </motion.div>
      <motion.h2 
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-2xl font-black text-manila-yellow uppercase text-center font-mono"
      >
        {messages[index]}
      </motion.h2>
      <div className="mt-12 w-64 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-manila-yellow"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<GameScenario | null>(null);
  const [gameState, setGameState] = useState<'upload' | 'game' | 'result'>('upload');
  const [actionResult, setActionResult] = useState<{msg: string, type: 'success' | 'fail'} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    
    try {
      const data = await analyzePilaImage(file);
      setScenario(data);
      setGameState('game');
    } catch (err) {
      console.error(err);
      alert("System Overload: The PILA was too chaotic even for our AI. Try a different photo.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: GameScenario['playerActions'][0]) => {
    const isSuccess = Math.random() < action.successChance;
    setActionResult({
      msg: isSuccess ? action.success : action.fail,
      type: isSuccess ? 'success' : 'fail'
    });
    setGameState('result');
  };

  const reset = () => {
    setGameState('upload');
    setFile(null);
    setScenario(null);
    setActionResult(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <AnimatePresence>
        {loading && <LoadingOverlay />}
      </AnimatePresence>

      <div className="w-full max-w-5xl">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic text-vibrant-pink drop-shadow-md leading-none"
            >
              Pila Royale
            </motion.h1>
            <p className="text-lg font-bold mt-1">
              AI BACKEND ENGINE v1.02: <span className="text-vibrant-blue animate-pulse">SCANNING CHAOS...</span>
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white border-4 border-black p-3 rounded-2xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] uppercase font-black opacity-60 leading-none mb-1">Engine Temp</p>
              <p className="text-2xl font-black text-vibrant-pink">98°C</p>
            </div>
            <div className="bg-white border-4 border-black p-3 rounded-2xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] uppercase font-black opacity-60 leading-none mb-1">Vibe Check</p>
              <p className="text-2xl font-black text-vibrant-green">94%</p>
            </div>
          </div>
        </header>

        <main>
          {gameState === 'upload' && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bento-card-dark relative overflow-hidden"
            >
              <div className="dot-pattern text-white/10"></div>
              <div className="relative z-10 text-center py-12">
                <div className="mb-8 flex justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-vibrant-yellow flex items-center justify-center animate-pulse">
                    <Upload size={40} className="text-vibrant-yellow" />
                  </div>
                </div>
                <h2 className="text-4xl font-black uppercase mb-4 italic">Feed the Chaos</h2>
                <p className="mb-8 text-vibrant-yellow/80 font-bold max-w-md mx-auto">
                  Capture the gulo. Upload a photo of a real-world pila to generate your survival scenario.
                </p>
                
                <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                  <div className="relative group w-full">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <button className="brutalist-button w-full text-vibrant-dark">
                      {file ? file.name : "Select Input Image"}
                    </button>
                  </div>

                  {file && (
                    <button 
                      onClick={handleSubmit}
                      className="w-full py-4 bg-vibrant-pink text-white border-4 border-black rounded-2xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                    >
                      Initiate Analysis
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'game' && scenario && (
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              <div className="md:col-span-5 flex flex-col gap-6">
                <div className="bento-card-dark relative overflow-hidden flex-grow min-h-[400px]">
                  <div className="dot-pattern text-white/10"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="border-2 border-vibrant-blue rounded-lg p-2 mb-4 bg-black/40">
                       <p className="text-vibrant-green font-mono text-xs uppercase">// SOURCE_IMAGE_ANALYSIS: PR-{Math.floor(Math.random()*9000)+1000}</p>
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-center gap-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-vibrant-blue p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-[10px] text-white/70 uppercase font-black leading-none mb-1">Gulo Factor</p>
                          <div className="flex items-center gap-2">
                            <span className="text-3xl text-white font-black italic">{scenario.imageAnalysis.guloFactor}/10</span>
                          </div>
                        </div>
                        <div className="bg-vibrant-green p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-[10px] text-black/70 uppercase font-black leading-none mb-1">Stressor Level</p>
                          <p className="text-2xl text-vibrant-dark font-black italic uppercase leading-none">Critical</p>
                        </div>
                      </div>

                      <div className="bg-black/20 border-2 border-white/10 rounded-2xl p-4">
                        <p className="text-vibrant-pink uppercase font-black text-xs mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-vibrant-pink rounded-full animate-ping"></span> Environment Hazards
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {scenario.imageAnalysis.environmentalStressors.map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-vibrant-yellow border border-vibrant-yellow/30">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bento-card">
                  <h3 className="text-xs uppercase font-black mb-4 text-vibrant-pink flex items-center gap-2">
                    <span className="w-3 h-3 bg-vibrant-pink rounded-full"></span> Key Characters Detected
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {scenario.imageAnalysis.keyCharacters.map((char, i) => (
                      <div key={i} className="bg-vibrant-yellow border-2 border-black px-4 py-2 rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {char.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 flex flex-col gap-6">
                <div className="bento-card-accent">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black italic uppercase">Random Chaos Event</h2>
                    <span className="text-xs font-black bg-white text-vibrant-pink px-3 py-1 rounded-full border-2 border-black">DIFFICULTY LVL {scenario.imageAnalysis.guloFactor}</span>
                  </div>
                  <p className="text-4xl font-black leading-none mb-3 underline decoration-white/30 truncate uppercase tracking-tighter">
                    "{scenario.randomEvent.title}"
                  </p>
                  <p className="text-lg font-bold leading-tight opacity-90 italic">
                    {scenario.randomEvent.description}
                  </p>
                </div>

                <div className="flex-grow grid grid-rows-3 gap-4">
                  {scenario.playerActions.map((action, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(action)}
                      className="bg-white border-4 border-black rounded-3xl p-5 flex gap-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left hover:bg-vibrant-blue hover:text-white transition-colors group"
                    >
                      <div className={`w-14 h-14 rounded-2xl border-4 border-black flex-none flex items-center justify-center text-vibrant-dark font-black text-2xl italic ${i===0 ? 'bg-vibrant-blue' : i===1 ? 'bg-vibrant-yellow' : 'bg-vibrant-green'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-grow flex flex-col justify-center">
                        <p className="font-black text-xl uppercase leading-tight">{action.action}</p>
                        <div className="text-[10px] font-mono mt-1 font-bold opacity-60 uppercase">
                          Success Odds: {Math.round(action.successChance * 100)}%
                        </div>
                      </div>
                      <ChevronRight className="self-center opacity-40 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'result' && actionResult && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`bento-card-dark relative overflow-hidden text-center py-16 ${actionResult.type === 'success' ? 'border-vibrant-green border-8 shadow-[12px_12px_0px_0px_theme(colors.vibrant-green)]' : 'border-vibrant-pink border-8 shadow-[12px_12px_0px_0px_theme(colors.vibrant-pink)]'}`}
            >
               <div className="dot-pattern opacity-10"></div>
               <div className="relative z-10 max-w-2xl mx-auto px-4">
                <h2 className={`text-7xl font-black uppercase mb-6 italic tracking-tighter ${actionResult.type === 'success' ? 'text-vibrant-green' : 'text-vibrant-pink'}`}>
                  {actionResult.type === 'success' ? 'SUCCESS' : 'SYSTEM FAIL'}
                </h2>
                <p className="text-3xl font-bold mb-12 leading-tight italic">
                   "{actionResult.msg}"
                </p>
                <button 
                  onClick={reset}
                  className="brutalist-button w-full max-w-xs text-vibrant-dark py-5 text-xl"
                >
                  SCAN NEW PILA <RefreshCw size={24} className="inline ml-2" />
                </button>
              </div>
            </motion.div>
          )}
        </main>

        <footer className="mt-12 flex justify-between items-center text-[10px] font-black uppercase opacity-60">
          <p>Logged in as: MARSHALL_{scenario ? 710 : 88}</p>
          <p>© 2026 PILA ROYALE GAME ENGINE • PHILIPPINES DIVISION</p>
        </footer>
      </div>
    </div>
  );
}
