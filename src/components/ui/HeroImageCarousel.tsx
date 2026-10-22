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
  const [loadedImages, setLoadedImages] = useState<Set<string>>(() => new Set())
  const [canRotate, setCanRotate] = useState(false)
  const [prepareNext, setPrepareNext] = useState(false)
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstImageLoaded = loadedImages.has(images[0])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setCanRotate(!preference.matches && !document.hidden)
    update()
    preference.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      preference.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  // The first image is the only hero request in the initial HTML. Let it load
  // before warming another full-screen image; a hidden slide must not compete
  // with the LCP resource on a slow connection.
  useEffect(() => {
    if (!firstImageLoaded || !canRotate || images.length <= 1) return
    const timer = setTimeout(() => setPrepareNext(true), 1500)
    return () => clearTimeout(timer)
  }, [firstImageLoaded, canRotate, images.length])

  useEffect(() => {
    if (!canRotate || !prepareNext || images.length <= 1) return
    const timer = setInterval(() => {
      const next = (currentIndex + 1) % images.length
      // Keep the current photograph visible until its replacement is loaded.
      if (!loadedImages.has(images[next])) return
      setPreviousIndex(currentIndex)
      setCurrentIndex(next)
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
      transitionTimeout.current = setTimeout(() => setPreviousIndex(null), 1100)
    }, interval)
    return () => clearInterval(timer)
  }, [canRotate, prepareNext, images, currentIndex, interval, loadedImages])

  useEffect(() => () => {
    if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
  }, [])

  const nextIndex = images.length ? (currentIndex + 1) % images.length : 0

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {images.map((src, index) => {
        const isUpcoming = canRotate && prepareNext && index === nextIndex
        if (index !== currentIndex && !isUpcoming && index !== previousIndex) return null

        return (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={index === 0}
              loading={index === 0 || isUpcoming ? 'eager' : 'lazy'}
              className="object-cover scale-105 animate-[scaleIn_1.5s_ease-out_forwards] motion-reduce:animate-none motion-reduce:transform-none"
              sizes="100vw"
              quality={75}
              fetchPriority={index === 0 ? 'high' : 'low'}
              onLoad={() => setLoadedImages(current => {
                if (current.has(src)) return current
                return new Set(current).add(src)
              })}
            />
          </div>
        )
      })}
    </div>
  )
}
