// ✅ SOLUTION CORRIGÉE : AppText.tsx avec merge intelligent des styles

import React from 'react';
import { Text as RNText, TextProps, StyleSheet, Platform } from 'react-native';

type Props = TextProps & {
  bold?: boolean;
  weight?: '300' | '400' | '500' | '600' | '700' | '800';
};

export function AppText({ 
  style, 
  bold, 
  weight, 
  children, 
  ...rest 
}: Props) {
  
  // 🔍 Debug (tu peux le supprimer après test)
  if (__DEV__) {
    console.log('🔤 AppText Debug:', {
      bold: bold,
      weight: weight,
      hasStyle: !!style,
      children: typeof children === 'string' ? children.slice(0, 20) + '...' : 'non-text'
    });
  }

  // 🎯 SOLUTION 1 : Merge intelligent avec priorité bold
  const getFinalStyle = () => {
    // Calcul du fontWeight voulu
    const desiredFontWeight = bold ? '700' : weight || '400';
    
    // Si pas de style externe, simple
    if (!style) {
      return [styles.text, { fontWeight: desiredFontWeight }];
    }
    
    // Si style externe existe, on le merge intelligemment
    const externalStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
    
    return [
      styles.text,
      externalStyle,  // Style externe d'abord
      bold && { fontWeight: '700' }, // ✅ FORCE bold si nécessaire
    ];
  };

  return (
    <RNText {...rest} style={getFinalStyle()}>
      {children}
    </RNText>
  );
}

// ✅ SOLUTION 2 : Plus simple - Force toujours bold en dernier

export function AppTextSimple({ 
  style, 
  bold, 
  weight, 
  children, 
  ...rest 
}: Props) {
  
  const fontWeight = bold ? '700' : weight || '400';
  
  return (
    <RNText 
      {...rest} 
      style={[
        styles.text,
        style,                              // Style externe
        { fontWeight },                     // ✅ TOUJOURS en dernier !
      ]}
    >
      {children}
    </RNText>
  );
}

// ✅ SOLUTION 3 : Avec fallback police système

export function AppTextWithFallback({ 
  style, 
  bold, 
  weight, 
  children, 
  ...rest 
}: Props) {
  
  const fontWeight = bold ? '700' : weight || '400';
  
  return (
    <RNText 
      {...rest} 
      style={[
        styles.textWithFallback,
        style,
        { fontWeight },  // Toujours en dernier
      ]}
    >
      {children}
    </RNText>
  );
}

// Default export (choose the main one you want to use)
export default AppText;

const styles = StyleSheet.create({
  text: {
    fontFamily: 'FiraCode-VariableFont',
    color: '#fff',
    fontSize: 16,
  },
  
  // ✅ Version avec fallback si FiraCode pose problème
  textWithFallback: {
    fontFamily: Platform.select({
      ios: 'FiraCode-VariableFont',
      android: 'FiraCode-VariableFont',
      default: 'System', // Fallback
    }),
    color: '#fff',
    fontSize: 16,
  },
});

/* 
🎯 EXPLICATION DU PROBLÈME ET SOLUTION :

❌ AVANT (ce qui ne marchait pas) :
[styles.text, { fontWeight }, style]
Le `style` externe écrasait `fontWeight`

✅ MAINTENANT (ce qui marche) :
[styles.text, style, { fontWeight }]
Le `fontWeight` est TOUJOURS appliqué en dernier

📊 RÉSULTAT ATTENDU :
Tous tes textes avec bold=true vont maintenant apparaître en gras !

🧪 TEST RAPIDE :
Remplace ton AppText.tsx avec la SOLUTION 2 (plus simple)
Clear cache : expo start --clear
Les logs devraient montrer la même chose MAIS les textes bold seront visibles !

🔍 SI ÇA MARCHE TOUJOURS PAS :
Teste la SOLUTION 3 avec fallback police système
Ça nous dira si le problème vient de FiraCode-VariableFont
*/