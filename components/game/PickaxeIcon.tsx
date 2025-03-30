import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Rect, G, LinearGradient, Stop, Defs, Ellipse, RadialGradient, Polygon } from 'react-native-svg';

export type PickaxeIconProps = {
  size: number;
  pickaxeType: string;
  color?: string;
};

// Define SVG icons for each pickaxe type
const pickaxeSvgIcons = {
  'wooden-pickaxe.png': (size: number, color = '#A0522D') => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="woodHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#8B4513" />
          <Stop offset="50%" stopColor="#A0522D" />
          <Stop offset="100%" stopColor="#8B4513" />
        </LinearGradient>
        <LinearGradient id="simpleIron" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#555555" />
          <Stop offset="50%" stopColor="#888888" />
          <Stop offset="100%" stopColor="#555555" />
        </LinearGradient>
      </Defs>
      {/* Wooden handle with grain */}
      <Path d="M15 25 L35 15" stroke="url(#woodHandle)" strokeWidth="5" strokeLinecap="round" />
      <Path d="M18 27 L22 23" stroke="#704214" strokeWidth="1" />
      <Path d="M25 23 L30 18" stroke="#704214" strokeWidth="1" />
      {/* Simple iron head */}
      <Path d="M30 12 L40 5 L35 15 L30 12" fill="url(#simpleIron)" />
      <Path d="M35 15 L40 20 L45 15 L35 15" fill="url(#simpleIron)" />
    </Svg>
  ),
  'stone-pickaxe.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="woodHandleStone" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#8B4513" />
          <Stop offset="50%" stopColor="#A0522D" />
          <Stop offset="100%" stopColor="#8B4513" />
        </LinearGradient>
        <LinearGradient id="stoneHead" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#555555" />
          <Stop offset="50%" stopColor="#777777" />
          <Stop offset="100%" stopColor="#666666" />
        </LinearGradient>
      </Defs>
      {/* Wooden handle with binding */}
      <Path d="M15 30 L35 15" stroke="url(#woodHandleStone)" strokeWidth="5" strokeLinecap="round" />
      <Path d="M20 27 L25 22" stroke="#704214" strokeWidth="1" />
      <Path d="M22 26 L30 18" stroke="#704214" strokeWidth="1" />
      <Circle cx="25" cy="22.5" r="2" fill="#5D4037" opacity="0.6" />
      {/* Stone head with texture */}
      <Path d="M30 12 L42 5 L35 15 L30 12" fill="url(#stoneHead)" />
      <Path d="M35 15 L42 22 L48 15 L35 15" fill="url(#stoneHead)" />
      <Path d="M37 8 L39 10" stroke="#555555" strokeWidth="0.8" />
      <Path d="M42 15 L44 17" stroke="#555555" strokeWidth="0.8" />
    </Svg>
  ),
  'copper-pickaxe.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="copperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#B87333" />
          <Stop offset="50%" stopColor="#DA9157" />
          <Stop offset="100%" stopColor="#B87333" />
        </LinearGradient>
        <LinearGradient id="woodHandleCopper" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#5D4037" />
          <Stop offset="50%" stopColor="#8B4513" />
          <Stop offset="100%" stopColor="#5D4037" />
        </LinearGradient>
      </Defs>
      {/* Enhanced wooden handle with copper reinforcement */}
      <Path d="M15 30 L35 15" stroke="url(#woodHandleCopper)" strokeWidth="5" strokeLinecap="round" />
      <Circle cx="25" cy="22.5" r="2.5" fill="#B87333" />
      <Line x1="24" y1="21" x2="26" y2="24" stroke="#A06023" strokeWidth="0.8" />
      {/* Copper head with shine */}
      <Path d="M30 12 L42 3 L35 15 L30 12" fill="url(#copperGrad)" />
      <Path d="M35 15 L42 24 L50 15 L35 15" fill="url(#copperGrad)" />
      <Path d="M38 7 L40 9" stroke="#FFD580" strokeWidth="0.8" />
      <Path d="M44 16 L46 18" stroke="#FFD580" strokeWidth="0.8" />
    </Svg>
  ),
  'iron-pickaxe.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="ironGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#8c8c8c" />
          <Stop offset="50%" stopColor="#d8d8d8" />
          <Stop offset="100%" stopColor="#8c8c8c" />
        </LinearGradient>
        <LinearGradient id="darkHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#4E342E" />
          <Stop offset="50%" stopColor="#6D4C41" />
          <Stop offset="100%" stopColor="#4E342E" />
        </LinearGradient>
      </Defs>
      {/* Enhanced handle with binding */}
      <Path d="M15 30 L35 15" stroke="url(#darkHandle)" strokeWidth="5" strokeLinecap="round" />
      <Circle cx="25" cy="22.5" r="2.5" fill="#d8d8d8" />
      <Line x1="24" y1="21" x2="26" y2="24" stroke="#BEBEBE" strokeWidth="0.8" />
      {/* Iron head with rivets */}
      <Path d="M30 12 L44 2 L35 15 L30 12" fill="url(#ironGrad)" />
      <Path d="M35 15 L44 25 L52 15 L35 15" fill="url(#ironGrad)" />
      <Circle cx="38" cy="9" r="1" fill="#555555" />
      <Circle cx="45" cy="15" r="1" fill="#555555" />
      <Path d="M39 7 L41 6" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
      <Path d="M46 18 L48 17" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
    </Svg>
  ),
  'diamond-pickaxe.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#4DD0E1" />
          <Stop offset="50%" stopColor="#B2EBF2" />
          <Stop offset="100%" stopColor="#4DD0E1" />
        </LinearGradient>
        <LinearGradient id="richHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#3E2723" />
          <Stop offset="50%" stopColor="#4E342E" />
          <Stop offset="100%" stopColor="#3E2723" />
        </LinearGradient>
      </Defs>
      {/* Fine handle with diamond inlays */}
      <Path d="M15 30 L35 15" stroke="url(#richHandle)" strokeWidth="5" strokeLinecap="round" />
      <Circle cx="20" cy="25" r="1.5" fill="#81D4FA" />
      <Circle cx="30" cy="20" r="1.5" fill="#81D4FA" />
      <Circle cx="25" cy="22.5" r="2.5" fill="#B2EBF2" />
      {/* Diamond head with facets */}
      <Path d="M30 12 L45 1 L35 15 L30 12" fill="url(#diamondGrad)" />
      <Path d="M35 15 L45 26 L54 15 L35 15" fill="url(#diamondGrad)" />
      <Circle cx="40" cy="15" r="3" fill="#81D4FA" />
      <Path d="M37 8 L38 5" stroke="#E0F7FA" strokeWidth="1" />
      <Path d="M43 10 L46 8" stroke="#E0F7FA" strokeWidth="1" />
      <Path d="M48 15 L50 17" stroke="#E0F7FA" strokeWidth="1" />
      <Path d="M43 20 L45 22" stroke="#E0F7FA" strokeWidth="1" />
    </Svg>
  ),
  'gold-pickaxe.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFD700" />
          <Stop offset="50%" stopColor="#FFF8DC" />
          <Stop offset="100%" stopColor="#FFD700" />
        </LinearGradient>
        <LinearGradient id="royalHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#4E342E" />
          <Stop offset="50%" stopColor="#5D4037" />
          <Stop offset="100%" stopColor="#4E342E" />
        </LinearGradient>
      </Defs>
      {/* Decorated handle with gold inlays */}
      <Path d="M15 30 L35 15" stroke="url(#royalHandle)" strokeWidth="5" strokeLinecap="round" />
      <Circle cx="25" cy="22.5" r="2.5" fill="#FFD700" />
      <Circle cx="20" cy="25" r="1.5" fill="#FFD700" />
      <Circle cx="30" cy="20" r="1.5" fill="#FFD700" />
      {/* Gold head with ornate details */}
      <Path d="M30 12 L45 0 L35 15 L30 12" fill="url(#goldGrad)" />
      <Path d="M35 15 L45 26 L55 15 L35 15" fill="url(#goldGrad)" />
      <Path d="M40 5 L42 3" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.7" />
      <Path d="M47 15 L49 13" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.7" />
      <Path d="M42 22 L44 24" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.7" />
      <Circle cx="40" cy="10" r="1" fill="#FFF8DC" />
      <Circle cx="47" cy="15" r="1" fill="#FFF8DC" />
      <Circle cx="40" cy="20" r="1" fill="#FFF8DC" />
    </Svg>
  ),
  'ultra-diamond-pickaxe.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="ultraDiamondGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#00BCD4" />
          <Stop offset="50%" stopColor="#E0F7FA" />
          <Stop offset="100%" stopColor="#00BCD4" />
        </LinearGradient>
        <LinearGradient id="ultraHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#263238" />
          <Stop offset="50%" stopColor="#37474F" />
          <Stop offset="100%" stopColor="#263238" />
        </LinearGradient>
        <LinearGradient id="diamondGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#B3E5FC" stopOpacity="0.7" />
          <Stop offset="100%" stopColor="#4FC3F7" stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      {/* Enchanted handle with glowing runes */}
      <Path d="M15 30 L35 15" stroke="url(#ultraHandle)" strokeWidth="6" strokeLinecap="round" />
      <Circle cx="25" cy="22.5" r="3.5" fill="#80DEEA" opacity="0.8" />
      <Path d="M22 25 L28 20" stroke="#B2EBF2" strokeWidth="1.2" />
      <Path d="M20 27 L30 17" stroke="#B2EBF2" strokeWidth="1.2" />
      {/* Ultra Diamond head with glowing core */}
      <Path d="M30 12 L47 -1 L35 15 L30 12" fill="url(#ultraDiamondGrad)" />
      <Path d="M35 15 L47 28 L57 15 L35 15" fill="url(#ultraDiamondGrad)" />
      <Circle cx="45" cy="15" r="5" fill="url(#diamondGlow)" />
      <Circle cx="45" cy="15" r="3" fill="#B3E5FC" />
      <Circle cx="45" cy="15" r="1.5" fill="#FFFFFF" />
      <Path d="M35 5 L37 2" stroke="#E0F7FA" strokeWidth="1.2" />
      <Path d="M50 10 L53 7" stroke="#E0F7FA" strokeWidth="1.2" />
      <Path d="M50 20 L53 23" stroke="#E0F7FA" strokeWidth="1.2" />
      <Path d="M35 25 L37 28" stroke="#E0F7FA" strokeWidth="1.2" />
    </Svg>
  ),
  'laser-pickaxe.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="laserBeam" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FF3D00" stopOpacity="0.8" />
          <Stop offset="50%" stopColor="#FF9E80" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#FF3D00" stopOpacity="0.8" />
        </LinearGradient>
        <LinearGradient id="techHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#37474F" />
          <Stop offset="50%" stopColor="#455A64" />
          <Stop offset="100%" stopColor="#37474F" />
        </LinearGradient>
        <LinearGradient id="laserGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFAB91" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#FF5722" stopOpacity="0.6" />
        </LinearGradient>
      </Defs>
      {/* High-tech handle with control module */}
      <Path d="M15 30 L35 15" stroke="url(#techHandle)" strokeWidth="4" strokeLinecap="round" />
      <Rect x="21" y="19" width="8" height="7" rx="1.5" fill="#607D8B" />
      <Circle cx="25" cy="22.5" r="1.5" fill="#FF5252" />
      <Line x1="22" y1="20" x2="28" y2="20" stroke="#CFD8DC" strokeWidth="0.8" />
      <Line x1="22" y1="25" x2="28" y2="25" stroke="#CFD8DC" strokeWidth="0.8" />
      {/* Laser emitter with energy beams */}
      <Circle cx="38" cy="15" r="6" fill="#263238" />
      <Circle cx="38" cy="15" r="4" fill="#37474F" />
      <Circle cx="38" cy="15" r="2.5" fill="#FF5252" />
      <Circle cx="38" cy="15" r="1" fill="#FFECB3" />
      {/* Laser beams with glow */}
      <Path d="M38 15 L55 5" stroke="url(#laserBeam)" strokeWidth="2.5" />
      <Path d="M38 15 L55 15" stroke="url(#laserBeam)" strokeWidth="2.5" />
      <Path d="M38 15 L55 25" stroke="url(#laserBeam)" strokeWidth="2.5" />
      <Circle cx="45" cy="10" r="2" fill="url(#laserGlow)" />
      <Circle cx="50" cy="15" r="2" fill="url(#laserGlow)" />
      <Circle cx="45" cy="20" r="2" fill="url(#laserGlow)" />
    </Svg>
  ),
  'plasma-cutter.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="plasmaGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#3D5AFE" stopOpacity="0.8" />
          <Stop offset="50%" stopColor="#8C9EFF" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#3D5AFE" stopOpacity="0.8" />
        </LinearGradient>
        <LinearGradient id="advancedHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#212121" />
          <Stop offset="50%" stopColor="#263238" />
          <Stop offset="100%" stopColor="#212121" />
        </LinearGradient>
        <LinearGradient id="plasmaField" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8C9EFF" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#3D5AFE" stopOpacity="0.6" />
        </LinearGradient>
      </Defs>
      {/* Futuristic handle with advanced controls */}
      <Path d="M15 30 L35 15" stroke="url(#advancedHandle)" strokeWidth="4" strokeLinecap="round" />
      <Rect x="21" y="19" width="8" height="7" rx="2" fill="#37474F" />
      <Circle cx="25" cy="22.5" r="1.8" fill="#536DFE" />
      <Line x1="20" y1="25" x2="18" y2="26" stroke="#90A4AE" strokeWidth="1" />
      <Line x1="20" y1="27" x2="17" y2="29" stroke="#90A4AE" strokeWidth="1" />
      <Line x1="23" y1="18" x2="23" y2="16" stroke="#90A4AE" strokeWidth="1" />
      <Line x1="27" y1="18" x2="27" y2="16" stroke="#90A4AE" strokeWidth="1" />
      {/* Plasma generator with energy field */}
      <Circle cx="40" cy="15" r="7" fill="#1A237E" />
      <Circle cx="40" cy="15" r="5" fill="#303F9F" />
      <Circle cx="40" cy="15" r="3" fill="#7986CB" />
      <Circle cx="40" cy="15" r="1.5" fill="#C5CAE9" />
      {/* Plasma field with particles */}
      <Ellipse cx="50" cy="15" rx="9" ry="7" fill="url(#plasmaField)" />
      <Path d="M40 15 C45 5, 55 8, 55 15 C55 22, 45 25, 40 15" fill="url(#plasmaGlow)" fillOpacity="0.5" />
      <Circle cx="47" cy="15" r="1.2" fill="#E8EAF6" />
      <Circle cx="50" cy="12" r="1" fill="#E8EAF6" />
      <Circle cx="53" cy="15" r="1" fill="#E8EAF6" />
      <Circle cx="50" cy="18" r="1" fill="#E8EAF6" />
      <Circle cx="45" cy="10" r="0.7" fill="#E8EAF6" />
      <Circle cx="45" cy="20" r="0.7" fill="#E8EAF6" />
    </Svg>
  ),
  'quantum-disruptor.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="quantumCore" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#AA00FF" stopOpacity="0.8" />
          <Stop offset="50%" stopColor="#EA80FC" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#AA00FF" stopOpacity="0.8" />
        </LinearGradient>
        <LinearGradient id="quantumField" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D500F9" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#651FFF" stopOpacity="0.5" />
        </LinearGradient>
        <LinearGradient id="futuristicHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#121212" />
          <Stop offset="50%" stopColor="#212121" />
          <Stop offset="100%" stopColor="#121212" />
        </LinearGradient>
      </Defs>
      {/* Advanced tech handle with quantum stabilizers */}
      <Path d="M15 30 L30 17" stroke="url(#futuristicHandle)" strokeWidth="4" strokeLinecap="round" />
      <Rect x="19" y="21" width="9" height="8" rx="2" fill="#424242" />
      <Circle cx="23.5" cy="25" r="2.5" fill="#7B1FA2" />
      <Line x1="19" y1="26" x2="17" y2="28" stroke="#9E9E9E" strokeWidth="1" />
      <Line x1="18" y1="24" x2="16" y2="23" stroke="#9E9E9E" strokeWidth="1" />
      <Line x1="20" y1="28" x2="18" y2="32" stroke="#9E9E9E" strokeWidth="1" />
      <Line x1="23" y1="20" x2="23" y2="16" stroke="#9E9E9E" strokeWidth="1" />
      <Line x1="26" y1="19" x2="28" y2="16" stroke="#9E9E9E" strokeWidth="1" />
      {/* Quantum field generator with dimensional rift */}
      <Circle cx="40" cy="15" r="8" fill="#311B92" />
      <Circle cx="40" cy="15" r="6" fill="#512DA8" />
      <Circle cx="40" cy="15" r="4" fill="#9575CD" />
      <Circle cx="40" cy="15" r="2" fill="#D1C4E9" />
      {/* Quantum disruptive field with energy spirals */}
      <Circle cx="40" cy="15" r="14" fill="url(#quantumField)" fillOpacity="0.3" />
      <G transform="rotate(0, 40, 15)">
        <Path d="M40 2 Q60 15, 40 28 Q20 15, 40 2" fill="url(#quantumCore)" fillOpacity="0.5" />
      </G>
      <G transform="rotate(45, 40, 15)">
        <Path d="M40 2 Q60 15, 40 28 Q20 15, 40 2" fill="url(#quantumCore)" fillOpacity="0.4" />
      </G>
      <G transform="rotate(90, 40, 15)">
        <Path d="M40 2 Q60 15, 40 28 Q20 15, 40 2" fill="url(#quantumCore)" fillOpacity="0.3" />
      </G>
      <G transform="rotate(135, 40, 15)">
        <Path d="M40 2 Q60 15, 40 28 Q20 15, 40 2" fill="url(#quantumCore)" fillOpacity="0.2" />
      </G>
      {/* Energy particles */}
      <Circle cx="45" cy="8" r="1" fill="#E8EAF6" />
      <Circle cx="49" cy="15" r="1" fill="#E8EAF6" />
      <Circle cx="45" cy="22" r="1" fill="#E8EAF6" />
      <Circle cx="40" cy="25" r="1" fill="#E8EAF6" />
      <Circle cx="35" cy="22" r="1" fill="#E8EAF6" />
      <Circle cx="31" cy="15" r="1" fill="#E8EAF6" />
      <Circle cx="35" cy="8" r="1" fill="#E8EAF6" />
      <Circle cx="40" cy="5" r="1" fill="#E8EAF6" />
      {/* Additional quantum energy nodes */}
      <Circle cx="42" cy="12" r="0.8" fill="#FFFFFF" />
      <Circle cx="38" cy="12" r="0.8" fill="#FFFFFF" />
      <Circle cx="42" cy="18" r="0.8" fill="#FFFFFF" />
      <Circle cx="38" cy="18" r="0.8" fill="#FFFFFF" />
    </Svg>
  ),
  'infinity-pickaxe.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <RadialGradient id="infinityCore" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="40%" stopColor="#E0FFFF" stopOpacity="0.9" />
          <Stop offset="70%" stopColor="#00BFFF" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#0000CD" stopOpacity="0.7" />
        </RadialGradient>
        <LinearGradient id="infinityHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#15002B" />
          <Stop offset="50%" stopColor="#22053C" />
          <Stop offset="100%" stopColor="#15002B" />
        </LinearGradient>
        <LinearGradient id="infinityGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8A2BE2" stopOpacity="0.3" />
          <Stop offset="30%" stopColor="#4B0082" stopOpacity="0.5" />
          <Stop offset="60%" stopColor="#9400D3" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#8A2BE2" stopOpacity="0.3" />
        </LinearGradient>
        <RadialGradient id="cosmicPower" cx="40%" cy="40%" r="60%" fx="40%" fy="40%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="20%" stopColor="#F8F8FF" stopOpacity="0.95" />
          <Stop offset="50%" stopColor="#E6E6FA" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#9370DB" stopOpacity="0.6" />
        </RadialGradient>
      </Defs>
      {/* Enhanced cosmic handle with galaxy-like swirls */}
      <Path d="M10 35 L38 15" stroke="url(#infinityHandle)" strokeWidth="6" strokeLinecap="round" />
      
      {/* Cosmic energy flowing through the handle */}
      <Path d="M12 34 L38 16" stroke="#9400D3" strokeWidth="1" strokeOpacity="0.7" strokeDasharray="1,2" />
      <Path d="M14 33 L39 14" stroke="#8A2BE2" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="2,1" />
      <Path d="M14 36 L41 15" stroke="#4B0082" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="1,3" />
      
      {/* Galaxy-like embellishments on handle */}
      <Circle cx="20" cy="29" r="3" fill="url(#infinityGlow)" />
      <Circle cx="30" cy="22" r="3" fill="url(#infinityGlow)" />
      <Circle cx="25" cy="25" r="4" fill="url(#infinityGlow)" />
      
      {/* Infinity symbol head */}
      <Path d="M38 15 C42 10, 46 10, 48 15 C50 20, 46 25, 42 25 C38 25, 34 20, 36 15 C38 10, 42 10, 46 15 C48 20, 44 25, 40 25 C36 25, 32 20, 34 15 C36 10, 38 10, 38 15 Z" 
        fill="url(#infinityGlow)" stroke="#9400D3" strokeWidth="0.5" />
      
      {/* Cosmic core in the center */}
      <Circle cx="42" cy="15" r="3" fill="url(#infinityCore)" />
      <Circle cx="42" cy="15" r="1.5" fill="#FFFFFF" />
      
      {/* Energy radiating from infinity symbol */}
      <Path d="M42 12 L42 9" stroke="#FFFFFF" strokeWidth="0.7" />
      <Path d="M45 15 L48 15" stroke="#FFFFFF" strokeWidth="0.7" />
      <Path d="M42 18 L42 21" stroke="#FFFFFF" strokeWidth="0.7" />
      <Path d="M39 15 L36 15" stroke="#FFFFFF" strokeWidth="0.7" />
      <Path d="M44 13 L46 11" stroke="#FFFFFF" strokeWidth="0.7" />
      <Path d="M44 17 L46 19" stroke="#FFFFFF" strokeWidth="0.7" />
      <Path d="M40 17 L38 19" stroke="#FFFFFF" strokeWidth="0.7" />
      <Path d="M40 13 L38 11" stroke="#FFFFFF" strokeWidth="0.7" />
      
      {/* Cosmic dust particles */}
      <Circle cx="46" cy="10" r="0.5" fill="#FFFFFF" />
      <Circle cx="48" cy="12" r="0.3" fill="#FFFFFF" />
      <Circle cx="48" cy="18" r="0.4" fill="#FFFFFF" />
      <Circle cx="46" cy="20" r="0.3" fill="#FFFFFF" />
      <Circle cx="38" cy="20" r="0.3" fill="#FFFFFF" />
      <Circle cx="36" cy="18" r="0.5" fill="#FFFFFF" />
      <Circle cx="36" cy="12" r="0.4" fill="#FFFFFF" />
      <Circle cx="38" cy="10" r="0.3" fill="#FFFFFF" />
      
      {/* Glowing energy field */}
      <Circle cx="42" cy="15" r="8" fill="none" stroke="#E6E6FA" strokeWidth="0.5" strokeOpacity="0.5" />
      <Circle cx="42" cy="15" r="10" fill="none" stroke="#E6E6FA" strokeWidth="0.3" strokeOpacity="0.3" />
    </Svg>
  ),
  'cosmic-excavator.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="cosmicHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#191970" />
          <Stop offset="50%" stopColor="#483D8B" />
          <Stop offset="100%" stopColor="#191970" />
        </LinearGradient>
        <RadialGradient id="galaxyCore" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="30%" stopColor="#E6E6FA" />
          <Stop offset="60%" stopColor="#9370DB" />
          <Stop offset="80%" stopColor="#4B0082" />
          <Stop offset="100%" stopColor="#191970" />
        </RadialGradient>
        <RadialGradient id="starBurst" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="20%" stopColor="#FFFAFA" stopOpacity="0.9" />
          <Stop offset="50%" stopColor="#FFD700" stopOpacity="0.7" />
          <Stop offset="100%" stopColor="#FFA500" stopOpacity="0.5" />
        </RadialGradient>
      </Defs>
      
      {/* Starry handle with cosmic energy */}
      <Path d="M10 32 L35 15" stroke="url(#cosmicHandle)" strokeWidth="6" strokeLinecap="round" />
      
      {/* Stars embedded in handle */}
      <Circle cx="18" cy="27" r="1" fill="#FFFFFF" />
      <Circle cx="22" cy="25" r="0.8" fill="#FFFFFF" />
      <Circle cx="26" cy="23" r="0.6" fill="#FFFFFF" />
      <Circle cx="30" cy="21" r="0.7" fill="#FFFFFF" />
      
      {/* Cosmic energy pattern */}
      <Path d="M12 30 C16 28, 18 26, 20 24 C22 22, 25 20, 28 19 C30 18, 32 17, 35 16" 
        stroke="#9370DB" strokeWidth="0.5" strokeDasharray="0.5,1" fill="none" />
      <Path d="M15 31 C19 28, 23 24, 27 22 C31 20, 35 17, 37 16" 
        stroke="#9400D3" strokeWidth="0.5" strokeDasharray="1,1" fill="none" />
      
      {/* Galaxy head of excavator */}
      <Circle cx="40" cy="15" r="8" fill="url(#galaxyCore)" />
      
      {/* Spiral arms of galaxy */}
      <Path d="M40 15 C42 13, 44 12, 46 12 C48 12, 48 15, 47 17 C46 19, 44 20, 40 19 C36 18, 36 16, 38 14 C40 12, 44 13, 46 16" 
        stroke="#9370DB" strokeWidth="0.8" fill="none" />
      <Path d="M40 15 C38 17, 36 18, 34 18 C32 18, 32 15, 33 13 C34 11, 36 10, 40 11 C44 12, 44 14, 42 16 C40 18, 36 17, 34 14" 
        stroke="#9370DB" strokeWidth="0.8" fill="none" />
      
      {/* Bright stars in galaxy */}
      <Circle cx="38" cy="13" r="1" fill="url(#starBurst)" />
      <Circle cx="42" cy="17" r="0.8" fill="url(#starBurst)" />
      <Circle cx="43" cy="14" r="1.2" fill="url(#starBurst)" />
      <Circle cx="37" cy="16" r="0.6" fill="url(#starBurst)" />
      
      {/* Excavator blades made of cosmic energy */}
      <Path d="M40 5 L48 10 L46 15 L40 12 Z" fill="#4B0082" fillOpacity="0.7" />
      <Path d="M40 25 L48 20 L46 15 L40 18 Z" fill="#4B0082" fillOpacity="0.7" />
      <Path d="M40 5 L32 10 L34 15 L40 12 Z" fill="#4B0082" fillOpacity="0.7" />
      <Path d="M40 25 L32 20 L34 15 L40 18 Z" fill="#4B0082" fillOpacity="0.7" />
      
      {/* Stellar energy lines */}
      <Path d="M40 7 L40 4" stroke="#FFFFFF" strokeWidth="0.6" />
      <Path d="M40 23 L40 26" stroke="#FFFFFF" strokeWidth="0.6" />
      <Path d="M33 15 L30 15" stroke="#FFFFFF" strokeWidth="0.6" />
      <Path d="M47 15 L50 15" stroke="#FFFFFF" strokeWidth="0.6" />
      
      {/* Cosmic dust */}
      <Circle cx="45" cy="8" r="0.3" fill="#FFFFFF" />
      <Circle cx="47" cy="17" r="0.3" fill="#FFFFFF" />
      <Circle cx="35" cy="7" r="0.3" fill="#FFFFFF" />
      <Circle cx="33" cy="23" r="0.3" fill="#FFFFFF" />
    </Svg>
  ),
  'dark-energy-drill.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="darkEnergyHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#000000" />
          <Stop offset="40%" stopColor="#1A0033" />
          <Stop offset="60%" stopColor="#1A0033" />
          <Stop offset="100%" stopColor="#000000" />
        </LinearGradient>
        <RadialGradient id="darkEnergyCore" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="#9370DB" />
          <Stop offset="30%" stopColor="#8A2BE2" />
          <Stop offset="60%" stopColor="#4B0082" />
          <Stop offset="90%" stopColor="#120A2A" />
          <Stop offset="100%" stopColor="#000000" />
        </RadialGradient>
        <LinearGradient id="energyBeam" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#9370DB" stopOpacity="0" />
          <Stop offset="50%" stopColor="#8A2BE2" stopOpacity="0.7" />
          <Stop offset="100%" stopColor="#9370DB" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      
      {/* Advanced dark handle with energy conduits */}
      <Path d="M10 35 L35 15" stroke="url(#darkEnergyHandle)" strokeWidth="6" strokeLinecap="round" />
      
      {/* Energy conduits along handle */}
      <Path d="M12 34 L34 17" stroke="#4B0082" strokeWidth="1" strokeOpacity="0.8" />
      <Path d="M14 36 L36 18" stroke="#8A2BE2" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="1,1" />
      <Path d="M10 33 L33 14" stroke="#9370DB" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="0.5,2" />
      
      {/* Dark energy nodes on handle */}
      <Circle cx="20" cy="28" r="2" fill="#000000" strokeWidth="0.5" stroke="#4B0082" />
      <Circle cx="28" cy="22" r="2" fill="#000000" strokeWidth="0.5" stroke="#4B0082" />
      
      {/* Main dark energy core */}
      <Circle cx="40" cy="15" r="6" fill="url(#darkEnergyCore)" />
      <Circle cx="40" cy="15" r="4" fill="#120A2A" strokeWidth="0.5" stroke="#8A2BE2" />
      <Circle cx="40" cy="15" r="2" fill="#000000" />
      
      {/* Dark energy absorption field */}
      <Circle cx="40" cy="15" r="8" fill="none" stroke="#4B0082" strokeWidth="0.3" strokeDasharray="0.5,0.5" />
      <Circle cx="40" cy="15" r="10" fill="none" stroke="#4B0082" strokeWidth="0.2" strokeDasharray="0.5,1" />
      <Circle cx="40" cy="15" r="12" fill="none" stroke="#4B0082" strokeWidth="0.1" strokeDasharray="0.5,1.5" />
      
      {/* Dark energy drill bits */}
      <Path d="M40 15 L50 8" stroke="#8A2BE2" strokeWidth="2" />
      <Path d="M40 15 L50 22" stroke="#8A2BE2" strokeWidth="2" />
      <Path d="M40 15 L30 8" stroke="#8A2BE2" strokeWidth="2" />
      <Path d="M40 15 L30 22" stroke="#8A2BE2" strokeWidth="2" />
      
      {/* Energy beam tips */}
      <Circle cx="50" cy="8" r="1" fill="#FFFFFF" />
      <Circle cx="50" cy="22" r="1" fill="#FFFFFF" />
      <Circle cx="30" cy="8" r="1" fill="#FFFFFF" />
      <Circle cx="30" cy="22" r="1" fill="#FFFFFF" />
      
      {/* Dark energy wisps */}
      <Path d="M40 9 C42 7, 45 8, 45 11 C45 14, 42 14, 40 12" stroke="#9370DB" strokeWidth="0.5" fill="none" />
      <Path d="M40 21 C38 23, 35 22, 35 19 C35 16, 38 16, 40 18" stroke="#9370DB" strokeWidth="0.5" fill="none" />
      <Path d="M34 15 C32 17, 32 14, 34 12 C36 10, 38 13, 36 15" stroke="#9370DB" strokeWidth="0.5" fill="none" />
      <Path d="M46 15 C48 13, 48 16, 46 18 C44 20, 42 17, 44 15" stroke="#9370DB" strokeWidth="0.5" fill="none" />
      
      {/* Absorption particles */}
      <Circle cx="43" cy="13" r="0.3" fill="#FFFFFF" />
      <Circle cx="44" cy="17" r="0.2" fill="#FFFFFF" />
      <Circle cx="36" cy="13" r="0.2" fill="#FFFFFF" />
      <Circle cx="37" cy="17" r="0.3" fill="#FFFFFF" />
      <Circle cx="40" cy="11" r="0.2" fill="#FFFFFF" />
      <Circle cx="40" cy="19" r="0.2" fill="#FFFFFF" />
    </Svg>
  ),
  'antimatter-crusher.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <RadialGradient id="antimatterCore" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="20%" stopColor="#FFCCFF" />
          <Stop offset="40%" stopColor="#FF00FF" />
          <Stop offset="60%" stopColor="#9900CC" />
          <Stop offset="100%" stopColor="#330033" />
        </RadialGradient>
        <LinearGradient id="antimatterHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#000000" />
          <Stop offset="40%" stopColor="#1A001A" />
          <Stop offset="60%" stopColor="#1A001A" />
          <Stop offset="100%" stopColor="#000000" />
        </LinearGradient>
        <RadialGradient id="antimatterField" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
          <Stop offset="0%" stopColor="#FF00FF" stopOpacity="0.7" />
          <Stop offset="60%" stopColor="#9900CC" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#330033" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      
      {/* Hyper-advanced handle with antimatter containment tech */}
      <Path d="M5 38 L32 15" stroke="url(#antimatterHandle)" strokeWidth="6" strokeLinecap="round" />
      
      {/* Antimatter stream through the handle */}
      <Path d="M10 36 L32 16" stroke="#FF33FF" strokeWidth="1" strokeOpacity="0.8" />
      <Path d="M12 34 L30 18" stroke="#CC00CC" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="1,1" />
      <Path d="M8 36 L28 20" stroke="#FF99FF" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="0.5,1.5" />
      
      {/* Stabilizer nodes on handle */}
      <Circle cx="18" cy="27" r="2.5" fill="#1A001A" strokeWidth="0.5" stroke="#FF00FF" />
      <Circle cx="18" cy="27" r="1" fill="#FF00FF" opacity="0.7" />
      <Circle cx="25" cy="22" r="2" fill="#1A001A" strokeWidth="0.5" stroke="#FF00FF" />
      <Circle cx="25" cy="22" r="0.8" fill="#FF00FF" opacity="0.7" />
      
      {/* Antimatter crusher head */}
      <Path d="M30 5 L50 15 L40 25 L30 5 Z" fill="#330033" stroke="#FF00FF" strokeWidth="1" />
      
      {/* Antimatter core */}
      <Circle cx="40" cy="15" r="6" fill="url(#antimatterCore)" />
      <Circle cx="40" cy="15" r="10" fill="url(#antimatterField)" />
      
      {/* Containment field around core */}
      <Circle cx="40" cy="15" r="8" fill="none" stroke="#FF00FF" strokeWidth="0.3" strokeDasharray="0.5,0.5" />
      <Circle cx="40" cy="15" r="12" fill="none" stroke="#FF00FF" strokeWidth="0.2" strokeDasharray="1,1" />
      <Circle cx="40" cy="15" r="14" fill="none" stroke="#FF00FF" strokeWidth="0.1" strokeDasharray="1.5,1.5" />
      
      {/* Antimatter wave distortions */}
      <Path d="M32 7 C36 1, 44 1, 48 7" stroke="#CC00CC" strokeWidth="1" fill="none" />
      <Path d="M32 23 C36 29, 44 29, 48 23" stroke="#CC00CC" strokeWidth="1" fill="none" />
      
      {/* Annihilation rays */}
      <Path d="M40 9 L40 21" stroke="#FF00FF" strokeWidth="0.5" strokeDasharray="1,1" />
      <Path d="M34 15 L46 15" stroke="#FF00FF" strokeWidth="0.5" strokeDasharray="1,1" />
      <Path d="M36 11 L44 19" stroke="#FF00FF" strokeWidth="0.5" strokeDasharray="1,1" />
      <Path d="M36 19 L44 11" stroke="#FF00FF" strokeWidth="0.5" strokeDasharray="1,1" />
      
      {/* Antimatter particles */}
      <Circle cx="38" cy="13" r="0.4" fill="#FFFFFF" />
      <Circle cx="42" cy="13" r="0.4" fill="#FFFFFF" />
      <Circle cx="38" cy="17" r="0.4" fill="#FFFFFF" />
      <Circle cx="42" cy="17" r="0.4" fill="#FFFFFF" />
      <Circle cx="40" cy="11" r="0.3" fill="#FFFFFF" />
      <Circle cx="40" cy="19" r="0.3" fill="#FFFFFF" />
      <Circle cx="36" cy="15" r="0.3" fill="#FFFFFF" />
      <Circle cx="44" cy="15" r="0.3" fill="#FFFFFF" />
      
      {/* Matter-antimatter reaction */}
      <Path d="M37 10 C35 12, 34 14, 36 16 C38 18, 42 18, 44 16 C46 14, 45 12, 43 10" 
        stroke="#FF99FF" strokeWidth="0.5" fill="none" strokeDasharray="0.5,0.5" />
      
      {/* Antimatter glow */}
      <Circle cx="40" cy="15" r="2" fill="#FFFFFF" opacity="0.8" />
      <Circle cx="40" cy="15" r="1" fill="#FF00FF" opacity="1" />
    </Svg>
  ),
  'graviton-hammer.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="gravitonHandle" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#0A0A0A" />
          <Stop offset="40%" stopColor="#222222" />
          <Stop offset="60%" stopColor="#222222" />
          <Stop offset="100%" stopColor="#0A0A0A" />
        </LinearGradient>
        <RadialGradient id="gravitonCore" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="30%" stopColor="#00FFFF" />
          <Stop offset="60%" stopColor="#0099CC" />
          <Stop offset="100%" stopColor="#006666" />
        </RadialGradient>
        <RadialGradient id="gravityField" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="#00FFFF" stopOpacity="0.3" />
          <Stop offset="60%" stopColor="#006666" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#004444" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="gravityDistortion" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00FFFF" stopOpacity="0" />
          <Stop offset="50%" stopColor="#00FFFF" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      
      {/* Ultra-dense composite handle */}
      <Path d="M5 40 L30 15" stroke="url(#gravitonHandle)" strokeWidth="7" strokeLinecap="round" />
      
      {/* Gravity manipulation conduits */}
      <Path d="M9 37 L30 16" stroke="#00CCCC" strokeWidth="1" strokeOpacity="0.7" />
      <Path d="M11 35 L28 18" stroke="#009999" strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="1,1" />
      <Path d="M7 38 L26 19" stroke="#00FFFF" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="0.5,1" />
      
      {/* Gravitational stabilization nodes */}
      <Circle cx="15" cy="30" r="2.5" fill="#222222" strokeWidth="0.5" stroke="#00CCCC" />
      <Circle cx="15" cy="30" r="1" fill="#00FFFF" opacity="0.6" />
      <Circle cx="22" cy="23" r="2" fill="#222222" strokeWidth="0.5" stroke="#00CCCC" />
      <Circle cx="22" cy="23" r="0.8" fill="#00FFFF" opacity="0.6" />
      
      {/* Massive graviton hammer head */}
      <Path d="M30 5 L50 15 L40 25 L30 5 Z" fill="#1A1A1A" stroke="#00CCCC" strokeWidth="1" />
      
      {/* Graviton quantum singularity */}
      <Circle cx="40" cy="15" r="6" fill="url(#gravitonCore)" />
      <Circle cx="40" cy="15" r="10" fill="url(#gravityField)" />
      
      {/* Distortion field around singularity */}
      <Circle cx="40" cy="15" r="8" fill="none" stroke="#00CCCC" strokeWidth="0.3" strokeDasharray="0.5,0.5" />
      <Circle cx="40" cy="15" r="12" fill="none" stroke="#00CCCC" strokeWidth="0.2" strokeDasharray="1,1" />
      <Circle cx="40" cy="15" r="14" fill="none" stroke="#00CCCC" strokeWidth="0.1" strokeDasharray="1.5,1.5" />
      
      {/* Space-time distortion waves */}
      <Path d="M32 7 C36 1, 44 1, 48 7" stroke="url(#gravityDistortion)" strokeWidth="1" fill="none" />
      <Path d="M32 23 C36 29, 44 29, 48 23" stroke="url(#gravityDistortion)" strokeWidth="1" fill="none" />
      
      {/* Gravity manipulation beams */}
      <Path d="M40 9 L40 21" stroke="#00FFFF" strokeWidth="0.5" strokeDasharray="1,1" />
      <Path d="M34 15 L46 15" stroke="#00FFFF" strokeWidth="0.5" strokeDasharray="1,1" />
      <Path d="M36 11 L44 19" stroke="#00FFFF" strokeWidth="0.5" strokeDasharray="1,1" />
      <Path d="M36 19 L44 11" stroke="#00FFFF" strokeWidth="0.5" strokeDasharray="1,1" />
      
      {/* Floating quantum particles */}
      <Circle cx="38" cy="13" r="0.4" fill="#FFFFFF" />
      <Circle cx="42" cy="13" r="0.4" fill="#FFFFFF" />
      <Circle cx="38" cy="17" r="0.4" fill="#FFFFFF" />
      <Circle cx="42" cy="17" r="0.4" fill="#FFFFFF" />
      <Circle cx="40" cy="11" r="0.3" fill="#FFFFFF" />
      <Circle cx="40" cy="19" r="0.3" fill="#FFFFFF" />
      <Circle cx="36" cy="15" r="0.3" fill="#FFFFFF" />
      <Circle cx="44" cy="15" r="0.3" fill="#FFFFFF" />
      
      {/* Energy discharge arc */}
      <Path d="M37 10 C35 12, 34 14, 36 16 C38 18, 42 18, 44 16 C46 14, 45 12, 43 10" 
        stroke="#00FFFF" strokeWidth="0.5" fill="none" strokeDasharray="0.5,0.5" />
      
      {/* Gravitational lensing effect */}
      <Circle cx="40" cy="15" r="2" fill="#FFFFFF" opacity="0.8" />
      <Circle cx="40" cy="15" r="1" fill="#00FFFF" opacity="1" />
    </Svg>
  ),
};

export default function PickaxeIcon({ size, pickaxeType, color }: PickaxeIconProps) {
  const renderSvgIcon = () => {
    // If it's obsidian-pickaxe.png, map to ultra-diamond-pickaxe.png
    const mappedPickaxeType = pickaxeType === 'obsidian-pickaxe.png' ? 'ultra-diamond-pickaxe.png' : pickaxeType;
    
    // Return the appropriate SVG based on pickaxeType
    const iconRenderer = pickaxeSvgIcons[mappedPickaxeType] || pickaxeSvgIcons['wooden-pickaxe.png'];
    return iconRenderer(size, color);
  };

  return (
    <View style={styles.container}>
      {renderSvgIcon()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 