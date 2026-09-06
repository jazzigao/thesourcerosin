import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Product } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useCart } from '@/contexts/CartContext';
import { getExperienceNotes } from '@/lib/product-copy';
import { BulletList } from '@/components/BulletList';

const LOCAL_IMAGES: Record<string, any> = {
  'fizz': require('@/assets/images/fizz-primary.jpg'),
  'gak-smoovie': require('@/assets/images/gak-smoovie-primary.jpg'),
  'gmo': require('@/assets/images/gmo-upload-primary.jpg'),
  'high-fructose-corn-syrup': require('@/assets/images/high-fructose-corn-syrup-primary.jpg'),
  'ogkb-melonade': require('@/assets/images/ogkb-melonade-primary.jpg'),
  'organic-flower': require('@/assets/images/organic-flower-upload-primary.jpg'),
};

const LOCAL_GALLERIES: Record<string, any[]> = {
  fizz: [
    LOCAL_IMAGES.fizz,
    require('@/assets/images/fizz-macro.jpg'),
    require('@/assets/images/fizz-texture.jpg'),
    require('@/assets/images/fizz-tool.jpg'),
  ],
  'gak-smoovie': [
    LOCAL_IMAGES['gak-smoovie'],
    require('@/assets/images/gak-smoovie-macro.jpg'),
    require('@/assets/images/gak-smoovie-texture.jpg'),
    require('@/assets/images/gak-smoovie-tool.jpg'),
  ],
  gmo: [
    LOCAL_IMAGES.gmo,
    require('@/assets/images/gmo-upload-macro.jpg'),
    require('@/assets/images/gmo-upload-texture.jpg'),
    require('@/assets/images/gmo-upload-tool.jpg'),
  ],
  'high-fructose-corn-syrup': [
    LOCAL_IMAGES['high-fructose-corn-syrup'],
    require('@/assets/images/high-fructose-corn-syrup-macro.jpg'),
    require('@/assets/images/high-fructose-corn-syrup-texture.jpg'),
    require('@/assets/images/high-fructose-corn-syrup-tool.jpg'),
  ],
  'ogkb-melonade': [
    LOCAL_IMAGES['ogkb-melonade'],
    require('@/assets/images/ogkb-melonade-macro.jpg'),
    require('@/assets/images/ogkb-melonade-texture.jpg'),
    require('@/assets/images/ogkb-melonade-tool.jpg'),
  ],
  'organic-flower': [
    LOCAL_IMAGES['organic-flower'],
    require('@/assets/images/organic-flower-macro.jpg'),
    require('@/assets/images/organic-flower-texture.jpg'),
  ],
};

type LocalImageKey = keyof typeof LOCAL_IMAGES;

const LOCAL_IMAGE_ALIASES: Record<string, LocalImageKey> = {
  fizz: 'fizz',
  'the-fizz': 'fizz',
  'gak-smoovie': 'gak-smoovie',
  gak: 'gak-smoovie',
  gmo: 'gmo',
  'gmo-cookies': 'gmo',
  hfcs: 'high-fructose-corn-syrup',
  'high-fructose-corn-syrup': 'high-fructose-corn-syrup',
  'ogkb-melonade': 'ogkb-melonade',
  'melonade-breath': 'ogkb-melonade',
  'organic-cannabis-flower': 'organic-flower',
  'organic-flower': 'organic-flower',
};

const FLOWER_TIERS = ['Premium Indoor Flower', 'Greenhouse Flower', 'Sungrown Flower'];

const normalizeProductIdentity = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const resolveLocalImageKey = (product: Product): LocalImageKey => {
  if (product.type === 'flower') return 'organic-flower';

  for (const candidate of [product.id, product.name]) {
    const key = LOCAL_IMAGE_ALIASES[normalizeProductIdentity(candidate)];
    if (key && key !== 'organic-flower') return key;
  }

  throw new Error(
    `Missing exact rosin image mapping for ${product.id} (${product.name})`,
  );
};

export const getImageSource = (product: Product) => {
  return LOCAL_IMAGES[resolveLocalImageKey(product)];
};

export const getProductGallery = (product: Product) => {
  const key = resolveLocalImageKey(product);
  const labels = [
    'primary product photo',
    'macro product detail',
    'texture product detail',
    'tool product detail',
  ];

  return LOCAL_GALLERIES[key].map((source, index) => ({
    source,
    label: `${product.name} ${labels[index] ?? 'product detail'}`,
  }));
};

const getStrainDisplay = (strainType: string) => {
  const [type, ...details] = strainType.split('·').map(part => part.trim());
  return { type, mix: details.join(' · ') };
};

export const renderStrainText = (value: string, colors: ReturnType<typeof useColors>) =>
  value.split(/(indica|sativa|hybrid)/gi).map((part, index) => {
    const normalized = part.toLowerCase();
    const color = normalized === 'indica'
      ? colors.classificationIndica
      : normalized === 'sativa'
        ? colors.classificationSativa
        : normalized === 'hybrid'
          ? colors.classificationHybrid
          : undefined;
    return (
      <Text key={`${part}-${index}`} style={color ? { color } : undefined}>
        {part}
      </Text>
    );
  });

const getListingFlavor = (flavorNotes: string[]) => {
  const notes = flavorNotes.slice(0, 4).join(' · ');
  return notes || 'Small-batch cultivar';
};

export function ProductTile({ product }: { product: Product; tone?: 'green' | 'purple' }) {
  const colors = useColors();
  const router = useRouter();
  const { addItem } = useCart();
  const isAvailable = product.status === 'available' && product.stock > 0;
   const displaySizes = product.type === 'flower' ? [] : product.sizes;
   const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
   const selectedSize = displaySizes?.[selectedSizeIndex] ?? displaySizes?.[0] ?? null;
  const [addedToCartMessage, setAddedToCartMessage] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const strain = getStrainDisplay(product.strainType);
  const listingFlavor = getListingFlavor(product.flavorNotes);
  const [titleHovered, setTitleHovered] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);
  const [categoryHovered, setCategoryHovered] = useState(false);
  const [addHovered, setAddHovered] = useState(false);
  const effectColors = [colors.descriptionPurple, colors.effectPurpleAlt, colors.effectPurpleDeep];
  const strainType = strain.type.toLowerCase();
  const strainGradient: [string, string] = strainType.includes('hybrid')
    ? [colors.strainHybridStart, colors.strainHybridEnd]
    : strainType.includes('sativa')
      ? [colors.strainSativaStart, colors.strainSativaEnd]
      : [colors.strainIndicaStart, colors.strainIndicaEnd];
  const itemBoxGradient: [string, string] = product.type === 'flower'
    ? strainGradient
    : [colors.strainHybridStart, colors.strainHybridEnd];
    const titleGradient: [string, string, string, string] = [
      colors.titleOrange,
      colors.titleSage,
      colors.titleLavender,
      colors.titleCaramel,
    ];
  const classificationColor = strainType.includes('hybrid')
    ? colors.classificationHybrid
    : strainType.includes('sativa')
      ? colors.classificationSativa
      : colors.classificationIndica;

  const addToCart = () => {
    if (!isAvailable || !selectedSize) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem({
      id: product.id,
      name: product.name,
      grams: selectedSize.grams,
      price: selectedSize.price,
    });
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setAddedToCartMessage(`Added to Cart! (${selectedSize.grams}g)`);
    feedbackTimeoutRef.current = setTimeout(() => setAddedToCartMessage(null), 2200);
  };

  useEffect(() => () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
  }, []);

  return (
    <LinearGradient
      colors={itemBoxGradient}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[
        styles.card,
        {
          borderColor: colors.descriptionBorder,
          shadowColor: colors.orangeDark,
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.24,
          shadowRadius: 0,
          boxShadow: `0 0 0 1px ${colors.textBoxDarkMagenta}, 0 1px 5px ${colors.textBoxMagentaGlow}, 0 0 8px ${colors.orangeLight}`,
          elevation: 3,
          borderRadius: colors.radius,
        },
      ]}
    >
        <Pressable
          accessibilityLabel={`View photos and details for ${product.name}`}
            accessibilityRole="link"
          onHoverIn={() => setImageHovered(true)}
          onHoverOut={() => setImageHovered(false)}
          onPress={() => router.push(`/product/${product.id}`)}
          style={({ pressed }) => [
            styles.imageContainer,
            {
              borderColor: colors.orangeDark,
              borderTopLeftRadius: colors.radius - 1,
              borderTopRightRadius: colors.radius - 1,
              overflow: 'hidden',
              shadowColor: colors.orangeLight,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: pressed ? 0.7 : 0.46,
              shadowRadius: pressed ? 7 : 5,
              boxShadow: `0 0 0 1px ${colors.orangeDark}, 0 0 ${pressed ? 10 : 7}px ${colors.orangeLight}`,
            },
            pressed && styles.imagePressed,
          ]}
          testID={`product-image-${product.id}`}
        >
          {({ pressed }) => (
            <>
              <Image
                accessibilityLabel={`${product.name} product photo`}
                cachePolicy="memory-disk"
                source={getImageSource(product)}
                style={[styles.image, { opacity: pressed ? 0.76 : 0.9 }]}
                contentFit="cover"
                priority="normal"
                recyclingKey={product.id}
                transition={200}
              />
              <View pointerEvents="none" style={[styles.imageInnerBorder, { borderColor: colors.innerGlow, shadowColor: colors.innerGlow }]} />
              <View style={styles.imageOverlay}>
                <View style={[styles.badge, { backgroundColor: product.type === 'flower' ? colors.infoBlueAlt : colors.infoBlue }]}>
                  <Text style={[styles.badgeText, { color: colors.thcText }]}>
                    {product.type === 'flower' ? 'FLOWER' : 'COLD CURE'}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: product.type === 'flower' ? colors.infoBlueStrong : colors.infoBlueAlt }]}>
                  <Text style={[styles.badgeText, { color: colors.infoBlueText }]}>
                    {product.type === 'flower' ? 'SOON' : `${product.potency}% THC`}
                  </Text>
                </View>
              </View>
              <Pressable
                onHoverIn={() => setCategoryHovered(true)}
                onHoverOut={() => setCategoryHovered(false)}
                style={[
                  styles.categoryReveal,
                  {
                  backgroundColor: categoryHovered ? 'transparent' : colors.ctaSage,
                  borderColor: categoryHovered ? colors.orangeDark : colors.descriptionForest,
                  borderRadius: 0,
                  opacity: imageHovered || categoryHovered || pressed ? 1 : 0,
                  shadowColor: categoryHovered ? colors.orangeLight : colors.ctaSage,
                  boxShadow: categoryHovered
                    ? `0 0 4px ${colors.orangeLight}, 0 0 6px ${colors.orangeLight}`
                    : `0 0 3px ${colors.ctaSage}`,
                  },
                ]}
              >
                <LinearGradient
                  colors={categoryHovered ? [colors.orangeLight, colors.lavenderLight] : [colors.ctaSage, colors.ctaSage]}
                  end={{ x: 1, y: 1 }}
                  pointerEvents="none"
                  start={{ x: 0, y: 0 }}
                  style={[
                    StyleSheet.absoluteFillObject,
                    { borderRadius: 0 },
                  ]}
                />
                <Feather color={product.type === 'flower' ? colors.secondary : categoryHovered ? colors.rustBright : colors.secondary} name="arrow-up-right" size={12} />
                <Text style={[styles.categoryRevealText, { color: colors.descriptionForest, textShadowColor: colors.photoHoverBeige, textShadow: `0 0 2px ${colors.photoHoverBeige}` } as any]}>
                  {product.type === 'flower' ? 'ORGANIC FLOWER' : 'LIVE ROSIN'}
                </Text>
              </Pressable>
            </>
          )}
        </Pressable>
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityLabel={`Product name: ${product.name}`}
            accessibilityRole="link"
            onHoverIn={() => setTitleHovered(true)}
            onHoverOut={() => setTitleHovered(false)}
            onPress={() => router.push(`/product/${product.id}`)}
            style={styles.titleBannerPressable}
          >
            {({ pressed }) => {
              const highlighted = titleHovered || pressed;
              return highlighted ? (
                <LinearGradient
                  colors={titleGradient}
                  end={{ x: 0, y: 1 }}
                  start={{ x: 0, y: 0 }}
                    style={[styles.titleBanner, { shadowColor: colors.titleMagentaGlow, boxShadow: `0 0 8px ${colors.titleMagentaGlow}` }]}
                >
                  <Text style={[styles.title, product.type === 'flower' ? styles.flowerTitle : null, { color: colors.productTitleText, textShadowColor: colors.titleGlow, textShadow: `0 0 4px ${colors.titleGlow}, 0 0 7px ${colors.titleGlow}` } as any]}>
                    {product.name}
                  </Text>
                </LinearGradient>
              ) : (
                     <LinearGradient colors={titleGradient} end={{ x: 0, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.titleBanner, { shadowColor: colors.titleMagentaGlow, boxShadow: `0 0 8px ${colors.titleMagentaGlow}` }]}>
                          <Text style={[styles.title, product.type === 'flower' ? styles.flowerTitle : null, { color: colors.productTitleText, textShadowColor: colors.titleGlow, textShadow: `0 0 4px ${colors.titleGlow}, 0 0 7px ${colors.titleGlow}` } as any]}>
                    {product.name}
                  </Text>
                  </LinearGradient>
              );
            }}
          </Pressable>
           <Text style={[styles.stock, { color: colors.rustBright }]}>
            {isAvailable ? `${product.stock} left` : 'Future drop'}
          </Text>
        </View>

         <View style={styles.traitsAndReference}>
           <View style={styles.traitsRow}>
              <LinearGradient colors={itemBoxGradient} end={{ x: 1, y: 0 }} start={{ x: 0, y: 0 }} style={[styles.cultivarHighlight, { borderLeftColor: classificationColor, borderBottomColor: colors.innerBorder }]}>
                 <Text style={[styles.cultivarType, { color: classificationColor }]} numberOfLines={1}>
                  {renderStrainText(strain.type, colors)}
               </Text>
               {strain.mix ? (
                  <Text style={[styles.cultivarMix, { color: classificationColor }]} numberOfLines={2}>
                    {renderStrainText(strain.mix, colors)}
                 </Text>
               ) : null}
              </LinearGradient>
           </View>
           {product.referenceUrl && product.referenceLabel ? (
             <Pressable
               accessibilityRole="link"
               accessibilityLabel={`Open ${product.referenceLabel}`}
               onPress={() => Linking.openURL(product.referenceUrl!)}
                style={[styles.referenceLink, { backgroundColor: colors.descriptionLavender, borderColor: colors.descriptionLavender }]}
             >
                <Text style={[styles.referenceLinkText, { color: colors.descriptionPurple }]} numberOfLines={2}>{product.referenceLabel}</Text>
                <Feather color={colors.descriptionPurple} name="external-link" size={11} />
             </Pressable>
           ) : null}
         </View>

             <View style={styles.copyBoxFrame}>
               <LinearGradient
                 colors={[colors.copyLavender, colors.copyOrange, colors.copySage]}
                 end={{ x: 1, y: 1 }}
                 start={{ x: 0, y: 0 }}
                 style={[styles.copyBox, { backgroundColor: 'transparent', borderColor: colors.descriptionBorder, shadowColor: colors.orangeDark, shadowOpacity: 0.28, shadowRadius: 3, boxShadow: `0 0 0 1px ${colors.textBoxDarkMagenta}, 0 1px 5px ${colors.textBoxMagentaGlow}, 0 0 8px ${colors.orangeLight}` } as any]}
               >
                 <View style={styles.copyBoxContent}>
                   <BulletList items={[
                       { label: 'Flavor Profile / Notes Of', labelColor: colors.descriptionPurple, text: listingFlavor, bullet: false, color: colors.bulletOrange, fontFamily: 'Georgia', fontStyle: 'normal', fontWeight: '400', glowColor: colors.flavorGlow, glowRadius: 2 },
                      { label: 'Experience', labelColor: colors.descriptionPurple, text: getExperienceNotes(product), bullet: false, color: colors.bulletGreen, fontFamily: 'Georgia', fontSize: 12, lineHeight: 18, fontStyle: 'italic', fontWeight: '400', glowColor: colors.experienceGlow, glowRadius: 2 },
                       { label: 'Strain Description', labelColor: colors.descriptionPurple, text: product.description, bullet: false, color: colors.descriptionForest, fontFamily: 'Georgia', fontSize: 12, lineHeight: 18, fontStyle: 'normal', fontWeight: '400', glowColor: colors.experienceGlow, glowRadius: 2 },
                  ]} />
                 </View>
               </LinearGradient>
             </View>

         <View style={[styles.lineageBlock, { borderTopColor: colors.descriptionBorder }]}>
           <Text style={[styles.copyHeading, { color: colors.descriptionPurple }]}>Lineage</Text>
           <Text style={[styles.lineage, { color: colors.descriptionForest, textShadowColor: colors.experienceGlow, textShadow: `0 0 2px ${colors.experienceGlow}` } as any]}>{product.lineage}</Text>
         </View>

        {product.effects && product.effects.length > 0 ? (
          <View style={[styles.effectsBox, { backgroundColor: colors.listingBackground, borderColor: colors.effectsBorder, shadowColor: colors.orangeDark, shadowOpacity: 0.28, shadowRadius: 3, boxShadow: `0 0 0 1px ${colors.textBoxDarkMagenta}, 0 1px 5px ${colors.textBoxMagentaGlow}, 0 0 8px ${colors.orangeLight}` }]}>
            <Text style={[styles.effectsLabel, { color: colors.effectPurpleDeep }]}>Effects:</Text>
            <Text style={styles.effectsText}>
              {product.effects.map((effect, index) => (
                <Text key={effect} style={{ color: effectColors[index % effectColors.length] }}>
                  {index > 0 ? ' · ' : ''}{effect}
                </Text>
              ))}
            </Text>
          </View>
        ) : null}

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
             <Text style={[styles.optionsLabel, { color: colors.descriptionPurple }]}>AVAILABLE SIZES</Text>
            <View style={styles.optionsRow}>
               {displaySizes.map((option, index) => (
                 <Pressable
                   accessibilityLabel={`Select ${option.grams} grams for $${option.price}`}
                   key={`${option.grams}-${option.price}`}
                   onPress={() => setSelectedSizeIndex(index)}
                   style={[
                     styles.optionChip,
                     {
                       backgroundColor: index === selectedSizeIndex ? colors.orangeLight : colors.titleLavender,
                       borderColor: index === selectedSizeIndex ? colors.orangeDark : colors.innerGlow,
                     },
                   ]}
                 >
                  <Text style={[styles.optionText, { color: colors.descriptionCaramel }]}>{option.grams}g - ${option.price}</Text>
                 </Pressable>
              ))}
            </View>
          </View>
         ) : null}

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.price, { color: colors.foreground }]}>
             {selectedSize ? `${selectedSize.grams}g · $${selectedSize.price}` : 'Details soon'}
          </Text>
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
              accessibilityLabel={`Add ${product.name} to cart`}
               disabled={!isAvailable || !selectedSize}
              onHoverIn={() => setAddHovered(true)}
              onHoverOut={() => setAddHovered(false)}
              onPress={addToCart}
              style={({ pressed }) => [
                styles.addButton,
                {
                     backgroundColor: isAvailable ? 'transparent' : colors.muted,
                      backgroundImage: isAvailable
                       ? pressed || addHovered
                           ? `linear-gradient(110deg, ${colors.addButtonMagentaPurple}, ${colors.addButtonMagentaPurple})`
                           : `linear-gradient(110deg, ${colors.addButtonPineOrange}, ${colors.addButtonPineOrange})`
                       : undefined,
                      borderColor: colors.addButtonPineOrangeDark,
                      shadowColor: pressed || addHovered ? colors.addButtonOrangePinkGlow : colors.addButtonPineOrange,
                     boxShadow: isAvailable
                       ? pressed || addHovered
                           ? `0 0 7px ${colors.addButtonOrangePinkGlow}, 0 0 12px ${colors.addButtonOrangePinkGlow}`
                           : `0 0 4px ${colors.addButtonPineOrange}`
                       : undefined,
                      shadowOpacity: isAvailable ? 0.48 : 0.12,
                      shadowRadius: pressed || addHovered ? 6 : 3,
                     shadowOffset: { width: 0, height: 0 },
                     elevation: pressed && isAvailable ? 5 : 1,
                     borderWidth: 1,
                    transform: [{ scale: isAvailable && pressed ? 0.97 : 1 }],
                 },
               ]}
               testID={`add-${product.id}`}
             >
               {({ pressed }) => {
                 const buttonHovered = pressed || addHovered;
                 const buttonColor = isAvailable ? colors.addButtonText : colors.mutedForeground;
                 return (
                   <>
                     {isAvailable ? (
                       <LinearGradient
                         colors={buttonHovered ? [colors.addButtonMagentaPurple, colors.addButtonMagentaPurple] : [colors.addButtonPineOrange, colors.addButtonPineOrange]}
                         end={{ x: 1, y: 1 }}
                         pointerEvents="none"
                         start={{ x: 0, y: 0 }}
                         style={StyleSheet.absoluteFillObject}
                       />
                     ) : null}
                      <Text style={[styles.addButtonText, { color: buttonColor, textShadowColor: buttonHovered ? colors.addButtonOrangePinkGlow : undefined, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: buttonHovered ? 2 : 0, textShadow: buttonHovered ? `0 0 2px ${colors.addButtonOrangePinkGlow}` : undefined } as any]}>
                       {isAvailable ? 'Add to Bag' : 'Unavailable'}
                     </Text>
                     <Feather
                        color={buttonHovered && isAvailable ? colors.addButtonHoverSage : buttonColor}
                       name={isAvailable ? 'plus' : 'clock'}
                       size={14}
                     />
                   </>
                 );
               }}
             </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { 
    borderWidth: 1, 
    overflow: 'hidden', 
    marginBottom: 8
  },
  imageContainer: {
    borderRadius: 12,
    borderWidth: 1,
    height: 150,
    width: '100%',
    position: 'relative',
  },
  imagePressed: {
    transform: [{ scale: 0.992 }],
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imageInnerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    borderWidth: 2,
    elevation: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.46,
    shadowRadius: 4,
    zIndex: 3,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryReveal: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    bottom: 8,
    flexDirection: 'row',
    gap: 6,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: 'absolute',
    right: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 5,
  },
  categoryRevealText: {
    fontFamily: 'Georgia',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: 'Georgia',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  disclaimer: {
    fontFamily: 'Georgia',
    fontSize: 10,
    paddingHorizontal: 12,
     paddingVertical: 7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  content: {
    padding: 11,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleBannerPressable: {
    flex: 1,
    minWidth: 0,
  },
  titleBanner: {
    borderRadius: 8,
    borderWidth: 0,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
  },
  title: {
    fontFamily: 'Georgia',
     fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.25,
     lineHeight: 30,
    flexShrink: 1,
  },
  flowerTitle: {
     fontSize: 22,
    letterSpacing: -0.35,
     lineHeight: 26,
  },
  stock: {
    fontFamily: 'Georgia',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  traitsRow: {
    alignItems: 'flex-start',
  },
  traitsAndReference: {
    alignItems: 'flex-start',
    gap: 4,
    width: '100%',
  },
  referenceLink: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: 'row',
     gap: 4,
    maxWidth: '100%',
    minWidth: 0,
     paddingHorizontal: 6,
     paddingVertical: 3,
  },
  referenceLinkText: {
    fontFamily: 'Georgia',
     fontSize: 9,
     fontWeight: '700',
    letterSpacing: 0.25,
  },
  cultivarHighlight: {
    alignSelf: 'stretch',
    maxWidth: '100%',
    borderRadius: 7,
    borderLeftWidth: 2,
    borderBottomWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 5,
    gap: 2,
  },
  cultivarType: {
    fontFamily: 'Georgia',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    lineHeight: 12,
  },
  cultivarMix: {
    fontFamily: 'Georgia',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.25,
    lineHeight: 13,
  },
  lineageScroll: {
    maxWidth: '100%',
  },
  lineageBlock: {
    borderTopWidth: 1,
    gap: 3,
    paddingTop: 7,
    width: '100%',
  },
  copyHeading: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  lineage: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
  },
  listingSummary: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  },
  copyBox: {
    alignSelf: 'stretch',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  copyBoxFrame: { alignSelf: 'stretch', position: 'relative' },
  copyBoxContent: { position: 'relative', zIndex: 1 },
  experience: {
    fontFamily: 'Georgia',
    fontSize: 13,
    lineHeight: 19,
  },
  description: {
    flexGrow: 1,
    flexShrink: 1,
    fontFamily: 'Georgia',
    fontSize: 13,
    fontStyle: 'normal',
    lineHeight: 20,
    width: '100%',
  },
  effectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 4,
  },
  effectsBox: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 4,
    paddingHorizontal: 9,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 2,
    paddingVertical: 8,
  },
  effectsLabel: {
    fontFamily: 'Georgia',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  effectsText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    lineHeight: 18,
  },
  flavorNotes: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontStyle: 'normal',
  },
  optionsBlock: {
    gap: 7,
  },
  optionsLabel: {
    fontFamily: 'Georgia',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  optionChip: {
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  optionText: {
    fontFamily: 'Georgia',
    fontSize: 11,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 4,
  },
  price: {
    fontFamily: 'Georgia',
    fontSize: 15,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  addAction: {
    alignItems: 'flex-end',
    gap: 4,
  },
  addFeedback: {
    fontFamily: 'Georgia',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
    textAlign: 'right',
  },
  addButtonText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
