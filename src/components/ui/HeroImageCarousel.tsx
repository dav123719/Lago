'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface HeroImageCarouselProps {
  images: string[]
  interval?: number
}

export function HeroImageCarousel({ images, interval = 5000 }: HeroImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const currentIndexRef = useRef(0)
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      const next = (currentIndexRef.current + 1) % images.length
      setPreviousIndex(currentIndexRef.current)
      currentIndexRef.current = next
      setCurrentIndex(next)
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
      transitionTimeout.current = setTimeout(() => setPreviousIndex(null), 1100)
    }, interval)

    return () => {
      clearInterval(timer)
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
    }
  }, [images.length, interval])

  const nextIndex = (currentIndex + 1) % images.length

  return (
    <div className="absolute inset-0">
      {images.map((src, index) => {
        // Keep only the active slide, its upcoming slide, and the outgoing
        // slide during the crossfade mounted. This avoids downloading every
        // full-screen image during initial page load.
        if (index !== currentIndex && index !== nextIndex && index !== previousIndex) return null

        return (
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
            priority={index === currentIndex}
            loading={index === currentIndex || index === nextIndex ? 'eager' : 'lazy'}
            className="object-cover scale-105 animate-[scaleIn_1.5s_ease-out_forwards]"
            // PERFORMANCE: Responsive sizes prevent mobile from downloading desktop-sized images
            sizes="100vw"
            quality={index === 0 ? 80 : 70} // PERFORMANCE: Reduced quality to save ~50KB on hero images
            fetchPriority={index === currentIndex ? 'high' : 'low'} // Prioritize the active LCP image
          />
        </div>
        )
      })}
    </div>
  )
}

