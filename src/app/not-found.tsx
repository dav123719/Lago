import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="lv">
      <body className="min-h-screen flex flex-col items-center justify-center bg-lago-cream p-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-heading font-medium text-lago-charcoal mb-4">
            404
          </h1>
          <h2 className="text-2xl font-heading text-lago-charcoal mb-4">
            Lapa nav atrasta
          </h2>
          <p className="text-lago-stone mb-8">
            Diemžēl pieprasītā lapa neeksistē vai ir pārvietota.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/lv"
              className="px-6 py-3 bg-lago-charcoal text-white font-medium rounded-sm hover:bg-lago-stone transition-colors"
            >
              Uz sākumu (LV)
            </Link>
            <Link
              href="/en"
              className="px-6 py-3 border-2 border-lago-charcoal text-lago-charcoal font-medium rounded-sm hover:bg-lago-charcoal hover:text-white transition-colors"
            >
              Go Home (EN)
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}

