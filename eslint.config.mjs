import next from 'eslint-config-next/core-web-vitals';
export default [...next, {
  ignores: ['dist/**', 'node_modules/**'],
  rules: {
    'react-hooks/set-state-in-effect': 'warn',
    'react-hooks/preserve-manual-memoization': 'warn',
    'react-hooks/immutability': 'warn',
    'react-hooks/purity': 'warn',
    'react-hooks/static-components': 'warn',
  },
}];
