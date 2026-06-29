Interaction Plan: "How It Works" (Sticky Phone UI)

1. Core Layout Architecture

The Scroll Track: Create a <section> with h-[300vh] to give the user enough scroll distance to trigger the 3 stages comfortably.

The Sticky Grid: Inside the section, use position: sticky and top-0 with a 2-column CSS Grid.

Left Column (The Copy): Contains the 3 text steps (e.g., "1. Route Dispatched", "2. Secure Access", "3. Proof of Work"). As the user scrolls, the active step gains 100% opacity and an Electric Cyan highlight, while inactive steps fade to 30% opacity.

Right Column (The Device): Contains a sleek, minimalistic iPhone wireframe (dark mode, glassmorphism borders).

2. The Screen States (Framer Motion UI Swaps)

Instead of heavy video files or actual Mapbox instances, we will build lightweight HTML/Tailwind mockups inside the phone frame. We will use Framer Motion's <AnimatePresence> to crossfade between these screens based on the user's scroll progress (0-33%, 34-66%, 67-100%).

Screen 1: The Live Tracker (0% - 33%)

Visual: A stylized, dark-mode SVG map background (not a real Mapbox load, to save bandwidth). A small "Runner Badge" icon pulses and moves along an SVG dashed line toward a home pin.

Vibe: "Your CurbSitter is on the way."

Screen 2: The Arrival & Details (34% - 66%)

Visual: A sleek iOS-style push notification drops down from the top: "CurbSitter Arrived at 123 Main St." Below it, the screen shows the internal "Runner View" displaying a mock Gate Code and special property instructions.

Vibe: "We handle the security protocols so you don't have to."

Screen 3: Proof of Work (67% - 100%)

Visual: The screen mimics a camera viewfinder snapping a photo of trash bins. Once the "photo" is taken, a green checkmark animates, and an SMS bubble slides up from the bottom: "Service Complete! View your bins here."

Vibe: "Total peace of mind, delivered."

3. Performance & Mobile Responsiveness Guardrails

Mobile Layout: On mobile, the 2-column layout stacks. The phone mockup stays sticky at the top/center of the screen, and the text steps scroll behind or under it.

Asset Optimization: Use pure SVG, Tailwind gradients, and Framer Motion for the UI. Do not use .mp4 or .gif files to ensure instant load times. Provide a static .webp fallback if Framer Motion detects a reduced-motion preference on the user's device.
