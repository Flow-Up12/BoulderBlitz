import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, RadialGradient, Circle, Ellipse, G, Filter, FeGaussianBlur, FeBlend, FeOffset } from 'react-native-svg';

type SvgRockProps = {
  width: number;
  height: number;
  color?: string;
};

export default function SvgRock({ width, height, color = '#777777' }: SvgRockProps) {
  // Calculate lighter and darker shades for gradients
  const baseColor = color;
  const lighterColor = adjustColorBrightness(baseColor, 40);
  const darkerColor = adjustColorBrightness(baseColor, -40);
  const highlightColor = adjustColorBrightness(baseColor, 80);
  
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 200 200">
        <Defs>
          {/* Main rock gradient */}
          <LinearGradient id="rockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={lighterColor} />
            <Stop offset="50%" stopColor={baseColor} />
            <Stop offset="100%" stopColor={darkerColor} />
          </LinearGradient>
          
          {/* Shine effect gradient */}
          <RadialGradient
            id="shineGradient"
            cx="70"
            cy="70"
            r="65"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor={highlightColor} stopOpacity="0.7" />
            <Stop offset="100%" stopColor={highlightColor} stopOpacity="0" />
          </RadialGradient>
          
          {/* Texture gradient */}
          <RadialGradient
            id="textureGradient"
            cx="100"
            cy="100"
            r="100"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="90%" stopColor="#000000" stopOpacity="0.05" />
          </RadialGradient>
          
          {/* Shadow filter */}
          <Filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <FeOffset dx="2" dy="2" result="offsetblur" />
            <FeBlend in="SourceGraphic" in2="offsetblur" mode="normal" />
          </Filter>
        </Defs>
        
        {/* Base rock shape */}
        <Path
          d="M35,120 C20,90 25,60 40,40 C60,15 90,10 120,25 C150,40 175,70 180,105 C185,140 165,170 130,180 C95,190 60,170 35,120 Z"
          fill="url(#rockGradient)"
          filter="url(#shadow)"
        />
        
        {/* Rock texture overlay */}
        <Path
          d="M35,120 C20,90 25,60 40,40 C60,15 90,10 120,25 C150,40 175,70 180,105 C185,140 165,170 130,180 C95,190 60,170 35,120 Z"
          fill="url(#textureGradient)"
          opacity="0.7"
        />
        
        {/* Rock cracks and details */}
        <G opacity="0.6">
          <Path
            d="M65,60 C85,80 95,100 85,140"
            stroke={darkerColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M110,40 C100,80 115,120 130,160"
            stroke={darkerColor}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M75,90 C105,95 130,85 150,100"
            stroke={darkerColor}
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
        </G>
        
        {/* Rock indentations */}
        <Ellipse cx="70" cy="110" rx="15" ry="10" fill={darkerColor} opacity="0.2" />
        <Ellipse cx="120" cy="70" rx="20" ry="12" fill={darkerColor} opacity="0.15" />
        <Ellipse cx="110" cy="140" rx="12" ry="8" fill={darkerColor} opacity="0.2" />
        
        {/* Shine highlight */}
        <Circle cx="70" cy="70" r="50" fill="url(#shineGradient)" />
        
        {/* Mineral specks */}
        <G opacity="0.9">
          <Circle cx="60" cy="60" r="1.5" fill="#FFDC73" />
          <Circle cx="130" cy="55" r="2" fill="#FFDC73" />
          <Circle cx="95" cy="150" r="1.5" fill="#FFDC73" />
          <Circle cx="150" cy="100" r="1" fill="#FFDC73" />
          <Circle cx="55" cy="120" r="1" fill="#FFDC73" />
        </G>
      </Svg>
    </View>
  );
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, amount: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse the hex color to r, g, b
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 