import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useColors } from '@/hooks/useColors';

type SeeNewDropsButtonProps = {
  onPress: () => void;
};

export function SeeNewDropsButton({ onPress }: SeeNewDropsButtonProps) {
  const colors = useColors();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  return (
    <Pressable
      accessibilityLabel="See new drops"
      accessibilityRole="button"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setClicked(true)}
      onPress={() => {
        setClicked(true);
        setTimeout(onPress, 650);
      }}
      style={styles.pressable}
      testID="button-see-new-drops"
    >
      {({ pressed }) => {
        const isPressed = pressed || clicked;
        const isHighlighted = hovered || isPressed;
        const labelColor = colors.ctaDeepForest;
        const faceGradient: [string, string, ...string[]] = isPressed
          ? [colors.ctaClickOrange, colors.orangeLight, colors.ctaBrightOrange]
          : [colors.primary, colors.ctaDeepPurple];

        return (
          <View
            style={[
              styles.face,
              {
                borderColor: isPressed
                  ? 'transparent'
                  : 'transparent',
                borderWidth: 2,
                boxShadow: isPressed
                  ? `inset 0 0 16px ${colors.seeDropsInnerGlow}, inset 0 0 32px ${colors.seeDropsInnerGlow}`
                  : isHighlighted
                    ? `inset 0 0 14px ${colors.seeDropsInnerGlow}, inset 0 0 28px ${colors.seeDropsInnerGlow}`
                    : undefined,
              },
            ]}
          >
            <LinearGradient
              colors={faceGradient}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              start={{ x: 0, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text
              style={[
                styles.label,
                {
                  color: labelColor,
                  textShadowColor: colors.ctaHoverBeige,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 4,
                },
              ]}
            >
              See New Drops
            </Text>
            <Feather color={labelColor} name="arrow-up-right" size={17} />
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginTop: 13,
  },
  face: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 44,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  label: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
  },
});