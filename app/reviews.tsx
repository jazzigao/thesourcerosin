import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReviewSection } from '@/components/ReviewSection';
import { useColors } from '@/hooks/useColors';

export default function ReviewsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useLocalSearchParams<{ token?: string }>();

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      style={{ backgroundColor: colors.background }}
    >
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>THE SOURCE / REVIEWS</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Share your experience</Text>
        <Text style={[styles.copy, { color: colors.mutedForeground }]}>
          A verified note helps the next person find the right jar. Your order details stay private.
        </Text>
      </View>
      <ReviewSection showFeed={false} token={typeof token === 'string' ? token : undefined} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14 },
  header: { borderBottomWidth: 1, borderBottomColor: 'rgba(184, 91, 49, 0.35)', gap: 8, paddingBottom: 18, paddingTop: 12 },
  eyebrow: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { fontFamily: 'Georgia', fontSize: 29, lineHeight: 34 },
  copy: { fontFamily: 'Georgia', fontSize: 14, lineHeight: 20 },
});