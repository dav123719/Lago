import Link from 'next/link'
import Image from 'next/image'

interface CardProps {
  title: string
  description?: string
  image?: string
  href?: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'portrait'
  overlay?: boolean
}

const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
}

export function Card({ title, description, image, href, className = '', aspectRatio = 'video', overlay = false }: CardProps) {
  const content = (
    <div className={`group card-hover bg-white rounded-sm overflow-hidden shadow-sm ${className}`}>
      {image && (
        <div className={`img-zoom relative ${aspectRatios[aspectRatio]} bg-lago-cream`}>
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {overlay && (
            <div className="absolute inset-0 bg-lago-charcoal/40 group-hover:bg-lago-charcoal/20 transition-colors duration-300" />
          )}
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-heading font-medium text-lago-charcoal group-hover:text-lago-gold transition-colors">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-lago-stone text-sm line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

// Variant for larger featured cards
interface FeaturedCardProps extends CardProps {
  tag?: string
}

export function FeaturedCard({ title, description, image, href, tag, className = '' }: FeaturedCardProps) {
  const content = (
    <div className={`group relative overflow-hidden rounded-sm ${className}`}>
      <div className="img-zoom aspect-[4/3] md:aspect-video relative bg-lago-cream">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        )}
        <div className="hero-gradient absolute inset-0" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        {tag && (
          <span className="text-lago-gold text-sm font-medium mb-2">{tag}</span>
        )}
        <h3 className="text-xl md:text-2xl font-heading font-medium text-white group-hover:text-lago-gold transition-colors">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-white/80 text-sm md:text-base line-clamp-2 max-w-xl">
            {description}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

