/**
 * useMotion Composable
 * Unified Apple-Grade Animation Engine
 * Integrates AutoAnimate, Anime.js Spring Physics, Canvas-Confetti, Typed.js, and Vanta Liquid Fog.
 */

(function (window) {
  function useMotion() {
    let vantaEffect = null;

    // 1. Confetti Particle Bursts (Apple Palette)
    function triggerConfetti(mode = 'standard') {
      if (typeof window.confetti !== 'function') return;

      if (mode === 'celebrate') {
        // High energy burst for AI Report Generation
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          colors: ['#007AFF', '#5856D6', '#34C759', '#FF9500', '#AF52DE', '#38BDF8']
        };

        function fire(particleRatio, opts) {
          window.confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
          });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      } else {
        // Subtle burst for copy actions
        window.confetti({
          particleCount: 40,
          spread: 45,
          startVelocity: 35,
          origin: { y: 0.85, x: 0.8 },
          colors: ['#007AFF', '#34C759', '#38BDF8']
        });
      }
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

    // 3. Dynamic Typewriter Effect for Report Generation
    function runTypewriter(targetEl, text, onProgress, onComplete) {
      if (!targetEl || !text) {
        if (onComplete) onComplete();
        return;
      }

      let current = '';
      let index = 0;
      const speed = Math.max(8, Math.min(25, Math.floor(1500 / text.length)));

      const timer = setInterval(() => {
        if (index < text.length) {
          current += text[index];
          index++;
          if (onProgress) onProgress(current);
        } else {
          clearInterval(timer);
          if (onComplete) onComplete();
        }
      }, speed);
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
