import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CompanionPet } from '../../types';

export type PetMood = 'happy' | 'idle' | 'walking' | 'running' | 'petting' | 'eating' | 'sleeping' | 'celebrating' | 'curious';

export const POKEMON_ARTWORK_MAP: Record<string, Record<number, string>> = {
  sprout: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', // Bulbasaur
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png', // Ivysaur
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png', // Venusaur
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10033.png', // Mega Venusaur
  },
  ember: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', // Charmander
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png', // Charmeleon
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', // Charizard
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10034.png', // Mega Charizard X
  },
  bubbles: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', // Squirtle
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png', // Wartortle
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png', // Blastoise
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10036.png', // Mega Blastoise
  },
  zephyr: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/172.png', // Pichu
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', // Pikachu
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png', // Raichu
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10199.png', // Gigantamax Pikachu
  },
  nyx: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png', // Gastly
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/93.png', // Haunter
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png', // Gengar
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10038.png', // Mega Gengar
  },
  lumi: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', // Eevee
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png', // Jolteon
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png', // Umbreon
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/700.png', // Sylveon
  },
  blossom: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png', // Chikorita
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/153.png', // Bayleef
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/154.png', // Meganium
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/154.png', // Mega Meganium Apex
  },
  magma: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/447.png', // Riolu
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png', // Lucario
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10059.png', // Mega Lucario
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/448.png', // Aura Sovereign Lucario
  },
  mewtwo: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png', // Mew
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', // Mewtwo
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/150.png', // Armored Mewtwo
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10044.png', // Mega Mewtwo Y
  },
  dragonite: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png', // Dratini
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/148.png', // Dragonair
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png', // Dragonite
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/149.png', // Titan Dragonite
  },
  snorlax: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/446.png', // Munchlax
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png', // Snorlax
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/143.png', // Heavy Snorlax
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10198.png', // Gigantamax Snorlax
  },
  cyndaquil: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png', // Cyndaquil
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/156.png', // Quilava
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/157.png', // Typhlosion
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10237.png', // Hisuian Typhlosion
  },
  totodile: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png', // Totodile
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/159.png', // Croconaw
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/160.png', // Feraligatr
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/160.png', // Apex Feraligatr
  },
  rayquaza: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png', // Sky Dragon Rayquaza
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/384.png',
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10079.png', // Mega Rayquaza
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/384.png', // Shiny Celestial Rayquaza
  },
  greninja: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/656.png', // Froakie
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/657.png', // Frogadier
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png', // Greninja
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10117.png', // Ash-Greninja
  },
  mimikyu: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/778.png', // Mimikyu
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10143.png', // Busted Mimikyu
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/778.png', // Shadow Mimikyu
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/778.png', // Ghost Mimikyu
  },
  baby_sprout: {
    1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', // Bulbasaur
    2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png',
    3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
    4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10033.png',
  },
};

export const POKEMON_STAGE_NAMES: Record<string, Record<number, string>> = {
  sprout: { 1: 'Bulbasaur', 2: 'Ivysaur', 3: 'Venusaur', 4: 'Mega Venusaur' },
  ember: { 1: 'Charmander', 2: 'Charmeleon', 3: 'Charizard', 4: 'Mega Charizard X' },
  bubbles: { 1: 'Squirtle', 2: 'Wartortle', 3: 'Blastoise', 4: 'Mega Blastoise' },
  zephyr: { 1: 'Pichu', 2: 'Pikachu', 3: 'Raichu', 4: 'Gigantamax Pikachu' },
  nyx: { 1: 'Gastly', 2: 'Haunter', 3: 'Gengar', 4: 'Mega Gengar' },
  lumi: { 1: 'Eevee', 2: 'Jolteon', 3: 'Umbreon', 4: 'Sylveon' },
  blossom: { 1: 'Chikorita', 2: 'Bayleef', 3: 'Meganium', 4: 'Mega Meganium' },
  magma: { 1: 'Riolu', 2: 'Lucario', 3: 'Mega Lucario', 4: 'Aura Sovereign Lucario' },
  mewtwo: { 1: 'Mew', 2: 'Mewtwo', 3: 'Armored Mewtwo', 4: 'Mega Mewtwo Y' },
  dragonite: { 1: 'Dratini', 2: 'Dragonair', 3: 'Dragonite', 4: 'Titan Dragonite' },
  snorlax: { 1: 'Munchlax', 2: 'Snorlax', 3: 'Heavy Snorlax', 4: 'Gigantamax Snorlax' },
  cyndaquil: { 1: 'Cyndaquil', 2: 'Quilava', 3: 'Typhlosion', 4: 'Hisuian Typhlosion' },
  totodile: { 1: 'Totodile', 2: 'Croconaw', 3: 'Feraligatr', 4: 'Apex Feraligatr' },
  rayquaza: { 1: 'Rayquaza', 2: 'Sky Rayquaza', 3: 'Mega Rayquaza', 4: 'Celestial Rayquaza' },
  greninja: { 1: 'Froakie', 2: 'Frogadier', 3: 'Greninja', 4: 'Ash-Greninja' },
  mimikyu: { 1: 'Mimikyu', 2: 'Busted Mimikyu', 3: 'Shadow Mimikyu', 4: 'Ghost Sovereign Mimikyu' },
  baby_sprout: { 1: 'Baby Bulbasaur', 2: 'Baby Ivysaur', 3: 'Baby Venusaur', 4: 'Baby Mega Venusaur' },
};

export const getPokemonArtwork = (petId: string, stage: number = 1): string => {
  const line = POKEMON_ARTWORK_MAP[petId] || POKEMON_ARTWORK_MAP.sprout;
  return line[stage] || line[1] || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png';
};

export const getPokemonStageName = (petId: string, stage: number = 1): string => {
  const line = POKEMON_STAGE_NAMES[petId] || POKEMON_STAGE_NAMES.sprout;
  return line[stage] || line[1] || 'Pokémon';
};

interface InteractivePet2DProps {
  pet: CompanionPet;
  stageOverride?: number;
  mood?: PetMood;
  scale?: number;
  className?: string;
  onClick?: () => void;
  onPet?: () => void;
  pointerPos?: { x: number; y: number } | null;
  isFacingLeft?: boolean;
  showAccessories?: boolean;
}

export const InteractivePet2D: React.FC<InteractivePet2DProps> = ({
  pet,
  stageOverride,
  mood = 'idle',
  scale = 1,
  className = '',
  onClick,
  pointerPos = null,
  isFacingLeft = false,
  showAccessories = true,
}) => {
  const stage = stageOverride !== undefined ? stageOverride : (pet.evolutionStage || 1);
  const petId = pet.id || 'sprout';
  const artworkUrl = getPokemonArtwork(petId, stage);
  const [imgSrc, setImgSrc] = useState<string>(artworkUrl);

  useEffect(() => {
    setImgSrc(artworkUrl);
  }, [artworkUrl]);

  return (
    <div
      className={`relative select-none inline-flex items-center justify-center cursor-pointer transition-transform ${className}`}
      onClick={onClick}
      style={{
        transform: `scale(${scale}) ${isFacingLeft ? 'scaleX(-1)' : 'scaleX(1)'}`,
      }}
    >
      <motion.div
        animate={
          mood === 'petting'
            ? { scaleX: [1, 1.15, 0.92, 1.08, 1], scaleY: [1, 0.82, 1.06, 0.88, 1], y: [0, 6, -4, 4, 0] }
            : mood === 'celebrating' || mood === 'running'
            ? { y: [0, -22, 0], scaleX: [1, 0.92, 1.06, 1], scaleY: [1, 1.12, 0.9, 1] }
            : mood === 'walking'
            ? { y: [0, -8, 0], rotate: [-3, 3, -3] }
            : mood === 'eating'
            ? { scaleX: [1, 1.05, 0.98, 1], scaleY: [1, 0.95, 1.03, 1] }
            : mood === 'sleeping'
            ? { y: [0, 2, 0], scaleY: [1, 0.98, 1], opacity: 0.85 }
            : { y: [0, -6, 0], scaleY: [1, 1.02, 1] }
        }
        transition={{
          repeat: Infinity,
          duration: mood === 'petting' ? 0.65 : mood === 'celebrating' ? 0.55 : mood === 'walking' ? 0.45 : 2.4,
          ease: 'easeInOut',
        }}
        className="relative flex items-center justify-center"
      >
        {/* Stage 3/4 Titan / Mega Glowing Aura */}
        {stage >= 3 && (
          <motion.div
            animate={{ rotate: 360, scale: [0.95, 1.08, 0.95] }}
            transition={{ rotate: { repeat: Infinity, duration: 12, ease: 'linear' }, scale: { repeat: Infinity, duration: 2.5 } }}
            className={`absolute -inset-4 rounded-full blur-md opacity-40 pointer-events-none ${
              pet.element === 'fire'
                ? 'bg-amber-500'
                : pet.element === 'water'
                ? 'bg-cyan-400'
                : pet.element === 'thunder'
                ? 'bg-yellow-400'
                : pet.element === 'shadow'
                ? 'bg-purple-600'
                : 'bg-emerald-500'
            }`}
          />
        )}

        {/* Dynamic Shadow underneath */}
        <div className="absolute -bottom-2 w-32 h-6 bg-black/20 rounded-full blur-[3px] pointer-events-none" />

        {/* High-Resolution Official Pokémon Artwork Image for this specific Evolution Stage */}
        <img
          src={imgSrc}
          alt={pet.name || 'Pokemon'}
          onError={() => {
            const fallback = getPokemonArtwork(petId, 1);
            if (imgSrc !== fallback) {
              setImgSrc(fallback);
            }
          }}
          referrerPolicy="no-referrer"
          className="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.25)] relative z-10 pointer-events-none select-none transition-all duration-300 hover:brightness-105"
        />

        {/* Blushing Hearts when Petting */}
        {mood === 'petting' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <span className="text-2xl animate-bounce -translate-y-8">💖</span>
          </div>
        )}

        {/* Sleeping Zzz */}
        {mood === 'sleeping' && (
          <motion.span
            animate={{ y: [-10, -30], opacity: [0.3, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-4 right-2 text-blue-400 font-black text-lg z-20"
          >
            Zzz
          </motion.span>
        )}
      </motion.div>
    </div>
  );
};

