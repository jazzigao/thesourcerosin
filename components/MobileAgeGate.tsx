import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '@/components/BrandMark';
import { LegalDisclaimer } from '@/components/LegalDisclaimer';
import { useColors } from '@/hooks/useColors';
import { LinearGradient } from 'expo-linear-gradient';

const AGE_GATE_STORAGE_KEY = 'the-source-mobile-age-verified';
let resetMobileAgeGate: (() => void) | null = null;

export function requestMobileAgeGateReset() {
  resetMobileAgeGate?.();
}

export function MobileAgeGate() {
  const colors = useColors();
  const [isEntered, setIsEntered] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(AGE_GATE_STORAGE_KEY)
      .then((value) => setIsEntered(value === 'true'))
      .catch(() => setIsEntered(false));
  }, []);

  useEffect(() => {
    const reset = () => {
      setIsEntered(false);
      AsyncStorage.removeItem(AGE_GATE_STORAGE_KEY).catch(() => undefined);
    };

    resetMobileAgeGate = reset;
    return () => {
      if (resetMobileAgeGate === reset) {
        resetMobileAgeGate = null;
      }
    };
  }, []);

  const enterStore = () => {
    setIsEntered(true);
    AsyncStorage.setItem(AGE_GATE_STORAGE_KEY, 'true').catch(() => undefined);
  };

  if (isEntered === true) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: colors.entryBackground }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.entryCard,
                borderColor: colors.entryBorder,
                boxShadow: `0 10px 28px ${colors.entryShadow}`,
              },
            ]}
          >
            <BrandMark variant="hero" style={styles.entryLogo} />
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              HIGH QUALITY &amp; PURE
            </Text>
            <Text style={[styles.title, { color: colors.entryText }]}>
              Are you 21 years of age or older?
            </Text>
            <Text style={[styles.intro, { color: colors.entryMutedText }]}>
              You must be of legal age to enter this app. By entering, you also
              confirm that your jurisdiction allows the purchase of these
              products.
            </Text>
            <LegalDisclaimer compact />
            <View style={styles.actions}>
              <Pressable
                accessibilityLabel="Yes, I am 21 or older"
                onPress={enterStore}
                style={({ pressed }) => [
                  styles.enterButton,
                  {
                    borderColor: colors.entryButtonBorder,
                    opacity: pressed ? 0.96 : 1,
                  },
                ]}
              >
                {({ pressed, hovered }) => (
                  <LinearGradient
                    colors={
                      pressed
                        ? [colors.entryButtonPressedGradientStart, colors.entryButtonPressedGradientEnd]
                        : hovered
                          ? [colors.entryButtonHoverGradientStart, colors.entryButtonHoverGradientEnd]
                          : [colors.entryButtonGradientStart, colors.entryButtonGradientEnd]
                    }
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={styles.enterButtonGradient}
                  >
                    <Text style={[styles.enterButtonText, { color: colors.entryButtonText }]}>
                      Yes, I am 21+
                    </Text>
                  </LinearGradient>
                )}
              </Pressable>
              <Pressable
                accessibilityLabel="No, I am under 21"
                onPress={() => {
                  Linking.openURL('https://google.com').catch(() => undefined);
                }}
                style={({ pressed }) => [
                  styles.exitButton,
                  {
                    borderColor: colors.entryExitBorder,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.exitButtonText, { color: colors.entryText }]}>
                  No, I am under 21
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    elevation: 100,
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 14,
  },
  card: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  entryLogo: {
    alignSelf: 'center',
    marginBottom: 6,
  },
  eyebrow: {
    fontFamily: 'Georgia',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 6,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 27,
    fontWeight: '700',
    lineHeight: 32,
    marginTop: 26,
    textAlign: 'center',
  },
  intro: {
    fontFamily: 'Georgia',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
    maxWidth: 330,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: 10,
    marginTop: 20,
  },
  enterButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  enterButtonGradient: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    borderRadius: 7,
    justifyContent: 'center',
  },
  enterButtonText: {
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '800',
  },
  exitButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  exitButtonText: {
    fontFamily: 'Georgia',
    fontSize: 15,
    fontWeight: '700',
  },
});