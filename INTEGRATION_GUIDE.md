# **CurbSitter: Incremental Integration & Migration Guide**

This document outlines the step-by-step process for introducing our bulletproof edge-case features, STR inspections, and gamified referrals into an existing, partially complete codebase. Follow these steps to prevent breaking working code.

## **Phase 1: Safe Database Schema Migrations**

We will update our existing Supabase/PostgreSQL schema. Run these SQL migrations in your Supabase SQL Editor. They are non-destructive and only append new tables and columns.

### **1.1 Add Referral & Waitlist Support**

\-- Create waitlist table for the Velvet Rope gamification  
CREATE TABLE IF NOT EXISTS public.waitlist (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    email TEXT UNIQUE NOT NULL,  
    zip\_code TEXT NOT NULL,  
    referral\_code TEXT UNIQUE NOT NULL,  
    referred\_by TEXT, \-- Stores the referral\_code of the person who referred them  
    referral\_count INTEGER DEFAULT 0,  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL  
);

\-- Add referral tracking to existing users table  
ALTER TABLE public.users   
ADD COLUMN IF NOT EXISTS referral\_code TEXT UNIQUE,  
ADD COLUMN IF NOT EXISTS referred\_by\_code TEXT,  
ADD COLUMN IF NOT EXISTS referral\_credits\_cents INTEGER DEFAULT 0;

### **1.2 Support Multi-Photo uploads & Exception Logs**

\-- Extend service\_logs to track exceptions, multi-photo payloads, and GPS points  
ALTER TABLE public.service\_logs  
ADD COLUMN IF NOT EXISTS photos TEXT\[\] DEFAULT '{}', \-- Supports up to 50 photos for STR inspections  
ADD COLUMN IF NOT EXISTS exception\_logged BOOLEAN DEFAULT FALSE,  
ADD COLUMN IF NOT EXISTS exception\_type TEXT, \-- 'locked\_gate', 'overflow', 'wildlife', 'blocked'  
ADD COLUMN IF NOT EXISTS exception\_notes TEXT,  
ADD COLUMN IF NOT EXISTS surcharge\_approved BOOLEAN DEFAULT FALSE,  
ADD COLUMN IF NOT EXISTS surcharge\_amount\_cents INTEGER DEFAULT 0,  
ADD COLUMN IF NOT EXISTS gps\_lat NUMERIC,  
ADD COLUMN IF NOT EXISTS gps\_lng NUMERIC;

## **Phase 2: Updating Backend Logic & Server Actions**

### **2.1 The Runner Exception Service Action**

In your existing actions file (e.g., app/actions/runner.ts), implement or expand the stop submission logic.

* **The Goal:** If the runner flags an issue (like "Overflowing Bins"), the action must save the status as exception and immediately call Twilio to text the user a one-click approval link: https://curbsitter.com/approve-charge?logId=...  
* **Multi-Photo Uploads:** Iterate through the array of photo files, uploading each to Supabase Storage, and save the resulting public URLs array to the photos column in service\_logs.

### **2.2 The Referral Attribution Engine**

When a user finishes onboarding:

* Generate a unique 6-character alphanumeric referral\_code and store it on their users record.  
* If a referred\_by\_code cookie or URL parameter is present, increment the referrer's referral\_credits\_cents by $2000 ($20.00) and apply a $20.00 discount to the new user's Stripe subscription invoice.

## **Phase 3: Frontend Component Patches**

### **3.1 The "Velvet Rope" Modal (Waitlist Gamification)**

* **Where:** Modify your onboarding zip-code check screen.  
* **Logic:** If the zip check fails, instead of showing a static "Unserviceable" page, launch a state-driven Modal that captures their email, generates their waitlist referral code, and presents a "Share this link with 3 neighbors to unlock![][image1]  
  \!" visual tracker.

### **3.2 The Runner Terminal High-Contrast Overlays**

* **Where:** /runner-app page.  
* **Logic:** Add an "Exceptions Panel" to the active stop card.  
  * A prominent red button: **"Report Issue"**.  
  * On click, open an overlay with options: "Locked Gate", "Wildlife Mess ($25)", "Extra Bags ($10/ea)".  
  * Enable multiple file uploads using \<input type="file" multiple accept="image/\*" capture="environment"\>.

### **3.3 The Customer Dashboard Alerts Banner**

* **Where:** /customer-dashboard home interface.  
* **Logic:** Run a subscription query or fetch the latest service\_logs where exception\_logged \== true and surcharge\_approved \== false.  
* If found, render a pulsing banner at the top of the viewport: *"Urgent: Runner reported overflowing bins. Click here to authorize a one-off trash removal for $10."*

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAxCAYAAABnGvUlAAAD9klEQVR4Xu3c62tXdRzAcf8TdYZaiualZipq6rxuQ83M6UaopNNFXsrWxVvMvCCIMy84cd6mMwy6oIkmKualBz2JqCdBQRRERiVFVk++cb6w0+Zh4hP9fa3Xgxe/cz7n/M7Zwzffc37rceL63wEAgHT1uH0AAEBaBBsAQOIEGwBA4gQbAEDiBBsAQOIEGwBA4gQbAEDiBBsAQOIEGwBA4gQbAEDiBBsAQOIEGwBA4gQbAEDiBBsAQOIEGwBA4gQbUFLL32gNZWV9wugJVWFiZU3Us2fP/Pie978Ow8rHFr7XnSOXbobJM54NQ8vHhBFjJof5S9eHNc2nCud159CFn+P9+zzUt3AMoFQEG1AyLR9+Fx4fNSHfr3/lrRhL7df+Kpx7N7Lvzqh9oTDv139AYXYn2XUWrdpWmAOUimADSmbVxqNhZdORfD8LpZm1ywvn3Y1tRz8Nk6rrwvErtwrHps9+rjC7k+zv2HTg48IcoFQEG1ByO97+PPR7eGCX2Dp+9VYYO2lWqGtoCgMHD4+z1VtOhNe2vxeDat/pb+Ns1JOVYe3O010eo97JgEHDwrpdZ0Lb5d9DRXVtPh88dER8/Jrdo/MqXbbqt739s/xezSe/LFwT4F4TbEDJDRpSHiZMr+ky29x6NSxp3BmGjRiXr7pVz10WFr+8I77z1nFeFmpzFjbeVbA1tVwMKzf+u6L3/Lr9Yfe7X8V33F7cdCzOthy6Hl7a3B63G7e9k1+37fJv3a7gAdxrgg0omQNnf4jvsB08/1M+y1a4Op/z6PCRcbWtY79v/0fC4sbmuH3syh9x1WtW3Ypug626piF+Hjx/o3BO+eiKcOTir6FXr975bPy0ufl277KyMPWpRYVrAtxvgg0omZHjpkUd+/vPfB8DrWM/e+xZ/+quLj9CyKJr6+FP4vb63WfDmp2nQlPLpUKMZWqXbgjLXt8bt7Mo7HxO9t1sPwu2zvNs9S6bzVuyNgx5bHR4esHq/FjzyS9C60c3CvcBuNcEG1ASVc/Ux1C6XecVtqOXbsYfDGTvkXXMxk2ZHd8xGzW+Kqx6s63LNafOWhieGDslLFixNTSs3Ve45+ELv4TKOUviqtuGPefy+d4PvgkVVfPDmIqZ8TP7hWgWidmqXPZvRrLZxMp58bHo7dcEuB8EG/DAaL/2Z/44FOD/RLABD4zs8WbruR8Lc4D/OsEGAJA4wQYAkDjBBgCQOMEGAJA4wQYAkDjBBgCQOMEGAJA4wQYAkDjBBgCQOMEGAJA4wQYAkDjBBgCQOMEGAJA4wQYAkDjBBgCQOMEGAJA4wQYAkDjBBgCQOMEGAJA4wQYAkDjBBgCQOMEGAJA4wQYAkLh/AMDhjrgHKVFdAAAAAElFTkSuQmCC>