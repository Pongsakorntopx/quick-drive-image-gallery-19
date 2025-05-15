import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'sans': ['Kanit', 'Inter', 'sans-serif'],
        'display': ['Noto Sans Thai', 'system-ui', 'sans-serif'],
        'body': ['Sarabun', 'system-ui', 'sans-serif'],
        // Standard fonts
        'roboto': ['Roboto', 'sans-serif'],
        'opensans': ['Open Sans', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'raleway': ['Raleway', 'sans-serif'],
        'ubuntu': ['Ubuntu', 'sans-serif'],
        // Serif fonts
        'playfair': ['Playfair Display', 'serif'],
        'merriweather': ['Merriweather', 'serif'],
        'crimson': ['Crimson Text', 'serif'],
        'lora': ['Lora', 'serif'],
        'roboto-slab': ['Roboto Slab', 'serif'],
        'noto-serif': ['Noto Serif', 'serif'],
        'cormorant': ['Cormorant Garamond', 'serif'],
        // Display fonts
        'bebas': ['Bebas Neue', 'cursive'],
        'archivo-black': ['Archivo Black', 'sans-serif'],
        'anton': ['Anton', 'sans-serif'],
        'passion-one': ['Passion One', 'cursive'],
        'righteous': ['Righteous', 'cursive'],
        // Monospace fonts
        'roboto-mono': ['Roboto Mono', 'monospace'],
        'source-code': ['Source Code Pro', 'monospace'],
        'fira-code': ['Fira Code', 'monospace'],
        // Handwriting fonts
        'caveat': ['Caveat', 'cursive'],
        'pacifico': ['Pacifico', 'cursive'],
        'dancing-script': ['Dancing Script', 'cursive'],
        'indie-flower': ['Indie Flower', 'cursive'],
        'kalam': ['Kalam', 'cursive'],
        'satisfy': ['Satisfy', 'cursive'],
        'great-vibes': ['Great Vibes', 'cursive'],
        'sacramento': ['Sacramento', 'cursive'],
        'shadows-into-light': ['Shadows Into Light', 'cursive'],
        'amatic-sc': ['Amatic SC', 'cursive'],
        'architects-daughter': ['Architects Daughter', 'cursive'],
        'homemade-apple': ['Homemade Apple', 'cursive'],
        'reenie-beanie': ['Reenie Beanie', 'cursive'],
        'rock-salt': ['Rock Salt', 'cursive'],
        'covered-by-your-grace': ['Covered By Your Grace', 'cursive'],
        // Thai fonts
        'prompt': ['Prompt', 'sans-serif'],
        'mitr': ['Mitr', 'sans-serif'],
        'taviraj': ['Taviraj', 'serif'],
        'athiti': ['Athiti', 'sans-serif'],
        'sriracha': ['Sriracha', 'cursive'],
        // Additional modern fonts
        'lexend': ['Lexend', 'sans-serif'],
        'outfit': ['Outfit', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'plus-jakarta-sans': ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        theme1: {
          DEFAULT: "#3b82f6", // Blue
          light: "#93c5fd",
          dark: "#1d4ed8",
        },
        theme2: {
          DEFAULT: "#ef4444", // Red
          light: "#fca5a5",
          dark: "#b91c1c",
        },
        theme3: {
          DEFAULT: "#10b981", // Green
          light: "#6ee7b7",
          dark: "#047857",
        },
        theme4: {
          DEFAULT: "#8b5cf6", // Purple
          light: "#c4b5fd",
          dark: "#6d28d9",
        },
        theme5: {
          DEFAULT: "#f59e0b", // Amber
          light: "#fcd34d",
          dark: "#b45309",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slideshow": {
          "0%": { opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slideshow": "slideshow 5s ease-in-out",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
