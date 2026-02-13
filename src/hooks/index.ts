// ============================================
// Hooks Exports
// ============================================

// Original hooks
export { useScrollAnimation, useStaggeredAnimation, useParallax, useMouseFollow } from './useScrollAnimation'
export { useMouseGlow } from './useMouseGlow'

// Performance hooks
export {
  useWebVitals,
  useIntersectionObserver,
  useLazyLoad,
  useResourceLoad,
  usePerformanceMark,
  useIdleCallback,
  useNetworkStatus,
  useDebouncedCallback,
  useThrottledCallback,
} from './usePerformance'

// Accessibility hooks
export {
  useReducedMotion,
  useHighContrast,
  useDarkMode,
  useFocusVisible,
  useKeyboardNavigation,
  useAriaExpanded,
  useAriaHidden,
  useAriaPressed,
  useAriaSelected,
  useUniqueId,
  useDescribedBy,
  useLabelledBy,
  useSkipToContent,
  useScreenReaderAnnouncement,
} from './useA11y'

// Focus management hooks
export {
  useFocusReturn,
  useFocusScope,
  useFocusVisibleState,
  useFocusWithin,
  useAutoFocus,
  useFocusRing,
  useRovingTabIndex,
  useFocusSync,
  useInitialFocus,
} from './useFocusManager'

// Analytics hooks
export {
  usePageView,
  useScrollTracking,
  useTimeOnPage,
  useTrackClick,
  useTrackProductView,
  useTrackAddToCart,
  useTrackCheckout,
  useTrackSearch,
  useTrackConversion,
  useAnalytics,
  useConsent,
} from './useAnalytics'
