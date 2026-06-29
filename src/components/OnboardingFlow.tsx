"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, CreditCard, 
  MapPin, Loader2, XCircle, Crown
} from "lucide-react";
import { Button } from "./ui/Button";
import { WaitlistForm } from "@/app/components/WaitlistForm";
import { submitWaitlist } from "@/app/actions/waitlistActions";
import { z } from "zod";

interface MapboxContextItem {
  id: string;
  text: string;
  short_code?: string;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  address?: string;
  context?: MapboxContextItem[];
  center?: [number, number];
}

// Allowed Prescott ZIPs (Physical and PO Box lists)
const PHYSICAL_ZIPS = ["86301", "86303", "86305"];
const PO_BOX_ZIPS = ["86302", "86304", "86313", "86318"];

// Mock Prescott addresses for Step 2 autocomplete
const MOCK_PRESCOTT_ADDRESSES = [
  "1001 E Gurley St, Prescott, AZ 86301",
  "220 W Goodwin St, Prescott, AZ 86303",
  "1200 Commerce Dr, Prescott, AZ 86305",
  "300 S Montezuma St, Prescott, AZ 86303",
  "1901 Prescott Lakes Pkwy, Prescott, AZ 86301",
];

const MOCK_PRESCOTT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "1001 E Gurley St, Prescott, AZ 86301": { lat: 34.5441, lng: -112.4518 },
  "220 W Goodwin St, Prescott, AZ 86303": { lat: 34.5412, lng: -112.4715 },
  "1200 Commerce Dr, Prescott, AZ 86305": { lat: 34.5714, lng: -112.4930 },
  "300 S Montezuma St, Prescott, AZ 86303": { lat: 34.5398, lng: -112.4705 },
  "1901 Prescott Lakes Pkwy, Prescott, AZ 86301": { lat: 34.5682, lng: -112.4410 },
};

// Zod Validation Schemas
const step1Schema = z.object({
  zipCode: z.string().trim().regex(/^\d{5}$/, "Please enter a valid 5-digit ZIP code.")
});

const step2Schema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().min(1, "Service address is required."),
  smsOptIn: z.boolean().refine(val => val === true, {
    message: "Consent is required to receive automated valet alerts."
  }),
}).superRefine((data, ctx) => {
  const emailVal = data.email?.trim() || "";
  const phoneVal = data.phone?.trim() || "";

  if (!emailVal && !phoneVal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either email or phone is required.",
      path: ["email"]
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either email or phone is required.",
      path: ["phone"]
    });
  } else {
    if (emailVal) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailVal)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid email address (e.g. name@domain.com).",
          path: ["email"]
        });
      }
    }
    if (phoneVal) {
      const cleanPhone = phoneVal.replace(/\D/g, "");
      const phoneRegex = /^[2-9][0-9]{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid 10-digit phone number with area code.",
          path: ["phone"]
        });
      }
    }
  }
});

const step4CardSchema = z.object({
  cardNumber: z.string().trim().transform(v => v.replace(/\D/g, "")).refine(v => v.length >= 13 && v.length <= 19, "Please enter a valid card number (13-19 digits)."),
  cardExp: z.string().trim().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Use MM/YY format."),
  cardCvc: z.string().trim().regex(/^[0-9]{3,4}$/, "CVC must be 3 or 4 digits."),
});

const step4AchSchema = z.object({
  routingNumber: z.string().trim().regex(/^[0-9]{9}$/, "Routing number must be exactly 9 digits."),
  accountNumber: z.string().trim().regex(/^[0-9]{4,17}$/, "Account number must be 4 to 17 digits."),
});

interface OnboardingFlowProps {
  initialZip?: string;
  onPropertyTypeChange?: (type: string) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ initialZip = "", onPropertyTypeChange }) => {
  const [step, setStep] = useState<number | "waitlist" | "waitlist_success" | "checkout_success">(() => {
    if (initialZip) {
      const trimmed = initialZip.trim();
      if (PHYSICAL_ZIPS.includes(trimmed)) return 2;
      if (PO_BOX_ZIPS.includes(trimmed)) return 1;
      return "waitlist";
    }
    return 1;
  });
  const [zipInput, setZipInput] = useState(() => initialZip.trim());
  const [zipError, setZipError] = useState(() => {
    if (initialZip) {
      const trimmed = initialZip.trim();
      if (PO_BOX_ZIPS.includes(trimmed)) {
        return "It looks like you entered a P.O. Box zip code. Please enter the physical zip code of your property to check service availability.";
      }
    }
    return "";
  });
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactMethod, setContactMethod] = useState<"phone" | "text" | "email">("text");
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [propertyType, setPropertyType] = useState("single_family");
  
  // Service State
  const [binCount, setBinCount] = useState(1);
  const [frequency, setFrequency] = useState<"1x" | "2x">("1x");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "ach">("card");

  // Geocoding UI State
  const [addressSuggestions, setAddressSuggestions] = useState<{ placeName: string; zipCode: string; latitude: number; longitude: number; }[]>([]);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [showGeoDropdown, setShowGeoDropdown] = useState(false);
  const [showAddressErrorModal, setShowAddressErrorModal] = useState(false);
  const [invalidSelectedZip, setInvalidSelectedZip] = useState("");
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [waitlistRole, setWaitlistRole] = useState("homeowner");

  // Checkout Input States
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const inputBaseClass = "w-full bg-white/5 border rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 transition-all duration-300";
  const getFieldClass = (hasError: boolean) => 
    `${inputBaseClass} ${hasError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-cyan-400'}`;

  // Step validation check for pipeline integrity
  const isStepUnlocked = (targetStep: number): boolean => {
    if (targetStep === 1) return true;
    if (targetStep === 2) return PHYSICAL_ZIPS.includes(zipInput);
    if (targetStep === 3) {
      const result = step2Schema.safeParse({ firstName, lastName, email, phone, address, smsOptIn });
      return result.success && PHYSICAL_ZIPS.includes(zipInput);
    }
    if (targetStep === 4) {
      const result = step2Schema.safeParse({ firstName, lastName, email, phone, address, smsOptIn });
      return result.success && PHYSICAL_ZIPS.includes(zipInput) && binCount <= 6;
    }
    return false;
  };

  const getHighestUnlockedStep = (currentStep: typeof step): typeof step => {
    if (typeof currentStep !== "number") return currentStep;
    for (let s = currentStep; s >= 1; s--) {
      if (isStepUnlocked(s)) {
        return s;
      }
    }
    return 1;
  };

  const activeStep = getHighestUnlockedStep(step);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
  const addressContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (addressContainerRef.current && !addressContainerRef.current.contains(e.target as Node)) {
        setShowGeoDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Step 1: Zip Code Check
  const handleZipCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setZipError("");
    const result = step1Schema.safeParse({ zipCode: zipInput });
    if (!result.success) {
      setZipError(result.error.issues[0].message);
      return;
    }
    const cleanZip = result.data.zipCode;
    if (PHYSICAL_ZIPS.includes(cleanZip)) {
      setStep(2);
    } else if (PO_BOX_ZIPS.includes(cleanZip)) {
      setZipError("It looks like you entered a P.O. Box zip code. Please enter the physical zip code of your property to check service availability.");
    } else {
      setStep("waitlist");
    }
  };



  // Step 2 Address Autocomplete effect
  useEffect(() => {
    if (address.trim().length < 3) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsGeoLoading(true);
      try {
        if (mapboxToken) {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              address
            )}.json?access_token=${mapboxToken}&proximity=-112.4685,34.5400&bbox=-112.7,34.3,-112.2,34.8&types=address&country=US`
          );
          const data = await res.json();
          if (data.features) {
            setAddressSuggestions(data.features.map((f: MapboxFeature) => {
              const context = f.context || [];
              const zipContext = context.find((c: MapboxContextItem) => c.id.startsWith("postcode"));
              const zipCode = zipContext?.text || "";
              const [lng, lat] = f.center || [-112.4685, 34.5400];
              return {
                placeName: f.place_name,
                zipCode,
                latitude: lat,
                longitude: lng
              };
            }));
          }
        } else {
          // Fallback to Prescott matches
          const matches = MOCK_PRESCOTT_ADDRESSES.filter(addr =>
            addr.toLowerCase().includes(address.toLowerCase())
          ).map(addr => {
            const zipMatch = addr.match(/\b\d{5}\b/);
            const zipCode = zipMatch ? zipMatch[0] : "86301";
            const coords = MOCK_PRESCOTT_COORDINATES[addr] || { lat: 34.5400, lng: -112.4685 };
            return {
              placeName: addr,
              zipCode,
              latitude: coords.lat,
              longitude: coords.lng
            };
          });
          setAddressSuggestions(
            matches.length > 0
              ? matches
              : [{ 
                  placeName: `${address}, Prescott, AZ ${zipInput}`, 
                  zipCode: zipInput,
                  latitude: 34.5400,
                  longitude: -112.4685
                }]
          );
        }
      } catch (err) {
        console.error("Geocoding fetch failed:", err);
        setFormErrors(prev => ({
          ...prev,
          address: "Temporary connection issue with address lookup. Please verify your address manually."
        }));
        const matches = MOCK_PRESCOTT_ADDRESSES.filter(addr =>
          addr.toLowerCase().includes(address.toLowerCase())
        ).map(addr => {
          const zipMatch = addr.match(/\b\d{5}\b/);
          const zipCode = zipMatch ? zipMatch[0] : "86301";
          const coords = MOCK_PRESCOTT_COORDINATES[addr] || { lat: 34.5400, lng: -112.4685 };
          return {
            placeName: addr,
            zipCode,
            latitude: coords.lat,
            longitude: coords.lng
          };
        });
        setAddressSuggestions(
          matches.length > 0
            ? matches
            : [{ 
                placeName: `${address}, Prescott, AZ ${zipInput}`, 
                zipCode: zipInput,
                latitude: 34.5400,
                longitude: -112.4685
              }]
        );
      } finally {
        setIsGeoLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [address, mapboxToken, zipInput]);

  // Cost Engine Calculation
  const calculatePricing = () => {
    const baseRate = 29; // $29/mo
    const additionalBinRate = 10; // $10/mo per extra bin
    const extraFrequencyRate = 15; // $15/mo for 2x weekly

    const binAdditions = (binCount - 1) * additionalBinRate;
    const frequencyAdditions = frequency === "2x" ? extraFrequencyRate : 0;
    
    let monthlyRate = baseRate + binAdditions + frequencyAdditions;
    
    // Apply 10% discount for quarterly
    if (billingCycle === "quarterly") {
      monthlyRate = Math.round(monthlyRate * 0.9 * 100) / 100;
    }

    const transactionCharge = paymentMethod === "ach" ? monthlyRate - 5 : monthlyRate;

    return {
      monthlyRate,
      billingCycleText: billingCycle === "monthly" ? "month" : "month (billed quarterly)",
      displayTotal: transactionCharge,
      quarterlyTotal: Math.round(monthlyRate * 3 * 100) / 100
    };
  };

  const validateStep2 = (): boolean => {
    const result = step2Schema.safeParse({
      firstName,
      lastName,
      email,
      phone,
      address,
      smsOptIn
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        const path = err.path[0];
        if (typeof path === "string") {
          errors[path] = err.message;
        }
      });
      setFormErrors(errors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleProceedToStep3 = () => {
    if (!validateStep2()) {
      return;
    }

    const zipMatch = address.match(/\b\d{5}\b/);
    const selectedZip = zipMatch ? zipMatch[0] : "";

    if (!selectedZip || !PHYSICAL_ZIPS.includes(selectedZip)) {
      setInvalidSelectedZip(selectedZip || "unknown");
      setShowAddressErrorModal(true);
      setFormErrors(prev => ({
        ...prev,
        address: `Selected address ZIP code (${selectedZip || "unknown"}) is outside our physical service area.`
      }));
    } else {
      setZipInput(selectedZip);
      setStep(3);
    }
  };

  const validateStep4 = (): boolean => {
    if (paymentMethod === "card") {
      const result = step4CardSchema.safeParse({ cardNumber, cardExp, cardCvc });
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach(err => {
          const path = err.path[0];
          if (typeof path === "string") {
            errors[path] = err.message;
          }
        });
        setFormErrors(errors);
        return false;
      }
    } else {
      const result = step4AchSchema.safeParse({ routingNumber, accountNumber });
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach(err => {
          const path = err.path[0];
          if (typeof path === "string") {
            errors[path] = err.message;
          }
        });
        setFormErrors(errors);
        return false;
      }
    }
    setFormErrors({});
    return true;
  };

  const handleCheckoutSubmit = async () => {
    if (!validateStep4()) {
      return;
    }
    
    setIsSubmittingCheckout(true);
    setCheckoutError("");

    try {
      const formData = new FormData();
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      formData.append("email", email.trim());
      if (phone.trim()) {
        formData.append("phone", phone.trim());
      }
      formData.append("zip_code", zipInput.trim());
      formData.append("account_type", "single_home");
      formData.append("entity_type", "residential");
      formData.append("property_type", propertyType);
      
      formData.append("address", address.trim());
      if (latitude !== null) {
        formData.append("latitude", latitude.toString());
        formData.append("lat", latitude.toString());
      }
      if (longitude !== null) {
        formData.append("longitude", longitude.toString());
        formData.append("lng", longitude.toString());
      }

      const res = await submitWaitlist(formData);

      if (res.success) {
        setStep("checkout_success");
      } else {
        setCheckoutError(res.error || "Payment and registration failed. Please try again.");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setCheckoutError(errMsg);
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  const pricing = calculatePricing();

  return (
    <div className="w-full">
      {/* Top mounted progress bar */}
      {typeof activeStep === "number" && (
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Progress</span>
            <span>Step {activeStep} of 4</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-electric-cyan transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
              style={{ width: `${(activeStep / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1: Zip Verification */}
        {activeStep === 1 && (() => {
          const isValidZip = /^\d{5}$/.test(zipInput);
          const isServiceable = !isValidZip || PHYSICAL_ZIPS.includes(zipInput);
          const headerTitle = isServiceable ? "Get a Quote" : "Join the Priority Waitlist";
          const buttonText = isServiceable ? "Get a Quote" : "Join the Priority Waitlist";
          const descriptionText = isServiceable
            ? "We are expanding neighborhood routes weekly. Enter your ZIP code to verify coverage."
            : "CurbSitter is currently outside your neighborhood. Join our priority waitlist to help us route your area.";

          return (
            <motion.form
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              onSubmit={handleZipCheck}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">{headerTitle}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {descriptionText}
                </p>
              </div>
              <div>
                <label htmlFor="zip-code-field" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  ZIP Code
                </label>
                <input
                  id="zip-code-field"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{5}"
                  maxLength={5}
                  required
                  className={`${getFieldClass(!!zipError)} font-mono text-center text-2xl tracking-widest`}
                  placeholder="86301"
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ""))}
                />
                {zipError && <p className="text-sm text-red-400 mt-2 font-medium">{zipError}</p>}
              </div>
              <Button type="submit" variant="primary" className="w-full h-14 text-sm font-extrabold uppercase tracking-wider" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {buttonText}
              </Button>
            </motion.form>
          );
        })()}

        {/* STEP 2: Contact Info & Address Autocomplete */}
        {activeStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="space-y-5"
          >
            <div>
              <h3 className="text-xl font-bold text-white">Contact & Property Details</h3>
              <p className="text-sm text-slate-400 mt-1">Let us know how to coordinate your bin valet service.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fn-field" className={`block text-xs font-semibold mb-1 ${formErrors.firstName ? 'text-red-400' : 'text-slate-400'}`}>First Name *</label>
                <input
                  id="fn-field"
                  type="text"
                  className={getFieldClass(!!formErrors.firstName)}
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (formErrors.firstName) {
                      setFormErrors(prev => {
                        const next = { ...prev };
                        delete next.firstName;
                        return next;
                      });
                    }
                  }}
                />
                {formErrors.firstName && <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.firstName}</span>}
              </div>
              <div>
                <label htmlFor="ln-field" className={`block text-xs font-semibold mb-1 ${formErrors.lastName ? 'text-red-400' : 'text-slate-400'}`}>Last Name *</label>
                <input
                  id="ln-field"
                  type="text"
                  className={getFieldClass(!!formErrors.lastName)}
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (formErrors.lastName) {
                      setFormErrors(prev => {
                        const next = { ...prev };
                        delete next.lastName;
                        return next;
                      });
                    }
                  }}
                />
                {formErrors.lastName && <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.lastName}</span>}
              </div>
            </div>

            <div>
              <label htmlFor="email-field" className={`block text-xs font-semibold mb-1 ${formErrors.email ? 'text-red-400' : 'text-slate-400'}`}>Email Address</label>
              <input
                id="email-field"
                type="email"
                className={getFieldClass(!!formErrors.email)}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) {
                    setFormErrors(prev => {
                      const next = { ...prev };
                      delete next.email;
                      if (next.phone === "Either email or phone is required.") {
                        delete next.phone;
                      }
                      return next;
                    });
                  }
                }}
              />
              {formErrors.email && <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.email}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone-field" className={`block text-xs font-semibold mb-1 ${formErrors.phone ? 'text-red-400' : 'text-slate-400'}`}>Mobile Phone</label>
                <input
                  id="phone-field"
                  type="tel"
                  className={getFieldClass(!!formErrors.phone)}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (formErrors.phone) {
                      setFormErrors(prev => {
                        const next = { ...prev };
                        delete next.phone;
                        if (next.email === "Either email or phone is required.") {
                          delete next.email;
                        }
                        return next;
                      });
                    }
                  }}
                />
                {formErrors.phone && <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.phone}</span>}
              </div>
              <div>
                <label htmlFor="prop-field" className="block text-xs font-semibold text-slate-400 mb-1">Property Type</label>
                <select
                  id="prop-field"
                  className={getFieldClass(false)}
                  value={propertyType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPropertyType(val);
                    if (onPropertyTypeChange) {
                      onPropertyTypeChange(val);
                    }
                  }}
                >
                  <option value="single_family" className="bg-[#0A0F1D] text-white">Single Family</option>
                  <option value="hoa" className="bg-[#0A0F1D] text-white">HOA Managed</option>
                  <option value="short_term_rental" className="bg-[#0A0F1D] text-white">Short-Term Rental</option>
                </select>
              </div>
            </div>

            {/* Address Autocomplete input */}
            <div ref={addressContainerRef} className="relative">
              <label htmlFor="address-autocomplete" className={`block text-xs font-semibold mb-1 ${formErrors.address ? 'text-red-400' : 'text-slate-400'}`}>Service Address *</label>
              <div className="relative">
                <input
                  id="address-autocomplete"
                  type="text"
                  autoComplete="street-address"
                  className={`${getFieldClass(!!formErrors.address)} pl-12`}
                  placeholder="Start typing your address..."
                  value={address}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAddress(val);
                    if (formErrors.address) {
                      setFormErrors(prev => {
                        const next = { ...prev };
                        delete next.address;
                        return next;
                      });
                    }
                    if (val.trim().length < 3) {
                      setAddressSuggestions([]);
                      setShowGeoDropdown(false);
                    } else {
                      setShowGeoDropdown(true);
                    }
                  }}
                  onFocus={() => setShowGeoDropdown(true)}
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-electric-cyan" />
                {isGeoLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-electric-cyan animate-spin" />}
              </div>
              {formErrors.address && <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.address}</span>}
              
              {showGeoDropdown && addressSuggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-midnight-blue border border-white/10 rounded shadow-xl z-30 divide-y divide-white/5">
                  {addressSuggestions.map((suggestion, idx) => (
                    <li key={idx}>
                      <button
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-xs text-slate-300 hover:bg-slate-gray/30 hover:text-white transition-colors"
                        onClick={() => {
                          setAddress(suggestion.placeName);
                          setLatitude(suggestion.latitude);
                          setLongitude(suggestion.longitude);
                          setShowGeoDropdown(false);
                          setAddressSuggestions([]);

                          // Silent Re-Validation on click
                          const selectedZip = suggestion.zipCode;
                          if (!PHYSICAL_ZIPS.includes(selectedZip)) {
                            setInvalidSelectedZip(selectedZip || "unknown");
                            setShowAddressErrorModal(true);
                            setFormErrors(prev => ({
                              ...prev,
                              address: `Selected address ZIP code (${selectedZip || "unknown"}) is outside our physical service area.`
                            }));
                          } else {
                            setZipInput(selectedZip);
                            setFormErrors(prev => {
                              const next = { ...prev };
                              delete next.address;
                              return next;
                            });
                          }
                        }}
                      >
                        {suggestion.placeName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Contact preferences */}
            <div className="space-y-2 border-t border-white/5 pt-3">
              <p className="text-xs font-semibold text-slate-400">Preferred Contact Method</p>
              <div className="flex gap-4">
                {(["text", "phone", "email"] as const).map((method) => (
                  <label key={method} className="flex items-center gap-2 text-xs text-slate-300 capitalize cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      value={method}
                      checked={contactMethod === method}
                      onChange={() => setContactMethod(method)}
                      className="accent-electric-cyan"
                    />
                    {method}
                  </label>
                ))}
              </div>
              <label className="flex items-start gap-2.5 text-[11px] text-slate-400 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(e) => {
                    setSmsOptIn(e.target.checked);
                    if (e.target.checked && formErrors.smsOptIn) {
                      setFormErrors(prev => {
                        const next = { ...prev };
                        delete next.smsOptIn;
                        return next;
                      });
                    }
                  }}
                  className="accent-electric-cyan mt-0.5"
                />
                <span className={formErrors.smsOptIn ? 'text-red-400' : ''}>I agree to receive automated updates/alerts via SMS. Message & data rates may apply.</span>
              </label>
              {formErrors.smsOptIn && <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.smsOptIn}</span>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={handleProceedToStep3}
              >
                Configure Service
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Service Configuration & Cost Engine */}
        {activeStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold text-white">Select Bins & Frequency</h3>
              <p className="text-sm text-slate-400 mt-1">Configure your weekly rollout schedule.</p>
            </div>

            {/* Bin volume configuration */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-300">Number of Trash/Recycle Bins</span>
                <span className="text-lg font-bold text-electric-cyan">{binCount} {binCount === 1 ? "Bin" : "Bins"}</span>
              </div>
              <div className="flex items-center justify-between gap-4 bg-deep-onyx p-3 rounded-lg border border-white/5">
                <button
                  type="button"
                  disabled={binCount <= 1}
                  className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-35 transition-colors"
                  onClick={() => setBinCount(binCount - 1)}
                >
                  -
                </button>
                <div className="text-xs text-slate-400">Standard residential bin limits (1 to 6)</div>
                <button
                  type="button"
                  className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  onClick={() => setBinCount(binCount + 1)}
                >
                  +
                </button>
              </div>

              {/* Over 6 Bins Sales Prompt */}
              {binCount > 6 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="bg-electric-cyan/5 border border-electric-cyan/20 rounded-lg p-4 space-y-3 text-center"
                >
                  <p className="text-xs text-slate-300">
                    For 7 or more bins, we offer custom commercial and estate pricing.
                  </p>
                  <a 
                    href="tel:5202259713"
                    className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2 rounded bg-electric-cyan text-deep-onyx hover:bg-electric-cyan-hover transition-all"
                  >
                    Contact Commercial Sales
                  </a>
                </motion.div>
              )}
            </div>

            {/* Collection Frequency */}
            <div className="space-y-3">
              <span className="text-sm font-semibold text-slate-300 block">Collection Frequency</span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`py-3.5 px-4 rounded-lg border text-sm font-semibold transition-all ${
                    frequency === "1x"
                      ? "border-electric-cyan bg-electric-cyan/5 text-white"
                      : "border-white/10 bg-deep-onyx text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setFrequency("1x")}
                >
                  1x Per Week
                  <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Standard Rollout</span>
                </button>
                <button
                  type="button"
                  className={`py-3.5 px-4 rounded-lg border text-sm font-semibold transition-all ${
                    frequency === "2x"
                      ? "border-electric-cyan bg-electric-cyan/5 text-white"
                      : "border-white/10 bg-deep-onyx text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setFrequency("2x")}
                >
                  2x Per Week
                  <span className="block text-[10px] text-slate-400 font-normal mt-0.5">+$15/mo (High Volume)</span>
                </button>
              </div>
            </div>

            {/* Quarterly Billing Discount Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
              <div>
                <span className="text-sm font-semibold text-white block">Quarterly Billing Option</span>
                <span className="text-xs text-slate-400">Save 10% on your monthly subscription rate</span>
              </div>
              <button
                type="button"
                className={`relative w-12 h-6 rounded-full transition-all duration-300 border ${
                  billingCycle === "quarterly" ? "bg-electric-cyan border-electric-cyan" : "bg-slate-gray/30 border-white/20"
                }`}
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "quarterly" : "monthly")}
              >
                <div 
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                    billingCycle === "quarterly" ? "left-6" : "left-0.5"
                  }`} 
                />
              </button>
            </div>

            {/* Price Engine Box */}
            <div className="p-5 bg-deep-onyx rounded-lg border border-white/10 space-y-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Base Valet Valet</span>
                <span>$29.00/mo</span>
              </div>
              {binCount > 1 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Additional Bins ({binCount - 1})</span>
                  <span>+${(binCount - 1) * 10}.00/mo</span>
                </div>
              )}
              {frequency === "2x" && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Additional pickup frequency</span>
                  <span>+$15.00/mo</span>
                </div>
              )}
              {billingCycle === "quarterly" && (
                <div className="flex justify-between text-xs text-emerald-400 font-medium">
                  <span>Quarterly Prepay Discount (10%)</span>
                  <span>-10%</span>
                </div>
              )}
              
              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Estimated Subtotal</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-electric-cyan">${pricing.monthlyRate}</span>
                  <span className="text-xs text-slate-500 font-normal"> / {pricing.billingCycleText}</span>
                  {billingCycle === "quarterly" && (
                    <span className="block text-[10px] text-slate-400">Billed as ${pricing.quarterlyTotal} every 3 mos</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>Back</Button>
              <Button 
                variant="primary" 
                className="flex-1" 
                disabled={binCount > 6}
                onClick={() => setStep(4)}
              >
                Proceed to Checkout
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Stripe Checkout (ACH / Card) */}
        {activeStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold text-white">Secure Checkout</h3>
              <p className="text-sm text-slate-400 mt-1">Payment processed securely via Stripe.</p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`py-3.5 px-4 rounded-lg border text-sm font-semibold transition-all relative flex flex-col items-center justify-center ${
                  paymentMethod === "card"
                    ? "border-electric-cyan bg-electric-cyan/5 text-white"
                    : "border-white/10 bg-deep-onyx text-slate-400 hover:text-white"
                }`}
                onClick={() => {
                  setPaymentMethod("card");
                  setFormErrors({});
                }}
              >
                <CreditCard className="w-5 h-5 mb-1.5" />
                Credit Card
              </button>

              <button
                type="button"
                className={`py-3.5 px-4 rounded-lg border text-sm font-semibold transition-all relative flex flex-col items-center justify-center ${
                  paymentMethod === "ach"
                    ? "border-electric-cyan bg-electric-cyan/5 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    : "border-white/10 bg-deep-onyx text-slate-400 hover:text-white"
                }`}
                onClick={() => {
                  setPaymentMethod("ach");
                  setFormErrors({});
                }}
              >
                {/* ACH Badge */}
                <span className="absolute -top-2 px-2 py-0.5 text-[9px] bg-electric-cyan text-deep-onyx rounded font-black tracking-wide shadow-md">
                  $5 SAVINGS
                </span>
                <span className="inline-flex items-center text-xs gap-1 mb-1.5 mt-0.5">🏦 ACH Debit</span>
                Direct Bank Transfer
              </button>
            </div>

            {/* Autopay discount indicator */}
            {paymentMethod === "ach" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg p-3 text-xs font-semibold flex items-center justify-between"
              >
                <span>🏦 ACH Direct Auto-Debit Activated</span>
                <span>-$5.00 Off/mo Applied</span>
              </motion.div>
            )}

            {/* Form Fields for Card/ACH */}
            <div className="space-y-4 p-5 bg-white/5 rounded-lg border border-white/5">
              {paymentMethod === "card" ? (
                <div className="space-y-3">
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1 font-semibold ${formErrors.cardNumber ? 'text-red-400' : 'text-slate-400'}`}>Card Information</label>
                    <input
                      type="text"
                      className={`${getFieldClass(!!formErrors.cardNumber)} font-mono text-sm`}
                      placeholder="•••• •••• •••• ••••"
                      value={cardNumber}
                      onChange={(e) => {
                        setCardNumber(e.target.value);
                        if (formErrors.cardNumber) {
                          setFormErrors(prev => {
                            const next = { ...prev };
                            delete next.cardNumber;
                            return next;
                          });
                        }
                      }}
                    />
                    {formErrors.cardNumber && <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.cardNumber}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[10px] uppercase tracking-wider mb-1 font-semibold ${formErrors.cardExp ? 'text-red-400' : 'text-slate-400'}`}>Expiration</label>
                      <input
                        type="text"
                        className={`${getFieldClass(!!formErrors.cardExp)} font-mono text-center text-sm`}
                        placeholder="MM / YY"
                        value={cardExp}
                        onChange={(e) => {
                          setCardExp(e.target.value);
                          if (formErrors.cardExp) {
                            setFormErrors(prev => {
                              const next = { ...prev };
                              delete next.cardExp;
                              return next;
                            });
                          }
                        }}
                      />
                      {formErrors.cardExp && <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.cardExp}</span>}
                    </div>
                    <div>
                      <label className={`block text-[10px] uppercase tracking-wider mb-1 font-semibold ${formErrors.cardCvc ? 'text-red-400' : 'text-slate-400'}`}>CVC / CVV</label>
                      <input
                        type="text"
                        className={`${getFieldClass(!!formErrors.cardCvc)} font-mono text-center text-sm`}
                        placeholder="•••"
                        value={cardCvc}
                        onChange={(e) => {
                          setCardCvc(e.target.value);
                          if (formErrors.cardCvc) {
                            setFormErrors(prev => {
                              const next = { ...prev };
                              delete next.cardCvc;
                              return next;
                            });
                          }
                        }}
                      />
                      {formErrors.cardCvc && <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.cardCvc}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1 font-semibold ${formErrors.routingNumber ? 'text-red-400' : 'text-slate-400'}`}>Routing Number (9-digits)</label>
                    <input
                      type="text"
                      className={`${getFieldClass(!!formErrors.routingNumber)} font-mono text-sm`}
                      placeholder="021000021"
                      value={routingNumber}
                      onChange={(e) => {
                        setRoutingNumber(e.target.value);
                        if (formErrors.routingNumber) {
                          setFormErrors(prev => {
                            const next = { ...prev };
                            delete next.routingNumber;
                            return next;
                          });
                        }
                      }}
                    />
                    {formErrors.routingNumber && <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.routingNumber}</span>}
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1 font-semibold ${formErrors.accountNumber ? 'text-red-400' : 'text-slate-400'}`}>Account Number</label>
                    <input
                      type="text"
                      className={`${getFieldClass(!!formErrors.accountNumber)} font-mono text-sm`}
                      placeholder="1234567890"
                      value={accountNumber}
                      onChange={(e) => {
                        setAccountNumber(e.target.value);
                        if (formErrors.accountNumber) {
                          setFormErrors(prev => {
                            const next = { ...prev };
                            delete next.accountNumber;
                            return next;
                          });
                        }
                      }}
                    />
                    {formErrors.accountNumber && <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.accountNumber}</span>}
                  </div>
                </div>
              )}
            </div>

            {checkoutError && (
              <p className="text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                {checkoutError}
              </p>
            )}

            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1" 
                onClick={() => { 
                  setFormErrors({}); 
                  setCheckoutError(""); 
                  setStep(3); 
                }}
                disabled={isSubmittingCheckout}
              >
                Back
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                onClick={handleCheckoutSubmit}
                isLoading={isSubmittingCheckout}
              >
                Pay ${pricing.displayTotal} Now
              </Button>
            </div>
            
            <p className="text-[10px] text-center text-slate-500 leading-normal">
              By checking out, you authorize CurbSitter to initiate recurring payments as outlined. Your transaction is encrypted and secured by Stripe Elements.
            </p>
          </motion.div>
        )}

        {/* MOCK REJECTION / WAITLIST FORM */}
        {activeStep === "waitlist" && (
          <motion.div
            key="waitlist_form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <WaitlistForm 
              zipCode={zipInput}
              onSuccess={(role) => {
                setWaitlistRole(role);
                setStep("waitlist_success");
              }}
              onBack={() => setStep(1)}
            />
          </motion.div>
        )}

        {/* WAITLIST SUCCESS */}
        {activeStep === "waitlist_success" && (
          <motion.div
            key="waitlist_success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="text-center p-6 space-y-6"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-electric-cyan/15 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan shadow-[0_0_15px_rgba(6,182,212,0.25)] animate-fadeIn">
              {waitlistRole === "hoa_property_management" || waitlistRole === "hoa_pm" || waitlistRole === "multi_property" ? (
                <Crown className="w-8 h-8 text-electric-cyan" />
              ) : (
                <svg className="w-8 h-8 text-electric-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                  />
                </svg>
              )}
            </div>

            <div className="space-y-2">
              {waitlistRole === "hoa_property_management" || waitlistRole === "hoa_pm" || waitlistRole === "multi_property" ? (
                <>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Priority Activation</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    Thank you. Managing multiple properties requires a dedicated approach. A CurbSitter Portfolio Specialist will contact you within 24 hours to bulk-import your service addresses and discuss volume pricing.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wider">You’re on the list.</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    We’ll notify you the moment CurbSitter touches down in your neighborhood.
                  </p>
                </>
              )}
            </div>

            <Button variant="secondary" className="w-full h-14 text-sm font-bold" onClick={() => {
              resetStates();
              setStep(1);
            }}>
              Return to Homepage
            </Button>
          </motion.div>
        )}

        {/* CHECKOUT SUCCESS */}
        {activeStep === "checkout_success" && (
          <motion.div
            key="checkout_success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="text-center p-6 space-y-6"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ type: "spring", stiffness: 80, damping: 18 }}
                />
                <motion.path
                  d="m9 11 2 2 4-4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Welcome to CurbSitter</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your concierge onboarding is complete! We have verified your Prescott route and registered your details. Check your email for login details.
              </p>
            </div>

            <div className="p-4 bg-deep-onyx rounded-lg border border-white/5 space-y-2 text-left text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Address</span>
                <span className="font-semibold text-white truncate max-w-[180px]">{address}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly rate</span>
                <span className="font-semibold text-white">${pricing.monthlyRate}</span>
              </div>
              <div className="flex justify-between">
                <span>Billed cycle</span>
                <span className="font-semibold text-white capitalize">{billingCycle}</span>
              </div>
            </div>

            <Button variant="secondary" className="w-full" onClick={() => {
              resetStates();
              setStep(1);
            }}>
              Restart Setup
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Re-validation Rejection Modal */}
      <AnimatePresence>
        {showAddressErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              onClick={() => setShowAddressErrorModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative w-full max-w-md glass-card rounded-2xl p-8 overflow-hidden z-10"
            >
              {/* Corner ambient glow */}
              <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-red-500/10 blur-2xl pointer-events-none" />

              <div className="text-center space-y-6">
                <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <XCircle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Address Outside Route</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    The selected address is in ZIP code <span className="text-white font-semibold font-mono">{invalidSelectedZip || "an unverified area"}</span>, which is outside our current physical service routes.
                  </p>
                  <p className="text-xs text-slate-400">
                    CurbSitter is exclusive to physical residences in Prescott ZIP codes: 86301, 86303, and 86305.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    variant="primary" 
                    className="w-full shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    onClick={() => {
                      setShowAddressErrorModal(false);
                      if (invalidSelectedZip && invalidSelectedZip !== "unknown") {
                        setZipInput(invalidSelectedZip);
                      }
                      setStep("waitlist");
                    }}
                  >
                    Join the Waitlist
                  </Button>
                  <button
                    onClick={() => {
                      setShowAddressErrorModal(false);
                      setAddress("");
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-semibold"
                  >
                    Enter Different Address
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  function resetStates() {
    setZipInput("");
    setZipError("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setLatitude(null);
    setLongitude(null);
    setBinCount(1);
    setFrequency("1x");
    setBillingCycle("monthly");
    setPaymentMethod("card");
    setFormErrors({});
    setCardNumber("");
    setCardExp("");
    setCardCvc("");
    setRoutingNumber("");
    setAccountNumber("");
    setWaitlistRole("homeowner");
  }
};
