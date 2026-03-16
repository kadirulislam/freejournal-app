
import typography from '@tailwindcss/typography'

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {}
  },
plugins: [
  require('@tailwindcss/typography'),
  // ... other plugins
],
}