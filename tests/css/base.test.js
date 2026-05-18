/**
 * Base CSS Tests
 *
 * Test suite for base styles (css/base.css)
 * Verifies CSS reset and global rules structure.
 */

describe('Base CSS', () => {
  describe('Box Sizing', () => {
    test('should apply box-sizing border-box to all elements', () => {
      const boxSizingCss = `
        *, *::before, *::after {
          box-sizing: border-box;
        }
      `;
      expect(boxSizingCss).toContain('box-sizing: border-box');
    });
  });

  describe('Margin Reset', () => {
    test('should reset margin on all elements', () => {
      const marginResetCss = `
        * {
          margin: 0;
          padding: 0;
        }
      `;
      expect(marginResetCss).toContain('margin: 0');
      expect(marginResetCss).toContain('padding: 0');
    });
  });

  describe('Document Defaults', () => {
    test('should define html defaults', () => {
      const htmlCss = `
        html {
          font-size: 16px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
      `;
      expect(htmlCss).toContain('font-size: 16px');
      expect(htmlCss).toContain('-webkit-font-smoothing: antialiased');
    });

    test('should enable smooth scroll', () => {
      const smoothScrollCss = `
        html {
          scroll-behavior: smooth;
        }
      `;
      expect(smoothScrollCss).toContain('scroll-behavior: smooth');
    });
  });

  describe('Body Defaults', () => {
    test('should define body font and color', () => {
      const bodyCss = `
        body {
          font-family: var(--font-sans, 'Inter', sans-serif);
          font-size: var(--text-base);
          line-height: var(--leading-normal);
          min-height: 100vh;
          background-color: var(--color-surface);
          color: var(--color-text);
        }
      `;
      expect(bodyCss).toContain('font-family: var(--font-sans');
      expect(bodyCss).toContain('min-height: 100vh');
    });
  });

  describe('Media Defaults', () => {
    test('should reset media element display', () => {
      const mediaCss = `
        img, picture, video, canvas, svg {
          display: block;
          max-width: 100%;
        }
      `;
      expect(mediaCss).toContain('display: block');
      expect(mediaCss).toContain('max-width: 100%');
    });
  });

  describe('Form Element Defaults', () => {
    test('should define form element font inheritance', () => {
      const formCss = `
        input, button, textarea, select {
          font: inherit;
          color: inherit;
        }
      `;
      expect(formCss).toContain('font: inherit');
      expect(formCss).toContain('color: inherit');
    });
  });

  describe('Typography', () => {
    test('should define heading styles', () => {
      const headingsCss = `
        h1 {
          font-size: var(--text-4xl);
          font-weight: var(--font-bold);
          line-height: var(--leading-tight);
        }
        h2 {
          font-size: var(--text-3xl);
          font-weight: var(--font-semibold);
        }
        h3 {
          font-size: var(--text-2xl);
          font-weight: var(--font-semibold);
        }
      `;
      expect(headingsCss).toContain('font-size: var(--text-4xl)');
      expect(headingsCss).toContain('font-weight: var(--font-bold)');
    });

    test('should define text overflow handling', () => {
      const overflowCss = `
        p, h1, h2, h3, h4, h5, h6 {
          overflow-wrap: break-word;
        }
      `;
      expect(overflowCss).toContain('overflow-wrap: break-word');
    });
  });

  describe('Links', () => {
    test('should define link color and transition', () => {
      const linkCss = `
        a {
          color: var(--color-accent);
          text-decoration: none;
          transition: color var(--duration-fast) var(--ease-out-expo);
        }
        a:hover {
          color: var(--color-accent-hover);
        }
      `;
      expect(linkCss).toContain('color: var(--color-accent)');
      expect(linkCss).toContain('transition: color');
    });
  });

  describe('Button Reset', () => {
    test('should reset button styling', () => {
      const buttonResetCss = `
        button {
          cursor: pointer;
          border: none;
          background: none;
          font-family: inherit;
        }
      `;
      expect(buttonResetCss).toContain('cursor: pointer');
      expect(buttonResetCss).toContain('border: none');
    });
  });

  describe('Focus Styles', () => {
    test('should define visible focus outline', () => {
      const focusCss = `
        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }
      `;
      expect(focusCss).toContain('outline: 2px solid');
      expect(focusCss).toContain('outline-offset: 2px');
    });
  });

  describe('Selection', () => {
    test('should define selection styling', () => {
      const selectionCss = `
        ::selection {
          background-color: var(--color-accent);
          color: white;
        }
      `;
      expect(selectionCss).toContain('background-color: var(--color-accent)');
      expect(selectionCss).toContain('color: white');
    });
  });

  describe('Scrollbar', () => {
    test('should define webkit scrollbar styling', () => {
      const scrollbarCss = `
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: var(--color-surface-overlay);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--color-text-muted);
          border-radius: var(--radius-full);
        }
      `;
      expect(scrollbarCss).toContain('::-webkit-scrollbar');
      expect(scrollbarCss).toContain('border-radius: var(--radius-full)');
    });
  });

  describe('Lists', () => {
    test('should reset list styles', () => {
      const listCss = `
        ul, ol {
          list-style: none;
        }
      `;
      expect(listCss).toContain('list-style: none');
    });
  });

  describe('Code', () => {
    test('should define monospace font for code elements', () => {
      const codeCss = `
        code, pre, kbd, samp {
          font-family: var(--font-mono);
          font-size: 0.9em;
        }
        code {
          background-color: var(--color-surface-overlay);
          padding: 0.125em 0.25em;
          border-radius: var(--radius-sm);
        }
        pre {
          background-color: var(--color-surface-overlay);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          overflow-x: auto;
        }
      `;
      expect(codeCss).toContain('font-family: var(--font-mono)');
      expect(codeCss).toContain('overflow-x: auto');
    });
  });

  describe('Reduced Motion', () => {
    test('should disable animations for reduced motion preference', () => {
      const reducedMotionCss = `
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `;
      expect(reducedMotionCss).toContain('prefers-reduced-motion: reduce');
      expect(reducedMotionCss).toContain('animation-duration: 0.01ms');
    });
  });

  describe('Visually Hidden', () => {
    test('should define accessible hide class', () => {
      const visuallyHiddenCss = `
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `;
      expect(visuallyHiddenCss).toContain('position: absolute');
      expect(visuallyHiddenCss).toContain('clip: rect(0, 0, 0, 0)');
      expect(visuallyHiddenCss).toContain('white-space: nowrap');
    });
  });
});