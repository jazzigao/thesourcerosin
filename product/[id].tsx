import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useListProducts } from '@workspace/api-client-react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useCart } from '@/contexts/CartContext';
import { getProductGallery, renderStrainText } from '@/components/ProductTile';
import { getExperienceNotes } from '@/lib/product-copy';
import { BulletList } from '@/components/BulletList';
import { BackToTopButton } from '@/components/BackToTopButton';

const FLOWER_TIERS = ['Premium Indoor Flower', 'Greenhouse Flower', 'Sungrown Flower'];

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const productsQuery = useListProducts();
  const { addItem } = useCart();
  const [addHovered, setAddHovered] = useState(false);
  const [buyHovered, setBuyHovered] = useState(false);
  const [addedToCartMessage, setAddedToCartMessage] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number | null>(null);
  const [hoveredSizeIndex, setHoveredSizeIndex] = useState<number | null>(null);
  useEffect(() => () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
  }, []);

  const product = productsQuery.data?.find((item) => item.id === id);
  const displaySizes = product?.type === 'flower' ? [] : product?.sizes;
  const defaultSizeIndex = displaySizes?.findIndex((option) => option.grams === 7) ?? -1;
  const activeSizeIndex = selectedSizeIndex ?? (defaultSizeIndex >= 0 ? defaultSizeIndex : 0);
  const size = displaySizes?.[activeSizeIndex] ?? displaySizes?.[0];
  const gallery = product ? getProductGallery(product) : [];
  const selectedImage = gallery[selectedImageIndex] ?? gallery[0];
  const [strainType, ...strainDetails] = (product?.strainType ?? '').split('·').map((part) => part.trim());
  const effectColors = [colors.descriptionPurple, colors.effectPurpleAlt, colors.effectPurpleDeep];
  const strainValue = strainType.toLowerCase();
  const strainGradient: [string, string] = strainValue.includes('hybrid')
    ? [colors.strainHybridStart, colors.strainHybridEnd]
    : strainValue.includes('sativa')
      ? [colors.strainSativaStart, colors.strainSativaEnd]
      : [colors.strainIndicaStart, colors.strainIndicaEnd];
  const titleGradient: [string, string, string, string] = [
    colors.titleOrange,
    colors.titleSage,
    colors.titleLavender,
    colors.titleCaramel,
  ];
  const classificationColor = strainValue.includes('hybrid')
    ? colors.classificationHybrid
    : strainValue.includes('sativa')
      ? colors.classificationSativa
      : colors.classificationIndica;

  if (productsQuery.isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.foreground }]}>This expression is not in the garden.</Text>
        <Pressable onPress={() => router.back()} style={[styles.addButton, { backgroundColor: colors.accent, borderColor: colors.magenta }]}>
          <Text style={[styles.buttonText, { color: colors.accentForeground }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const addToBag = () => {
    if (product.status !== 'available' || product.stock < 1 || !size) return;
    addItem({ id: product.id, name: product.name, grams: size.grams, price: size.price });
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setAddedToCartMessage(`Added to Cart! (${size.grams}g)`);
    feedbackTimeoutRef.current = setTimeout(() => setAddedToCartMessage(null), 2200);
  };

  const buyNow = () => {
    if (product.status !== 'available' || product.stock < 1 || !size) return;
    router.push({
      pathname: '/checkout',
      params: {
        productId: product.id,
        grams: String(size.grams),
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: product.name,
          headerBackTitle: 'Back',
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.productTitleText, fontFamily: 'Georgia' },
        }}
      />
      <LinearGradient colors={[colors.background, colors.pageGradientEnd]} end={{ x: 0, y: 1 }} start={{ x: 0, y: 0 }} style={styles.pageGradient}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 36 }]}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
      <Pressable accessibilityLabel="Go back to the garden" onPress={() => router.back()} style={styles.backLink}>
        <Feather color={colors.primary} name="arrow-left" size={15} />
        <Text style={[styles.backText, { color: colors.primary }]}>Back to the garden</Text>
      </Pressable>

      <View style={[styles.imageFrame, { borderColor: colors.orangeDark, backgroundColor: colors.card }]}>
        <Image
          accessibilityLabel={selectedImage?.label}
          cachePolicy="memory-disk"
          contentFit="cover"
          priority="normal"
          recyclingKey={`${product.id}-${selectedImageIndex}`}
          source={selectedImage?.source}
          style={styles.image}
          transition={180}
        />
        <View pointerEvents="none" style={[styles.imageInnerBorder, { borderColor: colors.innerGlow, shadowColor: colors.innerGlow }]} />
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, { backgroundColor: colors.infoBlue, color: colors.infoBlueText }]}>
            {product.type === 'flower' ? 'FLOWER' : 'COLD CURE'}
          </Text>
           <Text style={[styles.badge, { backgroundColor: colors.infoBlueAlt, color: colors.thcText }]}>
            {product.potency > 0 ? `${product.potency}% THC` : 'COMING SOON'}
          </Text>
        </View>
        <View style={[styles.galleryCount, { backgroundColor: colors.titleText }]}>
          <Text style={[styles.galleryCountText, { color: colors.orangeLight }]}>
            {selectedImageIndex + 1} / {gallery.length}
          </Text>
        </View>
      </View>
      <ScrollView
        accessibilityLabel={`${product.name} photo gallery`}
        contentContainerStyle={styles.thumbnailRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {gallery.map((image, index) => {
          const selected = index === selectedImageIndex;
          return (
            <Pressable
              accessibilityLabel={`Show image ${index + 1} of ${gallery.length}: ${image.label}`}
              accessibilityRole="button"
              key={image.label}
              onPress={() => setSelectedImageIndex(index)}
              style={[
                styles.thumbnailButton,
                {
                  borderColor: colors.orangeDark,
                  opacity: selected ? 1 : 0.66,
                  shadowColor: colors.orangeLight,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: selected ? 0.72 : 0.42,
                  shadowRadius: selected ? 7 : 5,
                  boxShadow: `0 0 0 1px ${colors.orangeDark}, 0 0 ${selected ? 10 : 7}px ${colors.orangeLight}`,
                },
              ]}
              testID={`gallery-image-${index + 1}`}
            >
              <>
                <Image
                  accessibilityLabel={image.label}
                  cachePolicy="memory-disk"
                  contentFit="cover"
                  priority="low"
                  recyclingKey={`${product.id}-${index}`}
                  source={image.source}
                  style={styles.thumbnailImage}
                  transition={150}
                />
                <View pointerEvents="none" style={[styles.thumbnailInnerBorder, { borderColor: colors.innerBorder, shadowColor: colors.innerGlow, boxShadow: `inset 0 0 3px ${colors.innerGlow}` } as any]} />
              </>
            </Pressable>
          );
        })}
      </ScrollView>

       <View style={[styles.card, { backgroundColor: colors.listingBackground, borderColor: colors.orangeDark, shadowColor: colors.textBoxDarkMagenta, shadowOpacity: 0.7, shadowRadius: 3, boxShadow: `0 0 0 1px ${colors.textBoxDarkMagenta}, 0 0 7px ${colors.orangeLight}, 0 0 15px ${colors.textBoxMagentaGlow}` }]}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>FULL EXPRESSION</Text>
        <LinearGradient colors={titleGradient} end={{ x: 0, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.titleBanner, { shadowColor: colors.titleMagentaGlow, boxShadow: `0 0 8px ${colors.titleMagentaGlow}` }]}>
           <Text style={[styles.title, product.type === 'flower' ? styles.flowerTitle : null, { color: colors.productTitleText, textShadowColor: colors.titleGlow, textShadow: `0 0 4px ${colors.titleGlow}, 0 0 7px ${colors.titleGlow}` } as any]}>{product.name}</Text>
        </LinearGradient>
        <LinearGradient colors={strainGradient} end={{ x: 1, y: 0 }} start={{ x: 0, y: 0 }} style={[styles.cultivar, { borderLeftColor: classificationColor, borderBottomColor: colors.innerBorder }]}>
          <Text style={[styles.cultivarType, { color: classificationColor }]}>{renderStrainText(strainType, colors)}</Text>
          {strainDetails.length ? <Text style={[styles.cultivarMix, { color: classificationColor }]}>{renderStrainText(strainDetails.join(' · '), colors)}</Text> : null}
        </LinearGradient>
        {product.referenceUrl && product.referenceLabel ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open ${product.referenceLabel}`}
            onPress={() => Linking.openURL(product.referenceUrl!)}
            style={[styles.referenceLink, { backgroundColor: colors.descriptionLavender, borderColor: colors.descriptionLavender }]}
          >
            <Text numberOfLines={2} style={[styles.referenceLinkText, { color: colors.descriptionPurple }]}>{product.referenceLabel}</Text>
            <Feather color={colors.descriptionPurple} name="external-link" size={12} />
          </Pressable>
        ) : null}
          <View style={styles.descriptionBoxFrame}>
             <LinearGradient
               colors={[colors.copyLavender, colors.copyOrange, colors.copySage]}
               end={{ x: 1, y: 1 }}
               start={{ x: 0, y: 0 }}
               style={[styles.descriptionBox, { backgroundColor: 'transparent', borderColor: colors.descriptionBorder, shadowColor: colors.textBoxDarkMagenta, shadowOpacity: 0.7, shadowRadius: 3, boxShadow: `0 0 0 1px ${colors.textBoxDarkMagenta}, 0 0 3px ${colors.orangeLight}, 0 0 10px ${colors.textBoxMagentaGlow}` } as any]}
             >
              <View style={styles.descriptionBoxContent}>
                <BulletList items={[
                    { label: 'Flavor Profile / Notes Of', labelColor: colors.descriptionPurple, text: product.flavorNotes.join(' · ') || 'Small-batch cultivar', bullet: false, color: colors.bulletOrange, fontFamily: 'Georgia', fontStyle: 'normal', fontWeight: '400', glowColor: colors.flavorGlow, glowRadius: 2 },
                   { label: 'Experience', labelColor: colors.descriptionPurple, text: getExperienceNotes(product), bullet: false, color: colors.bulletGreen, fontFamily: 'Georgia', fontSize: 12, lineHeight: 18, fontStyle: 'italic', fontWeight: '400', glowColor: colors.experienceGlow, glowRadius: 2 },
                ]} />
                <View style={[styles.longDescription, { borderTopColor: colors.descriptionBorder }]}>
                   <Text style={[styles.descriptionLabel, { color: colors.descriptionPurple }]}>STRAIN DESCRIPTION</Text>
                   <Text style={[styles.description, { color: colors.descriptionForest, textShadowColor: colors.experienceGlow, textShadow: `0 0 2px ${colors.experienceGlow}` } as any]}>{product.description}</Text>
                 </View>
                </View>
             </LinearGradient>
          </View>
         <View style={[styles.lineageBlock, { borderTopColor: colors.descriptionBorder }]}>
           <Text style={[styles.descriptionLabel, { color: colors.descriptionPurple }]}>LINEAGE</Text>
              <Text style={[styles.lineage, { color: colors.lineageForest, textShadowColor: colors.experienceGlow, textShadow: `0 0 2px ${colors.experienceGlow}` } as any]}>{product.lineage}</Text>
         </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.descriptionPurple }]}>Feeling</Text>
          <Text style={styles.sectionCopy}>
            {product.effects.map((effect, index) => (
              <Text key={effect} style={{ color: effectColors[index % effectColors.length] }}>
                {index > 0 ? ' · ' : ''}{effect}
              </Text>
            ))}
          </Text>
        </View>

         {product.type === 'flower' ? (
           <View style={styles.optionsBlock}>
             <Text style={[styles.optionsLabel, { color: colors.descriptionPurple }]}>ORGANIC FLOWER TIERS</Text>
             <View style={styles.optionsRow}>
               {FLOWER_TIERS.map((tier) => (
                 <View key={tier} style={[styles.optionChip, { backgroundColor: colors.titleLavender, borderColor: colors.innerGlow }]}>
                   <Text style={[styles.optionText, { color: colors.descriptionCaramel }]}>{tier}</Text>
                 </View>
               ))}
             </View>
           </View>
         ) : displaySizes?.length ? (
          <View style={styles.optionsBlock}>
            <Text style={[styles.optionsLabel, { color: colors.descriptionPurple }]}>SELECT SIZE</Text>
            <View style={styles.optionsRow}>
              {displaySizes.map((option, index) => (
                (() => {
                   const selected = index === activeSizeIndex;
                  const hovered = index === hoveredSizeIndex;
                  return (
                <Pressable
                  accessibilityLabel={`Select ${option.grams} grams for $${option.price}`}
                  key={`${option.grams}-${option.price}`}
                  onHoverIn={() => setHoveredSizeIndex(index)}
                  onHoverOut={() => setHoveredSizeIndex(null)}
                  onPress={() => setSelectedSizeIndex(index)}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: 'transparent',
                      borderColor: hovered
                        ? colors.sizeHoverPink
                        : colors.ctaMagenta,
                       borderWidth: selected ? 2 : 1,
                      elevation: selected ? 4 : hovered ? 3 : 2,
                      shadowColor: hovered
                        ? colors.sizeHoverBeige
                        : selected
                          ? colors.sizeButtonPinkGlow
                          : colors.sizeHoverOrange,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: hovered ? 0.9 : selected ? 1 : 0.88,
                      shadowRadius: hovered ? 7 : selected ? 15 : 9,
                      boxShadow: selected
                        ? `0 0 14px ${colors.sizeButtonPinkGlow}, 0 0 28px ${colors.sizeButtonPinkGlow}, 0 0 38px ${colors.sizeButtonPinkGlow}`
                        : undefined,
                    },
                  ]}
                  testID={`size-${option.grams}`}
                >
                  <LinearGradient
                    colors={hovered
                      ? [colors.sizeHoverOrange, colors.sizeHoverBeige, colors.sizeHoverOrange]
                      : selected
                        ? [colors.addButtonPineOrange, colors.sizeHoverOrange, colors.addButtonPineOrange, colors.addButtonPineOrangeDark]
                      : [colors.sizeButtonPeach, colors.sizeButtonLavenderMid, colors.sizeButtonLavender]}
                    end={{ x: 1, y: 0 }}
                    pointerEvents="none"
                    start={{ x: 0, y: 0 }}
                    style={[StyleSheet.absoluteFillObject, styles.optionChipGradient, { opacity: hovered ? 0.62 : 0.45 }]}
                  />
                  <Text style={[styles.optionText, { color: colors.foreground }]}>{option.grams}g - ${option.price}</Text>
                </Pressable>
                  );
                })()
              ))}
            </View>
          </View>
         ) : null}

        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.foreground }]}>
            {size ? `${size.grams}g · $${size.price}` : 'Details soon'}
          </Text>
          <View style={styles.actionRow}>
             <View style={styles.addAction}>
               {addedToCartMessage ? (
                 <Text
                   accessibilityLiveRegion="polite"
                   style={[styles.addFeedback, { color: colors.primary }]}
                 >
                   {addedToCartMessage}
                 </Text>
               ) : null}
               <Pressable
                 accessibilityLabel={`Add ${product.name} to bag`}
                 disabled={product.status !== 'available' || !size}
                 onHoverIn={() => setAddHovered(true)}
                 onHoverOut={() => setAddHovered(false)}
                 onPress={addToBag}
                 style={({ pressed }) => [
                   styles.addButton,
                   {
                      backgroundColor: product.status === 'available' ? 'transparent' : colors.muted,
                       backgroundImage: product.status === 'available'
                        ? pressed || addHovered
                            ? `linear-gradient(110deg, ${colors.addButtonMagentaPurple}, ${colors.addButtonMagentaPurple})`
                            : `linear-gradient(110deg, ${colors.addButtonPineOrange}, ${colors.addButtonPineOrange})`
                        : undefined,
                        borderColor: colors.addButtonPineOrangeDark,
                        shadowColor: pressed || addHovered ? colors.addButtonOrangePinkGlow : colors.addButtonPineOrange,
                      boxShadow: product.status === 'available'
                        ? pressed || addHovered
                            ? `0 0 7px ${colors.addButtonOrangePinkGlow}, 0 0 12px ${colors.addButtonOrangePinkGlow}`
                            : `0 0 4px ${colors.addButtonPineOrange}`
                        : undefined,
                      shadowOpacity: product.status === 'available' ? 0.48 : 0.12,
                      shadowRadius: pressed || addHovered ? 6 : 3,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: pressed && product.status === 'available' ? 5 : 1,
                     borderWidth: 1,
                     transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
                testID="add-to-bag"
              >
                {({ pressed }) => {
                  const buttonHovered = pressed || addHovered;
                  const buttonColor = product.status === 'available' ? colors.addButtonText : colors.mutedForeground;

                  return (
                    <>
                      {product.status === 'available' ? (
                        <LinearGradient
                          colors={buttonHovered ? [colors.addButtonMagentaPurple, colors.addButtonMagentaPurple] : [colors.addButtonPineOrange, colors.addButtonPineOrange]}
                          end={{ x: 1, y: 1 }}
                          pointerEvents="none"
                          start={{ x: 0, y: 0 }}
                          style={StyleSheet.absoluteFillObject}
                        />
                      ) : null}
                      <Text style={[styles.buttonText, { color: buttonColor, textShadowColor: buttonHovered ? colors.addButtonOrangePinkGlow : undefined, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: buttonHovered ? 2 : 0, textShadow: buttonHovered ? `0 0 2px ${colors.addButtonOrangePinkGlow}` : undefined } as any]}>
                        {product.status === 'available' ? 'Add to Bag' : 'Coming Soon'}
                      </Text>
                      <Feather color={buttonHovered && product.status === 'available' ? colors.addButtonHoverSage : buttonColor} name="plus" size={14} />
                    </>
                  );
                }}
              </Pressable>
             </View>
            <Pressable
              accessibilityLabel={`Buy ${product.name} now`}
              disabled={product.status !== 'available' || !size}
              onHoverIn={() => setBuyHovered(true)}
              onHoverOut={() => setBuyHovered(false)}
              onPress={buyNow}
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: product.status === 'available' ? pressed || buyHovered ? colors.magenta : colors.primary : colors.muted,
                  borderColor: colors.titleTextGlow,
                  opacity: product.status === 'available' ? 1 : 0.55,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              testID="buy-now"
            >
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Buy now</Text>
              <Feather color={colors.primaryForeground} name="arrow-right" size={14} />
            </Pressable>
          </View>
        </View>
       </View>
       <BackToTopButton onPress={() => scrollRef.current?.scrollTo({ animated: true, y: 0 })} />
      </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  pageGradient: { flex: 1 },
  centered: { alignItems: 'center', flex: 1, gap: 18, justifyContent: 'center', padding: 28 },
  notFound: { fontFamily: 'Georgia', fontSize: 22, textAlign: 'center' },
  content: { gap: 16, padding: 18, paddingTop: 22 },
  backLink: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingVertical: 3 },
  backText: { fontFamily: 'Georgia', fontSize: 12, fontWeight: '700' },
  imageFrame: { borderRadius: 12, borderWidth: 2, height: 310, overflow: 'hidden', position: 'relative', width: '100%' },
  image: { height: '100%', width: '100%' },
  imageInnerBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 10, borderWidth: 2, elevation: 2, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.46, shadowRadius: 4 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', left: 12, position: 'absolute', right: 12, top: 12 },
  badge: { fontFamily: 'Georgia', fontSize: 9, fontWeight: '800', letterSpacing: 0.8, paddingHorizontal: 7, paddingVertical: 5 },
  galleryCount: { bottom: 12, paddingHorizontal: 9, paddingVertical: 6, position: 'absolute', right: 12 },
  galleryCountText: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  thumbnailRow: { gap: 9, paddingVertical: 2 },
  thumbnailButton: { borderRadius: 8, borderWidth: 2, height: 72, overflow: 'hidden', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.38, shadowRadius: 4, width: 72 },
  thumbnailImage: { height: '100%', width: '100%' },
  thumbnailInnerBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 6, borderWidth: 1, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.46, shadowRadius: 3 },
  card: { borderRadius: 12, borderWidth: 2, elevation: 2, overflow: 'hidden', padding: 18, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.48, shadowRadius: 0 },
  eyebrow: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  titleBanner: { borderRadius: 12, borderWidth: 0, elevation: 2, marginTop: 10, overflow: 'hidden', paddingHorizontal: 11, paddingVertical: 10, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 5 },
  title: { fontFamily: 'Georgia', fontSize: 40, fontWeight: '900', lineHeight: 44 },
  flowerTitle: { fontSize: 34, letterSpacing: -0.5, lineHeight: 38 },
  cultivar: { borderBottomWidth: 1, borderLeftWidth: 2, marginTop: 15, paddingHorizontal: 10, paddingVertical: 8 },
  cultivarType: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  cultivarMix: { fontFamily: 'Georgia', fontSize: 10, lineHeight: 15, marginTop: 3 },
   referenceLink: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 7, borderWidth: 1, flexDirection: 'row', gap: 4, marginTop: 5, maxWidth: '100%', minWidth: 0, paddingHorizontal: 7, paddingVertical: 4 },
   referenceLinkText: { flexShrink: 1, fontFamily: 'Georgia', fontSize: 9, fontWeight: '700', letterSpacing: 0.2 },
  lineage: { fontFamily: 'Georgia', fontSize: 12, fontWeight: '400', lineHeight: 17 },
  descriptionBoxFrame: { alignSelf: 'stretch', marginTop: 18, position: 'relative' },
  descriptionBox: { borderRadius: 12, borderWidth: 1, elevation: 2, gap: 12, maxWidth: '100%', overflow: 'hidden', padding: 12, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 6 },
  descriptionBoxContent: { position: 'relative', zIndex: 1 },
  experience: { fontFamily: 'Georgia', fontSize: 15, lineHeight: 23 },
  longDescription: { borderTopWidth: 1, gap: 6, maxWidth: '100%', minWidth: 0, paddingTop: 12 },
  descriptionLabel: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
   description: { flexShrink: 1, fontFamily: 'Georgia', fontSize: 12, fontStyle: 'normal', fontWeight: '400', lineHeight: 18, maxWidth: '100%' },
  section: { borderTopColor: 'rgba(107, 62, 37, 0.28)', borderTopWidth: 1, marginTop: 15, paddingTop: 13 },
  sectionLabel: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  sectionCopy: { fontFamily: 'Georgia', fontSize: 14, lineHeight: 21, marginTop: 5 },
   flavorNotes: { fontFamily: 'Georgia', fontWeight: '400' },
  lineageBlock: { borderTopWidth: 1, gap: 4, marginTop: 10, paddingTop: 9 },
  optionsBlock: { gap: 8, marginTop: 16 },
  optionsLabel: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  optionChip: { borderBottomLeftRadius: 4, borderBottomRightRadius: 9, borderTopLeftRadius: 9, borderTopRightRadius: 4, borderWidth: 1, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5 },
  optionChipGradient: { opacity: 0.3 },
  optionText: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800' },
  footer: { borderTopColor: 'rgba(107, 62, 37, 0.28)', borderTopWidth: 1, gap: 12, marginTop: 20, paddingTop: 16 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  addAction: { alignItems: 'flex-start', gap: 4 },
  addFeedback: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '700', lineHeight: 13 },
  price: { fontFamily: 'Georgia', fontSize: 15, fontWeight: '800' },
  addButton: { alignItems: 'center', borderRadius: 999, borderWidth: 2, flexDirection: 'row', gap: 6, justifyContent: 'center', overflow: 'hidden', paddingHorizontal: 16, paddingVertical: 10 },
  buttonText: { fontFamily: 'Georgia', fontSize: 12, fontWeight: '800' },
});