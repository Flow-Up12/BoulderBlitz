import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Rect, G, LinearGradient, Stop, Defs, Ellipse } from 'react-native-svg';

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