/** The chrome (sidebar, topbar) stays monochrome; these three hues mark
 * identity elsewhere. Deliberately not primary/secondary/tertiary — those
 * drive the sidebar/topbar's own neutral active/hover states (see
 * app/globals.css). Bento-style showcase cards get a soft accent tint as a
 * background plus a big low-opacity icon watermark — a step past "accent
 * never fills a background," but still just a tint, not a solid fill. */
export type Accent = 'blue' | 'mint' | 'pink';

export const ACCENT_TEXT: Record<Accent, string> = {
  blue: 'text-accent-blue',
  mint: 'text-accent-mint',
  pink: 'text-accent-pink',
};

export const ACCENT_CHIP_BG: Record<Accent, string> = {
  blue: 'bg-accent-blue/15',
  mint: 'bg-accent-mint/15',
  pink: 'bg-accent-pink/15',
};

export const ACCENT_BORDER: Record<Accent, string> = {
  blue: 'group-hover/card:border-accent-blue/60',
  mint: 'group-hover/card:border-accent-mint/60',
  pink: 'group-hover/card:border-accent-pink/60',
};

/** Soft tinted card surface — a wash of the accent, not a solid fill. In dark
 * mode the accent hues themselves turn pastel/light (see :root.dark below),
 * so the same 10% wash reads as barely-there against a near-black card —
 * bumped to 20% there to keep the tint actually visible. */
export const ACCENT_CARD_BG: Record<Accent, string> = {
  blue: 'bg-accent-blue/10 dark:bg-accent-blue/28',
  mint: 'bg-accent-mint/10 dark:bg-accent-mint/28',
  pink: 'bg-accent-pink/10 dark:bg-accent-pink/28',
};

/** Static (non-hover) card border, slightly stronger than the tint. */
export const ACCENT_CARD_BORDER: Record<Accent, string> = {
  blue: 'border-accent-blue/25',
  mint: 'border-accent-mint/25',
  pink: 'border-accent-pink/25',
};

/** Large decorative icon sitting low-opacity in the card, behind the copy. */
export const ACCENT_WATERMARK: Record<Accent, string> = {
  blue: 'text-accent-blue/20',
  mint: 'text-accent-mint/20',
  pink: 'text-accent-pink/20',
};

/** Solid vivid block, as a two-stop gradient (Figma-reference bento style
 * pushed a bit further) rather than a flat fill. Pairs with BLOCK_INK, not
 * ACCENT_TEXT: the block already carries the color, so the copy on top
 * goes pitch black instead of accent-colored. */
export const ACCENT_BLOCK_GRADIENT: Record<Accent, string> = {
  blue: 'bg-gradient-to-br from-block-blue to-block-blue-to',
  mint: 'bg-gradient-to-br from-block-mint to-block-mint-to',
  pink: 'bg-gradient-to-br from-block-pink to-block-pink-to',
};

/** Pitch black — literal, not `on-surface`, since it must stay black on a
 * light pastel block regardless of theme. Used for title/body. */
export const BLOCK_INK = 'text-[#000000]';

/** The CTA's own deep accent ink — distinct from BLOCK_INK so the action
 * reads as colored, not as plain black text. Fixed (not theme-dependent),
 * same reasoning as the block fill: contrast is against the block, not the
 * page. */
export const ACCENT_BLOCK_CTA: Record<Accent, string> = {
  blue: 'text-block-ink-blue',
  mint: 'text-block-ink-mint',
  pink: 'text-block-ink-pink',
};

/** Black at low opacity, for a watermark sitting on a solid block — an
 * accent-colored icon would vanish against a same-hue block background. */
export const BLOCK_WATERMARK = 'text-black/15';
