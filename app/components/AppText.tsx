import React from 'react';
import { Text as RNText, TextProps, StyleSheet, Platform } from 'react-native';

type Props = TextProps & {
  bold?: boolean;
  weight?: '300' | '400' | '500' | '700' | '900';  // ✅ Poids personnalisable
};

export default function AppText({ 
  style, 
  bold, 
  weight, 
  children, 
  ...rest 
}: Props) {
  
  // ✅ Logique poids optimisée pour Satoshi
  const fontWeight = bold ? '700' : weight || '400';
  
  return (
    <RNText 
      {...rest} 
      style={[
        styles.text,
        style,
        { fontWeight },  // ✅ Toujours en dernier !
      ]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Satoshi',  // ✅ Nom de base pour auto-détection des poids
    color: '#fff',          // Blanc pour ton thème sombre
    fontSize: 16,           // Taille de base optimale
    letterSpacing: -0.2,    // ✅ IMPORTANT : Satoshi plus beau avec tracking serré
  },
});