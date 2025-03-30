import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';

export type MinerIconProps = {
  size: number;
  position?: 'left' | 'right' | 'top' | 'bottom' | 'none';
  minerType: string;
};

// Define SVG icons for each miner type
const minerSvgIcons = {
  'caveman-apprentice.png': (size: number, color = '#8B4513') => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      {/* Head with features */}
      <Circle cx="25" cy="15" r="10" fill="#FFD700" />
      <Circle cx="21" cy="13" r="1.5" fill="#000" /> {/* Left eye */}
      <Circle cx="29" cy="13" r="1.5" fill="#000" /> {/* Right eye */}
      <Path d="M23 17 L27 17" stroke="#000" strokeWidth="1" /> {/* Mouth */}
      
      {/* Body with texture */}
      <Path d="M15 25 L35 25 L35 40 L15 40 Z" fill={color} />
      <Path d="M17 27 L33 27" stroke="#6B4226" strokeWidth="1" opacity="0.5" />
      <Path d="M19 33 L31 33" stroke="#6B4226" strokeWidth="1" opacity="0.5" />
      
      {/* Arms with more definition */}
      <Path d="M15 25 L10 35 L15 40" fill={color} />
      <Path d="M35 25 L40 35 L35 40" fill={color} />
      <Path d="M12 35 L14 37" stroke="#6B4226" strokeWidth="0.8" />
      <Path d="M38 35 L36 37" stroke="#6B4226" strokeWidth="0.8" />
      
      {/* Legs with more definition */}
      <Path d="M20 40 L20 50 L25 50" fill={color} />
      <Path d="M30 40 L30 50 L25 50" fill={color} />
      <Path d="M22 45 L23 47" stroke="#6B4226" strokeWidth="0.8" />
      <Path d="M28 45 L27 47" stroke="#6B4226" strokeWidth="0.8" />
      
      {/* Simple belt detail */}
      <Path d="M15 32 L35 32" stroke="#513018" strokeWidth="1.5" />
    </Svg>
  ),
  'caveman-miner.png': (size: number, color = '#A0522D') => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      {/* Head with features and helmet */}
      <Circle cx="25" cy="15" r="10" fill="#FFD700" />
      <Path d="M15 15 C15 10, 20 5, 25 5 C30 5, 35 10, 35 15" fill="#D2691E" />
      <Circle cx="21" cy="13" r="1.5" fill="#000" /> {/* Left eye */}
      <Circle cx="29" cy="13" r="1.5" fill="#000" /> {/* Right eye */}
      <Path d="M22 17 L28 18" stroke="#000" strokeWidth="1" /> {/* Smiling mouth */}
      
      {/* Body with texture and details */}
      <Path d="M15 25 L35 25 L35 40 L15 40 Z" fill={color} />
      <Path d="M17 27 L33 27" stroke="#8B4513" strokeWidth="1" opacity="0.5" />
      <Path d="M19 33 L31 33" stroke="#8B4513" strokeWidth="1" opacity="0.5" />
      
      {/* Arms with muscles */}
      <Path d="M15 25 L10 35 L15 40" fill={color} />
      <Path d="M35 25 L40 35 L35 40" fill={color} />
      <Path d="M12 30 L14 33" stroke="#8B4513" strokeWidth="0.8" />
      <Path d="M38 30 L36 33" stroke="#8B4513" strokeWidth="0.8" />
      
      {/* Legs with boots */}
      <Path d="M20 40 L20 50 L25 50" fill={color} />
      <Path d="M30 40 L30 50 L25 50" fill={color} />
      <Path d="M20 47 L20 50 L25 50" fill="#654321" /> {/* Boot */}
      <Path d="M30 47 L30 50 L25 50" fill="#654321" /> {/* Boot */}
      
      {/* Leather strap */}
      <Path d="M15 32 L35 32" stroke="#513018" strokeWidth="2" />
      <Circle cx="25" cy="32" r="1.5" fill="#B87333" /> {/* Belt buckle */}
    </Svg>
  ),
  'skilled-miner.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      {/* Head with features and helmet */}
      <Circle cx="25" cy="15" r="10" fill="#FFD700" />
      <Path d="M15 12 C15 7, 20 2, 25 2 C30 2, 35 7, 35 12" fill="#2E8B57" stroke="#228B22" strokeWidth="1" />
      <Path d="M15 12 L35 12" stroke="#1E6B36" strokeWidth="1" />
      <Circle cx="21" cy="15" r="1.5" fill="#000" /> {/* Left eye */}
      <Circle cx="29" cy="15" r="1.5" fill="#000" /> {/* Right eye */}
      <Path d="M23 18 L27 18" stroke="#000" strokeWidth="1" /> {/* Determined mouth */}
      
      {/* Body with texture and details */}
      <Path d="M15 25 L35 25 L35 40 L15 40 Z" fill="#556B2F" />
      <Path d="M17 27 L33 27" stroke="#4A5D28" strokeWidth="1" opacity="0.8" />
      <Path d="M19 33 L31 33" stroke="#4A5D28" strokeWidth="1" opacity="0.8" />
      
      {/* Chest plate armor */}
      <Path d="M20 25 L30 25 L28 32 L22 32 Z" fill="#3A5024" />
      <Path d="M24 25 L26 25 L26 32 L24 32 Z" stroke="#2E4020" strokeWidth="0.5" />
      
      {/* Arms with leather guards */}
      <Path d="M15 25 L10 35 L15 40" fill="#556B2F" />
      <Path d="M35 25 L40 35 L35 40" fill="#556B2F" />
      <Path d="M10 30 L15 30" stroke="#4A5D28" strokeWidth="1.5" />
      <Path d="M35 30 L40 30" stroke="#4A5D28" strokeWidth="1.5" />
      
      {/* Legs with shin guards */}
      <Path d="M20 40 L20 50 L25 50" fill="#556B2F" />
      <Path d="M30 40 L30 50 L25 50" fill="#556B2F" />
      <Path d="M20 42 L20 48" stroke="#4A5D28" strokeWidth="1.5" />
      <Path d="M30 42 L30 48" stroke="#4A5D28" strokeWidth="1.5" />
      
      {/* Belt with tool pouch */}
      <Path d="M15 34 L35 34" stroke="#CD7F32" strokeWidth="2" />
      <Path d="M32 34 L35 34 L35 39 L32 39 Z" fill="#8B6914" />
      
      {/* Headlamp on helmet */}
      <Circle cx="25" cy="5" r="2" fill="#FFFF33" opacity="0.8" />
      <Circle cx="25" cy="5" r="1" fill="#FFFFAA" />
    </Svg>
  ),
  'mining-expert.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      {/* Head with advanced helmet */}
      <Circle cx="25" cy="15" r="9" fill="#FFD700" />
      <Path d="M15 15 C15 8, 20 3, 25 3 C30 3, 35 8, 35 15" fill="#4682B4" stroke="#1E90FF" strokeWidth="1" />
      <Path d="M15 15 L35 15" stroke="#4169E1" strokeWidth="1" />
      <Path d="M20 3 L30 3 L28 8 L22 8 Z" fill="#1E90FF" />
      
      {/* Visor */}
      <Path d="M18 10 L32 10 L32 15 L18 15 Z" fill="#87CEFA" opacity="0.7" />
      <Path d="M18 10 L32 10" stroke="#4169E1" strokeWidth="0.5" />
      <Path d="M18 13 L32 13" stroke="#4169E1" strokeWidth="0.5" />
      
      {/* Body with reinforced armor */}
      <Path d="M15 25 L35 25 L35 40 L15 40 Z" fill="#4682B4" />
      <Path d="M15 25 L35 25 L32 32 L18 32 Z" fill="#5F9EA0" />
      <Path d="M18 32 L32 32 L30 40 L20 40 Z" fill="#4682B4" />
      <Path d="M22 25 L28 25 L27 40 L23 40 Z" fill="#5F9EA0" />
      
      {/* Tech equipment on chest */}
      <Rect x="22" y="28" width="6" height="3" rx="1" fill="#191970" />
      <Rect x="23" y="29" width="1" height="1" fill="#4169E1" />
      <Rect x="25" y="29" width="1" height="1" fill="#00BFFF" />
      <Rect x="27" y="29" width="1" height="1" fill="#00FA9A" />
      
      {/* Arms with mechanical joints */}
      <Path d="M15 25 L10 35 L15 40" fill="#4682B4" />
      <Circle cx="10" cy="35" r="2" fill="#5F9EA0" stroke="#4169E1" strokeWidth="0.5" />
      <Path d="M35 25 L40 35 L35 40" fill="#4682B4" />
      <Circle cx="40" cy="35" r="2" fill="#5F9EA0" stroke="#4169E1" strokeWidth="0.5" />
      
      {/* Mechanical boots */}
      <Path d="M20 40 L20 50 L25 50" fill="#4682B4" />
      <Path d="M30 40 L30 50 L25 50" fill="#4682B4" />
      <Path d="M20 45 L23 45" stroke="#5F9EA0" strokeWidth="1" />
      <Path d="M30 45 L27 45" stroke="#5F9EA0" strokeWidth="1" />
      <Path d="M20 48 L25 50 L30 48" fill="#1E90FF" />
      
      {/* Tech gadget on arm */}
      <Rect x="7" y="25" width="5" height="5" rx="1" fill="#191970" />
      <Circle cx="9.5" cy="27.5" r="1" fill="#00BFFF" />
    </Svg>
  ),
  'drill-operator.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      {/* Head with safety helmet and face shield */}
      <Circle cx="25" cy="15" r="8" fill="#FFD700" />
      <Path d="M15 15 C15 8, 20 3, 25 3 C30 3, 35 8, 35 15" fill="#B22222" stroke="#800000" strokeWidth="1" />
      <Path d="M15 15 L35 15" stroke="#CD5C5C" strokeWidth="1" />
      <Path d="M18 10 L32 10 L30 15 L20 15 Z" fill="#FF6347" opacity="0.7" />
      
      {/* Face with safety goggles */}
      <Circle cx="22" cy="15" r="2" fill="#FFFF99" opacity="0.7" />
      <Circle cx="28" cy="15" r="2" fill="#FFFF99" opacity="0.7" />
      <Path d="M22 15 L28 15" stroke="#CD5C5C" strokeWidth="0.5" />
      
      {/* Reinforced jumpsuit with hazard stripes */}
      <Path d="M15 25 L35 25 L35 40 L15 40 Z" fill="#FF6347" />
      <Path d="M15 28 L35 28" stroke="#FFD700" strokeWidth="1.5" />
      <Path d="M15 32 L35 32" stroke="#FFD700" strokeWidth="1.5" />
      <Path d="M15 36 L35 36" stroke="#FFD700" strokeWidth="1.5" />
      
      {/* Reinforced arms with protective gear */}
      <Path d="M15 25 L10 35 L15 40" fill="#FF6347" />
      <Path d="M11 30 L14 30" stroke="#FFD700" strokeWidth="1" />
      <Path d="M12 35 L15 35" stroke="#FFD700" strokeWidth="1" />
      <Path d="M35 25 L40 35 L35 40" fill="#FF6347" />
      <Path d="M36 30 L39 30" stroke="#FFD700" strokeWidth="1" />
      <Path d="M35 35 L38 35" stroke="#FFD700" strokeWidth="1" />
      
      {/* Heavy-duty boots */}
      <Path d="M20 40 L20 50 L25 50" fill="#8B0000" />
      <Path d="M30 40 L30 50 L25 50" fill="#8B0000" />
      <Path d="M20 45 L23 45" stroke="#CD5C5C" strokeWidth="1" />
      <Path d="M30 45 L27 45" stroke="#CD5C5C" strokeWidth="1" />
      
      {/* High-tech industrial drill */}
      <Path d="M35 30 L45 20 L50 25 L40 35" fill="#A9A9A9" stroke="#808080" strokeWidth="1" />
      <Circle cx="47" cy="22" r="2" fill="#FF0000" />
      <Circle cx="47" cy="22" r="1" fill="#FFFF00" opacity="0.8" />
      <Path d="M46 21 L48 23" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.8" />
      <Path d="M48 21 L46 23" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.8" />
      
      {/* Control panel on chest */}
      <Rect x="22" y="29" width="6" height="2" rx="0.5" fill="#696969" />
      <Circle cx="23" cy="30" r="0.5" fill="#FF0000" />
      <Circle cx="25" cy="30" r="0.5" fill="#00FF00" />
      <Circle cx="27" cy="30" r="0.5" fill="#FFFF00" />
    </Svg>
  ),
  'mining-robot.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      {/* Robot head with advanced features */}
      <Rect x="15" y="5" width="20" height="20" rx="3" ry="3" fill="#708090" />
      <Rect x="17" y="7" width="16" height="16" rx="2" ry="2" fill="#2F4F4F" />
      
      {/* Glowing eyes */}
      <Circle cx="20" cy="12" r="2.5" fill="#000000" />
      <Circle cx="20" cy="12" r="1.5" fill="#FF3333" />
      <Circle cx="20" cy="12" r="0.7" fill="#FF9999" />
      
      <Circle cx="30" cy="12" r="2.5" fill="#000000" />
      <Circle cx="30" cy="12" r="1.5" fill="#FF3333" />
      <Circle cx="30" cy="12" r="0.7" fill="#FF9999" />
      
      {/* Status indicators */}
      <Rect x="22" y="9" width="6" height="1" fill="#00FF00" />
      <Rect x="22" y="11" width="6" height="1" fill="#FFFF00" />
      <Rect x="22" y="13" width="6" height="1" fill="#00FFFF" />
      
      {/* Robot mouth with light pattern */}
      <Rect x="20" y="18" width="10" height="2" rx="1" fill="#000000" />
      <Rect x="21" y="18.5" width="2" height="1" fill="#4682B4" />
      <Rect x="24" y="18.5" width="2" height="1" fill="#4682B4" />
      <Rect x="27" y="18.5" width="2" height="1" fill="#4682B4" />
      
      {/* Reinforced body with panel details */}
      <Path d="M15 25 L35 25 L35 40 L15 40 Z" fill="#708090" />
      <Rect x="17" y="27" width="16" height="11" rx="1" fill="#2F4F4F" />
      <Rect x="19" y="29" width="12" height="7" rx="1" fill="#000000" />
      
      {/* Display panel on chest */}
      <Rect x="21" y="30" width="8" height="5" rx="1" fill="#000080" />
      <Path d="M22 32 L24 31 L26 33 L28 30" stroke="#00FFFF" strokeWidth="0.5" fill="none" />
      
      {/* Advanced mechanical arms */}
      <Path d="M15 30 L10 35 L15 40" fill="#708090" />
      <Circle cx="12.5" cy="32.5" r="1.5" fill="#2F4F4F" />
      <Circle cx="10" cy="35" r="1.5" fill="#2F4F4F" />
      <Circle cx="12.5" cy="37.5" r="1.5" fill="#2F4F4F" />
      
      <Path d="M35 30 L40 35 L35 40" fill="#708090" />
      <Circle cx="37.5" cy="32.5" r="1.5" fill="#2F4F4F" />
      <Circle cx="40" cy="35" r="1.5" fill="#2F4F4F" />
      <Circle cx="37.5" cy="37.5" r="1.5" fill="#2F4F4F" />
      
      {/* Robotic legs with joint details */}
      <Path d="M20 40 L20 50 L25 50" fill="#708090" />
      <Path d="M30 40 L30 50 L25 50" fill="#708090" />
      <Circle cx="20" cy="45" r="1.5" fill="#2F4F4F" />
      <Circle cx="30" cy="45" r="1.5" fill="#2F4F4F" />
      <Rect x="19" y="47" width="2" height="3" fill="#2F4F4F" />
      <Rect x="29" y="47" width="2" height="3" fill="#2F4F4F" />
      
      {/* Advanced tech wings/boosters */}
      <Path d="M5 25 L15 20 L15 30 L5 25" fill="#B0C4DE" />
      <Path d="M5 25 L15 20" stroke="#4682B4" strokeWidth="0.5" />
      <Path d="M5 25 L15 30" stroke="#4682B4" strokeWidth="0.5" />
      <Circle cx="7" cy="25" r="1" fill="#4169E1" />
      <Circle cx="9" cy="25" r="1" fill="#4169E1" />
      <Circle cx="11" cy="25" r="1" fill="#4169E1" />
      
      <Path d="M45 25 L35 20 L35 30 L45 25" fill="#B0C4DE" />
      <Path d="M45 25 L35 20" stroke="#4682B4" strokeWidth="0.5" />
      <Path d="M45 25 L35 30" stroke="#4682B4" strokeWidth="0.5" />
      <Circle cx="43" cy="25" r="1" fill="#4169E1" />
      <Circle cx="41" cy="25" r="1" fill="#4169E1" />
      <Circle cx="39" cy="25" r="1" fill="#4169E1" />
      
      {/* Energy core glow */}
      <Circle cx="25" cy="34" r="2" fill="#00BFFF" opacity="0.8" />
      <Circle cx="25" cy="34" r="1" fill="#FFFFFF" opacity="0.8" />
    </Svg>
  ),
  'quantum-miner.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      {/* Multi-layered quantum energy field */}
      <Circle cx="25" cy="25" r="20" fill="#000080" opacity="0.5" />
      <Circle cx="25" cy="25" r="18" fill="#0000CD" opacity="0.4" />
      <Circle cx="25" cy="25" r="16" fill="#4169E1" opacity="0.3" />
      <Circle cx="25" cy="25" r="14" fill="#1E90FF" opacity="0.2" />
      
      {/* Quantum core */}
      <Circle cx="25" cy="25" r="10" fill="#0000CD" opacity="0.6" />
      <Circle cx="25" cy="25" r="8" fill="#1E90FF" opacity="0.7" />
      <Circle cx="25" cy="25" r="6" fill="#00BFFF" opacity="0.8" />
      <Circle cx="25" cy="25" r="4" fill="#87CEFA" opacity="0.9" />
      <Circle cx="25" cy="25" r="2" fill="#FFFFFF" />
      
      {/* Quantum energy rings dynamically rotating */}
      <G transform="rotate(0, 25, 25)">
        <Circle cx="25" cy="25" r="19" fill="none" stroke="#00FFFF" strokeWidth="0.5" strokeDasharray="3,3" />
      </G>
      <G transform="rotate(30, 25, 25)">
        <Circle cx="25" cy="25" r="17" fill="none" stroke="#00FFFF" strokeWidth="0.5" strokeDasharray="2,2" />
      </G>
      <G transform="rotate(60, 25, 25)">
        <Circle cx="25" cy="25" r="15" fill="none" stroke="#00FFFF" strokeWidth="0.5" strokeDasharray="1,1" />
      </G>
      
      {/* Quantum energy pathways */}
      <Path d="M25 5 C40 15, 40 35, 25 45" fill="none" stroke="#00FFFF" strokeWidth="1.2" />
      <Path d="M25 5 C10 15, 10 35, 25 45" fill="none" stroke="#00FFFF" strokeWidth="1.2" />
      <Path d="M5 25 C15 40, 35 40, 45 25" fill="none" stroke="#00FFFF" strokeWidth="1.2" />
      <Path d="M5 25 C15 10, 35 10, 45 25" fill="none" stroke="#00FFFF" strokeWidth="1.2" />
      
      {/* Diagonal energy beams */}
      <Path d="M10 10 L40 40" fill="none" stroke="#00FFFF" strokeWidth="0.8" strokeDasharray="2,2" />
      <Path d="M10 40 L40 10" fill="none" stroke="#00FFFF" strokeWidth="0.8" strokeDasharray="2,2" />
      
      {/* Energy particles around the quantum field */}
      <G>
        <Circle cx="25" cy="5" r="1.5" fill="#FFFFFF" opacity="0.9" />
        <Circle cx="45" cy="25" r="1.5" fill="#FFFFFF" opacity="0.9" />
        <Circle cx="25" cy="45" r="1.5" fill="#FFFFFF" opacity="0.9" />
        <Circle cx="5" cy="25" r="1.5" fill="#FFFFFF" opacity="0.9" />
      </G>
      
      <G>
        <Circle cx="15" cy="10" r="1" fill="#00FFFF" opacity="0.8" />
        <Circle cx="35" cy="10" r="1" fill="#00FFFF" opacity="0.8" />
        <Circle cx="40" cy="15" r="1" fill="#00FFFF" opacity="0.8" />
        <Circle cx="40" cy="35" r="1" fill="#00FFFF" opacity="0.8" />
        <Circle cx="35" cy="40" r="1" fill="#00FFFF" opacity="0.8" />
        <Circle cx="15" cy="40" r="1" fill="#00FFFF" opacity="0.8" />
        <Circle cx="10" cy="35" r="1" fill="#00FFFF" opacity="0.8" />
        <Circle cx="10" cy="15" r="1" fill="#00FFFF" opacity="0.8" />
      </G>
      
      {/* Small energy bursts */}
      <G>
        <Circle cx="20" cy="15" r="0.7" fill="#FFFFFF" />
        <Circle cx="30" cy="15" r="0.7" fill="#FFFFFF" />
        <Circle cx="15" cy="20" r="0.7" fill="#FFFFFF" />
        <Circle cx="35" cy="20" r="0.7" fill="#FFFFFF" />
        <Circle cx="20" cy="35" r="0.7" fill="#FFFFFF" />
        <Circle cx="30" cy="35" r="0.7" fill="#FFFFFF" />
        <Circle cx="15" cy="30" r="0.7" fill="#FFFFFF" />
        <Circle cx="35" cy="30" r="0.7" fill="#FFFFFF" />
      </G>
      
      {/* Central energy explosion effect */}
      <G>
        <Path d="M25 20 L27 17 L25 15 L23 17 Z" fill="#FFFFFF" opacity="0.9" />
        <Path d="M25 30 L27 33 L25 35 L23 33 Z" fill="#FFFFFF" opacity="0.9" />
        <Path d="M20 25 L17 27 L15 25 L17 23 Z" fill="#FFFFFF" opacity="0.9" />
        <Path d="M30 25 L33 27 L35 25 L33 23 Z" fill="#FFFFFF" opacity="0.9" />
      </G>
      
      {/* Hyperdimensional field indicators */}
      <Circle cx="25" cy="25" r="12" fill="none" stroke="#FFFFFF" strokeWidth="0.2" strokeDasharray="0.5,0.5" />
      <Circle cx="25" cy="25" r="12" fill="none" stroke="#FFFFFF" strokeWidth="0.2" transform="rotate(45, 25, 25)" strokeDasharray="0.5,0.5" />
    </Svg>
  ),
  'nano-miner.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Circle cx="25" cy="25" r="15" fill="#32CD32" opacity="0.5" />
      <G fill="#00FF00">
        <Circle cx="25" cy="10" r="3" />
        <Circle cx="40" cy="25" r="3" />
        <Circle cx="25" cy="40" r="3" />
        <Circle cx="10" cy="25" r="3" />
      </G>
      <G fill="none" stroke="#00FF00" strokeWidth="1">
        <Path d="M25 10 L40 25 L25 40 L10 25 Z" />
        <Path d="M25 10 L25 40" />
        <Path d="M10 25 L40 25" />
      </G>
      <Circle cx="25" cy="25" r="5" fill="#228B22" />
      <Circle cx="25" cy="25" r="2" fill="#ADFF2F" />
    </Svg>
  ),
  'gravity-miner-colorful.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Circle cx="25" cy="25" r="20" fill="#4B0082" opacity="0.8" />
      <Circle cx="25" cy="25" r="15" fill="#8A2BE2" opacity="0.7" />
      <Circle cx="25" cy="25" r="10" fill="#9370DB" opacity="0.9" />
      <Circle cx="25" cy="25" r="5" fill="#BA55D3" />
      <G fill="none" stroke="#EE82EE" strokeWidth="1">
        <Path d="M15 15 C25 5, 35 15, 35 25" />
        <Path d="M35 25 C45 35, 35 45, 25 45" />
        <Path d="M25 45 C15 35, 5 25, 15 15" />
      </G>
      <G fill="#FFFFFF">
        <Circle cx="20" cy="20" r="1" />
        <Circle cx="30" cy="20" r="1" />
        <Circle cx="20" cy="30" r="1" />
        <Circle cx="30" cy="30" r="1" />
        <Circle cx="25" cy="15" r="1" />
        <Circle cx="25" cy="35" r="1" />
        <Circle cx="15" cy="25" r="1" />
        <Circle cx="35" cy="25" r="1" />
      </G>
    </Svg>
  ),
  'time-miner.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Circle cx="25" cy="25" r="20" fill="#4682B4" opacity="0.7" />
      <Circle cx="25" cy="25" r="18" fill="none" stroke="#87CEEB" strokeWidth="2" />
      <G>
        <Path d="M25 10 L25 25 L40 25" fill="none" stroke="#E0FFFF" strokeWidth="2" strokeLinecap="round" />
      </G>
      <G fill="#ADD8E6">
        <Circle cx="25" cy="10" r="2" />
        <Circle cx="40" cy="25" r="2" />
        <Circle cx="25" cy="40" r="2" />
        <Circle cx="10" cy="25" r="2" />
      </G>
      <G fill="#F0F8FF" opacity="0.8">
        <Circle cx="17" cy="13" r="1" />
        <Circle cx="33" cy="13" r="1" />
        <Circle cx="37" cy="17" r="1" />
        <Circle cx="37" cy="33" r="1" />
        <Circle cx="33" cy="37" r="1" />
        <Circle cx="17" cy="37" r="1" />
        <Circle cx="13" cy="33" r="1" />
        <Circle cx="13" cy="17" r="1" />
      </G>
    </Svg>
  ),
  'black-hole-miner.png': (size: number) => (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Circle cx="25" cy="25" r="20" fill="black" />
      <Circle cx="25" cy="25" r="15" fill="#222" />
      <Circle cx="25" cy="25" r="10" fill="#333" />
      <Circle cx="25" cy="25" r="5" fill="#444" />
      <G>
        <Path d="M5 25 C5 15, 15 5, 25 5" stroke="#FB00FF" strokeWidth="1" fill="none" />
        <Path d="M25 5 C35 5, 45 15, 45 25" stroke="#00FBFF" strokeWidth="1" fill="none" />
        <Path d="M45 25 C45 35, 35 45, 25 45" stroke="#FBFF00" strokeWidth="1" fill="none" />
        <Path d="M25 45 C15 45, 5 35, 5 25" stroke="#00FF77" strokeWidth="1" fill="none" />
      </G>
      <G fill="white">
        <Circle cx="25" cy="18" r="1" />
        <Circle cx="28" cy="22" r="0.5" />
        <Circle cx="22" cy="20" r="0.5" />
        <Circle cx="23" cy="28" r="0.7" />
      </G>
    </Svg>
  ),
};

export default function MinerIcon({ size, position = 'right', minerType }: MinerIconProps) {
  const getMinerIconType = (id: string) => {
    // Add .png extension if not already there
    if (!id.endsWith('.png')) {
      return `${id}.png`;
    }
    return id;
  };

  const renderSvgIcon = () => {
    // Get the appropriate icon type and use fallback if not found
    const iconType = getMinerIconType(minerType);
    const iconRenderer = minerSvgIcons[iconType] || minerSvgIcons['caveman-apprentice.png'];
    return iconRenderer(size);
  };

  // Calculate position based on placement around the rock
  let positionStyle = {};
  
  switch (position) {
    case 'left':
      positionStyle = { position: 'absolute', left: -size / 1.5, top: '50%', transform: [{ translateY: -size / 2 }] };
      break;
    case 'right':
      positionStyle = { position: 'absolute', right: -size / 1.5, top: '50%', transform: [{ translateY: -size / 2 }] };
      break;
    case 'top':
      positionStyle = { position: 'absolute', top: -size / 1.5, left: '50%', transform: [{ translateX: -size / 2 }] };
      break;
    case 'bottom':
      positionStyle = { position: 'absolute', bottom: -size / 1.5, left: '50%', transform: [{ translateX: -size / 2 }] };
      break;
    case 'none':
      positionStyle = {}; // No positioning styles
      break;
  }

  return (
    <View style={[styles.container, positionStyle]}>
      {renderSvgIcon()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
}); 