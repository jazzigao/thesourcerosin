import { Image } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type BrandMarkProps = {
  style?: StyleProp<ViewStyle>;
  variant?: 'compact' | 'store' | 'hero';
};

export function BrandMark({ style, variant = 'compact' }: BrandMarkProps) {
  return (
    <View
      accessibilityLabel="The Source logo"
      accessible
      style={[
        styles.frame,
        variant === 'hero' ? styles.hero : variant === 'store' ? styles.store : styles.compact,
        style,
      ]}
    >
      <Image
        accessibilityLabel="The Source emblem"
        cachePolicy="memory-disk"
        contentFit="contain"
        priority={variant === 'hero' ? 'high' : 'normal'}
        recyclingKey={`brand-mark-${variant}`}
        source={require('@/assets/images/the-source-brand.png')}
        style={StyleSheet.absoluteFill}
        transition={150}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flexShrink: 0,
  },
  compact: {
    height: 50,
    width: 82,
  },
  store: {
    height: 84,
    width: 138,
  },
  hero: {
    alignSelf: 'flex-start',
    height: 116,
    marginBottom: 0,
    width: 144,
  },
});