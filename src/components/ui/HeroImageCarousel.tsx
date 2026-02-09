'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface HeroImageCarouselProps {
  images: string[]
  interval?: number
}

export function HeroImageCarousel({ images, interval = 5000 }: HeroImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval])

  return (
    <div className="absolute inset-0">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt={`Hero image ${index + 1}`}
            fill
            // PERFORMANCE: Only first image has priority for LCP optimization
            // Other images lazy load to reduce initial page weight
            priority={index === 0}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="object-cover scale-105 animate-[scaleIn_1.5s_ease-out_forwards]"
            // PERFORMANCE: Responsive sizes prevent mobile from downloading desktop-sized images
            sizes="100vw"
            quality={index === 0 ? 80 : 70} // PERFORMANCE: Reduced quality to save ~50KB on hero images
            fetchPriority={index === 0 ? 'high' : 'low'} // Explicit fetch priority for better LCP
          />
        </div>
      ))}
    </div>
  )
}

