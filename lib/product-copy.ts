import type { Product } from '@workspace/api-client-react';

const EXPERIENCE_NOTES: Record<string, string> = {
  'gak-smoovie':
    'Inhale opens with ripe melon, berry skin, and a ribbon of cream. The onset is bright and happy without rushing you. On the exhale, citrus turns soft and floral; relaxation arrives as a silky, contented finish.',
  'high-fructose-corn-syrup':
    'Inhale sweet candy, berry syrup, and hot gas with a savory GMO edge. The onset is warm, euphoric, and appetite-bright. Exhale pulls through diesel, pine, and dark earth, leaving a grounded relaxation that lingers.',
  gmo:
    'Inhale garlic, pepper, and chemical fuel; the onset is bold, happy, and immediate. Exhale turns earthy and dense, with a faint creaminess beneath the gas, easing into deep evening relaxation.',
  fizz:
    'Inhale strawberry, vanilla cream, and guava arrive like a bright first note. The onset feels buoyant and creative. On the exhale, berry cake melts into tropical fruit and a mellow, happy calm.',
  'ogkb-melonade':
    'Inhale creamy cookie funk, sweet melon, and lemon peel; the start is clear, social, and uplifted. Flavor transitions into fuel and soft citrus on the exhale, then settles into earthy, full-body relaxation.',
  'organic-flower':
    'Inhale fresh berry, pine, and damp earth from the whole flower; the onset is calm, happy, and unhurried. Exhale carries a soft creaminess through the greenery, with a clean, grounding relaxation at the finish.',
};

export function getExperienceNotes(product: Product) {
  return (
    EXPERIENCE_NOTES[product.id] ??
    'A small-batch expression with a gentle aromatic opening, layered flavor through the inhale, and a clean lingering finish.'
  );
}