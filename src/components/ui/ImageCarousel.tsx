'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
  autoRotateInterval?: number
  prefersReducedMotion?: boolean
  isVisible?: boolean
}

export function ImageCarousel({
  images,
  alt,
  className = '',
  autoRotateInterval = 5000,
  prefersReducedMotion = false,
  isVisible = false,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only start auto-rotation if visible, not reduced motion, and has multiple images
    if (!isVisible || prefersReducedMotion || images.length <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Start auto-rotation
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, autoRotateInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [images.length, autoRotateInterval, prefersReducedMotion, isVisible])

  // Reset to first image when images change
  useEffect(() => {
    setCurrentIndex(0)
  }, [images])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    // Reset interval when manually navigated (only if visible)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (isVisible && !prefersReducedMotion && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, autoRotateInterval)
    }
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    // Reset interval when manually navigated (only if visible)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (isVisible && !prefersReducedMotion && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, autoRotateInterval)
    }
  }

  if (images.length === 0) return null

  return (
    <div className={`relative group ${className}`}>
      {/* Carousel Container */}
      <div className="relative w-full h-full overflow-hidden">
        {images.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={image}
              alt={`${alt} - ${index + 1}`}
              fill
              className="object-cover"
              // PERFORMANCE: Optimized sizes to match actual display dimensions (65% on desktop, prevents oversizing)
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 65vw"
              // PERFORMANCE: Only first image loads eagerly, others lazy load to reduce initial payload
              priority={index === 0 && false} // Disabled priority for carousel images (below fold)
              loading={index === 0 ? 'eager' : 'lazy'}
              quality={index === 0 ? 75 : 70} // PERFORMANCE: Reduced quality for carousel images to save bandwidth
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          {/* Previous Arrow */}
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 transition-all duration-300 opacity-60 group-hover:opacity-100 hover:opacity-100 hover:scale-110 active:scale-95"
            aria-label="Previous image"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 transition-all duration-300 opacity-60 group-hover:opacity-100 hover:opacity-100 hover:scale-110 active:scale-95"
            aria-label="Next image"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && !prefersReducedMotion && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setCurrentIndex(index)
                // Reset interval when manually clicked (only if visible)
                if (intervalRef.current) {
                  clearInterval(intervalRef.current)
                }
                if (isVisible && !prefersReducedMotion && images.length > 1) {
                  intervalRef.current = setInterval(() => {
                    setCurrentIndex((prev) => (prev + 1) % images.length)
                  }, autoRotateInterval)
                }
              }}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-2 h-2 bg-lago-gold'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

