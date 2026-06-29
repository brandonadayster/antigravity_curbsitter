# Product Requirements Document (PRD)

## 1. Product Context & Objectives
CurbSitter replaces the operational friction and visual clutter of local solid waste management with an elite, automated subscription engine. The platform provides out-of-state short-term rental (STR) hosts, aging seniors, and strict HOA managers with photo-verified bin service synced precisely to local collection windows. The system must maximize neighborhood customer clustering (route density) while keeping administrative overhead zero via automated customer alerts and edge-case billing.

## 2. Core Operational Mechanics
* **Frictionless Ingestion Engine:** Validates service zones instantly, structures custom property footprints (bins, access rules), optimizes recurring ACH transactions, and deploys a viral waitlist for unserviced pockets.
* **The Field Command Terminal:** A responsive web interface allowing runners to navigate routes, document on-property constraints, upload secure photo confirmation, and execute field-surcharges.
* **Automated Exception Triage:** Real-time generation of customer alerts for blocked driveways, modified gate codes, or overflowing containers—securing zero missed pickups or administrative overhead.

## 3. Quantitative Success Criteria
* **Onboarding Friction:** Complete transaction time from landing hero to verified Stripe receipt must average under 120 seconds.
* **Runner Verification Speed:** Processing, renaming, and uploading a field photo to Supabase storage must execute in under 3.5 seconds over cellular data.
* **Delivery Precision:** Twilio SMS payloads must deliver matching photo tokens within 60 seconds of a runner logging a completed stop.
