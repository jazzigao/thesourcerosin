import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function LegalDisclaimer({ compact = false }: { compact?: boolean }) {
  const colors = useColors();

  const copy = (
    <Text style={[styles.copy, { color: colors.mutedForeground }]}>
        <Text style={[styles.lead, { color: colors.primary }]}>
          COLD CURED LIVE ROSIN THCA - 100% Solventless.
        </Text>{' '}
        THCa products are federally legal under the 2018 Farm Bill when derived
        from hemp and containing less than 0.3% Delta-9 THC by dry weight. THCa
        is non-psychoactive in its raw form, it converts to THC when heated.
        Laws may vary by state, so please check your local state regulations
        before purchasing. Made with love and care.
    </Text>
  );

  const surfaceStyle = [
    styles.container,
    compact ? styles.compactContainer : styles.footerContainer,
    { borderTopColor: colors.border },
  ];

  if (compact) {
    return (
      <View accessibilityLabel="THCa legal and safety information" style={surfaceStyle}>
        {copy}
      </View>
    );
  }

  return (
    <LinearGradient
      accessibilityLabel="THCa legal and safety information"
      colors={['rgba(246, 234, 212, 0.24)', 'rgba(234, 213, 177, 0.24)']}
      end={{ x: 0, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={surfaceStyle}
    >
      {copy}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    width: '100%',
  },
  footerContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  compactContainer: {
    marginTop: 4,
    paddingHorizontal: 2,
    paddingTop: 8,
  },
  copy: {
    fontFamily: 'Georgia',
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
  },
  lead: {
    fontWeight: '800',
  },
});