'use client'

// ============================================
// NoScript Fallback Component
// ============================================
// Provides fallback content for users with JavaScript disabled

interface NoScriptProps {
  children?: React.ReactNode
  className?: string
}

/**
 * NoScript Component
 * 
 * Renders fallback content for users without JavaScript.
 * Essential for progressive enhancement and accessibility.
 * 
 * @example
 * <NoScript>
 *   <p>This feature requires JavaScript to function.</p>
 * </NoScript>
 */
export function NoScript({ children, className = '' }: NoScriptProps) {
  return (
    <noscript>
      <div className={className}>
        {children || (
          <div className="bg-lago-gold text-lago-black p-4 text-center text-sm">
            JavaScript is disabled. Some features may not work properly.
          </div>
        )}
      </div>
    </noscript>
  )
}

/**
 * NoScriptNavigation
 * Navigation fallback for no-JS users
 */
export function NoScriptNavigation() {
  return (
    <noscript>
      <nav className="bg-lago-dark p-4">
        <ul className="flex flex-col gap-2 text-lago-light">
          <li><a href="/lv" className="hover:text-lago-gold">Sākums</a></li>
          <li><a href="/lv/store" className="hover:text-lago-gold">Veikals</a></li>
          <li><a href="/lv/projects" className="hover:text-lago-gold">Projekti</a></li>
          <li><a href="/lv/contact" className="hover:text-lago-gold">Kontakti</a></li>
        </ul>
      </nav>
    </noscript>
  )
}

/**
 * NoScriptCart
 * Cart fallback for no-JS users
 */
export function NoScriptCart() {
  return (
    <noscript>
      <a 
        href="/lv/cart" 
        className="inline-flex items-center gap-2 px-4 py-2 bg-lago-gold text-lago-black rounded-full"
      >
        Grozs
      </a>
    </noscript>
  )
}

/**
 * NoScriptContactForm
 * Contact form that works without JavaScript
 */
export function NoScriptContactForm() {
  return (
    <noscript>
      <form 
        action="/api/contact" 
        method="POST"
        className="space-y-4 bg-lago-dark p-6 rounded-xl"
      >
        <div>
          <label htmlFor="noscript-name" className="block text-lago-light mb-2">Vārds</label>
          <input
            type="text"
            id="noscript-name"
            name="name"
            required
            className="w-full px-4 py-2 bg-lago-charcoal border border-lago-gray rounded-lg text-lago-light"
          />
        </div>
        <div>
          <label htmlFor="noscript-email" className="block text-lago-light mb-2">E-pasts</label>
          <input
            type="email"
            id="noscript-email"
            name="email"
            required
            className="w-full px-4 py-2 bg-lago-charcoal border border-lago-gray rounded-lg text-lago-light"
          />
        </div>
        <div>
          <label htmlFor="noscript-message" className="block text-lago-light mb-2">Ziņa</label>
          <textarea
            id="noscript-message"
            name="message"
            rows={4}
            required
            className="w-full px-4 py-2 bg-lago-charcoal border border-lago-gray rounded-lg text-lago-light"
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 bg-lago-gold text-lago-black font-medium rounded-full hover:bg-lago-gold-light transition-colors"
        >
          Nosūtīt
        </button>
      </form>
    </noscript>
  )
}

/**
 * NoScriptFilters
 * Filters that work without JavaScript
 */
export function NoScriptFilters({ locale = 'lv' }: { locale?: string }) {
  return (
    <noscript>
      <form method="GET" className="space-y-4">
        <div>
          <label className="block text-lago-light mb-2">Kategorija</label>
          <select name="category" className="w-full px-4 py-2 bg-lago-charcoal border border-lago-gray rounded-lg text-lago-light">
            <option value="">Visas</option>
            <option value="silestone">Silestone</option>
            <option value="dekton">Dekton</option>
            <option value="granite">Granīts</option>
            <option value="marble">Marmors</option>
          </select>
        </div>
        <div>
          <label className="block text-lago-light mb-2">Cena no</label>
          <input
            type="number"
            name="minPrice"
            className="w-full px-4 py-2 bg-lago-charcoal border border-lago-gray rounded-lg text-lago-light"
          />
        </div>
        <div>
          <label className="block text-lago-light mb-2">Cena līdz</label>
          <input
            type="number"
            name="maxPrice"
            className="w-full px-4 py-2 bg-lago-charcoal border border-lago-gray rounded-lg text-lago-light"
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-2 bg-lago-gold text-lago-black font-medium rounded-full hover:bg-lago-gold-light transition-colors"
        >
          Filtrēt
        </button>
      </form>
    </noscript>
  )
}

/**
 * NoScriptLanguageSwitcher
 * Language switcher that works without JavaScript
 */
export function NoScriptLanguageSwitcher({ currentPath = '' }: { currentPath?: string }) {
  return (
    <noscript>
      <div className="flex gap-2">
        <a 
          href={`/lv${currentPath}`}
          className="px-3 py-1 text-sm text-lago-light hover:text-lago-gold transition-colors"
        >
          LV
        </a>
        <a 
          href={`/en${currentPath}`}
          className="px-3 py-1 text-sm text-lago-light hover:text-lago-gold transition-colors"
        >
          EN
        </a>
        <a 
          href={`/ru${currentPath}`}
          className="px-3 py-1 text-sm text-lago-light hover:text-lago-gold transition-colors"
        >
          RU
        </a>
      </div>
    </noscript>
  )
}

/**
 * NoScriptSearch
 * Search form that works without JavaScript
 */
export function NoScriptSearch() {
  return (
    <noscript>
      <form action="/lv/store" method="GET" className="flex gap-2">
        <input
          type="search"
          name="search"
          placeholder="Meklēt..."
          className="flex-1 px-4 py-2 bg-lago-charcoal border border-lago-gray rounded-lg text-lago-light placeholder-lago-muted"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-lago-gold text-lago-black rounded-lg hover:bg-lago-gold-light transition-colors"
        >
          Meklēt
        </button>
      </form>
    </noscript>
  )
}
