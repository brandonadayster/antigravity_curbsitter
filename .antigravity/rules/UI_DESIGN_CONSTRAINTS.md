---
name: UI_DESIGN_CONSTRAINTS
description: Create distinctive, production-grade frontend interfaces with premium UI/UX design styling and feature implementation. Use this skill whenever you build navigation elements, interactive elements - i.e. buttons, dropdowns, form fields, hover states, scrolling and trigger animations, etc.
---

# CurbSitter UI/UX Design Constraints (Version 1.0)

To maintain a competitive edge and premium feel, all generated UI must adhere to these motion and aesthetic rules:

## 1. Motion & Animation Rules
- **Non-Generic Motion:** Avoid standard CSS transitions. All motion must utilize **Framer Motion** with `spring` physics (stiffness: 100, damping: 20) for a weighted, organic feel.
- **Scroll-Linked Reveals:** Use `useScroll` hooks to trigger animations exactly when the user reaches the component, creating a "living page" experience.
- **Staggered Orchestration:** When multiple items appear (e.g., service list), use a 0.1s stagger delay between items.

## 2. Visual Layering (The "Concierge" Aesthetic)
- **Glassmorphism:** Use `backdrop-filter: blur(16px)` combined with a semi-transparent dark background (`rgba(255, 255, 255, 0.05)`) and a thin 1px border (`rgba(255, 255, 255, 0.1)`).
- **Depth:** Dashboard cards must always have a subtle drop-shadow (`shadow-xl`) and a 1px inner border to simulate a "carved" or premium interface look.

## 3. High-Conversion Interaction
- **The "Feel" of Action:** Every button must scale down to 98% on `whileTap`. 
- **Waitlist Exclusivity:** Any waitlist entry must include a "Success" state animation—perhaps a checkmark that draws itself on screen using an SVG path animation—to make the user feel like they just joined a prestigious club.
