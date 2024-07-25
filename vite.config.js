import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // ...
  base: "/bobross21346.github.io",
  plugins: [react()],
})