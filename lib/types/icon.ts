import type React from 'react';

/**
 * Shape of a Heroicons component. Icons are passed around as components now
 * rather than as icon-font glyph names, so the prop is typed once here.
 */
export type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
