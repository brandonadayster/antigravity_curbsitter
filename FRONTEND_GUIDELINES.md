# FRONTEND_GUIDELINES: Elite Glassmorphism Design Specs

## 1. Visual Token Definitions
* **\\\`bg-background\\\` (Deep Onyx):** \\\`#0A0F1D\\\`
* **\\\`bg-card\\\` (Slate Gray Container):** \\\`#1E2433\\\`
* **\\\`border-glow\\\` (Subtle Border Frame):** \\\`rgba(255, 255, 255, 0.1)\\\`
* **\\\`text-primary\\\` (High Contrast Text):** \\\`#FFFFFF\\\`
* **\\\`text-muted\\\` (Secondary Content layer):** \\\`#9CA3AF\\\`
* **\\\`brand-cyan\\\` (Primary CTA Accents):** \\\`#00FFFF\\\`
* **\\\`brand-neon\\\` (Glow Callout Vectors): \\\`#00E5FF\\\`
* **\\\`brand-alert\\\` (Exception Status Colors):** \\\`#FF4D4D\\\`

## 2. Global Component Interface Specifications

### The GlassCard Layout
\\\`\\\`\\\`tsx
export const GlassCard = ({ children, className }) => (
  <div className={\\\`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl transition-all duration-300 \\\${className}\\\`}>
    {children}
  </div>
);
\\\`\\\`\\\`

### The Neon Action Node
\\\`\\\`\\\`tsx
export const NeonButton = ({ label, onClick, className }) => (
  <button 
    onClick={onClick}
    className={\\\`bg-cyan-400 text-[#0A0F1D] font-extrabold px-6 py-3 rounded-xl hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] active:scale-95 transition-all duration-200 \\\${className}\\\`}
  >
    {label}
  </button>
);
\\\`\\\`\\\`

## 3. Runner Field Interface Constraints
The layout path tracking mobile runner application modules (\\\`/src/app/runner-app/\\\`) must lock screen view targets to vertical responsive constraints (\\\`max-w-md mx-auto\\\`). Do not incorporate side-scrolling tables or hover interactions. Ensure tap target frameworks provide a minimum interaction height profile of \\\`56px\\\` to allow safe operations under moving vehicle variables.
