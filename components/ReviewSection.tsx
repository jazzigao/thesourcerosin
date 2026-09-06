import {
  getListReviewsQueryKey,
  useClaimReview,
  useListReviews,
  useSubmitReview,
  type ReviewClaimLink,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message.replace(/^HTTP \d+[^:]*:\s*/, '') : fallback;
}

export function ReviewSection({ token, showFeed = true }: { token?: string; showFeed?: boolean }) {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const reviewsQuery = useListReviews({
    query: { queryKey: getListReviewsQueryKey(), staleTime: 30_000, refetchInterval: 60_000 },
  });
  const claim = useClaimReview();
  const submit = useSubmitReview();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [claims, setClaims] = useState<ReviewClaimLink[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ReviewClaimLink | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const activeClaim = token
    ? {
        productId: '',
        productName: 'your purchase',
        token,
        reviewUrl: '',
        expiresAt: new Date().toISOString(),
      }
    : selectedClaim;

  const handleClaim = () => {
    claim.mutate(
      { data: { orderNumber, email } },
      {
        onSuccess: (data) => {
          setClaims(data.claims);
          setSelectedClaim(data.claims[0] ?? null);
        },
      },
    );
  };

  const handleSubmit = () => {
    if (!activeClaim) return;
    submit.mutate(
      { data: { token: activeClaim.token, reviewerName, rating, text: reviewText } },
      {
        onSuccess: async () => {
          setReviewerName('');
          setReviewText('');
          await queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey() });
        },
      },
    );
  };

  return (
    <View style={styles.wrapper}>
      {!token && (
        <View style={[styles.claimCard, { backgroundColor: colors.titleSurface, borderColor: colors.orangeDark }]}>
          <View style={styles.headingRow}>
            <Feather color={colors.primary} name="shield" size={17} />
            <Text style={[styles.eyebrow, { color: colors.primary }]}>VERIFIED PURCHASER NOTES</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Share your experience</Text>
          <Text style={[styles.copy, { color: colors.mutedForeground }]}>
            Enter the order number and buyer email from your Shopify receipt. No account required.
          </Text>
          <TextInput
            autoCapitalize="characters"
            onChangeText={setOrderNumber}
            placeholder="Order number, e.g. #1001"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.orangeLight, color: colors.foreground }]}
            value={orderNumber}
          />
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Buyer email"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.orangeLight, color: colors.foreground }]}
            value={email}
          />
          <Pressable
            accessibilityRole="button"
            disabled={claim.isPending}
            onPress={handleClaim}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: pressed ? colors.addButtonHoverSage : colors.primary, opacity: claim.isPending ? 0.65 : 1 },
            ]}
          >
            {claim.isPending ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Find my purchase</Text>}
          </Pressable>
          {claim.isError && <Text style={[styles.error, { color: colors.destructive }]}>{getErrorMessage(claim.error, 'We could not verify that purchase.')}</Text>}
          {claims.length > 0 && (
            <View style={styles.claimChoices}>
              <Text style={[styles.choiceLabel, { color: colors.mutedForeground }]}>Choose a product to review</Text>
              {claims.map((claimLink) => (
                <Pressable
                  accessibilityRole="button"
                  key={claimLink.productId}
                  onPress={() => setSelectedClaim(claimLink)}
                  style={[
                    styles.productChoice,
                    {
                      backgroundColor: selectedClaim?.productId === claimLink.productId ? colors.primary : 'transparent',
                      borderColor: colors.orangeLight,
                    },
                  ]}
                >
                  <Text style={{ color: selectedClaim?.productId === claimLink.productId ? colors.primaryForeground : colors.foreground }}>
                    {claimLink.productName}
                  </Text>
                  <Feather
                    color={selectedClaim?.productId === claimLink.productId ? colors.primaryForeground : colors.primary}
                    name="arrow-right"
                    size={15}
                  />
                </Pressable>
              ))}
              {selectedClaim && (
                <Pressable onPress={() => router.push({ pathname: '/reviews' as never, params: { token: selectedClaim.token } })} style={styles.inlineLink}>
                  <Text style={[styles.inlineLinkText, { color: colors.primary }]}>Open secure review form</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}

      {activeClaim && (
        <View style={[styles.formCard, { borderColor: colors.primary, backgroundColor: colors.listingBackground }]}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>PURCHASE VERIFIED</Text>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>Review {activeClaim.productName}</Text>
          <TextInput
            onChangeText={setReviewerName}
            placeholder="Your name"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.orangeLight, color: colors.foreground }]}
            value={reviewerName}
          />
          <View style={styles.ratingRow}>
            <Text style={[styles.choiceLabel, { color: colors.mutedForeground }]}>Rating</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable accessibilityLabel={`${value} out of 5 stars`} key={value} onPress={() => setRating(value)}>
                  <Feather color={colors.primary} name="star" size={24} style={value <= rating ? styles.filledStar : undefined} />
                </Pressable>
              ))}
            </View>
          </View>
          <TextInput
            multiline
            onChangeText={setReviewText}
            placeholder="What stood out about this drop?"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, styles.textarea, { backgroundColor: colors.background, borderColor: colors.orangeLight, color: colors.foreground }]}
            textAlignVertical="top"
            value={reviewText}
          />
          <Pressable
            accessibilityRole="button"
            disabled={submit.isPending}
            onPress={handleSubmit}
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: pressed ? colors.addButtonHoverSage : colors.primary, opacity: submit.isPending ? 0.65 : 1 }]}
          >
            {submit.isPending ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Publish review</Text>}
          </Pressable>
          {submit.isError && <Text style={[styles.error, { color: colors.destructive }]}>{getErrorMessage(submit.error, 'Unable to publish the review.')}</Text>}
          {submit.isSuccess && <Text style={[styles.success, { color: colors.primary }]}>Thank you — your review is now live.</Text>}
        </View>
      )}

      {showFeed && (
        <View style={styles.feed}>
          <View style={styles.headingRow}>
            <Feather color={colors.primary} name="message-circle" size={17} />
            <Text style={[styles.eyebrow, { color: colors.primary }]}>FROM THE TABLE</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Purchaser notes</Text>
          {reviewsQuery.isLoading && <ActivityIndicator color={colors.primary} />}
          {!reviewsQuery.isLoading && !reviewsQuery.data?.length && <Text style={[styles.copy, { color: colors.mutedForeground }]}>The first notes from this drop will land here soon.</Text>}
          {(reviewsQuery.data ?? []).map((review) => (
            <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.titleSurface, borderColor: colors.orangeLight }]}>
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewProduct, { color: colors.foreground }]}>{review.productName}</Text>
                <Text style={[styles.rating, { color: colors.primary }]}>{'★'.repeat(review.rating)}</Text>
              </View>
              <Text style={[styles.reviewText, { color: colors.mutedForeground }]}>{review.text}</Text>
              <Text style={[styles.reviewer, { color: colors.primary }]}>{review.reviewerName}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 14, paddingTop: 18 },
  claimCard: { borderRadius: 14, borderWidth: 1, gap: 10, overflow: 'hidden', padding: 14 },
  formCard: { borderRadius: 14, borderWidth: 1, gap: 10, overflow: 'hidden', padding: 14 },
  feed: { gap: 10, paddingBottom: 6, paddingTop: 12 },
  headingRow: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  eyebrow: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontFamily: 'Georgia', fontSize: 26, lineHeight: 31 },
  formTitle: { fontFamily: 'Georgia', fontSize: 21, lineHeight: 26 },
  copy: { fontFamily: 'Georgia', fontSize: 13, lineHeight: 19 },
  input: { borderRadius: 8, borderWidth: 1, fontFamily: 'Georgia', fontSize: 14, minHeight: 46, paddingHorizontal: 12, paddingVertical: 10 },
  textarea: { minHeight: 120 },
  primaryButton: { alignItems: 'center', borderRadius: 999, minHeight: 46, justifyContent: 'center', overflow: 'hidden', paddingHorizontal: 16 },
  buttonText: { fontFamily: 'Georgia', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  error: { fontFamily: 'Georgia', fontSize: 12, lineHeight: 17 },
  success: { fontFamily: 'Georgia', fontSize: 12, lineHeight: 17 },
  claimChoices: { borderTopColor: 'rgba(184, 91, 49, 0.3)', borderTopWidth: 1, gap: 7, paddingTop: 10 },
  choiceLabel: { fontFamily: 'Georgia', fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  productChoice: { alignItems: 'center', borderRadius: 8, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 9 },
  inlineLink: { paddingVertical: 5 },
  inlineLinkText: { fontFamily: 'Georgia', fontSize: 12, fontWeight: '900', textDecorationLine: 'underline' },
  ratingRow: { gap: 6 },
  stars: { flexDirection: 'row', gap: 4 },
  filledStar: { backgroundColor: 'transparent' },
  reviewCard: { borderRadius: 12, borderWidth: 1, gap: 7, overflow: 'hidden', padding: 13 },
  reviewHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  reviewProduct: { flex: 1, fontFamily: 'Georgia', fontSize: 17, fontWeight: '800' },
  rating: { fontSize: 13, letterSpacing: 1 },
  reviewText: { fontFamily: 'Georgia', fontSize: 13, lineHeight: 19 },
  reviewer: { fontFamily: 'Georgia', fontSize: 11, fontWeight: '900', letterSpacing: 0.7, textTransform: 'uppercase' },
});