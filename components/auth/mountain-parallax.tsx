"use client";
import { useEffect, useRef } from 'react';
import Image from 'next/image';

export const MountainParallax = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const layers = parallaxRef.current?.children;
    if (!layers) return;

    let lastScrollY = window.pageYOffset;

    const handleScroll = () => {
      lastScrollY = window.pageYOffset;
      if (requestRef.current === null) {
        requestRef.current = requestAnimationFrame(updateParallax);
      }
    };

    const updateParallax = () => {
      Array.from(layers).forEach((layer, i) => {
        const speed = (i + 1) * 0.1; // Adjust for smoother movement
        const scaleSpeed = i * 0.03; // Adjust for less aggressive scaling
        const yPos = -(lastScrollY * speed);
        const scale = 1 + scaleSpeed;
        (layer as HTMLElement).style.transform = `translateY(${yPos}px) scale(${scale})`;
      });
      requestRef.current = null;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div ref={parallaxRef} className="fixed inset-0 -z-10 h-screen overflow-hidden">
      {/* Layer 1 - Background (paling belakang) */}
      <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
        <Image
          src="/paralax/background.PNG"
          alt="Background mountains"
          fill
          quality={100}
          sizes="100vw"
          className="object-cover object-bottom"
          priority
        />
      </div>

      {/* Layer 2 - Gunung Jauh */}
      <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
        <Image
          src="/paralax/gunung jauh.PNG"
          alt="Far mountains"
          fill
          quality={100}
          sizes="100vw"
          className="object-cover object-bottom"
          priority
        />
      </div>

      {/* Layer 3 - Pohon Deket */}
      <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
        <Image
          src="/paralax/pohon deket.PNG"
          alt="Near trees"
          fill
          quality={100}
          sizes="100vw"
          className="object-cover object-bottom"
          priority
        />
      </div>

      {/* Layer 4 - Pohon Pinus (paling depan) */}
      <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
        <Image
          src="/paralax/Pohon pinus.PNG"
          alt="Pine trees"
          fill
          quality={100}
          sizes="100vw"
          className="object-cover object-bottom"
          priority
        />
      </div>
    </div>
  );
};
