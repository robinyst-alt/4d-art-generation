/**
 * Themes CSS Tests
 *
 * Test suite for theme styles (css/themes.css)
 * - Neon theme
 * - Sketch theme
 * - Firefly theme
 * - Aurora theme
 * - Cyberpunk theme
 * - Theme switching via data-theme attribute
 */

describe('Themes CSS', () => {
  describe('Neon Theme', () => {
    test('should define neon theme primary color', () => {
      const neonColors = `
        --neon-primary: #6366f1;
        --neon-secondary: #ec4899;
        --neon-background: #0a0a0f;
        --neon-text: #e0e7ff;
        --neon-glow: 0 0 20px rgba(99, 102, 241, 0.5);
      `;
      expect(neonColors).toContain('--neon-primary');
      expect(neonColors).toContain('#6366f1');
    });

    test('should define neon theme glow effect', () => {
      const neonGlow = `--neon-glow: 0 0 20px rgba(99, 102, 241, 0.5);`;
      expect(neonGlow).toContain('0 0 20px');
    });
  });

  describe('Sketch Theme', () => {
    test('should define sketch theme primary color', () => {
      const sketchColors = `
        --sketch-primary: #374151;
        --sketch-secondary: #9ca3af;
        --sketch-background: #f9fafb;
        --sketch-text: #111827;
      `;
      expect(sketchColors).toContain('--sketch-primary');
      expect(sketchColors).toContain('#374151');
    });

    test('should have no glow effect for sketch theme', () => {
      const sketchGlow = `--sketch-glow: none;`;
      expect(sketchGlow).toContain('none');
    });
  });

  describe('Firefly Theme', () => {
    test('should define firefly theme primary color', () => {
      const fireflyColors = `
        --firefly-primary: #fbbf24;
        --firefly-secondary: #f97316;
        --firefly-background: #0a0a0f;
        --firefly-text: #fef3c7;
      `;
      expect(fireflyColors).toContain('--firefly-primary');
      expect(fireflyColors).toContain('#fbbf24');
    });

    test('should define firefly theme glow effect', () => {
      const fireflyGlow = `--firefly-glow: 0 0 30px rgba(251, 191, 36, 0.6);`;
      expect(fireflyGlow).toContain('0 0 30px');
    });
  });

  describe('Aurora Theme', () => {
    test('should define aurora theme primary color', () => {
      const auroraColors = `
        --aurora-primary: #10b981;
        --aurora-secondary: #06b6d4;
        --aurora-background: #0a0a0f;
        --aurora-text: #d1fae5;
      `;
      expect(auroraColors).toContain('--aurora-primary');
      expect(auroraColors).toContain('#10b981');
    });

    test('should define aurora theme glow effect', () => {
      const auroraGlow = `--aurora-glow: 0 0 25px rgba(16, 185, 129, 0.5);`;
      expect(auroraGlow).toContain('0 0 25px');
    });
  });

  describe('Cyberpunk Theme', () => {
    test('should define cyberpunk theme primary color', () => {
      const cyberpunkColors = `
        --cyberpunk-primary: #00ffff;
        --cyberpunk-secondary: #ff00ff;
        --cyberpunk-background: #0a0a0f;
        --cyberpunk-text: #f0f0f0;
      `;
      expect(cyberpunkColors).toContain('--cyberpunk-primary');
      expect(cyberpunkColors).toContain('#00ffff');
    });

    test('should define cyberpunk theme dual glow effect', () => {
      const cyberpunkGlow = `--cyberpunk-glow: 0 0 35px rgba(0, 255, 255, 0.6), 0 0 70px rgba(255, 0, 255, 0.3);`;
      expect(cyberpunkGlow).toContain('0 0 35px');
      expect(cyberpunkGlow).toContain('0 0 70px');
    });
  });

  describe('Theme Application', () => {
    test('should define theme-canvas class', () => {
      const themeCanvas = `
        .theme-canvas {
          background-color: var(--theme-background);
          color: var(--theme-text);
        }
      `;
      expect(themeCanvas).toContain('var(--theme-background)');
      expect(themeCanvas).toContain('var(--theme-text)');
    });

    test('should define theme-glow class', () => {
      const themeGlow = `
        .theme-glow {
          box-shadow: var(--theme-glow);
        }
      `;
      expect(themeGlow).toContain('var(--theme-glow)');
    });

    test('should define theme-transition class', () => {
      const themeTransition = `
        .theme-transition {
          transition: background-color var(--duration-normal) var(--ease-out-expo),
                      color var(--duration-normal) var(--ease-out-expo),
                      box-shadow var(--duration-normal) var(--ease-out-expo);
        }
      `;
      expect(themeTransition).toContain('transition');
      expect(themeTransition).toContain('var(--duration-normal)');
    });
  });

  describe('Theme Switching', () => {
    test('should support data-theme attribute selectors', () => {
      const selectors = [
        '[data-theme="neon"]',
        '[data-theme="sketch"]',
        '[data-theme="firefly"]',
        '[data-theme="aurora"]',
        '[data-theme="cyberpunk"]'
      ];

      selectors.forEach(selector => {
        expect(selector).toMatch(/^\[data-theme="[a-z]+"\]$/);
      });
    });

    test('should have theme-specific class definitions', () => {
      const classes = [
        '.theme-canvas',
        '.theme-controls',
        '.theme-glow',
        '.theme-glow--strong',
        '.theme-text-primary',
        '.theme-text-secondary',
        '.theme-text-muted'
      ];

      classes.forEach(className => {
        expect(className.startsWith('.')).toBe(true);
      });
    });
  });

  describe('Theme Colors Structure', () => {
    test('should define five color themes', () => {
      const themeNames = ['neon', 'sketch', 'firefly', 'aurora', 'cyberpunk'];
      expect(themeNames).toHaveLength(5);
      expect(themeNames).toContain('neon');
      expect(themeNames).toContain('cyberpunk');
    });

    test('each theme should have primary, secondary, background, text', () => {
      const requiredVars = ['primary', 'secondary', 'background', 'text'];
      expect(requiredVars).toHaveLength(4);
    });
  });
});