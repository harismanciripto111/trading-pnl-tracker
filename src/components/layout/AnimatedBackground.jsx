import { useCallback } from 'react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[#0a0e1a]" />

      {/* Animated gradient mesh */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(26, 16, 51, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(13, 31, 45, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(240, 185, 11, 0.05) 0%, transparent 40%),
            radial-gradient(ellipse at 60% 40%, rgba(0, 196, 140, 0.03) 0%, transparent 40%)
          `,
        }}
      />

      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-900/20 blur-3xl animate-float" />
      <div
        className="absolute top-3/4 right-1/4 w-80 h-80 rounded-full bg-blue-900/15 blur-3xl animate-float"
        style={{ animationDelay: '-2s' }}
      />
      <div
        className="absolute top-1/2 left-2/3 w-72 h-72 rounded-full bg-gold/5 blur-3xl animate-float"
        style={{ animationDelay: '-4s' }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles (pure CSS) */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </div>

      {/* Top fade for header area */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0e1a]/80 to-transparent" />
    </div>
  );
}

function Particle({ index }) {
  // Deterministic pseudo-random positioning based on index
  const left = ((index * 37 + 13) % 100);
  const top = ((index * 53 + 7) % 100);
  const size = 2 + (index % 3);
  const duration = 8 + (index % 6) * 2;
  const delay = (index % 5) * -2;
  const opacity = 0.1 + (index % 4) * 0.05;

  return (
    <div
      className="absolute rounded-full animate-float"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: index % 3 === 0
          ? 'rgba(240, 185, 11, 0.3)'
          : index % 3 === 1
            ? 'rgba(0, 196, 140, 0.2)'
            : 'rgba(139, 92, 246, 0.2)',
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity,
        boxShadow: `0 0 ${size * 3}px currentColor`,
      }}
    />
  );
}
