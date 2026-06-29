"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";

interface AddressSuggestion {
  id: string;
  placeName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isAvailable: boolean;
}

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
}

// Custom hook to handle click outside element
function useClickOutside(ref: React.RefObject<HTMLElement | null>, callback: () => void) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
}

// Prescott AZ mock addresses for demo/fallback
const MOCK_PRESCOTT_ADDRESSES: Omit<AddressSuggestion, "id" | "isAvailable" | "placeName">[] = [
  { street: "1001 E Gurley St", city: "Prescott", state: "AZ", zipCode: "86301" },
  { street: "220 W Goodwin St", city: "Prescott", state: "AZ", zipCode: "86303" },
  { street: "1200 Commerce Dr", city: "Prescott", state: "AZ", zipCode: "86305" },
  { street: "300 S Montezuma St", city: "Prescott", state: "AZ", zipCode: "86303" },
  { street: "1901 Prescott Lakes Pkwy", city: "Prescott", state: "AZ", zipCode: "86301" },
  { street: "540 Whipple St", city: "Prescott", state: "AZ", zipCode: "86301" },
  { street: "840 Miller Valley Rd", city: "Prescott", state: "AZ", zipCode: "86301" },
  { street: "3150 Willow Creek Rd", city: "Prescott", state: "AZ", zipCode: "86301" },
  { street: "3250 Gateway Blvd", city: "Prescott", state: "AZ", zipCode: "86303" },
  { street: "126 N Marina St", city: "Prescott", state: "AZ", zipCode: "86301" },
];

export const AddressSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

  useClickOutside(containerRef, () => setShowDropdown(false));

  // Check if address is in our Prescott target zone (86301, 86303, 86305)
  const verifyAvailability = (city: string, state: string, zip: string): boolean => {
    const zipCodeClean = zip.trim();
    
    // Explicitly target Prescott AZ physical zip codes 86301, 86303, 86305
    const PHYSICAL_ZIPS = ["86301", "86303", "86305"];
    return PHYSICAL_ZIPS.includes(zipCodeClean);
  };

  useEffect(() => {
    if (query.trim().length < 3 || selectedAddress) {
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      
      try {
        if (mapboxToken) {
          // Fetch from Mapbox Geocoding API (biased to Prescott region)
          const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${mapboxToken}&proximity=-112.4685,34.5400&bbox=-112.7,34.3,-112.2,34.8&types=address&country=US`;
          
          const response = await fetch(endpoint);
          const data = await response.json();
          
          if (data.features) {
            const results = data.features.map((feature: MapboxFeature) => {
              const context = feature.context || [];
              const zipContext = context.find((c: MapboxContextItem) => c.id.startsWith("postcode"));
              const cityContext = context.find((c: MapboxContextItem) => c.id.startsWith("place"));
              const regionContext = context.find((c: MapboxContextItem) => c.id.startsWith("region"));
              
              const street = feature.text ? `${feature.address || ""} ${feature.text}`.trim() : feature.place_name;
              const city = cityContext?.text || "Prescott";
              const state = regionContext?.short_code?.replace("US-", "") || "AZ";
              const zipCode = zipContext?.text || "86301";
              
              return {
                id: feature.id,
                placeName: feature.place_name,
                street,
                city,
                state,
                zipCode,
                isAvailable: verifyAvailability(city, state, zipCode),
              };
            });
            setSuggestions(results);
          }
        } else {
          // Simulated geocoder fallback targeting Prescott
          const filtered = MOCK_PRESCOTT_ADDRESSES.filter((addr) =>
            addr.street.toLowerCase().includes(query.toLowerCase())
          ).map((addr, index) => {
            const placeName = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
            return {
              id: `mock-${index}`,
              placeName,
              street: addr.street,
              city: addr.city,
              state: addr.state,
              zipCode: addr.zipCode,
              isAvailable: verifyAvailability(addr.city, addr.state, addr.zipCode),
            };
          });

          // Also allow user to check exactly what they type
          const userTypedSuggestion: AddressSuggestion = {
            id: "user-typed",
            placeName: `${query}, Prescott, AZ 86301`,
            street: query,
            city: "Prescott",
            state: "AZ",
            zipCode: "86301",
            isAvailable: true,
          };

          setSuggestions([userTypedSuggestion, ...filtered]);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, mapboxToken, selectedAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedAddress(null);
    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
    } else {
      setShowDropdown(true);
    }
  };

  const handleSelectSuggestion = (addr: AddressSuggestion) => {
    setSelectedAddress(addr);
    setQuery(addr.placeName);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const resetSearch = () => {
    setQuery("");
    setSelectedAddress(null);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="w-full relative max-w-xl mx-auto z-20">
      <div className="relative">
        <label htmlFor="address-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Service Address
        </label>
        <div className="relative flex items-center">
          <MapPin className="absolute left-4 text-electric-cyan w-5 h-5" />
          <input
            id="address-input"
            type="text"
            className="w-full h-14 pl-12 pr-12 bg-deep-onyx/80 backdrop-blur-md text-foreground rounded-lg border border-white/10 placeholder-slate-500 focus:border-electric-cyan transition-all duration-300 font-medium"
            placeholder="Enter your home address..."
            value={query}
            onChange={handleInputChange}
            autoComplete="street-address"
            required
            onFocus={() => query.length >= 3 && setShowDropdown(true)}
          />
          {isLoading ? (
            <Loader2 className="absolute right-4 w-5 h-5 text-electric-cyan animate-spin" />
          ) : query ? (
            <button
              onClick={resetSearch}
              className="absolute right-4 text-slate-500 hover:text-foreground text-sm font-semibold transition-colors"
              type="button"
            >
              Clear
            </button>
          ) : (
            <Search className="absolute right-4 w-5 h-5 text-slate-500" />
          )}
        </div>
      </div>

      {/* Suggestion Dropdown */}
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 mt-2 rounded-lg glass-card overflow-hidden z-30"
          >
            <ul className="divide-y divide-white/5 max-h-60 overflow-y-auto">
              {suggestions.map((addr) => (
                <li key={addr.id}>
                  <button
                    onClick={() => handleSelectSuggestion(addr)}
                    className="w-full px-5 py-4 text-left hover:bg-slate-gray/30 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-500 group-hover:text-electric-cyan transition-colors" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{addr.street}</p>
                        <p className="text-xs text-slate-400">{addr.city}, {addr.state} {addr.zipCode}</p>
                      </div>
                    </div>
                    {addr.isAvailable ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20">
                        Serviced
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-white/5 text-slate-400 border border-white/10">
                        Outside boundary
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Verification Card */}
      <AnimatePresence>
        {selectedAddress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-6 rounded-lg glass-card relative overflow-hidden"
          >
            {/* Soft decorative background glows */}
            <div className={`absolute -right-20 -bottom-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${selectedAddress.isAvailable ? "bg-electric-cyan" : "bg-red-500"}`} />

            <div className="flex items-start gap-4">
              {selectedAddress.isAvailable ? (
                <CheckCircle2 className="w-8 h-8 text-electric-cyan flex-shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
              )}
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">
                  {selectedAddress.isAvailable ? "We Service Your Address" : "Currently Outside Service Area"}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                </p>
                <p className="text-sm text-slate-300 mt-3 font-medium">
                  {selectedAddress.isAvailable 
                    ? "Premium trash day rollout and return is fully operational in your neighborhood."
                    : "We currently limit service to physical residences in Prescott ZIP codes: 86301, 86303, and 86305. Join our waitlist to vote for your area!"}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {selectedAddress.isAvailable ? (
                    <Button 
                      variant="primary" 
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="w-full sm:w-auto"
                    >
                      View Pricing & Plans
                    </Button>
                  ) : (
                    <Button 
                      variant="glow"
                      className="w-full sm:w-auto"
                    >
                      Join the Waitlist
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
