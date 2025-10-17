import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  allowedHosts:[
    'https://script.google.com/macros/s/AKfycbwdvpG6hlaKjLt1U5pcYhCMGl36k81WJEalTqp3UQGuAEZc2V_O7FQGYneFporcEcd1og/exec'
  ]
})
