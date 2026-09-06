import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetLoyaltyQueryKey,
  getListOrdersQueryKey,
  useCreateOrder,
  useListProducts,
} from '@workspace/api-client-react';
import * as Crypto from 'expo-crypto';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/contexts/CartContext';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/lib/auth';
import { BackToTopButton } from '@/components/BackToTopButton';

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { productId, grams } = useLocalSearchParams<{
    productId?: string;
    grams?: string;
  }>();
  const { clearCart, items: bagItems, subtotal: bagSubtotal } = useCart();
  const [ageVerified, setAgeVerified] = useState(false);
  const [jurisdictionConfirmed, setJurisdictionConfirmed] = useState(false);
  const [idempotencyKey] = useState(() => Crypto.randomUUID());
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const productsQuery = useListProducts();
  const parsedGrams = Number(grams);
  const isDirectCheckout = Boolean(productId);
  const directProduct = productId
    ? productsQuery.data?.find((product) => product.id === productId)
    : null;
  const directSize = directProduct?.sizes.find((size) => size.grams === parsedGrams);
  const directItem = directProduct && directSize
    ? {
        id: directProduct.id,
        name: directProduct.name,
        grams: directSize.grams,
        price: directSize.price,
        quantity: 1,
      }
    : null;
  const checkoutItems = isDirectCheckout ? (directItem ? [directItem] : []) : bagItems;
  const subtotal = directItem ? directItem.price : isDirectCheckout ? 0 : bagSubtotal;

  const checkoutMutation = useCreateOrder({
    request: {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    },
    mutation: {
      onSuccess: async (order) => {
        if (isAuthenticated) {
          void queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetLoyaltyQueryKey() });
        }
        setIsOpeningCheckout(true);
        try {
          await Linking.openURL(order.checkoutUrl);
          if (!directItem) clearCart();
        } catch {
          Alert.alert(
            'Checkout ready',
            'Your secure Shopify checkout is ready, but we could not open it automatically. Your bag is still saved.',
          );
        } finally {
          setIsOpeningCheckout(false);
        }
      },
      onError: () =>
        Alert.alert(
          'Checkout unavailable',
          'We could not prepare secure Shopify checkout. Your selections are still saved.',
        ),
    },
  });

  const beginCheckout = () => {
    if (!checkoutItems.length) {
      Alert.alert('Your bag is empty', 'Choose a product before continuing to payment.');
      return;
    }
    if (!ageVerified || !jurisdictionConfirmed) {
      Alert.alert(
        'Confirm eligibility',
        'Please confirm your age and delivery jurisdiction before continuing.',
      );
      return;
    }
    if (isOpeningCheckout) return;

    checkoutMutation.mutate({
      data: {
        items: checkoutItems.map((item) => ({
          productId: item.id,
          grams: item.grams,
          quantity: item.quantity,
        })),
        subtotal,
        guestCheckout: !isAuthenticated,
        ageVerified,
        jurisdictionConfirmed,
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Secure checkout',
          headerBackTitle: 'Back',
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.primary, fontFamily: 'Georgia' },
        }}
      />
      <LinearGradient colors={[colors.background, colors.pageGradientEnd]} end={{ x: 0, y: 1 }} start={{ x: 0, y: 0 }} style={styles.pageGradient}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 16,
            paddingBottom: Platform.OS === 'web' ? 52 : insets.bottom + 34,
          },
        ]}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.primary }]}>CHECKOUT REVIEW</Text>
        <Text style={[styles.heading, { color: colors.foreground }]}>Ready for secure payment.</Text>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Review your selection and confirm eligibility. Payment is completed on Shopify through a licensed, age-gated retailer.
        </Text>

        {isDirectCheckout && productsQuery.isLoading ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.muted }]}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Verifying live price and availability…</Text>
          </View>
        ) : checkoutItems.length ? (
          <View style={[styles.reviewCard, { backgroundColor: colors.listingBackground, borderColor: colors.orangeDark }]}>
            {checkoutItems.map((item, index) => (
              <View
                key={`${item.id}-${item.grams}`}
                style={[
                  styles.itemRow,
                  index > 0 && { borderTopColor: colors.border, borderTopWidth: 1 },
                ]}
              >
                <View style={styles.itemCopy}>
                  <Text style={[styles.itemName, { color: colors.primary }]}>{item.name}</Text>
                  <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>
                    {item.grams}g · Qty {item.quantity}
                  </Text>
                </View>
                <Text style={[styles.itemPrice, { color: colors.foreground }]}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={[styles.totalRow, { borderTopColor: colors.orangeDark }]}>
              <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
              <Text style={[styles.totalValue, { color: colors.foreground }]}>${subtotal.toFixed(2)}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.muted }]}>
            <Feather color={colors.primary} name="shopping-bag" size={24} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {isDirectCheckout ? 'This selection is no longer available.' : 'Your garden bag is empty.'}
            </Text>
            <Pressable accessibilityRole="button" onPress={() => router.replace('/drops')}>
              <Text style={[styles.browseLink, { color: colors.primary }]}>Browse all products</Text>
            </Pressable>
          </View>
        )}

        {checkoutItems.length ? (
          <>
            <View style={styles.confirmations}>
              <ConfirmationRow
                checked={ageVerified}
                label="I confirm I am of legal age to purchase in my jurisdiction."
                onPress={() => setAgeVerified((current) => !current)}
              />
              <ConfirmationRow
                checked={jurisdictionConfirmed}
                label="I confirm delivery is permitted at my destination."
                onPress={() => setJurisdictionConfirmed((current) => !current)}
              />
            </View>

            <View style={[styles.disclosure, { backgroundColor: colors.wholesaleSurface, borderColor: colors.border }]}>
              <Feather color={colors.primary} name="shield" size={20} />
              <Text style={[styles.disclosureText, { color: colors.foreground }]}>
                Shopify will verify inventory and open the licensed retailer’s secure payment page. No card details are collected in this app.
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Continue to secure Shopify payment"
              accessibilityRole="button"
              disabled={checkoutMutation.isPending || isOpeningCheckout}
              onPress={beginCheckout}
              style={({ pressed }) => [
                styles.checkoutButton,
                {
                  backgroundColor: pressed ? colors.magenta : colors.primary,
                  borderColor: colors.descriptionBorder,
                  opacity: checkoutMutation.isPending || isOpeningCheckout ? 0.7 : 1,
                  shadowColor: colors.orangeDark,
                  boxShadow: `0 1px 6px ${colors.textBoxMagentaGlow}`,
                },
              ]}
              testID="continue-to-payment"
            >
              {checkoutMutation.isPending || isOpeningCheckout ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Text style={[styles.checkoutButtonText, { color: colors.primaryForeground }]}>
                    Continue to secure payment
                  </Text>
                  <Feather color={colors.primaryForeground} name="arrow-up-right" size={18} />
                </>
              )}
            </Pressable>
          </>
        ) : null}
        <BackToTopButton onPress={() => scrollRef.current?.scrollTo({ animated: true, y: 0 })} />
      </ScrollView>
      </LinearGradient>
    </>
  );

  function ConfirmationRow({
    checked,
    label,
    onPress,
  }: {
    checked: boolean;
    label: string;
    onPress: () => void;
  }) {
    return (
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onPress}
        style={[styles.confirmationRow, { borderColor: colors.border }]}
      >
        <Feather
          color={checked ? colors.magenta : colors.mutedForeground}
          name={checked ? 'check-square' : 'square'}
          size={22}
        />
        <Text style={[styles.confirmationText, { color: colors.foreground }]}>{label}</Text>
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  pageGradient: { flex: 1 },
  content: { flexGrow: 1, gap: 18, padding: 18 },
  eyebrow: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  heading: { fontFamily: 'Georgia', fontSize: 31, fontWeight: '800', lineHeight: 36 },
  intro: { fontFamily: 'Georgia', fontSize: 14, lineHeight: 21 },
  reviewCard: { borderWidth: 2, overflow: 'hidden' },
  itemRow: { alignItems: 'center', flexDirection: 'row', gap: 12, padding: 15 },
  itemCopy: { flex: 1 },
  itemName: { fontFamily: 'Georgia', fontSize: 16, fontWeight: '800', lineHeight: 20 },
  itemMeta: { fontFamily: 'Georgia', fontSize: 12, marginTop: 4 },
  itemPrice: { fontFamily: 'Georgia', fontSize: 14, fontWeight: '800' },
  totalRow: { borderTopWidth: 2, flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  totalLabel: { fontFamily: 'Georgia', fontSize: 13 },
  totalValue: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '800' },
  confirmations: { gap: 10 },
  confirmationRow: { alignItems: 'flex-start', borderWidth: 1, flexDirection: 'row', gap: 11, padding: 14 },
  confirmationText: { flex: 1, fontFamily: 'Georgia', fontSize: 13, lineHeight: 19 },
  disclosure: { alignItems: 'flex-start', borderWidth: 1, flexDirection: 'row', gap: 11, padding: 14 },
  disclosureText: { flex: 1, fontFamily: 'Georgia', fontSize: 12, lineHeight: 18 },
  checkoutButton: { alignItems: 'center', borderWidth: 2, flexDirection: 'row', justifyContent: 'space-between', minHeight: 54, paddingHorizontal: 17, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.38, shadowRadius: 6 },
  checkoutButtonText: { fontFamily: 'Georgia', fontSize: 14, fontWeight: '800' },
  emptyCard: { alignItems: 'center', gap: 10, padding: 28 },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 22, textAlign: 'center' },
  browseLink: { fontFamily: 'Georgia', fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' },
});