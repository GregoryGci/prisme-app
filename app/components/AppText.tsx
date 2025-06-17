import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';


type Props = TextProps & {
  bold?: boolean; // optionnel : pour switcher sur Inter-Bold
};

export default function AppText({ style, bold, children, ...rest }: Props) {
  return (
    <RNText
      {...rest}
      style={[
        styles.text,
        bold && styles.bold,  // si bold=true, utilise la graisse bold
        style,                // merge avec style passé en prop
      ]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'SFUIText-Regular', // ta police par défaut
    color: '#000',               // tu peux ajuster si besoin
  },
  bold: {
    fontFamily: 'SFUIText-Bold',
  },
});
