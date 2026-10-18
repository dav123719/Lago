import { describe, expect, it } from 'vitest'
import { serializeJsonLd } from '@/lib/seo/serialize-json-ld'

describe('JSON-LD HTML containment', () => {
  it('keeps malicious CMS content inside one script while preserving its JSON value', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: '</ScRiPt><script>window.compromised=true</script>',
      description: '<!-- <img src=x onerror="alert(1)"> & Latvian āēī',
    }
    const serialized = serializeJsonLd(schema)
    const document = new DOMParser().parseFromString(`<script type="application/ld+json">${serialized}</script><p id="after">safe</p>`, 'text/html')
    expect(document.querySelectorAll('script')).toHaveLength(1)
    expect(document.querySelector('img')).toBeNull()
    expect(document.querySelector('#after')?.textContent).toBe('safe')
    expect(JSON.parse(document.querySelector('script')!.textContent!)).toEqual(schema)
  })
  it('preserves arrays and nested structured data for search engines', () => {
    const schemas = [{ '@type': 'Product', offers: { price: 12, description: 'A < B' } }, { '@type': 'Organization', name: 'LAGO' }]
    expect(JSON.parse(serializeJsonLd(schemas))).toEqual(schemas)
  })
})
