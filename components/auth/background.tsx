"use client";
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Snowfall from 'react-snowfall';

export const Background = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    let rAF: number | undefined;

    const handleScroll = () => {
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        setScrollPosition(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      if (rAF) cancelAnimationFrame(rAF);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-1 w-screen h-screen overflow-hidden">
      {/* Layer 5 */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ 
          transform: `translateY(${-scrollPosition * 0.1}px)`,
          willChange: 'transform' 
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

      {/* Layer 4 */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ 
          transform: `translateY(${-scrollPosition * 0.3}px)`,
          willChange: 'transform'
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

      {/* Layer 3 */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ 
          transform: `translateY(${-scrollPosition * 0.5}px)`,
          willChange: 'transform'
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

      {/* Snowfall Layer */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ 
          transform: `translateY(${-scrollPosition * 0.6}px)`,
          willChange: 'transform'
        }}
      >
        <Snowfall
          snowflakeCount={80}
          radius={[0.5, 2.0]}
          speed={[0.5, 2.0]}
          wind={[-0.5, 1.0]}
          color="#fff"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        />
      </div>

      {/* Layer 2 */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ 
          transform: `translateY(${-scrollPosition * 0.7}px)`,
          willChange: 'transform'
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

      {/* Layer 1 */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ 
          transform: `translateY(${-scrollPosition * 0.9}px)`,
          willChange: 'transform'
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
