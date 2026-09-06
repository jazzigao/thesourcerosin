import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useListProducts } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getImageSource, ProductTile } from '@/components/ProductTile';
import { useColors } from '@/hooks/useColors';
import { BackToTopButton } from '@/components/BackToTopButton';
import { ReviewSection } from '@/components/ReviewSection';

const STRAIN_CHOICES = ['Indica', 'Hybrid', 'Sativa'] as const;
const EFFECT_CHOICES = [
  'Euphoric',
  'Happy',
  'Creative',
  'Relaxing',
  'Sleepy',
  'Cerebral',
  'Uplifting',
  'Energizing',
  'Calming',
] as const;

type SortOption = 'default' | 'low' | 'high';

const getStrainCategory = (strainType: string) => {
  const value = strainType.toLowerCase();
  if (value.includes('hybrid')) return 'Hybrid';
  if (value.includes('sativa')) return 'Sativa';
  if (value.includes('indica')) return 'Indica';
  return null;
};

const getStartingPrice = (product: { sizes?: Array<{ price: number }> }) => {
  const prices = product.sizes?.map((size) => size.price) ?? [];
  return prices.length > 0 ? Math.min(...prices) : Number.POSITIVE_INFINITY;
};

export default function DropsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const listRef = useRef<FlatList<any>>(null);
  const [filter, setFilter] = useState<'all' | 'rosin' | 'flower'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hoveredStrainId, setHoveredStrainId] = useState<string | null>(null);
  const productsQuery = useListProducts();
  const getStrainThumbGradient = (
    strainType: string,
    active = false,
  ): [string, string, string, string] => {
    const strain = getStrainCategory(strainType);

    if (active) {
      if (strain === 'Indica') {
        return [colors.thumbnailSage, colors.thumbnailOrange, colors.thumbnailLavender, colors.thumbnailMagenta];
      }
      if (strain === 'Sativa') {
        return [colors.thumbnailMagenta, colors.thumbnailOrange, colors.thumbnailLavender, colors.thumbnailSage];
      }
      return [colors.thumbnailLavender, colors.thumbnailOrange, colors.thumbnailSage, colors.thumbnailMagenta];
    }

    if (strain === 'Indica') {
      return [colors.thumbnailLavender, colors.thumbnailMagenta, colors.thumbnailOrange, colors.thumbnailSage];
    }
    if (strain === 'Sativa') {
      return [colors.thumbnailSage, colors.thumbnailLavender, colors.thumbnailOrange, colors.thumbnailMagenta];
    }
    return [colors.thumbnailMagenta, colors.thumbnailOrange, colors.thumbnailLavender, colors.thumbnailSage];
  };
  const products = useMemo(
    () => {
      const filtered = (productsQuery.data ?? []).filter((product) => {
        if (filter !== 'all' && product.type !== filter) return false;
        if (selectedStrains.length > 0 && !selectedStrains.includes(getStrainCategory(product.strainType) ?? '')) {
          return false;
        }
        if (
          selectedEffects.length > 0 &&
          !selectedEffects.some((effect) =>
            product.effects.some((productEffect) => productEffect.toLowerCase() === effect.toLowerCase()),
          )
        ) {
          return false;
        }
        return true;
      });

      if (sortOption === 'default') return filtered;
      return [...filtered].sort((a, b) => {
        const difference = getStartingPrice(a) - getStartingPrice(b);
        return sortOption === 'low' ? difference : -difference;
      });
    },
    [filter, productsQuery.data, selectedEffects, selectedStrains, sortOption],
  );

  const toggleChoice = (
    choice: string,
    selected: string[],
    setSelected: (next: string[]) => void,
  ) => {
    setSelected(selected.includes(choice) ? selected.filter((item) => item !== choice) : [...selected, choice]);
  };

  const clearFilters = () => {
    setSortOption('default');
    setSelectedStrains([]);
    setSelectedEffects([]);
  };

  const activeFilterCount = selectedStrains.length + selectedEffects.length + (sortOption === 'default' ? 0 : 1);

  if (productsQuery.isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (productsQuery.isError) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Feather color={colors.secondary} name="wifi-off" size={27} />
        <Text style={[styles.errorText, { color: colors.foreground }]}>
          We couldn’t load the garden right now.
        </Text>
        <Pressable 
          onPress={() => productsQuery.refetch()}
          style={({ pressed }) => [
            styles.retryButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.secondary,
              borderBottomWidth: pressed ? 1 : 3,
              borderRightWidth: pressed ? 1 : 3,
              transform: [{ translateY: pressed ? 2 : 0 }, { translateX: pressed ? 2 : 0 }],
            }
          ]}
        >
          {({ pressed }) => (
            <Text style={[styles.retry, { color: pressed ? colors.accentForeground : colors.foreground }]}>
              Try again
            </Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.pageGradientEnd]}
      end={{ x: 0, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.screen}
    >
    <FlatList
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: 16,
          paddingBottom: Platform.OS === 'web' ? 120 : insets.bottom + 96,
        },
      ]}
      data={products}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
           <Text style={[styles.eyebrow, { color: colors.rustBright, textShadowColor: colors.photoHoverOrangeGlow, textShadow: `0 0 7px ${colors.photoHoverOrangeGlow}` } as any]}>THE GARDEN COLLECTION IS LIVE NOW</Text>
           <Text style={[styles.title, { color: colors.foreground, textShadowColor: colors.addButtonOrangePinkGlow, textShadow: `0 0 8px ${colors.addButtonOrangePinkGlow}` } as any]}>Browse All Products</Text>
            <Text style={[styles.sourceStory, { color: colors.descriptionForest }]}>
              {'Small-batch, cold-cure live hash rosin. Cultivated with intention, washed with care by hand, and sold directly by the farmers that grew it from seed. Everything is artisan designed and made with love and care, and we hope you can see and feel the difference.'}
            </Text>
           <LinearGradient colors={[colors.infoBlueAlt, colors.dealFadeBottom]} end={{ x: 0, y: 1 }} start={{ x: 0, y: 0 }} style={styles.dealBar}>
            <Feather color={colors.infoBlueText} name="star" size={14} />
            <Text style={[styles.dealText, { color: colors.infoBlueText }]}>
               {'Cold Cured Live Rosin. 100% Solventless.\nLimited Batch Drops. Delivered directly to your Door.'}
             </Text>
           </LinearGradient>
           <View style={styles.strainRailSection}>
             <View style={styles.strainRailHeader}>
               <Text style={[styles.strainRailTitle, { color: colors.primary }]}>ALL STRAINS</Text>
               <Text style={[styles.strainRailHint, { color: colors.mutedForeground }]}>Tap for details</Text>
             </View>
             <ScrollView
               contentContainerStyle={styles.strainRail}
               horizontal
               nestedScrollEnabled
               showsHorizontalScrollIndicator={false}
             >
                {(productsQuery.data ?? []).map((product) => {
                  const hovered = hoveredStrainId === product.id;
                  return (
                 <Pressable
                   accessibilityLabel={`View ${product.name} details`}
                   accessibilityRole="link"
                   key={product.id}
                    onHoverIn={() => setHoveredStrainId(product.id)}
                    onHoverOut={() => setHoveredStrainId(null)}
                   onPress={() => router.push(`/product/${product.id}`)}
                   style={({ pressed }) => [
                     styles.strainThumb,
                     {
                        backgroundColor: pressed || hovered ? colors.thumbnailLavender : colors.titleSurface,
                        borderColor: colors.orangeDark,
                       opacity: pressed ? 0.82 : 1,
                        shadowColor: colors.orangeLight,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: pressed || hovered ? 0.72 : 0.44,
                        shadowRadius: pressed || hovered ? 7 : 5,
                        boxShadow: `0 0 0 1px ${colors.orangeDark}, 0 0 ${pressed || hovered ? 10 : 7}px ${colors.orangeLight}`,
                     },
                   ]}
                 >
                    <Image
                      accessibilityLabel={`${product.name} product photo`}
                      cachePolicy="memory-disk"
                      contentFit="cover"
                      priority="low"
                      recyclingKey={product.id}
                      source={getImageSource(product)}
                      style={styles.strainThumbImage}
                      transition={150}
                    />
                   <LinearGradient
                       colors={getStrainThumbGradient(product.strainType, hovered)}
                       locations={[0, 0.32, 0.58, 1]}
                     end={{ x: 1, y: 0 }}
                     start={{ x: 0, y: 0 }}
                      style={[styles.strainThumbLabel, { backgroundColor: colors.titleSurface }]}
                   >
                      <View
                        pointerEvents="none"
                        style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.titleSurface, opacity: 0.42 }]}
                      />
                     <Text
                       numberOfLines={2}
                       style={[styles.strainThumbName, { color: colors.descriptionForest, textShadowColor: colors.photoHoverBeige, textShadow: `0 0 4px ${colors.photoHoverBeige}` } as any]}
                     >
                       {product.name}
                     </Text>
                     <Text
                       numberOfLines={1}
                       style={[styles.strainThumbType, { color: colors.descriptionPurple, textShadowColor: colors.photoHoverBeige, textShadow: `0 0 3px ${colors.photoHoverBeige}` } as any]}
                     >
                       {product.strainType}
                     </Text>
                   </LinearGradient>
                 </Pressable>
                  );
                })}
             </ScrollView>
           </View>
          <View style={styles.filters}>
            {(['all', 'rosin', 'flower'] as const).map((item) => {
              const selected = item === filter;
              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={({ pressed }) => [
                    styles.filter,
                    {
                       backgroundColor: selected ? colors.primary : pressed ? colors.accent : 'transparent',
                      borderColor: colors.secondary,
                      borderRadius: 999,
                      borderBottomWidth: pressed ? 1 : 3,
                      borderRightWidth: pressed ? 1 : 3,
                      transform: [{ translateY: pressed ? 2 : 0 }, { translateX: pressed ? 2 : 0 }],
                    },
                  ]}
                  testID={`filter-${item}`}
                >
                  {({ pressed }) => (
                    <Text
                      style={{
                        fontFamily: 'Georgia',
                        color: selected ? colors.primaryForeground : pressed ? colors.accentForeground : colors.foreground,
                        fontSize: 12,
                        fontWeight: '700',
                        textTransform: 'capitalize',
                      }}
                    >
                      {item}
                    </Text>
                  )}
                </Pressable>
              );
             })}
           </View>
           <Pressable
             accessibilityRole="button"
             accessibilityState={{ expanded: isFilterOpen }}
             onPress={() => setIsFilterOpen((open) => !open)}
             style={({ pressed }) => [
               styles.filterToggle,
               {
                  backgroundColor: isFilterOpen ? colors.primary : pressed ? colors.accent : 'transparent',
                 borderColor: isFilterOpen ? colors.primary : colors.secondary,
               },
             ]}
           >
             <Feather color={isFilterOpen ? colors.primaryForeground : colors.foreground} name="sliders" size={16} />
             <Text style={[styles.filterToggleText, { color: isFilterOpen ? colors.primaryForeground : colors.foreground }]}>
               Filter{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
             </Text>
             <Feather color={isFilterOpen ? colors.primaryForeground : colors.foreground} name={isFilterOpen ? 'chevron-up' : 'chevron-down'} size={16} />
           </Pressable>
           {isFilterOpen ? (
              <LinearGradient
                colors={[colors.cultivarBackground, colors.listingBackground, colors.orangeLight]}
                end={{ x: 0, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={[styles.filterPanel, { borderColor: colors.orangeDark, shadowColor: colors.lavenderDeep }]}
              >
               <View style={styles.filterPanelHeader}>
                 <Text style={[styles.filterPanelTitle, { color: colors.primary }]}>Product Browsing</Text>
                 {activeFilterCount > 0 ? (
                   <Pressable accessibilityRole="button" onPress={clearFilters}>
                     <Text style={[styles.clearText, { color: colors.descriptionPurple }]}>Clear all</Text>
                   </Pressable>
                  ) : null}
                </View>
               <Text style={[styles.filterLabel, { color: colors.descriptionCaramel }]}>Sort by price</Text>
               <View style={styles.sortChoices}>
                 {([
                   ['low', 'Price: Low to High'],
                   ['high', 'Price: High to Low'],
                 ] as const).map(([value, label]) => {
                   const selected = sortOption === value;
                   return (
                     <Pressable
                       key={value}
                       accessibilityRole="radio"
                       accessibilityState={{ selected }}
                       onPress={() => setSortOption(selected ? 'default' : value)}
                        style={[styles.sortChoice, { backgroundColor: selected ? colors.primary : 'transparent', borderColor: selected ? colors.primary : colors.orangeLight }]}
                     >
                       <Feather color={selected ? colors.primaryForeground : colors.descriptionPurple} name={selected ? 'check-circle' : 'circle'} size={16} />
                       <Text style={[styles.choiceText, { color: selected ? colors.primaryForeground : colors.foreground }]}>{label}</Text>
                     </Pressable>
                   );
                 })}
               </View>
               <Text style={[styles.filterLabel, { color: colors.descriptionCaramel }]}>Strain</Text>
               <View style={styles.choiceGrid}>
                 {STRAIN_CHOICES.map((choice) => {
                   const selected = selectedStrains.includes(choice);
                   return (
                     <Pressable
                       key={choice}
                       accessibilityRole="checkbox"
                       accessibilityState={{ checked: selected }}
                       onPress={() => toggleChoice(choice, selectedStrains, setSelectedStrains)}
                        style={[styles.checkboxChoice, { backgroundColor: selected ? colors.titleLavender : 'transparent', borderColor: selected ? colors.lavenderDeep : colors.orangeLight }]}
                     >
                       <Feather color={selected ? colors.descriptionPurple : colors.mutedForeground} name={selected ? 'check-square' : 'square'} size={16} />
                       <Text style={[styles.choiceText, { color: colors.foreground }]}>{choice}</Text>
                     </Pressable>
                   );
                 })}
               </View>
               <Text style={[styles.filterLabel, { color: colors.descriptionCaramel }]}>Effects</Text>
               <View style={styles.choiceGrid}>
                 {EFFECT_CHOICES.map((choice) => {
                   const selected = selectedEffects.includes(choice);
                   return (
                     <Pressable
                       key={choice}
                       accessibilityRole="checkbox"
                       accessibilityState={{ checked: selected }}
                       onPress={() => toggleChoice(choice, selectedEffects, setSelectedEffects)}
                        style={[styles.checkboxChoice, { backgroundColor: selected ? colors.titleLavender : 'transparent', borderColor: selected ? colors.lavenderDeep : colors.orangeLight }]}
                     >
                       <Feather color={selected ? colors.descriptionPurple : colors.mutedForeground} name={selected ? 'check-square' : 'square'} size={16} />
                       <Text style={[styles.choiceText, { color: colors.foreground }]}>{choice}</Text>
                     </Pressable>
                   );
                 })}
                </View>
              </LinearGradient>
           ) : null}
           <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
             Showing {products.length} {products.length === 1 ? 'product' : 'products'}
           </Text>
        </View>
      }
      numColumns={1}
      refreshControl={
        <RefreshControl
          colors={[colors.primary]}
          onRefresh={() => productsQuery.refetch()}
          refreshing={productsQuery.isFetching}
          tintColor={colors.primary}
        />
      }
      renderItem={({ item, index }) => (
        <View style={styles.tileWrap}>
          <ProductTile product={item} tone={index % 2 === 0 ? 'green' : 'purple'} />
        </View>
      )}
      ListFooterComponent={
        <View>
          <ReviewSection />
          <BackToTopButton onPress={() => listRef.current?.scrollToOffset({ animated: true, offset: 0 })} />
        </View>
      }
      ref={listRef}
      style={styles.list}
    />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { backgroundColor: 'transparent', flex: 1 },
  centered: { alignItems: 'center', flex: 1, gap: 14, justifyContent: 'center', padding: 28 },
  errorText: { fontFamily: 'Georgia', fontSize: 22, textAlign: 'center' },
  retryButton: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginTop: 12 },
  retry: { fontFamily: 'Georgia', fontSize: 14, fontWeight: '700' },
  content: { padding: 14, paddingBottom: 110 },
  header: { gap: 8, marginBottom: 14, paddingTop: 8 },
  eyebrow: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  title: { fontFamily: 'Georgia', fontSize: 28, lineHeight: 32 },
  sourceStory: { fontFamily: 'Georgia', fontSize: 13, lineHeight: 20 },
  dealBar: { alignItems: 'center', flexDirection: 'row', gap: 7, paddingHorizontal: 9, paddingVertical: 7 },
  dealText: { flex: 1, fontFamily: 'Georgia', fontSize: 11, lineHeight: 16 },
  strainRailSection: { gap: 6, marginTop: 2 },
  strainRailHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  strainRailTitle: { fontFamily: 'Georgia', fontSize: 11, fontWeight: '900', letterSpacing: 1.3 },
  strainRailHint: { fontFamily: 'Georgia', fontSize: 10, fontStyle: 'italic' },
  strainRail: { gap: 8, paddingBottom: 2, paddingRight: 4 },
  strainThumb: { borderRadius: 8, borderWidth: 1, height: 114, overflow: 'hidden', width: 104 },
  strainThumbImage: { height: '100%', width: '100%' },
  strainThumbLabel: { bottom: 0, gap: 1, left: 0, minHeight: 47, paddingHorizontal: 6, paddingVertical: 5, position: 'absolute', right: 0 },
  strainThumbName: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '900', lineHeight: 11 },
  strainThumbType: { fontFamily: 'Georgia', fontSize: 8, fontWeight: '700', lineHeight: 10 },
  filters: { flexDirection: 'row', gap: 6, marginTop: 3 },
  filter: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  filterToggle: { alignItems: 'center', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 2, paddingHorizontal: 12, paddingVertical: 9 },
  filterToggleText: { fontFamily: 'Georgia', fontSize: 13, fontWeight: '800' },
  filterPanel: { borderRadius: 12, borderWidth: 1, gap: 8, marginTop: 1, padding: 11, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 2 },
  filterPanelHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  filterPanelTitle: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '800' },
  clearText: { fontFamily: 'Georgia', fontSize: 12, fontWeight: '800' },
  filterLabel: { fontFamily: 'Georgia', fontSize: 12, fontWeight: '800', letterSpacing: 0.7, marginTop: 4, textTransform: 'uppercase' },
  sortChoices: { gap: 6 },
  sortChoice: { alignItems: 'center', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 7, paddingHorizontal: 9, paddingVertical: 7 },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  checkboxChoice: { alignItems: 'center', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  choiceText: { fontFamily: 'Georgia', fontSize: 12, fontWeight: '700' },
  resultCount: { fontFamily: 'Georgia', fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  tileWrap: { marginBottom: 10 },
});