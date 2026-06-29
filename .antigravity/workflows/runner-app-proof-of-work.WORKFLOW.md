---
name: runner-app-proof-of-work
description: "Pipeline for building the mobile-first worker app and photo-verification system."
version: 1.1.0
---

# Runner App & Proof-of-Work Pipeline

This is the core operational engine of CurbSitter. Execution must prioritize mobile responsiveness for field workers.

## Phase 1: Mapbox Route Display
1. **Initialize Runner Layout:** Create the `/runner-app` directory with a strict mobile-first viewport.
2. **Fetch Daily Stops:** Query the `properties` table for active subscriptions scheduled for the current day.
3. **Map Integration:** Use Mapbox to render pins for each stop. Cluster pins to visually demonstrate route density and optimal travel paths.

## Phase 2: The Proof-of-Work Camera Engine
1. **Service Action:** When a worker taps a property pin, open the "Service Stop" UI showing gate codes and property notes.
2. **Camera Integration:** Build an HTML5/Next.js native camera capture component.
3. **Upload Logic:** * Worker snaps a photo of the bins successfully returned to the side of the house/locked gate.
    * Upload the image to Supabase Storage.
    * Save the generated URL to the `service_logs` table with a server-side timestamp.
4. **Automated Notification (The Core Value Add):** * Trigger a backend edge function immediately upon successful photo upload.
    * Send an automated SMS (via Twilio) to the homeowner/property manager: *"Your CurbSitter has securely returned your bins. View verification: [Link to Photo]"*
