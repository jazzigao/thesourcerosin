import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetStorefrontSummary, useListProducts, useSubscribeNewsletter } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { ProductTile } from '@/components/ProductTile';
import { getImageSource } from '@/components/ProductTile';
import { BrandMark } from '@/components/BrandMark';
import { BackToTopButton } from '@/components/BackToTopButton';
import { SeeNewDropsButton } from '@/components/SeeNewDropsButton';

export default function TabOneScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [hoveredThumbnail, setHoveredThumbnail] = useState<string | null>(null);
  const [heroImageHovered, setHeroImageHovered] = useState(false);
  const [browseHovered, setBrowseHovered] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactQuestion, setContactQuestion] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const summaryQuery = useGetStorefrontSummary();
  const productsQuery = useListProducts();
  const subscribe = useSubscribeNewsletter();

  const featuredProduct = (productsQuery.data ?? []).find(
    (product) => product.status === 'available',
  );
  const products = productsQuery.data ?? [];
  const heroTitleLines = [
    '100% Solventless Hash Rosin.',
    'Organically Grown & Purely Made.',
    'Delivered Directly with Care.',
    'From Our Farm to Your Door.',
  ];
  const heroDescription = 'From organic seed to your table, every high-quality flower is grown with care, carefully harvested, and flash-frozen at its peak. Pressed 100% solventlessly with only ice, pressure, and water, our live hash rosin preserves pure, natural flavors of the best parts of the flower. It’s truly the cream of the crop. Made for connoisseurs, delivered fresh with care, you’ll be blissed by the outstanding quality of every single small batch artisan rosin jar. Unique strains for every kind of mood, with strong terpenes that explode with flavor at each twist of the puck. Collect them all for your daily driver rotations, special occasions, or sharing with friends and family.\nSimply put, Pure Rosin is Pure Happiness!';
  const [heroDescriptionLead, ...heroDescriptionBody] = heroDescription.split('\n');
  const getThumbnailStrainTone = (strainType: string): 'indica' | 'sativa' | 'hybrid' => {
    const value = strainType.toLowerCase();
    if (value.includes('indica-dominant') || value.startsWith('indica')) return 'indica';
    if (value.includes('sativa-dominant') || value.startsWith('sativa')) return 'sativa';
    return 'hybrid';
  };

  const getThumbnailGradient = (strainType: string): [string, string] => {
    const tone = getThumbnailStrainTone(strainType);
    if (tone === 'hybrid') return [colors.strainHybridStart, colors.strainHybridEnd];
    if (tone === 'sativa') return [colors.strainSativaStart, colors.strainSativaEnd];
    return [colors.strainIndicaStart, colors.strainIndicaEnd];
  };

  const getThumbnailHoverTint = (strainType: string) => {
    const tone = getThumbnailStrainTone(strainType);
    if (tone === 'sativa') return colors.sageButtonHover;
    if (tone === 'hybrid') return colors.thumbnailOrange;
    return colors.titleLavender;
  };

  const getThumbnailLabelGradient = (
    strainType: string,
    active = false,
  ): [string, string, string, string] => {
    const tone = getThumbnailStrainTone(strainType);

    if (active) {
      if (tone === 'indica') {
        return [colors.thumbnailSage, colors.thumbnailOrange, colors.thumbnailLavender, colors.thumbnailMagenta];
      }
      if (tone === 'sativa') {
        return [colors.thumbnailMagenta, colors.thumbnailOrange, colors.thumbnailLavender, colors.thumbnailSage];
      }
      return [colors.thumbnailLavender, colors.thumbnailOrange, colors.thumbnailSage, colors.thumbnailMagenta];
    }

    if (tone === 'indica') {
      return [colors.thumbnailLavender, colors.thumbnailMagenta, colors.thumbnailOrange, colors.thumbnailSage];
    }
    if (tone === 'sativa') {
      return [colors.thumbnailSage, colors.thumbnailLavender, colors.thumbnailOrange, colors.thumbnailMagenta];
    }
    return [colors.thumbnailMagenta, colors.thumbnailOrange, colors.thumbnailLavender, colors.thumbnailSage];
  };

  const handleNewsletterSubmit = () => {
    const email = newsletterEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterMessage('Enter a valid email address to join.');
      return;
    }

    setNewsletterMessage('');
    subscribe.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          setNewsletterEmail('');
          setNewsletterMessage('You are on the list for the latest updates.');
        },
        onError: () => {
          setNewsletterMessage('We could not add you right now. Please try again.');
        },
      },
    );
  };

  const handleContactSubmit = async () => {
    const name = contactName.trim();
    const email = contactEmail.trim();
    const question = contactQuestion.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !question) {
      setContactMessage('Add your name, a valid email, and your question.');
      return;
    }

    const subject = encodeURIComponent(`The Source help request from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${question}`);
    try {
      await Linking.openURL(`mailto:help@seedtotable.com?subject=${subject}&body=${body}`);
      setContactMessage('Your email app is ready with your question.');
    } catch {
      setContactMessage('We could not open your email app. Email help@seedtotable.com directly.');
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.copyLavender, colors.copySage, colors.copyOrange, colors.pageGradientEnd]} end={{ x: 0, y: 1 }} start={{ x: 0, y: 0 }} style={styles.pageGradient}>
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: 16,
          paddingBottom: Platform.OS === 'web' ? 128 : insets.bottom + 96,
        },
      ]}
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
    >
       <LinearGradient
         colors={[colors.strainSativaStart, colors.card]}
         end={{ x: 1, y: 1 }}
         start={{ x: 0, y: 0 }}
         style={[
         styles.hero,
         {
           borderRadius: colors.radius,
           borderWidth: 1,
           borderColor: colors.orangeDark,
            shadowColor: colors.titleGlow,
           shadowOffset: { width: 3, height: 3 },
           shadowOpacity: 0.36,
           shadowRadius: 0,
            boxShadow: `0 0 6px ${colors.titleGlow}`,
         }
         ]}
       >
          <View style={styles.heroContent}>
             <View style={styles.heroLeadMark}>
               <BrandMark variant="hero" />
             </View>
           <View style={styles.heroLead}>
             <View style={styles.heroLeadCopy}>
                <Text style={[styles.eyebrow, styles.heroEyebrow, { color: colors.primary }]}>
                 {summaryQuery.data?.heroEyebrow ?? 'LIMITED HARVEST'}
               </Text>
                 <Text style={[styles.heroTitle, windowWidth <= 340 ? styles.heroTitleCompact : null, { color: colors.primary, textShadowColor: colors.photoHoverBeige, textShadow: `0 0 2px ${colors.photoHoverBeige}` } as any]}>
                  {heroTitleLines.map((line, index) => (
                    <Text
                      key={line}
                      style={index === 1
                        ? [styles.heroTitleItalic, windowWidth <= 340 ? styles.heroTitleItalicCompact : null]
                        : undefined}
                    >
                      {index > 0 ? '\n' : ''}
                      {line}
                    </Text>
                  ))}
                </Text>
             </View>
           </View>
              <Text style={[styles.heroCopy, { color: colors.heroDescription, textShadowColor: colors.heroDescriptionGlow, textShadow: `0 0 1px ${colors.heroDescriptionGlow}` } as any]}>
               <Text style={[styles.heroCopyLead, { color: colors.heroDescription, textShadowColor: colors.heroDescriptionGlow, textShadow: `0 0 1px ${colors.heroDescriptionGlow}` } as any]}>{heroDescriptionLead}</Text>
              {heroDescriptionBody.length ? `\n${heroDescriptionBody.join('\n')}` : ''}
          </Text>
           <View style={[styles.heroRule, { backgroundColor: colors.secondary }]} />
              <Text style={[styles.dropText, { color: colors.rustBright }]}>
              {(summaryQuery.data?.activeDrop ?? 'THE GARDEN COLLECTION IS LIVE NOW').toUpperCase()}
          </Text>
            <SeeNewDropsButton onPress={() => router.push('/drops')} />
        </View>
          <Pressable
            accessibilityLabel="Browse all products"
            onHoverIn={() => setHeroImageHovered(true)}
            onHoverOut={() => setHeroImageHovered(false)}
            onPress={() => router.push('/drops')}
          >
            {({ pressed }) => (
              <View style={[styles.heroImageFrame, { borderColor: colors.orangeDark, borderWidth: pressed ? 2 : 1, shadowColor: colors.photoHoverOrangeGlow, boxShadow: `0 0 8px ${colors.photoHoverOrangeGlow}` }]}>
                <Image
                  accessibilityLabel="Shop solventless deals"
                  cachePolicy="memory-disk"
                  source={require('@/assets/images/hero-cannabis-crystals.jpg')}
                  contentFit="cover"
                  priority="high"
                  style={styles.heroImage}
                  transition={200}
                />
                <LinearGradient
                  colors={[colors.titleLavender, colors.lavenderLight]}
                            end={{ x: 1, y: 0 }}
                  pointerEvents="none"
                  start={{ x: 0, y: 0 }}
                  style={[styles.heroImageHoverWash, { opacity: pressed ? 0.7 : heroImageHovered ? 0.46 : 0 }]}
                />
                <View pointerEvents="none" style={[styles.heroImageDeal, { opacity: pressed || heroImageHovered ? 1 : 0 }]}>
                  <Text style={[styles.heroImageDealText, { color: colors.effectPurpleDeep }]}>
                    Shop Solventless Deals:{'\n'}10% Off Sitewide with First Purchase
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
       </LinearGradient>

        <View style={styles.thumbnailSection}>
         <Text style={[styles.eyebrow, { color: colors.primary }]}>THE FULL GARDEN</Text>
         <Text style={[styles.thumbnailHeading, { color: colors.foreground }]}>Every current expression</Text>
         <View style={styles.thumbnailGrid}>
           {products.map((product) => {
             const highlighted = hoveredThumbnail === product.id;
               const thumbnailGradient = getThumbnailGradient(product.strainType);
               const thumbnailHoverTint = getThumbnailHoverTint(product.strainType);
             return (
               <Pressable
                 key={product.id}
                 accessibilityLabel={`View details for ${product.name}`}
                 onHoverIn={() => setHoveredThumbnail(product.id)}
                 onHoverOut={() => setHoveredThumbnail(null)}
                 onPress={() => router.push(`/product/${product.id}`)}
                style={({ pressed }) => [
                  styles.thumbnail,
                  {
                    borderColor: colors.orangeDark,
                    backgroundColor: colors.card,
                     shadowColor: colors.orangeLight,
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: pressed || highlighted ? 0.72 : 0.44,
                     shadowRadius: pressed || highlighted ? 7 : 5,
                     boxShadow: `0 0 0 1px ${colors.orangeDark}, 0 0 ${pressed || highlighted ? 10 : 7}px ${colors.orangeLight}`,
                    backgroundImage: product.type === 'flower' && (pressed || highlighted)
                      ? `linear-gradient(135deg, ${colors.thumbnailOrange}, ${colors.thumbnailMagenta}, ${colors.thumbnailLavender}, ${colors.thumbnailBlue}, ${colors.thumbnailSage})`
                      : `linear-gradient(135deg, ${colors.thumbnailOrange}, ${colors.thumbnailLavender}, ${colors.thumbnailSage})`,
                  } as any,
                ]}
               >
                 {({ pressed }) => {
                   const active = highlighted || pressed;
                   return (
                     <>
                        <Image
                          accessibilityLabel={`${product.name} product photo`}
                          cachePolicy="memory-disk"
                          contentFit="cover"
                          priority="low"
                          recyclingKey={product.id}
                          source={getImageSource(product)}
                          style={styles.thumbnailImage}
                          transition={150}
                        />
                        <LinearGradient
                          colors={thumbnailGradient}
                         end={{ x: 1, y: 1 }}
                         pointerEvents="none"
                         start={{ x: 0, y: 0 }}
                          style={[styles.thumbnailTone, { opacity: active ? 0.34 : 0.16 }]}
                       />
                        <View pointerEvents="none" style={[styles.thumbnailHoverTint, { backgroundColor: thumbnailHoverTint, opacity: active ? 0.22 : 0 }]} />
                        <View
                          pointerEvents="none"
                          style={[
                            styles.thumbnailHoverRainbow,
                            {
                               backgroundImage: `linear-gradient(135deg, ${getThumbnailLabelGradient(product.strainType, true).join(', ')})`,
                              opacity: active ? 1 : 0,
                            } as any,
                          ]}
                        />
                         <View pointerEvents="none" style={[styles.thumbnailInnerBorder, { borderColor: colors.innerBorder, shadowColor: colors.innerGlow, boxShadow: `inset 0 0 3px ${colors.innerGlow}` } as any]} />
                         <LinearGradient
                            colors={['transparent', colors.thumbnailSage, colors.thumbnailLavender, colors.thumbnailOrange]}
                            end={{ x: 1, y: 1 }}
                           pointerEvents="none"
                            start={{ x: 0, y: 0 }}
                             style={[styles.thumbnailBottomGradient, { opacity: 0.72 }]}
                         />
                       {active ? (
                         <>
                           <View style={styles.thumbnailBadge}>
                              <Text style={[styles.thumbnailBadgeText, { color: colors.thcText }]}>
                               {product.potency > 0 ? `${product.potency}% THC` : 'COMING SOON'}
                             </Text>
                           </View>
                         </>
                       ) : null}
                       <View
                         style={[
                           styles.thumbnailLabel,
                           {
                              borderTopColor: colors.orangeDark,
                               backgroundColor: active ? colors.thumbnailLavender : colors.titleSurface,
                           } as any,
                         ]}
                       >
                          <LinearGradient
                              colors={getThumbnailLabelGradient(product.strainType, active)}
                             locations={[0, 0.32, 0.58, 1]}
                            end={{ x: 1, y: 1 }}
                            pointerEvents="none"
                            start={{ x: 0, y: 0 }}
                            style={[
                              StyleSheet.absoluteFillObject,
                              styles.thumbnailLabelGradient,
                                  { opacity: active ? 0.9 : 0.72 },
                            ]}
                          />
                          <View style={styles.thumbnailNamePlate}>
                            <Text numberOfLines={2} style={[styles.thumbnailLabelText, { color: product.type === 'flower' ? colors.descriptionPurple : colors.descriptionForest, textShadowColor: colors.photoHoverBeige, textShadow: `0 0 1px ${colors.photoHoverBeige}` } as any]}>
                              {product.name}
                            </Text>
                          </View>
                       </View>
                     </>
                   );
                 }}
               </Pressable>
             );
           })}
         </View>
       </View>

           <View style={styles.collectionHeader}>
               <Text style={[styles.featuredTitle, { color: colors.foreground, textShadowColor: colors.titleTextGlow, textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, textShadow: `1px 1px 0 ${colors.titleGradientGlow}, 0 0 3px ${colors.titleGlow}` } as any]}>Featured Live Rosin</Text>
              <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={[styles.collectionLiveText, { color: colors.primary, textShadowColor: colors.innerGlow, textShadow: `0 0 2px ${colors.innerGlow}` } as any]}>THE GARDEN COLLECTION IS LIVE NOW</Text>
          <Pressable
            accessibilityLabel="Browse all products"
            onHoverIn={() => setBrowseHovered(true)}
            onHoverOut={() => setBrowseHovered(false)}
            onPress={() => router.push('/drops')}
             style={({ pressed }) => [
               styles.browseProductsLink,
               {
                 backgroundColor: pressed || browseHovered ? colors.sageButtonHover : 'transparent',
                 borderColor: pressed || browseHovered ? colors.sageButton : 'transparent',
               },
             ]}
          >
            {({ pressed }) => (
               <Text style={[styles.sectionTitle, { color: pressed || browseHovered ? colors.descriptionForest : colors.primary, textShadowColor: colors.addButtonOrangePinkGlow, textShadow: `0 0 ${browseHovered || pressed ? 5 : 3}px ${colors.addButtonOrangePinkGlow}` } as any]}>
                Browse All Products
              </Text>
            )}
          </Pressable>
           <LinearGradient
             colors={[colors.orangeLight, colors.lavenderLight, colors.infoBlueAlt, colors.sageButton]}
             end={{ x: 1, y: 0.5 }}
             start={{ x: 0, y: 0.5 }}
             style={styles.collectionDivider}
           />
             </View>

      {productsQuery.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : featuredProduct ? (
        <ProductTile product={featuredProduct} />
      ) : (
        <View style={[
          styles.loading, 
          { 
            backgroundColor: colors.muted,
            borderRadius: colors.radius,
            borderBottomWidth: 3,
            borderRightWidth: 3,
            borderColor: colors.secondary,
          }
        ]}>
          <Text style={[styles.emptyCopy, { color: colors.foreground }]}>The next cure is being prepared.</Text>
        </View>
      )}

      <LinearGradient
        colors={[colors.sageButtonHover, colors.titleLavender, colors.card]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[
        styles.comingSoon, 
        { 
          borderRadius: colors.radius,
          borderWidth: 1,
             borderColor: colors.descriptionBorder,
             shadowColor: colors.orangeDark,
          shadowOffset: { width: 3, height: 3 },
             shadowOpacity: 0.2,
          shadowRadius: 0,
             boxShadow: `0 0 0 1px ${colors.textBoxDarkMagenta}, 0 2px 8px ${colors.textBoxMagentaGlow}`,
        }
        ]}
      >
        <View style={styles.lavenderStripe} pointerEvents="none">
          <View style={[styles.lavenderStripeLight, { backgroundColor: colors.lavenderLight }]} />
          <View style={[styles.lavenderStripeDeep, { backgroundColor: colors.lavenderDeep }]} />
        </View>
        <Text style={[styles.eyebrow, { color: colors.foreground }]}>UPCOMING</Text>
        <Text style={[styles.comingTitle, { color: colors.primary }]}>Organic flower,{'\n'}grown slow.</Text>
        <Text style={[styles.comingCopy, { color: colors.foreground }]}>
          Preserve your place for the next farm-to-table flower drop.
        </Text>
        <View style={[styles.sprout, { borderColor: colors.secondary }]}>
          <View style={[styles.leaf, styles.leftLeaf, { backgroundColor: colors.foreground }]} />
          <View style={[styles.leaf, styles.rightLeaf, { backgroundColor: colors.secondary }]} />
        </View>
      </LinearGradient>

      <View style={styles.promise}>
        <Feather color={colors.foreground} name="shield" size={18} />
        <Text style={[styles.promiseText, { color: colors.foreground }]}>
          21+ only. Available exclusively where permitted. Grown from seed, farm to table.
        </Text>
      </View>

      <View
        style={[
          styles.newsletterBox,
          {
            backgroundColor: colors.listingBackground,
             borderColor: colors.descriptionBorder,
             boxShadow: `0 0 0 1px ${colors.textBoxDarkMagenta}, 0 2px 8px ${colors.textBoxMagentaGlow}`,
          },
        ]}
      >
        <Text style={[styles.newsletterEyebrow, { color: colors.descriptionPurple }]}>LATEST UPDATES</Text>
        <Text style={[styles.newsletterTitle, { color: colors.productTitleText }]}>Stay close to the garden.</Text>
        <Text style={[styles.newsletterCopy, { color: colors.descriptionForest }]}>
          Get first word on new drops, limited batches, and upcoming flower.
        </Text>
        <TextInput
          accessibilityLabel="Email address for latest updates"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!subscribe.isPending}
          keyboardType="email-address"
          onChangeText={(value) => {
            setNewsletterEmail(value);
            if (newsletterMessage) setNewsletterMessage('');
          }}
          onSubmitEditing={handleNewsletterSubmit}
          placeholder="Enter your email"
          placeholderTextColor={colors.descriptionCaramel}
          returnKeyType="done"
          style={[
            styles.newsletterInput,
            {
              backgroundColor: colors.background,
               borderColor: colors.descriptionBorder,
              color: colors.descriptionForest,
                shadowColor: colors.orangeDark,
                shadowOpacity: 0.28,
               shadowRadius: 3,
                boxShadow: `0 0 0 1px ${colors.textBoxDarkMagenta}, 0 1px 5px ${colors.textBoxMagentaGlow}`,
            },
          ]}
          value={newsletterEmail}
        />
        <Pressable
          accessibilityLabel="Subscribe for latest updates"
          disabled={subscribe.isPending}
          onPress={handleNewsletterSubmit}
          style={({ pressed }) => [
            styles.newsletterButton,
            {
              backgroundColor: pressed ? colors.magenta : colors.descriptionForest,
              borderColor: pressed ? colors.magenta : colors.darkMagenta,
              opacity: subscribe.isPending ? 0.68 : 1,
            },
          ]}
        >
          {subscribe.isPending ? (
            <ActivityIndicator color={colors.ctaHoverOrange} size="small" />
          ) : (
            <Text style={[styles.newsletterButtonText, { color: colors.background }]}>Subscribe</Text>
          )}
        </Pressable>
        {newsletterMessage ? (
          <Text accessibilityLiveRegion="polite" style={[styles.newsletterMessage, { color: colors.descriptionForest }]}>
            {newsletterMessage}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.contactBox,
          {
            backgroundColor: colors.listingBackground,
            borderColor: colors.descriptionBorder,
            boxShadow: `0 0 0 1px ${colors.textBoxDarkMagenta}, 0 2px 8px ${colors.textBoxMagentaGlow}`,
          },
        ]}
      >
        <Text style={[styles.newsletterEyebrow, { color: colors.descriptionPurple }]}>QUESTIONS &amp; HELP</Text>
        <Text style={[styles.newsletterTitle, { color: colors.productTitleText }]}>Talk with Our Team.</Text>
        <Text style={[styles.newsletterCopy, { color: colors.descriptionForest }]}>
          Ask about orders, products, eligibility, or anything else. We’ll open your email app with the message ready to send.
        </Text>
        <Text style={[styles.contactEmail, { color: colors.descriptionPurple }]}>help@seedtotable.com</Text>
        <TextInput
          accessibilityLabel="Your name"
          onChangeText={setContactName}
          placeholder="Your name"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.newsletterInput, { backgroundColor: colors.background, borderColor: colors.descriptionBorder, color: colors.descriptionForest }]}
          value={contactName}
        />
        <TextInput
          accessibilityLabel="Your email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setContactEmail}
          placeholder="Your email"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.newsletterInput, { backgroundColor: colors.background, borderColor: colors.descriptionBorder, color: colors.descriptionForest }]}
          value={contactEmail}
        />
        <TextInput
          accessibilityLabel="Your question"
          multiline
          onChangeText={setContactQuestion}
          placeholder="How can we help?"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.newsletterInput, styles.contactInput, { backgroundColor: colors.background, borderColor: colors.descriptionBorder, color: colors.descriptionForest }]}
          value={contactQuestion}
        />
        <Pressable
          accessibilityRole="button"
          onPress={handleContactSubmit}
          style={({ pressed }) => [
            styles.newsletterButton,
            {
              backgroundColor: pressed ? colors.magenta : colors.descriptionForest,
              borderColor: pressed ? colors.magenta : colors.darkMagenta,
            },
          ]}
        >
          <Text style={[styles.newsletterButtonText, { color: colors.background }]}>Email Questions &amp; Help</Text>
          <Feather color={colors.background} name="send" size={14} />
        </Pressable>
        {contactMessage ? (
          <Text accessibilityLiveRegion="polite" style={[styles.newsletterMessage, { color: colors.descriptionForest }]}>
            {contactMessage}
          </Text>
        ) : null}
      </View>
      <BackToTopButton onPress={() => scrollRef.current?.scrollTo({ animated: true, y: 0 })} />
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageGradient: { flex: 1 },
  container: { flexGrow: 1, gap: 18, padding: 14, paddingBottom: 112, paddingTop: 14 },
  hero: { overflow: 'hidden', padding: 12 },
  heroContent: { position: 'relative', zIndex: 1 },
  heroLead: { alignItems: 'center', gap: 8 },
  heroLeadCopy: { alignSelf: 'center', minWidth: 0, width: '100%' },
  heroLeadMark: { alignSelf: 'center', marginBottom: 2 },
  heroImageFrame: { borderRadius: 10, elevation: 3, height: 116, marginTop: 14, overflow: 'hidden', position: 'relative', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 6, width: '100%' },
  heroImageHoverWash: { ...StyleSheet.absoluteFillObject },
  heroImageDeal: { alignItems: 'center', backgroundColor: 'rgba(244, 233, 242, 0.86)', borderRadius: 8, bottom: 10, left: 10, paddingHorizontal: 10, paddingVertical: 7, position: 'absolute', right: 10 },
  heroImageDealText: { fontFamily: 'Georgia', fontSize: 11, fontWeight: '900', lineHeight: 15, textAlign: 'center' },
  heroImage: { height: '100%', opacity: 0.92, width: '100%' },
  eyebrow: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  heroEyebrow: { textAlign: 'center' },
  heroTitle: { fontFamily: 'Georgia', fontSize: 21, fontWeight: '900', letterSpacing: -1, lineHeight: 26, marginTop: 7, textAlign: 'center' },
  heroTitleCompact: { fontSize: 17, letterSpacing: -0.45, lineHeight: 22 },
  heroTitleItalic: { fontSize: 18, fontStyle: 'italic', fontWeight: '400', lineHeight: 23 },
  heroTitleItalicCompact: { fontSize: 15, lineHeight: 20 },
  heroCopy: { fontFamily: 'Georgia', fontSize: 12, lineHeight: 17, marginTop: 12, maxWidth: 336 },
  heroCopyLead: { fontWeight: '400' },
  heroRule: { height: 2, marginTop: 12, width: 38 },
  dropText: { fontFamily: 'Georgia', fontSize: 11, fontWeight: '900', letterSpacing: 1.1, lineHeight: 15, marginTop: 10 },
  collectionHeader: { alignItems: 'flex-start', gap: 8 },
  featuredTitle: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '900', lineHeight: 27 },
  collectionLiveText: { fontFamily: 'Georgia', fontSize: 11, fontWeight: '800', letterSpacing: 1.25, lineHeight: 15, maxWidth: '100%', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8, textTransform: 'uppercase' },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 28, fontWeight: '900', lineHeight: 33, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 7 },
  browseProductsLink: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  collectionDivider: { alignSelf: 'stretch', height: 2, marginTop: 2, opacity: 0.92 },
  linkButton: { alignItems: 'center', flexDirection: 'row', gap: 6, minHeight: 44, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1 },
  link: { fontFamily: 'Georgia', fontSize: 13, fontWeight: '700' },
  thumbnailSection: { gap: 5 },
  thumbnailHeading: { fontFamily: 'Georgia', fontSize: 20, lineHeight: 24, marginBottom: 6 },
  thumbnailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  thumbnail: { borderRadius: 9, borderWidth: 1, elevation: 2, height: 120, overflow: 'hidden', position: 'relative', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.34, shadowRadius: 0, width: '31.5%' },
  thumbnailImage: { height: '100%', width: '100%' },
  thumbnailTone: { ...StyleSheet.absoluteFillObject },
  thumbnailHoverTint: { ...StyleSheet.absoluteFillObject },
  thumbnailHoverRainbow: { ...StyleSheet.absoluteFillObject },
  thumbnailInnerBorder: { ...StyleSheet.absoluteFillObject, borderWidth: 1, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.46, shadowRadius: 3 },
    thumbnailBadge: { left: 7, position: 'absolute', right: 7, top: 7 },
    thumbnailBottomGradient: { bottom: 0, height: '38%', left: 0, position: 'absolute', right: 0 },
  thumbnailBadgeText: { alignSelf: 'flex-start', backgroundColor: 'rgba(245, 232, 206, 0.9)', fontFamily: 'Georgia', fontSize: 9, fontWeight: '800', letterSpacing: 0.7, paddingHorizontal: 6, paddingVertical: 5 },
  thumbnailLabel: { borderTopWidth: 1, bottom: 0, left: 0, minHeight: 36, paddingHorizontal: 6, paddingVertical: 5, position: 'absolute', right: 0, zIndex: 20 },
   thumbnailLabelGradient: { bottom: 0, left: 0, right: 0, top: 0 },
   thumbnailNamePlate: { alignSelf: 'flex-start', backgroundColor: 'transparent', maxWidth: '100%', paddingHorizontal: 2, paddingVertical: 1, position: 'relative', zIndex: 1 },
    thumbnailLabelText: { flexShrink: 1, fontFamily: 'Georgia', fontSize: 11, fontWeight: '900', letterSpacing: 0.2, lineHeight: 13, maxWidth: '100%' },
  loading: { alignItems: 'center', justifyContent: 'center', minHeight: 220 },
  emptyCopy: { fontFamily: 'Georgia', fontSize: 13, textAlign: 'center' },
  comingSoon: { elevation: 2, minHeight: 160, overflow: 'hidden', padding: 16, position: 'relative', shadowColor: '#765990', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.24, shadowRadius: 7 },
  lavenderStripe: { flexDirection: 'row', height: 7, left: 0, position: 'absolute', right: 0, top: 0 },
  lavenderStripeLight: { flex: 1 },
  lavenderStripeDeep: { flex: 1 },
  comingTitle: { fontFamily: 'Georgia', fontSize: 27, lineHeight: 30, marginTop: 11 },
  comingCopy: { fontFamily: 'Georgia', fontSize: 12, lineHeight: 18, marginTop: 11, maxWidth: 205 },
  sprout: { borderTopWidth: 2, bottom: 24, height: 54, position: 'absolute', right: 30, width: 2 },
  leaf: { borderRadius: 30, height: 31, position: 'absolute', top: -28, width: 18 },
  leftLeaf: { right: 1, transform: [{ rotate: '-40deg' }] },
  rightLeaf: { left: 1, transform: [{ rotate: '40deg' }] },
  promise: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, paddingHorizontal: 4 },
  promiseText: { flex: 1, fontFamily: 'Georgia', fontSize: 11, lineHeight: 17 },
  newsletterBox: { borderRadius: 10, borderWidth: 1, gap: 7, overflow: 'hidden', padding: 12, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.24, shadowRadius: 4 },
  contactBox: { borderRadius: 10, borderWidth: 1, gap: 7, overflow: 'hidden', padding: 12, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.24, shadowRadius: 4 },
  contactEmail: { fontFamily: 'Georgia', fontSize: 11, letterSpacing: 0.4 },
  contactInput: { minHeight: 92, textAlignVertical: 'top' },
  newsletterEyebrow: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  newsletterTitle: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '900', lineHeight: 27 },
  newsletterCopy: { fontFamily: 'Georgia', fontSize: 12, lineHeight: 18 },
  newsletterInput: { borderRadius: 6, borderWidth: 1, fontFamily: 'Georgia', fontSize: 13, minHeight: 44, paddingHorizontal: 12, paddingVertical: 9 },
  newsletterButton: { alignItems: 'center', borderRadius: 6, borderWidth: 1, minHeight: 44, justifyContent: 'center', overflow: 'hidden', paddingHorizontal: 16, paddingVertical: 9 },
  newsletterButtonText: { fontFamily: 'Georgia', fontSize: 13, fontWeight: '900', letterSpacing: 0.8 },
  newsletterMessage: { fontFamily: 'Georgia', fontSize: 11, fontStyle: 'italic', lineHeight: 16 },
});
