/**
 * Font family variables are declared in globals.css and served from public/fonts.
 * Keeping this module as the class-name source avoids loading Google Fonts during
 * the build and keeps the three existing font roles intact.
 */
export const headingFont = {
  variable: 'font-heading',
}

export const bodyFont = {
  variable: 'font-body',
  className: 'font-body',
}

export const buttonFont = {
  variable: 'font-button',
}
