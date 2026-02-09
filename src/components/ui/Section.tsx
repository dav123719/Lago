interface SectionProps {
  children: React.ReactNode
  className?: string
  background?: 'white' | 'cream' | 'sand' | 'charcoal'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  id?: string
}

const backgrounds = {
  white: 'bg-white',
  cream: 'bg-lago-cream',
  sand: 'bg-lago-sand',
  charcoal: 'bg-lago-charcoal text-white',
}

const paddings = {
  none: '',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-20',
  lg: 'py-16 md:py-24 lg:py-32',
}

export function Section({ children, className = '', background = 'white', padding = 'lg', id }: SectionProps) {
  return (
    <section id={id} className={`${backgrounds[background]} ${paddings[padding]} ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {children}
      </div>
    </section>
  )
}

