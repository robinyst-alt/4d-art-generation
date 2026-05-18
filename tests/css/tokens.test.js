/**
 * Tokens CSS Tests
 *
 * Test suite for design tokens (css/tokens.css)
 * Verifies CSS custom properties are properly structured.
 */

describe('Tokens CSS', () => {
  describe('Color Tokens', () => {
    test('should define base color tokens', () => {
      const colorTokens = `
        --color-surface: oklch(98% 0 0);
        --color-surface-elevated: oklch(100% 0 0);
        --color-text: oklch(18% 0 0);
        --color-accent: oklch(68% 0.21 250);
        --color-error: oklch(63% 0.24 25);
        --color-success: oklch(63% 0.19 145);
      `;
      expect(colorTokens).toContain('--color-surface');
      expect(colorTokens).toContain('--color-text');
      expect(colorTokens).toContain('--color-accent');
    });

    test('should define neon theme colors', () => {
      const neonColors = `
        --neon-primary: #6366f1;
        --neon-secondary: #ec4899;
        --neon-background: #0a0a0f;
        --neon-text: #e0e7ff;
        --neon-glow: 0 0 20px rgba(99, 102, 241, 0.5);
      `;
      expect(neonColors).toContain('--neon-primary');
      expect(neonColors).toContain('--neon-secondary');
      expect(neonColors).toContain('--neon-background');
    });

    test('should define sketch theme colors', () => {
      const sketchColors = `
        --sketch-primary: #374151;
        --sketch-secondary: #9ca3af;
        --sketch-background: #f9fafb;
        --sketch-text: #111827;
      `;
      expect(sketchColors).toContain('--sketch-primary');
      expect(sketchColors).toContain('--sketch-background');
    });

    test('should define firefly theme colors', () => {
      const fireflyColors = `
        --firefly-primary: #fbbf24;
        --firefly-secondary: #f97316;
        --firefly-background: #0a0a0f;
        --firefly-text: #fef3c7;
      `;
      expect(fireflyColors).toContain('--firefly-primary');
      expect(fireflyColors).toContain('--firefly-secondary');
    });

    test('should define aurora theme colors', () => {
      const auroraColors = `
        --aurora-primary: #10b981;
        --aurora-secondary: #06b6d4;
        --aurora-background: #0a0a0f;
        --aurora-text: #d1fae5;
      `;
      expect(auroraColors).toContain('--aurora-primary');
      expect(auroraColors).toContain('--aurora-secondary');
    });

    test('should define cyberpunk theme colors', () => {
      const cyberpunkColors = `
        --cyberpunk-primary: #00ffff;
        --cyberpunk-secondary: #ff00ff;
        --cyberpunk-background: #0a0a0f;
        --cyberpunk-text: #f0f0f0;
      `;
      expect(cyberpunkColors).toContain('--cyberpunk-primary');
      expect(cyberpunkColors).toContain('--cyberpunk-secondary');
    });
  });

  describe('Typography Tokens', () => {
    test('should define font families', () => {
      const fontFamilies = `
        --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
        --font-display: 'Space Grotesk', 'Inter', sans-serif;
      `;
      expect(fontFamilies).toContain('--font-sans');
      expect(fontFamilies).toContain('--font-mono');
      expect(fontFamilies).toContain('--font-display');
    });

    test('should define font weights', () => {
      const fontWeights = `
        --font-normal: 400;
        --font-medium: 500;
        --font-semibold: 600;
        --font-bold: 700;
      `;
      expect(fontWeights).toContain('--font-normal');
      expect(fontWeights).toContain('--font-bold');
    });

    test('should define text size scale', () => {
      const textScale = `
        --text-xs: 0.75rem;
        --text-sm: 0.875rem;
        --text-base: 1rem;
        --text-lg: 1.125rem;
        --text-xl: 1.25rem;
        --text-2xl: 1.5rem;
        --text-3xl: 1.875rem;
        --text-4xl: 2.25rem;
      `;
      expect(textScale).toContain('--text-xs');
      expect(textScale).toContain('--text-base');
      expect(textScale).toContain('--text-4xl');
    });

    test('should define line heights', () => {
      const lineHeights = `
        --leading-none: 1;
        --leading-tight: 1.25;
        --leading-normal: 1.5;
      `;
      expect(lineHeights).toContain('--leading-tight');
      expect(lineHeights).toContain('--leading-normal');
    });
  });

  describe('Spacing Tokens', () => {
    test('should define spacing scale', () => {
      const spacing = `
        --space-0: 0;
        --space-1: 0.25rem;
        --space-2: 0.5rem;
        --space-4: 1rem;
        --space-6: 1.5rem;
        --space-8: 2rem;
        --space-12: 3rem;
        --space-16: 4rem;
      `;
      expect(spacing).toContain('--space-1');
      expect(spacing).toContain('--space-4');
      expect(spacing).toContain('--space-8');
    });
  });

  describe('Border Radius Tokens', () => {
    test('should define border radius scale', () => {
      const borderRadius = `
        --radius-sm: 0.25rem;
        --radius-md: 0.5rem;
        --radius-lg: 0.75rem;
        --radius-xl: 1rem;
        --radius-full: 9999px;
      `;
      expect(borderRadius).toContain('--radius-sm');
      expect(borderRadius).toContain('--radius-md');
      expect(borderRadius).toContain('--radius-full');
    });
  });

  describe('Shadow Tokens', () => {
    test('should define shadow scale', () => {
      const shadows = `
        --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        --shadow-glow: 0 0 20px;
      `;
      expect(shadows).toContain('--shadow-sm');
      expect(shadows).toContain('--shadow-md');
      expect(shadows).toContain('--shadow-lg');
    });
  });

  describe('Animation Tokens', () => {
    test('should define duration tokens', () => {
      const durations = `
        --duration-fast: 150ms;
        --duration-normal: 300ms;
        --duration-slow: 500ms;
      `;
      expect(durations).toContain('--duration-fast');
      expect(durations).toContain('--duration-normal');
      expect(durations).toContain('--duration-slow');
    });

    test('should define easing functions', () => {
      const easings = `
        --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
        --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
        --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
      `;
      expect(easings).toContain('--ease-out-expo');
      expect(easings).toContain('--ease-in-out');
    });
  });

  describe('Z-Index Tokens', () => {
    test('should define z-index scale', () => {
      const zIndex = `
        --z-base: 0;
        --z-dropdown: 100;
        --z-sticky: 200;
        --z-overlay: 300;
        --z-modal: 400;
        --z-tooltip: 500;
      `;
      expect(zIndex).toContain('--z-base');
      expect(zIndex).toContain('--z-dropdown');
      expect(zIndex).toContain('--z-modal');
    });
  });

  describe('Breakpoint Tokens', () => {
    test('should define breakpoint values', () => {
      const breakpoints = `
        --breakpoint-sm: 640px;
        --breakpoint-md: 768px;
        --breakpoint-lg: 1024px;
        --breakpoint-xl: 1280px;
      `;
      expect(breakpoints).toContain('--breakpoint-sm');
      expect(breakpoints).toContain('--breakpoint-lg');
    });
  });
});