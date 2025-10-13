'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function AnimatedTitle() {
  const title = 'Image Scramble';
  const [shuffledTitle, setShuffledTitle] = useState(title.split(''));
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setShuffledTitle(
          title.split('').sort(() => (Math.random() > 0.5 ? 1 : -1))
        );
      }, 500); // Halfway through the animation
      setTimeout(() => setIsAnimating(false), 1000); // End of animation
    }, 3000);

    return () => clearInterval(interval);
  }, [title]);

  return (
    <h1 className="text-4xl font-bold mb-8 text-primary flex justify-center overflow-hidden">
      {shuffledTitle.map((char, index) => (
        <span
          key={index}
          className={cn(
            'inline-block',
            isAnimating && 'animate-shuffle'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
}
