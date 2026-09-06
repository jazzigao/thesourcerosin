import assert from 'node:assert/strict';
import test from 'node:test';
import colors from '../constants/colors.ts';

const MIN_CONTRAST_RATIO = 4.5;
const BLUE_OVERLAY_TOKENS = ['infoBlue', 'infoBlueAlt', 'infoBlueStrong'];
const SUPPORTED_BASE_SURFACES = ['background', 'card', 'listingGreen', 'listingPurple'];
const COLOR_TOKENS_PATH = 'artifacts/the-source-mobile/constants/colors.ts';
const CONSUMER_PATHS = [
  'artifacts/the-source-mobile/components/ProductTile.tsx',
  'artifacts/the-source-mobile/app/(tabs)/drops.tsx',
];

function parseColor(value) {
  const hexMatch = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1].length === 3
      ? hexMatch[1].split('').map((channel) => channel + channel).join('')
      : hexMatch[1];
    return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  }

  const rgbaMatch = value.match(/^rgba?\(([^)]+)\)$/i);
  assert.ok(rgbaMatch, `Unsupported color value "${value}" in ${COLOR_TOKENS_PATH}`);
  const channels = rgbaMatch[1].split(',').map((channel) => Number.parseFloat(channel.trim()));
  assert.equal(channels.length, 4, `Expected an rgba color in ${COLOR_TOKENS_PATH}: "${value}"`);
  return channels;
}

function composite(foreground, background) {
  const [red, green, blue, alpha] = parseColor(foreground);
  const [backgroundRed, backgroundGreen, backgroundBlue] = parseColor(background);
  return [
    red * alpha + backgroundRed * (1 - alpha),
    green * alpha + backgroundGreen * (1 - alpha),
    blue * alpha + backgroundBlue * (1 - alpha),
  ];
}

function relativeLuminance(rgb) {
  return rgb
    .map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(foreground, overlay, baseSurface) {
  const foregroundLuminance = relativeLuminance(parseColor(foreground));
  const backgroundLuminance = relativeLuminance(composite(overlay, baseSurface));
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

for (const [scheme, palette] of Object.entries({ light: colors.light, dark: colors.dark })) {
  for (const overlayToken of BLUE_OVERLAY_TOKENS) {
    test(`${scheme} ${overlayToken} maintains readable overlay text`, () => {
      for (const surfaceToken of SUPPORTED_BASE_SURFACES) {
        const ratio = contrastRatio(
          palette.infoBlueText,
          palette[overlayToken],
          palette[surfaceToken],
        );
        assert.ok(
          ratio >= MIN_CONTRAST_RATIO,
          [
            `Contrast regression: ${scheme}.${overlayToken} over ${surfaceToken} is ${ratio.toFixed(2)}:1;`,
            `expected at least ${MIN_CONTRAST_RATIO}:1.`,
            `Update ${COLOR_TOKENS_PATH} and review ${CONSUMER_PATHS.join(' and ')}.`,
          ].join(' '),
        );
      }
    });
  }
}