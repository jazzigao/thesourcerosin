import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getGetLoyaltyQueryKey,
  getListOrdersQueryKey,
  useGetLoyalty,
  useListOrders,
} from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/contexts/CartContext';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/lib/auth';
import { BackToTopButton } from '@/components/BackToTopButton';
import { useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const [signUpHovered, setSignUpHovered] = useState(false);
  const [signUpPressed, setSignUpPressed] = useState(false);
  const [loginHovered, setLoginHovered] = useState(false);
  const [loginPressed, setLoginPressed] = useState(false);
  const { user, isAuthenticated, isLoading: isAuthLoading, login, logout } = useAuth();
  const loyaltyQuery = useGetLoyalty({
    query: { enabled: isAuthenticated, queryKey: getGetLoyaltyQueryKey() },
  });
  const ordersQuery = useListOrders({
    query: { enabled: isAuthenticated, queryKey: getListOrdersQueryKey() },
  });
  const { itemCount, items, subtotal, updateQuantity } = useCart();
  const loyalty = loyaltyQuery.data;

  return (
    <LinearGradient colors={[colors.background, colors.pageGradientEnd]} end={{ x: 0, y: 1 }} start={{ x: 0, y: 0 }} style={styles.pageGradient}>
    <ScrollView
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: 16,
          paddingBottom: Platform.OS === 'web' ? 130 : insets.bottom + 96,
        },
      ]}
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
    >
      {isAuthLoading ? (
        <View style={[styles.authLoading, { backgroundColor: colors.foreground, borderRadius: colors.radius }]}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : isAuthenticated ? (
        <View style={[styles.memberCard, { backgroundColor: colors.foreground, borderRadius: colors.radius }]}>
          <View style={styles.memberHeader}>
            <Text style={[styles.memberEyebrow, { color: colors.accent }]}>THE SOURCE MEMBER</Text>
            <Pressable onPress={logout} testID="member-logout">
              <Text style={[styles.logoutText, { color: colors.background }]}>LOG OUT</Text>
            </Pressable>
          </View>
          <Text style={[styles.memberTitle, { color: colors.background }]}>
            Welcome, {user?.firstName || user?.email || 'member'}.
          </Text>
          <View style={styles.pointsRow}>
            <Text style={[styles.points, { color: colors.background }]}>{loyalty?.points ?? 0}</Text>
            <Text style={[styles.pointsLabel, { color: colors.mutedForeground }]}>garden points</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.mutedForeground }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.accent,
                  width: `${Math.min(100, Math.max(0, 100 - (loyalty?.dollarsToNextReward ?? 100)))}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.rewardCopy, { color: colors.background }]}>
            {loyalty?.rewardMessage ?? 'Loading your next reward...'}
          </Text>
        </View>
      ) : (
        <View style={[styles.memberCard, { backgroundColor: colors.foreground, borderRadius: colors.radius }]}>
            <Text style={[styles.memberEyebrow, { color: colors.accent }]}>THE SOURCE MEMBERS</Text>
          <Text style={[styles.memberTitle, { color: colors.background }]}>
            Track and review your rosin history.{'\n'}Earn points for special deals with every order.
          </Text>
          <Text style={[styles.rewardCopy, { color: colors.background }]}>
            Sign up or log in to collect points and see member orders across devices.
          </Text>
          <View style={styles.authActions}>
            <Pressable
              onHoverIn={() => setSignUpHovered(true)}
              onHoverOut={() => setSignUpHovered(false)}
              onPressIn={() => setSignUpPressed(true)}
              onPressOut={() => setSignUpPressed(false)}
              onPress={login}
              style={({ pressed }) => {
                const hovered = signUpHovered && !pressed;
                const highlighted = hovered || pressed;
                return [
                  styles.authButton,
                  {
                    borderColor: pressed
                      ? colors.ctaHoverPink
                      : hovered
                        ? colors.lavenderLight
                        : colors.titleLavenderStrong,
                    borderRadius: colors.radius,
                    borderWidth: 1,
                    boxShadow: pressed
                      ? `0 0 0 1px ${colors.addButtonOrangePinkGlow}, 0 0 5px ${colors.addButtonOrangePinkGlow}, 0 0 9px ${colors.ctaHoverPink}`
                      : hovered
                        ? `0 0 0 1px ${colors.titleLavenderStrong}, 0 0 5px ${colors.lavenderLight}, 0 0 8px rgba(255, 255, 255, 0.28)`
                        : `0 0 0 1px ${colors.titleLavenderStrong}, 0 0 5px ${colors.lavenderLight}, 0 0 8px rgba(255, 255, 255, 0.32)`,
                    backgroundColor: 'transparent',
                    overflow: 'hidden',
                    shadowColor: pressed ? colors.addButtonOrangePinkGlow : colors.lavenderLight,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: pressed ? 0.5 : hovered ? 0.32 : 0.24,
                    shadowRadius: pressed ? 6 : hovered ? 5 : 4,
                  },
                ];
              }}
              testID="member-sign-up"
            >
              {({ pressed }) => (
                <>
                  <LinearGradient
                    colors={
                      pressed
                        ? [
                            'rgba(151, 42, 113, 0.48)',
                            'rgba(239, 117, 181, 0.52)',
                            'rgba(255, 190, 226, 0.56)',
                            'rgba(239, 117, 181, 0.52)',
                            'rgba(151, 42, 113, 0.48)',
                          ]
                        : signUpHovered
                          ? [
                              'rgba(128, 74, 164, 0.3)',
                              'rgba(208, 132, 198, 0.3)',
                              'rgba(255, 225, 246, 0.3)',
                              'rgba(208, 132, 198, 0.3)',
                              'rgba(128, 74, 164, 0.3)',
                            ]
                          : [
                              'rgba(82, 57, 111, 0.3)',
                              'rgba(127, 96, 157, 0.3)',
                              'rgba(185, 102, 172, 0.3)',
                              'rgba(198, 181, 214, 0.3)',
                              'rgba(91, 62, 122, 0.3)',
                            ]
                    }
                    end={{ x: 1, y: 0.5 }}
                    start={{ x: 0, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text
                    style={[
                      styles.authButtonText,
                      {
                        color: colors.primaryForeground,
                        textShadowColor: 'rgba(255, 255, 255, 0.9)',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 4,
                        textShadow: '0 0 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.65)',
                      } as any,
                    ]}
                  >
                    Sign Up
                  </Text>
                </>
              )}
            </Pressable>
            <Pressable
              onHoverIn={() => setLoginHovered(true)}
              onHoverOut={() => setLoginHovered(false)}
              onPressIn={() => setLoginPressed(true)}
              onPressOut={() => setLoginPressed(false)}
              onPress={login}
              style={({ pressed }) => [
                styles.authButton,
                styles.authButtonOutline,
                {
                  backgroundColor: 'transparent',
                  borderColor: colors.primaryForeground,
                  borderRadius: colors.radius,
                  boxShadow: pressed
                    ? `0 0 0 1px rgba(246, 234, 212, 0.92), 0 0 8px rgba(255, 255, 255, 0.72), 0 0 12px ${colors.orangeLight}`
                    : loginHovered
                      ? `0 0 0 1px rgba(184, 211, 174, 0.78), 0 0 8px rgba(137, 174, 132, 0.6), 0 0 12px rgba(219, 234, 207, 0.42)`
                      : `0 0 0 1px rgba(246, 234, 212, 0.42), 0 0 5px rgba(255, 255, 255, 0.22)`,
                  overflow: 'hidden',
                  shadowColor: pressed
                    ? colors.orangeLight
                    : loginHovered
                      ? 'rgba(137, 174, 132, 0.72)'
                      : colors.primaryForeground,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: pressed ? 0.7 : loginHovered ? 0.5 : 0.24,
                  shadowRadius: pressed ? 8 : loginHovered ? 7 : 4,
                },
              ]}
              testID="member-login"
            >
              {({ pressed }) => {
                return (
                  <>
                    <LinearGradient
                      colors={
                        loginHovered
                          ? [
                              'rgba(79, 116, 88, 0.3)',
                              'rgba(177, 204, 157, 0.3)',
                              'rgba(102, 145, 105, 0.3)',
                            ]
                          : pressed
                            ? [
                                'rgba(222, 126, 68, 0.3)',
                                'rgba(245, 185, 112, 0.3)',
                                'rgba(255, 234, 183, 0.3)',
                              ]
                            : ['rgba(246, 234, 212, 0.3)', 'rgba(239, 180, 123, 0.3)']
                      }
                      end={{ x: 1, y: 0.5 }}
                      start={{ x: 0, y: 0.5 }}
                      style={StyleSheet.absoluteFill}
                    />
              <Text
                style={[
                  styles.authButtonText,
                  {
                    color: colors.background,
                    textShadowColor: loginHovered || loginPressed ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                    textShadow: loginHovered || loginPressed
                      ? '0 0 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.65)'
                      : 'none',
                  } as any,
                ]}
              >
                Log In
              </Text>
                  </>
                );
              }}
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.sectionTitle}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR SHOPPING CART ITEMS</Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            {itemCount ? `${itemCount} selected` : 'Nothing selected'}
          </Text>
        </View>
        <Feather color={colors.primary} name="shopping-bag" size={22} />
      </View>

      {items.length ? (
        <View style={[styles.cartList, { borderColor: colors.border }]}>
          {items.map((item, index) => (
            <View
              key={`${item.id}-${item.grams}`}
              style={[
                styles.cartItem,
                index > 0 && { borderTopColor: colors.border, borderTopWidth: 1 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.cartName, { color: colors.primary }]}>{item.name}</Text>
                <Text style={[styles.cartMeta, { color: colors.mutedForeground }]}>
                  {item.grams}g · ${item.price}
                </Text>
              </View>
              <View style={styles.quantity}>
                <Pressable
                  onPress={() => updateQuantity(item.id, item.grams, item.quantity - 1)}
                  style={({ pressed }) => [
                    styles.quantityButton,
                    {
                      backgroundColor: pressed ? colors.primary : colors.magenta,
                      borderColor: pressed ? colors.primary : colors.magenta,
                    },
                  ]}
                  testID={`decrease-${item.id}`}
                >
                  {({ pressed }) => (
                    <Feather color={pressed ? colors.primaryForeground : colors.background} name="minus" size={15} />
                  )}
                </Pressable>
                <Text style={[styles.quantityText, { color: colors.foreground }]}>{item.quantity}</Text>
                <Pressable
                  onPress={() => updateQuantity(item.id, item.grams, item.quantity + 1)}
                  style={({ pressed }) => [
                    styles.quantityButton,
                    {
                      backgroundColor: pressed ? colors.primary : colors.magenta,
                      borderColor: pressed ? colors.primary : colors.magenta,
                    },
                  ]}
                  testID={`increase-${item.id}`}
                >
                  {({ pressed }) => (
                    <Feather color={pressed ? colors.primaryForeground : colors.background} name="plus" size={15} />
                  )}
                </Pressable>
              </View>
            </View>
          ))}
          <View style={[styles.total, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
            <Text style={[styles.totalValue, { color: colors.foreground }]}>${subtotal.toFixed(2)}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/checkout')}
            style={({ pressed }) => [
              styles.checkout,
              {
                backgroundColor: pressed ? colors.accent : colors.primary,
                borderRadius: colors.radius,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
            testID={isAuthenticated ? 'member-checkout' : 'guest-checkout'}
          >
            <Text style={[styles.checkoutText, { color: colors.primaryForeground }]}>
              Review secure checkout
            </Text>
            <Feather color={colors.primaryForeground} name="arrow-up-right" size={18} />
          </Pressable>
          <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
            Checkout is completed only through a licensed, age-gated retailer.
          </Text>
        </View>
      ) : (
        <View style={[styles.empty, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          <Feather color={colors.primary} name="sun" size={24} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>The next jar is waiting.</Text>
          <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>
            Explore the active cure and build your cart when you are ready.
          </Text>
        </View>
      )}

      {isAuthenticated && (
        <View style={styles.ordersSection}>
          <View style={styles.sectionTitle}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>MEMBER HISTORY</Text>
              <Text style={[styles.heading, { color: colors.foreground }]}>Recent orders</Text>
            </View>
            <Feather color={colors.primary} name="clock" size={22} />
          </View>
          {ordersQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : ordersQuery.data?.length ? (
            <View style={[styles.orderList, { borderColor: colors.border }]}>
              {ordersQuery.data.map((order, index) => (
                <View
                  key={order.id}
                  style={[styles.orderItem, index > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cartName, { color: colors.primary }]}>
                      Order {order.id.replace('order_', '#')}
                    </Text>
                    <Text style={[styles.cartMeta, { color: colors.mutedForeground }]}>
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <Text style={[styles.totalValue, { color: colors.foreground }]}>
                    ${order.subtotal.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.empty, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              <Feather color={colors.primary} name="clock" size={24} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No member orders yet.</Text>
              <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>
                Your next signed-in checkout will appear here.
              </Text>
            </View>
          )}
        </View>
      )}

      {!isAuthenticated && (
        <View style={styles.accountFooter}>
          <Feather color={colors.accent} name="shopping-bag" size={18} />
          <Text style={[styles.accountFooterText, { color: colors.mutedForeground }]}>
            Guest checkout stays available without creating an account.
          </Text>
        </View>
      )}
      <BackToTopButton onPress={() => scrollRef.current?.scrollTo({ animated: true, y: 0 })} />
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageGradient: { flex: 1 },
  content: { flexGrow: 1, gap: 24, padding: 18, paddingBottom: 130, paddingTop: 20 },
  memberCard: { overflow: 'hidden', padding: 22 },
  memberHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  memberEyebrow: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  logoutText: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  memberTitle: { fontFamily: 'Georgia', fontSize: 28, lineHeight: 32, marginTop: 14 },
  authLoading: { alignItems: 'center', justifyContent: 'center', minHeight: 210 },
  authActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  authButton: { alignItems: 'center', flex: 1, padding: 13 },
  authButtonOutline: { backgroundColor: 'transparent', borderWidth: 1 },
  authButtonText: { fontFamily: 'Georgia', fontSize: 12, fontWeight: '800' },
  pointsRow: { alignItems: 'baseline', flexDirection: 'row', gap: 8, marginTop: 22 },
  points: { fontFamily: 'Georgia', fontSize: 38 },
  pointsLabel: { fontFamily: 'Georgia', fontSize: 12 },
  progressTrack: { height: 3, marginTop: 12, width: '100%' },
  progressFill: { height: '100%' },
  rewardCopy: { fontFamily: 'Georgia', fontSize: 12, lineHeight: 18, marginTop: 10 },
  sectionTitle: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  eyebrow: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  heading: { fontFamily: 'Georgia', fontSize: 25, marginTop: 5 },
  cartList: { borderWidth: 1 },
  cartItem: { alignItems: 'center', flexDirection: 'row', gap: 10, padding: 15 },
  cartName: { fontFamily: 'Georgia', fontSize: 15, fontWeight: '800', lineHeight: 19 },
  cartMeta: { fontFamily: 'Georgia', fontSize: 12, marginTop: 3 },
  quantity: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  quantityButton: { alignItems: 'center', borderRadius: 15, borderWidth: 1, height: 30, justifyContent: 'center', width: 30 },
  quantityText: { fontFamily: 'Georgia', fontSize: 13, fontWeight: '700', minWidth: 16, textAlign: 'center' },
  total: { borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  totalLabel: { fontFamily: 'Georgia', fontSize: 13 },
  totalValue: { fontFamily: 'Georgia', fontSize: 15, fontWeight: '800' },
  checkout: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15, padding: 16 },
  checkoutText: { fontFamily: 'Georgia', fontSize: 14, fontWeight: '800' },
  disclaimer: { fontFamily: 'Georgia', fontSize: 10, lineHeight: 15, padding: 15, textAlign: 'center' },
  empty: { alignItems: 'center', gap: 10, padding: 28 },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 24 },
  emptyCopy: { fontFamily: 'Georgia', fontSize: 13, lineHeight: 19, maxWidth: 260, textAlign: 'center' },
  ordersSection: { gap: 14 },
  orderList: { borderWidth: 1 },
  orderItem: { alignItems: 'center', flexDirection: 'row', gap: 12, padding: 15 },
  accountFooter: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, paddingBottom: 10 },
  accountFooterText: { flex: 1, fontFamily: 'Georgia', fontSize: 12, lineHeight: 18 },
});
