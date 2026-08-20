/**
 * useMotion Composable
 * Unified Apple-Grade Animation Engine
 * Integrates AutoAnimate, Anime.js Spring Physics, Canvas-Confetti, Typed.js, and Vanta Liquid Fog.
 */

(function (window) {
  function useMotion() {
    let vantaEffect = null;

    // 1. Confetti Particle Bursts (Disabled)
    function triggerConfetti() {
      // Confetti disabled per user request
    }

    // 2. iOS Spring Modal Animation
    function animateModalSpring(targetSelector = '.studio-modal-box') {
      if (!window.anime) return;
      window.anime({
        targets: targetSelector,
        scale: [0.88, 1],
        opacity: [0, 1],
        duration: 450,
        easing: 'spring(1, 85, 13, 0)'
      });
    }

    // 3. Adaptive Token Stream Typewriter Effect for Report Generation
    function runTypewriter(targetEl, text, onProgress, onComplete) {
      if (!targetEl || !text) {
        if (onComplete) onComplete();
        return;
      }

      // Tokenize text into chunks (words / characters / punctuation)
      const tokens = [];
      let i = 0;
      while (i < text.length) {
        const char = text[i];
        if (char === '\n') {
          tokens.push('\n');
          i++;
        } else if (/[\s，。！？；：、.,!?;:]/.test(char)) {
          tokens.push(char);
          i++;
        } else {
          // Chunk 1 to 3 characters per token
          const chunkSize = Math.floor(Math.random() * 2) + 1;
          tokens.push(text.slice(i, i + chunkSize));
          i += chunkSize;
        }
      }

      let current = '';
      let tokenIndex = 0;

      function step() {
        if (tokenIndex < tokens.length) {
          const t = tokens[tokenIndex];
          current += t;
          tokenIndex++;
          if (onProgress) onProgress(current);

          let delay = 12;
          if (t === '\n') delay = 45;
          else if (/[。！？!?]/.test(t)) delay = 35;
          else if (/[，；、,;]/.test(t)) delay = 20;

          setTimeout(step, delay);
        } else {
          if (onComplete) onComplete();
        }
      }

      step();
    }

    // 4. Vanta.js Dynamic Ambient Fog Background (Apple Atmosphere)
    function initVantaBackground(targetEl, isDark = false) {
      if (!targetEl || !window.VANTA || !window.VANTA.FOG || !window.THREE) return;

      try {
        if (vantaEffect) vantaEffect.destroy();

        const options = isDark
          ? {
              el: targetEl,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              highlightColor: 0x1e293b,
              midtoneColor: 0x0f172a,
              lowlightColor: 0x020617,
              baseColor: 0x030712,
              blurFactor: 0.85,
              speed: 1.2,
              zoom: 0.9
            }
          : {
              el: targetEl,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              highlightColor: 0xdbeafe,
              midtoneColor: 0xe0e7ff,
              lowlightColor: 0xf1f5f9,
              baseColor: 0xf8fafc,
              blurFactor: 0.75,
              speed: 1.0,
              zoom: 0.9
            };

        vantaEffect = window.VANTA.FOG(options);
      } catch (e) {
        console.warn('Vanta initialization skipped orWebGL unavailable:', e);
      }
    }

    function updateVantaTheme(isDark) {
      if (!vantaEffect) return;
      try {
        if (isDark) {
          vantaEffect.setOptions({
            highlightColor: 0x1e293b,
            midtoneColor: 0x0f172a,
            lowlightColor: 0x020617,
            baseColor: 0x030712
          });
        } else {
          vantaEffect.setOptions({
            highlightColor: 0xdbeafe,
            midtoneColor: 0xe0e7ff,
            lowlightColor: 0xf1f5f9,
            baseColor: 0xf8fafc
          });
        }
      } catch (e) {}
    }

    // 5. AutoAnimate Binder
    function bindAutoAnimate(el) {
      if (el && window.autoAnimate) {
        window.autoAnimate(el, { duration: 250, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
      }
    }

    return {
      triggerConfetti,
      animateModalSpring,
      runTypewriter,
      initVantaBackground,
      updateVantaTheme,
      bindAutoAnimate
    };
  }

  window.useMotion = useMotion;
})(window);
