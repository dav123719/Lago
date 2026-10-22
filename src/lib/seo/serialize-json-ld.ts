/** Keep structured data inside its script element, even when CMS text contains HTML. */
export function serializeJsonLd(value: object): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
