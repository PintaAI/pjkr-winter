"use client";
import { useEffect, useRef } from 'react';
import Image from 'next/image';

export const MountainParallax = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Cari semua element dengan class `transform-gpu` yang jadi layer
    const layers = parallaxRef.current?.querySelectorAll('.transform-gpu');
    if (!layers || layers.length === 0) return;

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      lastScrollY = window.scrollY;
      if (requestRef.current === null) {
        requestRef.current = requestAnimationFrame(updateParallax);
      }
    };

    const updateParallax = () => {
      layers.forEach((layer, i) => {
        const speed = (i + 1) * 0.1;
        // Kalo scaling dirasa bikin masalah, matiin dulu:
        // const scaleSpeed = i * 0.03; 
        // const scale = 1 + scaleSpeed;
        
        const yPos = -(lastScrollY * speed);
        (layer as HTMLElement).style.transform = `translateY(${yPos}px)`;
        // Kalo mau scale balik, tinggal tambah lagi:
        // (layer as HTMLElement).style.transform = `translateY(${yPos}px) scale(${scale})`;
      });
      requestRef.current = null;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div ref={parallaxRef} className="fixed inset-0 -z-10 h-screen overflow-hidden">
      {/* Desktop Version */}
      <div className="hidden md:block">
        {/* Layer 1 - Background */}
        <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
          <Image
            src="/paralax/background.PNG"
            alt="Background mountains"
            fill
            quality={100}
            sizes="100vw"
            className="object-stretch object-bottom"
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
            className="object-stretch object-bottom"
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
            className="object-stretch object-bottom"
            priority
          />
        </div>

        {/* Layer 4 - Pohon Pinus */}
        <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
          <Image
            src="/paralax/Pohon pinus.PNG"
            alt="Pine trees"
            fill
            quality={100}
            sizes="100vw"
            className="object-stretch object-bottom"
            priority
          />
        </div>
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden">
        <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
          <Image
            src="/paralax-mobile/7.PNG"
            alt="Background layer"
            fill
            quality={100}
            sizes="100vw"
            className="object-stretch object-bottom"
            priority
          />
        </div>

        <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
          <Image
            src="/paralax-mobile/6.PNG"
            alt="Layer 6"
            fill
            quality={100}
            sizes="100vw"
            className="object-stretch object-bottom"
            priority
          />
        </div>
        
        <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
          <Image
            src="/paralax-mobile/5.PNG"
            alt="Layer 5"
            fill
            quality={100}
            sizes="100vw"
            className="object-stretch object-bottom"
            priority
          />
        </div>
        
        <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
          <Image
            src="/paralax-mobile/4.PNG"
            alt="Layer 4"
            fill
            quality={100}
            sizes="100vw"
            className="object-stretch object-bottom"
            priority
          />
        </div>
        
        <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
          <Image
            src="/paralax-mobile/3.PNG"
            alt="Layer 3"
            fill
            quality={100}
            sizes="100vw"
            className="object-stretch object-bottom"
            priority
          />
        </div>
        
        <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
          <Image
            src="/paralax-mobile/2.PNG"
            alt="Layer 2"
            fill
            quality={100}
            sizes="100vw"
            className="object-stretch object-bottom"
            priority
          />
        </div>
        
        <div className="absolute inset-0 h-[120vh] transform-gpu will-change-transform">
          <Image
            src="/paralax-mobile/1.PNG"
            alt="Front layer"
            fill
            quality={100}
            sizes="100vw"
            className="object-stretch object-bottom"
            priority
          />
        </div>
      </div>
    </div>
  );
};
