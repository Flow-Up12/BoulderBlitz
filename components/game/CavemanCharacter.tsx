import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, G, Circle, Line } from 'react-native-svg';

type CavemanProps = {
  size?: number;
  position?: 'left' | 'right' | 'top' | 'bottom';
  color?: string;
};

const CavemanCharacter: React.FC<CavemanProps> = ({
  size = 70,
  position = 'left',
  color = '#8D6E63'
}) => {
  // Get styling for different positions around the rock
  const getPositionStyle = () => {
    const styles = {
      position: 'absolute' as const,
      width: size,
      height: size
    };
    
    switch(position) {
      case 'left':
        return {
          ...styles,
          left: -size,
          top: 0
        };
      case 'right':
        return {
          ...styles,
          right: -size,
          top: 0
        };
      case 'top':
        return {
          ...styles,
          top: -size,
          left: 0
        };
      case 'bottom':
        return {
          ...styles,
          bottom: -size,
          left: 0
        };
      default:
        return {
          ...styles,
          left: 0,
          top: 0
        };
    }
  };
  
  // Adjust the SVG based on position
  const renderSvg = () => {
    // Flip the caveman for right position
    if (position === 'right') {
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: [{ scaleX: -1 }] }}>
          {renderCaveman()}
        </Svg>
      );
    }
    
    // Rotate for top position
    if (position === 'top') {
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: [{ rotate: '180deg' }] }}>
          {renderCaveman()}
        </Svg>
      );
    }
    
    // Regular orientation
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {renderCaveman()}
      </Svg>
    );
  };
  
  // The actual caveman SVG elements
  const renderCaveman = () => {
    return (
      <G>
        {/* Head */}
        <Circle cx="50" cy="30" r="20" fill={color} />
        
        {/* Face */}
        <Circle cx="43" cy="25" r="3" fill="#000" /> {/* Left eye */}
        <Circle cx="57" cy="25" r="3" fill="#000" /> {/* Right eye */}
        <Path d="M43 38 Q50 42 57 38" stroke="#000" strokeWidth="2" fill="none" /> {/* Smile */}
        
        {/* Body */}
        <Path d="M40 50 L40 80 L60 80 L60 50 Z" fill={color} />
        
        {/* Legs */}
        <Line x1="45" y1="80" x2="40" y2="95" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <Line x1="55" y1="80" x2="60" y2="95" stroke={color} strokeWidth="5" strokeLinecap="round" />
        
        {/* Arms */}
        <Line x1="40" y1="55" x2="25" y2="65" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <Line x1="60" y1="55" x2="75" y2="45" stroke={color} strokeWidth="5" strokeLinecap="round" />
        
        {/* Tool/club */}
        <Path d="M75 35 L85 45 L75 55 Z" fill="#8B4513" />
      </G>
    );
  };
  
  return (
    <View style={getPositionStyle()}>
      {renderSvg()}
    </View>
  );
};

export default CavemanCharacter; 