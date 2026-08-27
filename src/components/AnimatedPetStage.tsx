import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { InteractivePet2D, PetMood } from './pet2d/InteractivePet2D';
import {
  Heart,
  Sparkles,
  Sun,
  CloudRain,
  Moon,
  Cookie,
  Droplets,
  Gamepad2,
  Volume2,
  VolumeX,
  Cake,
  Flame,
  Star,
  Wind,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PET_THOUGHTS = [
  'Aku senang banget main di kebun bersamamu! 🌸',
  'Ayo selesaikan satu kebiasaan sehat hari ini! 🌿',
  'Segar banget rasanya makan berry manis! 🍓',
  'Usap kepalaku lagi dong, geli dan enak! 🥰',
  'Semangat terus ya, kamu luar biasa! 🌟',
  'Lihat bunga-bunga di taman sedang bermekaran! 🌺',
  'Nyam nyam! Energi kita bertambah terus! ✨',
];

interface FoodDrop {
  id: number;
  type: 'berry' | 'cake' | 'water';
  x: number; // percentage (15% to 85%)
  y: number; // percentage (55% to 80%)
  icon: string;
}

export const AnimatedPetStage: React.FC = () => {
  const { currentPet, pets, switchCompanion, marriage, interactWithPet } = useApp();

  // Weather theme: sun | sunset | rain | night
  const [weatherTheme, setWeatherTheme] = useState<'sun' | 'sunset' | 'rain' | 'night'>('sun');

  // Pet Position on stage (horizontal percentage 20% to 80%)
  const [petX, setPetX] = useState<number>(50);
  const [isFacingLeft, setIsFacingLeft] = useState<boolean>(false);
  const [petMood, setPetMood] = useState<PetMood>('idle');

  // Interactive Items dropped on lawn
  const [activeFood, setActiveFood] = useState<FoodDrop | null>(null);
  const [ballPos, setBallPos] = useState<{ x: number; y: number; bouncing: boolean } | null>(null);

  // Floating speech bubble
  const [speechBubble, setSpeechBubble] = useState<string | null>('Hai! Ayo main dan elus aku di sini! 🐾');

  // Particle bursts
  const [particles, setParticles] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mouse / Pointer tracking for pet eyes
  const stageRef = useRef<HTMLDivElement>(null);
  const [pointerOffset, setPointerOffset] = useState<{ x: number; y: number } | null>(null);

  // Trigger speech
  const triggerSpeech = (text?: string) => {
    const chosen = text || PET_THOUGHTS[Math.floor(Math.random() * PET_THOUGHTS.length)];
    setSpeechBubble(chosen);
    if (soundEnabled) sounds.playPetChirp();
    setTimeout(() => {
      setSpeechBubble(null);
    }, 4200);
  };

  const addParticle = (text: string, x: number = 50, y: number = 50) => {
    const id = Date.now() + Math.random();
    setParticles((prev) => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1400);
  };

  // Track pointer movements for eye gaze
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Center of the pet on screen
    const petPixelX = (petX / 100) * rect.width;
    const petPixelY = rect.height * 0.65;

    const diffX = (clientX - petPixelX) / (rect.width * 0.3);
    const diffY = (clientY - petPixelY) / (rect.height * 0.3);

    setPointerOffset({
      x: Math.max(-1, Math.min(1, diffX)),
      y: Math.max(-1, Math.min(1, diffY)),
    });
  };

  // Autonomous Roaming AI when pet is idle
  useEffect(() => {
    const roamInterval = setInterval(() => {
      if (petMood === 'idle' && !activeFood && !ballPos) {
        const roll = Math.random();
        if (roll < 0.5) {
          // Wander to random position on the grass (20% to 80%)
          const newTargetX = 20 + Math.random() * 60;
          setIsFacingLeft(newTargetX < petX);
          setPetMood('walking');

          // Walk transition
          setTimeout(() => {
            setPetX(newTargetX);
          }, 50);

          setTimeout(() => {
            setPetMood('idle');
          }, 1800);
        } else if (roll < 0.75) {
          triggerSpeech();
        } else {
          // Cheerful jump
          setPetMood('celebrating');
          if (soundEnabled) sounds.playBounce();
          addParticle('✨', petX, 55);
          setTimeout(() => setPetMood('idle'), 1300);
        }
      }
    }, 6000);

    return () => clearInterval(roamInterval);
  }, [petMood, petX, activeFood, ballPos, soundEnabled]);

  // Click on lawn to make pet walk there
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const targetX = Math.max(18, Math.min(82, clickXPercent));

    if (soundEnabled) sounds.playPop();
    addParticle('🐾', targetX, 75);

    setIsFacingLeft(targetX < petX);
    setPetMood('walking');
    setPetX(targetX);

    setTimeout(() => {
      setPetMood('idle');
    }, 1200);
  };

  // Handle direct Petting / Rubbing
  const handlePetRub = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPetMood('petting');
    interactWithPet('pet');
    if (soundEnabled) sounds.playPurr();

    addParticle('💖', petX - 5, 52);
    addParticle('✨', petX + 5, 48);
    triggerSpeech('Aww geli dan hangat! Sayang kamu banget! 🥰');

    setTimeout(() => {
      setPetMood('idle');
    }, 1600);
  };

  // Throw Ball on Grass
  const handleThrowBall = () => {
    if (soundEnabled) sounds.playBounce();
    const targetX = 25 + Math.random() * 50;
    setBallPos({ x: targetX, y: 72, bouncing: true });

    // Pet chases the ball
    setIsFacingLeft(targetX < petX);
    setPetMood('running');
    setPetX(targetX);
    triggerSpeech('Wah ada bola! Aku kejar ya! ⚽🏃');

    // Catches and heads the ball
    setTimeout(() => {
      if (soundEnabled) sounds.playBounce();
      setPetMood('celebrating');
      addParticle('🎉', targetX, 50);
      interactWithPet('play');
      triggerSpeech('Horeee kena sundul bolanya! Yaaay! 🏆');

      setTimeout(() => {
        setBallPos(null);
        setPetMood('idle');
      }, 1200);
    }, 1300);
  };

  // Drop Snack (Berry, Cake, Water)
  const handleDropSnack = (type: 'berry' | 'cake' | 'water') => {
    if (soundEnabled) sounds.playPop();
    const targetX = 20 + Math.random() * 60;
    const icon = type === 'berry' ? '🍓' : type === 'cake' ? '🍰' : '💧';

    setActiveFood({
      id: Date.now(),
      type,
      x: targetX,
      y: 72,
      icon,
    });

    // Pet runs to food
    setIsFacingLeft(targetX < petX);
    setPetMood('running');
    setPetX(targetX);
    triggerSpeech(type === 'water' ? 'Segar! Mau minum air dingin! 💧' : 'Aromanya wangi lezat! Nyam nyam! 🍓');

    // Pet eats food
    setTimeout(() => {
      if (soundEnabled) sounds.playNomNom();
      setPetMood('eating');
      addParticle(type === 'water' ? '💧' : '✨', targetX, 55);

      setTimeout(() => {
        setActiveFood(null);
        setPetMood('celebrating');
        interactWithPet(type === 'water' ? 'water' : 'feed');
        triggerSpeech('Kenyang dan berenergi! Terima kasih banyak! 😋');
        setTimeout(() => setPetMood('idle'), 1200);
      }, 1500);
    }, 1200);
  };

  // Background sky styling based on weatherTheme
  const getSkyStyle = () => {
    switch (weatherTheme) {
      case 'sunset':
        return 'from-[#fb7185] via-[#fdba74] to-[#fef08a]';
      case 'rain':
        return 'from-[#475569] via-[#64748b] to-[#94a3b8]';
      case 'night':
        return 'from-[#090d16] via-[#0f172a] to-[#1e1b4b]';
      case 'sun':
      default:
        return 'from-[#67e8f9] via-[#a5f3fc] to-[#e0f2fe]';
    }
  };

  return (
    <div className="w-full space-y-3 select-none">
      {/* MAIN 2D INTERACTIVE HABITAT STAGE */}
      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onClick={handleStageClick}
        className={`relative w-full h-[360px] sm:h-[420px] rounded-3xl p-5 border border-[#bccabb]/40 shadow-xl overflow-hidden cursor-crosshair transition-all duration-700 flex flex-col justify-between bg-gradient-to-b ${getSkyStyle()}`}
      >
        {/* --- TOP FLOATING CONTROLS & STATUS --- */}
        <div className="relative z-30 flex flex-wrap justify-between items-center w-full gap-2 pointer-events-auto">
          {/* Pet Status & Quick Companion Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[#005e2d] font-black text-xs rounded-full shadow-xs border border-white/80 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-[#006d36] text-[#006d36]" />
              {currentPet.name} • {currentPet.happinessPct}% Happy
            </span>

            {/* Switch Pets */}
            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-full border border-white/60 shadow-xs">
              {(Object.values(pets) as any[]).map((p) => (
                <button
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    switchCompanion(p.id);
                    if (soundEnabled) sounds.playPop();
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                    currentPet.id === p.id
                      ? 'bg-[#006d36] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Sound Toggles */}
          <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md p-1 rounded-full border border-white/60 shadow-xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setWeatherTheme('sun');
              }}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                weatherTheme === 'sun' ? 'bg-[#f59e0b] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Sunny Morning"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setWeatherTheme('sunset');
              }}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                weatherTheme === 'sunset' ? 'bg-[#f43f5e] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Sunset Glow"
            >
              <Flame className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setWeatherTheme('rain');
              }}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                weatherTheme === 'rain' ? 'bg-[#0284c7] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Gentle Rain"
            >
              <CloudRain className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setWeatherTheme('night');
              }}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                weatherTheme === 'night'
                  ? 'bg-[#6366f1] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Starlight Night"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSoundEnabled(!soundEnabled);
              }}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                soundEnabled ? 'text-emerald-700 bg-emerald-100' : 'text-slate-400'
              }`}
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* --- SCENIC 2D PARALLAX BACKGROUND ELEMENTS --- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Sun or Moon */}
          {weatherTheme === 'night' ? (
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute top-10 right-14 w-16 h-16 rounded-full bg-yellow-100 shadow-[0_0_40px_rgba(254,240,138,0.7)] flex items-center justify-center opacity-90"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-950/20" />
            </motion.div>
          ) : weatherTheme === 'sunset' ? (
            <div className="absolute top-14 right-16 w-20 h-20 rounded-full bg-gradient-to-t from-orange-400 to-rose-400 shadow-[0_0_50px_rgba(251,113,133,0.8)] opacity-90" />
          ) : (
            <div className="absolute top-8 right-12 w-20 h-20 rounded-full bg-yellow-300 shadow-[0_0_60px_rgba(253,224,71,0.9)] opacity-95 animate-pulse" />
          )}

          {/* Floating Clouds */}
          <motion.div
            animate={{ x: [-20, 40, -20] }}
            transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
            className="absolute top-12 left-10 w-32 h-10 bg-white/60 rounded-full blur-[1px]"
          />
          <motion.div
            animate={{ x: [30, -30, 30] }}
            transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut' }}
            className="absolute top-20 right-28 w-44 h-12 bg-white/50 rounded-full blur-[1px]"
          />

          {/* Rain FX if rain theme */}
          {weatherTheme === 'rain' && (
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] animate-pulse" />
          )}

          {/* Starlight Night Sparkles */}
          {weatherTheme === 'night' && (
            <div className="absolute inset-0 opacity-70 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
          )}

          {/* Background Hills */}
          <div className="absolute bottom-16 left-[-10%] right-[-10%] h-32 rounded-[50%] bg-emerald-600/30 blur-xs" />
          <div className="absolute bottom-12 left-[-5%] right-[-5%] h-28 rounded-[50%] bg-emerald-700/40 blur-xs" />

          {/* Foreground Lush Grass Lawn */}
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#166534] via-[#15803d] to-[#22c55e] rounded-b-3xl shadow-inner" />
        </div>

        {/* --- INTERACTIVE PET & STAGE CHARACTERS --- */}
        <div className="relative z-20 w-full h-[220px] flex items-center justify-center pointer-events-none">
          {/* Floating Speech Thought Bubble */}
          <AnimatePresence>
            {speechBubble && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ left: `${petX}%` }}
                className="absolute top-1 -translate-x-1/2 bg-white/95 backdrop-blur-md text-[#0d1c2e] text-xs font-black px-4 py-2 rounded-2xl shadow-xl border border-[#bccabb]/50 z-30 flex items-center gap-1.5 pointer-events-auto"
              >
                <span>{speechBubble}</span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white/95 rotate-45 border-r border-b border-[#bccabb]/50" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Particle FX (Hearts, Stars, Crumbs) */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -45, scale: 1.4 }}
                exit={{ opacity: 0 }}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl z-30 pointer-events-none drop-shadow-md"
              >
                {p.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Active Food Item Dropped on Grass */}
          {activeFood && (
            <motion.div
              initial={{ y: -60, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              style={{ left: `${activeFood.x}%`, top: `${activeFood.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl z-25 drop-shadow-lg"
            >
              {activeFood.icon}
            </motion.div>
          )}

          {/* Active Ball Dropped on Grass */}
          {ballPos && (
            <motion.div
              animate={{
                y: ballPos.bouncing ? [0, -40, 0, -20, 0] : 0,
                rotate: [0, 180, 360],
              }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'easeOut' }}
              style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl z-25 drop-shadow-lg cursor-pointer"
            >
              ⚽
            </motion.div>
          )}

          {/* MAIN 2D PET CHARACTER */}
          <div
            style={{
              left: `${petX}%`,
              transition: petMood === 'walking' || petMood === 'running' ? 'left 1.2s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
            }}
            className="absolute bottom-2 -translate-x-1/2 pointer-events-auto"
          >
            <InteractivePet2D
              pet={currentPet}
              mood={petMood}
              pointerPos={pointerOffset}
              isFacingLeft={isFacingLeft}
              onClick={handlePetRub}
              onPet={handlePetRub}
            />
          </div>

          {/* Partner Pet if Married */}
          {marriage.isMarried && (
            <div
              style={{
                left: `${Math.max(15, Math.min(85, petX + (isFacingLeft ? 18 : -18)))}%`,
                transition: 'left 1.5s ease-out',
              }}
              className="absolute bottom-4 -translate-x-1/2 pointer-events-auto opacity-95 scale-75"
            >
              <InteractivePet2D
                pet={
                  (pets[marriage.partnerPetId] as any) || {
                    id: 'ember',
                    name: marriage.partnerPetName,
                    element: 'fire',
                    growthLevel: 3,
                    happinessPct: 95,
                  }
                }
                mood="idle"
                isFacingLeft={!isFacingLeft}
                onClick={handlePetRub}
              />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-pink-500 text-white font-black text-[9px] rounded-full shadow-xs">
                💍 Partner
              </div>
            </div>
          )}

          {/* Baby Pet if Hatched */}
          {marriage.babyEgg?.isHatched && (
            <div
              style={{
                left: `${Math.max(10, Math.min(90, petX + (isFacingLeft ? -15 : 15)))}%`,
                transition: 'left 1.6s ease-out',
              }}
              className="absolute bottom-2 -translate-x-1/2 pointer-events-auto scale-60"
            >
              <InteractivePet2D
                pet={{
                  id: 'baby_sprout',
                  name: marriage.babyEgg.babyPetName || 'Baby Sprout',
                  element: 'nature',
                  growthLevel: 1,
                  happinessPct: 100,
                } as any}
                mood="idle"
                isFacingLeft={isFacingLeft}
              />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-amber-400 text-amber-950 font-black text-[8px] rounded-full shadow-xs">
                🐣 Baby
              </div>
            </div>
          )}
        </div>

      </div>

      {/* --- ACTION BUTTONS OUTSIDE STAGE FRAME --- */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full flex flex-wrap items-center justify-center gap-2 pt-1"
      >
        <button
          onClick={() => handleDropSnack('berry')}
          className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#0d1c2e] hover:text-[#006d36] rounded-xl text-xs font-black border border-[#bccabb]/40 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Cookie className="w-3.5 h-3.5 text-[#006d36]" /> Beri Berry (🍓)
        </button>

        <button
          onClick={() => handleDropSnack('cake')}
          className="px-4 py-2 bg-white hover:bg-pink-50 text-[#0d1c2e] hover:text-pink-600 rounded-xl text-xs font-black border border-[#bccabb]/40 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Cake className="w-3.5 h-3.5 text-pink-600" /> Beri Kue (🍰)
        </button>

        <button
          onClick={() => handleDropSnack('water')}
          className="px-4 py-2 bg-white hover:bg-blue-50 text-[#0d1c2e] hover:text-[#0060ac] rounded-xl text-xs font-black border border-[#bccabb]/40 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Droplets className="w-3.5 h-3.5 text-[#0060ac]" /> Minum Air (💧)
        </button>

        <button
          onClick={handleThrowBall}
          className="px-4 py-2 bg-white hover:bg-amber-50 text-[#0d1c2e] hover:text-amber-700 rounded-xl text-xs font-black border border-[#bccabb]/40 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Gamepad2 className="w-3.5 h-3.5 text-amber-600" /> Lempar Bola (⚽)
        </button>

        <button
          onClick={handlePetRub}
          className="px-4 py-2 bg-white hover:bg-rose-50 text-[#0d1c2e] hover:text-rose-600 rounded-xl text-xs font-black border border-[#bccabb]/40 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Elus Pet (💖)
        </button>
      </div>
    </div>
  );
};
