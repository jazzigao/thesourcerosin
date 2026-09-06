import { Pressable, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export function BackToTopButton({ onPress }: { onPress: () => void }) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityLabel="Back to top"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? colors.sageButtonHover : colors.primary,
          borderColor: pressed ? colors.orangeDark : colors.secondary,
          transform: [{ translateY: pressed ? 2 : 0 }],
        },
      ]}
    >
      <Feather color={colors.primaryForeground} name="arrow-up" size={15} />
      <Text style={[styles.label, { color: colors.primaryForeground }]}>Back to top</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    marginTop: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  label: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.35,
  },
});