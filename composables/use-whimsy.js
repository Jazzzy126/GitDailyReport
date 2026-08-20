/**
 * useWhimsy Composable
 * Whimsy Injection System for GitDailyReport
 * Features:
 * 1. Zero-dependency High-Performance Canvas Confetti & Sparkles with prefers-reduced-motion support
 * 2. Smart Loading Quotes Rotator for AI Generation
 * 3. Easter Eggs Engine (Logo Rapid Click Achievement)
 * 4. DevTools Console Geek Art Banner
 */

(function (window) {
  function useWhimsy() {
    const { ref, onMounted, onUnmounted } = window.Vue;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- 1. Zero-dependency Canvas Particle & Confetti Engine ---
    let canvasEl = null;
    let ctx = null;
    let animationFrameId = null;
    let particles = [];

    function ensureCanvas() {
      if (!canvasEl) {
        canvasEl = document.createElement('canvas');
        canvasEl.id = 'whimsy-particle-canvas';
        canvasEl.style.position = 'fixed';
        canvasEl.style.top = '0';
        canvasEl.style.left = '0';
        canvasEl.style.width = '100vw';
        canvasEl.style.height = '100vh';
        canvasEl.style.pointerEvents = 'none';
        canvasEl.style.zIndex = '99999';
        document.body.appendChild(canvasEl);
        ctx = canvasEl.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
      }
    }

    function resizeCanvas() {
      if (!canvasEl) return;
      canvasEl.width = window.innerWidth * window.devicePixelRatio;
      canvasEl.height = window.innerHeight * window.devicePixelRatio;
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    // Trigger full celebratory confetti burst
    function triggerConfetti(originX, originY) {
      if (prefersReducedMotion) return;
      ensureCanvas();

      const startX = originX || window.innerWidth / 2;
      const startY = originY || window.innerHeight * 0.4;
      const colors = ['#0066FF', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#38BDF8', '#F43F5E'];

      const count = 60;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 8 + 4;
        particles.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 4,
          tilt: Math.random() * 10 - 10,
          tiltAngleIncremental: Math.random() * 0.08 + 0.04,
          tiltAngle: 0,
          opacity: 1,
          gravity: 0.18,
          drag: 0.96,
          life: 0,
          maxLife: Math.random() * 40 + 70,
          type: 'confetti'
        });
      }

      if (!animationFrameId) {
        runParticleLoop();
      }
    }

    // Trigger micro sparkles around a target element or coordinate
    function triggerSparkles(elOrX, maybeY) {
      if (prefersReducedMotion) return;
      ensureCanvas();

      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;

      if (typeof elOrX === 'number') {
        startX = elOrX;
        startY = maybeY || window.innerHeight / 2;
      } else if (elOrX && elOrX.getBoundingClientRect) {
        const rect = elOrX.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
      }

      const colors = ['#FFD700', '#FFA500', '#0066FF', '#8B5CF6', '#FFFFFF'];
      for (let i = 0; i < 22; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1.5;
        particles.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 3.5 + 1.5,
          opacity: 1,
          gravity: 0.04,
          drag: 0.94,
          life: 0,
          maxLife: Math.random() * 20 + 35,
          type: 'sparkle'
        });
      }

      if (!animationFrameId) {
        runParticleLoop();
      }
    }

    function runParticleLoop() {
      if (!ctx || !canvasEl) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;

        p.opacity = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.type === 'confetti') {
          p.tiltAngle += p.tiltAngleIncremental;
          p.tilt = Math.sin(p.tiltAngle) * 12;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.tiltAngle);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          // Sparkle star / circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        if (p.life >= p.maxLife || p.opacity <= 0) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(runParticleLoop);
      } else {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }

    // --- 2. Smart Loading Quotes Rotator ---
    let quoteInterval = null;
    let currentQuoteIndex = 0;

    function startQuoteRotation(quotes = [], onUpdateMessage, intervalMs = 2200) {
      stopQuoteRotation();
      if (!quotes || quotes.length === 0) return;
      currentQuoteIndex = Math.floor(Math.random() * quotes.length);
      if (onUpdateMessage) onUpdateMessage(quotes[currentQuoteIndex]);

      quoteInterval = setInterval(() => {
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
        if (onUpdateMessage) onUpdateMessage(quotes[currentQuoteIndex]);
      }, intervalMs);
    }

    function stopQuoteRotation() {
      if (quoteInterval) {
        clearInterval(quoteInterval);
        quoteInterval = null;
      }
    }

    // --- 3. Easter Egg: Logo Rapid Clicker ---
    const isAchievementModalOpen = ref(false);
    let logoClickCount = 0;
    let logoClickTimer = null;

    function handleLogoClick(e) {
      logoClickCount++;
      if (e) triggerSparkles(e.clientX, e.clientY);

      clearTimeout(logoClickTimer);
      logoClickTimer = setTimeout(() => {
        logoClickCount = 0;
      }, 2000);

      if (logoClickCount >= 5) {
        logoClickCount = 0;
        triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
        isAchievementModalOpen.value = true;
      }
    }

    function closeAchievementModal() {
      isAchievementModalOpen.value = false;
    }

    // --- 4. DevTools Console Banner ---
    function printConsoleGeekBanner() {
      const banner = `
%c  ✨ GitDailyReport Studio | 趣味模式已注入 ✨  
%c  提示：连击左上角 Logo 5 次可解锁隐藏极客成就！  
      `;
      console.log(
        banner,
        'background: linear-gradient(135deg, #0066FF, #8B5CF6); color: #fff; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 6px;',
        'color: #0066FF; font-size: 11px; font-weight: bold; margin-top: 4px;'
      );
    }

    return {
      triggerConfetti,
      triggerSparkles,
      startQuoteRotation,
      stopQuoteRotation,
      handleLogoClick,
      isAchievementModalOpen,
      closeAchievementModal,
      printConsoleGeekBanner
    };
  }

  window.useWhimsy = useWhimsy;
})(window);
