import { Link, Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRef } from 'react';
import { useColors } from '@/hooks/useColors';
import { BackToTopButton } from '@/components/BackToTopButton';

export default function NotFoundScreen() {
  const colors = useColors();
  const scrollRef = useRef<ScrollView>(null);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        ref={scrollRef}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          This screen doesn&apos;t exist.
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.primary }]}>
            Go to home screen!
          </Text>
        </Link>
        <BackToTopButton onPress={() => scrollRef.current?.scrollTo({ animated: true, y: 0 })} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontFamily: 'Georgia',
    fontSize: 14,
  },
});
