import { StyleSheet, Text, View } from 'react-native';

export type BulletItem = {
  text: string;
  color: string;
  label?: string;
  labelColor?: string;
  bullet?: boolean;
  fontStyle?: 'normal' | 'italic';
  fontWeight?: '400' | '800';
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  glowColor?: string;
  glowRadius?: number;
};

export function BulletList({ items }: { items: BulletItem[] }) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={`${item.text}-${index}`} style={styles.row}>
          {item.bullet !== false ? (
             <Text style={[styles.bullet, { color: item.color, textShadowColor: item.glowColor, textShadow: item.glowColor ? `0 0 ${item.glowRadius ?? 2}px ${item.glowColor}` : undefined } as any]}>•</Text>
          ) : null}
          <View style={[styles.textGroup, item.label ? styles.labelGroup : null]}>
            {item.label ? (
              <Text
                style={[
                  styles.label,
                  {
                    color: item.labelColor ?? item.color,
                    textShadowColor: item.glowColor,
                    textShadow: item.glowColor ? `0 0 1px ${item.glowColor}` : undefined,
                  } as any,
                ]}
              >
                {item.label}
              </Text>
            ) : null}
            <Text
              style={[
                styles.text,
                {
                  color: item.color,
                  fontStyle: item.fontStyle ?? 'normal',
                   fontWeight: item.fontWeight ?? '400',
                   fontFamily: item.fontFamily ?? 'Georgia',
                   fontSize: item.fontSize ?? 13,
                   lineHeight: item.lineHeight ?? 19,
                  textShadowColor: item.glowColor,
                  textShadow: item.glowColor ? `0 0 ${item.glowRadius ?? 2}px ${item.glowColor}` : undefined,
                } as any,
              ]}
            >
              {item.text}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 7 },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: 7, width: '100%' },
  bullet: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '900', lineHeight: 20 },
  textGroup: { flex: 1, flexGrow: 1, flexShrink: 1, minWidth: 0, width: 0 },
  labelGroup: { gap: 3 },
  label: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  text: { flexGrow: 1, flexShrink: 1, fontFamily: 'Georgia', fontSize: 13, fontWeight: '400', lineHeight: 19, width: '100%' },
});