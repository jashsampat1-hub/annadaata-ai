import confetti from 'canvas-confetti';

export function triggerRescueConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#10b981', '#34d399', '#059669']
  });

  fire(0.2, {
    spread: 60,
    colors: ['#f59e0b', '#fbbf24', '#d97706']
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#06b6d4', '#22d3ee', '#10b981']
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#ffffff', '#a7f3d0']
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#10b981', '#f59e0b']
  });
}
