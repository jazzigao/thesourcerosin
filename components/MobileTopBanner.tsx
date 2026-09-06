import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '@/components/BrandMark';
import { requestMobileAgeGateReset } from '@/components/MobileAgeGate';
import { useColors } from '@/hooks/useColors';

const NAV_ITEMS = [
  { icon: 'home', label: 'Home', route: '/' },
  { icon: 'sun', label: 'Drops', route: '/drops' },
  { icon: 'shopping-bag', label: 'Cart', route: '/account' },
  { icon: 'briefcase', label: 'Wholesale', route: '/wholesale' },
] as const;

export function MobileTopBanner() {
  const colors = useColors();
  const pathname = usePathname();
  const router = useRouter();
  const announcementOffset = useRef(new Animated.Value(0)).current;
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(announcementOffset, {
        duration: 8500,
        easing: Easing.linear,
        toValue: -220,
        useNativeDriver: false,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [announcementOffset]);

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.banner,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.orangeDark,
          boxShadow: 'none',
          shadowColor: 'transparent',
        },
      ]}
    >
      <View
        accessibilityLabel="New member offer and free shipping announcement"
        accessible
        style={[styles.announcementBanner, { backgroundColor: colors.primary }]}
      >
        <Animated.View style={[styles.announcementTrack, { transform: [{ translateX: announcementOffset }] }]}>
          <Text numberOfLines={1} style={[styles.announcementText, { color: colors.primaryForeground }]}>
            FREE SHIPPING ON ALL ORDERS OVER $100 !    NEW MEMBERS: 10% OFF FIRST PURCHASE ON SIGN UP
          </Text>
        </Animated.View>
      </View>
      <View style={styles.brandRow}>
        <Pressable
          accessibilityLabel="Return to The Source entry page"
          onPress={() => {
            requestMobileAgeGateReset();
            router.push('/');
          }}
          style={({ pressed }) => [styles.brandLink, { opacity: pressed ? 0.72 : 1 }]}
        >
          <BrandMark variant="compact" />
          <View style={styles.brandCopy}>
            <Text style={[styles.brandName, { color: colors.foreground }]}>
              THE SOURCE
            </Text>
            <Text style={[styles.tagline, { color: colors.primary }]}>
              Seed Grown: Farm to Table.
            </Text>
            <Text style={[styles.tagline, { color: colors.primary }]}>
              Pure Solventless Hash Rosin.
            </Text>
            <Text style={[styles.tagline, styles.complianceTagline, { color: colors.primary }]}>
              Farm Bill Compliant THCA Rosin &amp; Flower.
            </Text>
          </View>
        </Pressable>
      </View>

      <View
        accessibilityLabel="Primary navigation"
        accessibilityRole="tablist"
        style={[
          styles.navRow,
          { borderTopColor: colors.border, borderBottomColor: colors.orangeDark },
        ]}
      >
        {NAV_ITEMS.map((item) => {
          const active = item.route === '/' ? pathname === '/' : pathname.startsWith(item.route);
          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={item.route}
              onPress={() => router.push(item.route)}
              onHoverIn={() => setHoveredRoute(item.route)}
              onHoverOut={() => setHoveredRoute(null)}
              style={styles.navItemPressable}
            >
              {({ pressed }) => {
                const highlighted = active || pressed || hoveredRoute === item.route;
                const foregroundColor = pressed
                  ? colors.navClickGlow
                  : highlighted
                    ? colors.primary
                    : colors.foreground;

                  return (
                  <View
                    style={[
                      styles.navItemShell,
                      {
                        boxShadow: 'none',
                      } as any,
                    ]}
                  >
                    <View
                      style={[
                        styles.navItem,
                        {
                          backgroundColor: pressed
                            ? colors.orangeLight
                            : active
                              ? colors.pageGradientEnd
                              : colors.background,
                          borderColor: pressed
                            ? colors.orangeDark
                            : highlighted
                              ? colors.borderHighlight
                              : colors.navBorder,
                          boxShadow: 'none',
                          filter: 'none',
                        } as any,
                      ]}
                    >
                      <Feather color={foregroundColor} name={item.icon} size={16} />
                      <Text style={[styles.navLabel, { color: foregroundColor }]}>
                        {item.label}
                      </Text>
                    </View>
                  </View>
                );
              }}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  announcementBanner: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 0,
    borderWidth: 0,
    height: 36,
    justifyContent: 'center',
    marginBottom: 0,
    marginTop: 0,
    overflow: 'hidden',
    width: '100%',
  },
  announcementTrack: {
    minWidth: 800,
  },
  announcementText: {
    fontFamily: 'Georgia',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.65,
    paddingHorizontal: 18,
    textTransform: 'uppercase',
    width: 800,
  },
  banner: {
    borderBottomWidth: 0,
    elevation: 0,
    flexShrink: 0,
    marginTop: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    width: '100%',
    zIndex: 100,
  },
  brandRow: {
    alignItems: 'center',
    minHeight: 74,
    paddingHorizontal: 16,
    paddingBottom: 6,
    paddingTop: 10,
  },
  brandLink: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
    minWidth: 0,
    paddingVertical: 3,
  },
  brandCopy: {
    flexShrink: 1,
    minWidth: 0,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  brandName: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    lineHeight: 16,
  },
  tagline: {
    fontFamily: 'Georgia',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.45,
    lineHeight: 12,
    maxWidth: '100%',
  },
  complianceTagline: {
    fontSize: 7.5,
    letterSpacing: 0.2,
    lineHeight: 10,
    marginTop: 2,
  },
  navRow: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    columnGap: 6,
    flexDirection: 'row',
    minHeight: 50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: '100%',
  },
  navItemPressable: {
    flex: 1,
    minWidth: 0,
  },
  navItemShell: {
    borderRadius: 12,
    flex: 1,
    minWidth: 0,
  },
  navItem: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 0,
    overflow: 'hidden',
    paddingHorizontal: 4,
  },
  navLabel: {
    fontFamily: 'Georgia',
    fontSize: 8,
    fontWeight: '800',
    lineHeight: 10,
  },
});