"use client";
import Image from 'next/image';
import { useEffect, useState } from 'react';

export const Background = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 h-screen overflow-hidden">
      {/* Layer 5 - Background (paling belakang) - Paling lambat */}
      <div 
        className="absolute inset-0 h-screen"
        style={{ 
          transform: `translateY(${-scrollPosition * 0.1}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <Image
          src="/paralax/5.png"
          alt="Background Layer"
          fill
          quality={100}
          sizes="100vw"
          className="object-cover object-bottom"
          priority
        />
      </div>

      {/* Layer 4 - Bergerak sedikit lebih cepat */}
      <div 
        className="absolute inset-0 h-screen"
        style={{ 
          transform: `translateY(${-scrollPosition * 0.3}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <Image
          src="/paralax/4.png"
          alt="Mountain Layer 4"
          fill
          quality={100}
          sizes="100vw"
          className="object-cover object-bottom"
          priority
        />
      </div>

      {/* Layer 3 - Kecepatan menengah */}
      <div 
        className="absolute inset-0 h-screen"
        style={{ 
          transform: `translateY(${-scrollPosition * 0.5}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <Image
          src="/paralax/3.png"
          alt="Mountain Layer 3"
          fill
          quality={100}
          sizes="100vw"
          className="object-cover object-bottom"
          priority
        />
      </div>

      {/* Layer 2 - Lebih cepat */}
      <div 
        className="absolute inset-0 h-screen"
        style={{ 
          transform: `translateY(${-scrollPosition * 0.7}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <Image
          src="/paralax/2.png"
          alt="Mountain Layer 2"
          fill
          quality={100}
          sizes="100vw"
          className="object-cover object-bottom"
          priority
        />
      </div>

      {/* Layer 1 - Foreground (paling depan) - Paling cepat */}
      <div 
        className="absolute inset-0 h-screen"
        style={{ 
          transform: `translateY(${-scrollPosition * 0.9}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <Image
          src="/paralax/1.png"
          alt="Foreground Layer"
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
