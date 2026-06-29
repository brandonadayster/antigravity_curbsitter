"use client";

import React, { useState } from "react";
import { submitWaitlist } from "../actions/waitlistActions";
import { Button } from "@/components/ui/Button";
import { Check, Crown, Home, Building2, ChevronLeft } from "lucide-react";

interface WaitlistFormProps {
  zipCode: string;
  onSuccess?: (role: string) => void;
  onBack: () => void;
}

export const WaitlistForm: React.FC<WaitlistFormProps> = ({
  zipCode,
  onSuccess,
  onBack,
}) => {
  const [accountType, setAccountType] = useState<"single_home" | "multi_property" | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // B2B conditional fields
  const [organizationName, setOrganizationName] = useState("");
  const [businessType, setBusinessType] = useState("Short-Term Rental Host");
  const [portfolioSize, setPortfolioSize] = useState("2-5 Properties");
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!accountType) {
      setError("Please select an account type.");
      return;
    }
    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (accountType === "multi_property") {
      if (!organizationName.trim()) {
        setError("Organization name is required.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      formData.append("email", email.trim());
      if (phone.trim()) {
        formData.append("phone", phone.trim());
      }
      formData.append("account_type", accountType);

      if (accountType === "multi_property") {
        formData.append("organization_name", organizationName.trim());
        formData.append("business_type", businessType);
        formData.append("portfolio_size", portfolioSize);
        // B2B maps to 'multi_property' for wizard success routing
        formData.append("entity_type", "multi_property");
      } else {
        formData.append("zip_code", zipCode.trim());
        formData.append("entity_type", "residential");
      }

      const res = await submitWaitlist(formData);

      if (res.success) {
        setIsSubmitted(true);
        if (onSuccess) {
          onSuccess(accountType);
        }
      } else {
        setError(res.error || "Failed to join waitlist. Please try again.");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 focus:border-electric-cyan rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 transition-all duration-300 text-sm";
  const selectClass = "w-full bg-[#0A0F1D] border border-white/10 focus:border-electric-cyan rounded-xl px-5 py-4 text-white focus:outline-none focus:bg-white/10 transition-all duration-300 appearance-none cursor-pointer text-sm";

  // Success view
  if (isSubmitted) {
    return (
      <div className="bg-[#0A0F1D]/80 backdrop-blur-xl border border-electric-cyan/25 rounded-3xl p-8 lg:p-12 shadow-[0_0_30px_rgba(6,182,212,0.2)] text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-electric-cyan/15 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan shadow-[0_0_15px_rgba(6,182,212,0.25)]">
          {accountType === "multi_property" ? (
            <Crown className="w-8 h-8 text-electric-cyan" />
          ) : (
            <Check className="w-8 h-8 text-electric-cyan" />
          )}
        </div>

        <div className="space-y-3">
          {accountType === "multi_property" ? (
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

        <Button variant="secondary" className="w-full h-14 text-sm font-bold" onClick={onBack}>
          Return to Homepage
        </Button>
      </div>
    );
  }

  // Step One: Selection
  if (!accountType) {
    return (
      <div className="bg-[#0A0F1D]/80 backdrop-blur-xl border border-electric-cyan/20 rounded-3xl p-8 lg:p-12 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div className="space-y-2 mb-6">
          <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Join the Priority Waitlist</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Help us prioritize our expansion routes. Select your account type below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 mb-8">
          <button
            type="button"
            onClick={() => setAccountType("single_home")}
            className="flex flex-col items-start bg-white/5 backdrop-blur-xl border border-white/10 hover:border-electric-cyan/45 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] group relative cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan mb-4 group-hover:bg-electric-cyan/20 transition-colors">
              <Home className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#E5E7EB] uppercase tracking-wider">Single Home</h4>
            <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
              I want to join the waitlist for my individual residence. Help us bring CurbSitter to my street.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setAccountType("multi_property")}
            className="flex flex-col items-start bg-white/5 backdrop-blur-xl border border-white/10 hover:border-electric-cyan/45 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] group relative cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan mb-4 group-hover:bg-electric-cyan/20 transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#E5E7EB] uppercase tracking-wider">Business / Multi-Property</h4>
            <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
              I represent an HOA, property manager, or vacation rental host. Request bulk imports and volume rates.
            </p>
          </button>
        </div>

        <Button type="button" variant="secondary" className="w-full h-14 text-sm font-bold" onClick={onBack}>
          Back to Homepage
        </Button>
      </div>
    );
  }

  // Step Two: Conditional Fields Form
  return (
    <div className="bg-[#0A0F1D]/80 backdrop-blur-xl border border-electric-cyan/20 rounded-3xl p-8 lg:p-12 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
      <button
        type="button"
        onClick={() => {
          setError("");
          setAccountType(null);
        }}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-electric-cyan transition-colors uppercase tracking-wider font-semibold mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Change Account Type ({accountType === "single_home" ? "Single Home" : "Business"})
      </button>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
            {accountType === "single_home" ? "Homeowner Waitlist" : "Business Portfolios"}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {accountType === "single_home" ? (
              <>
                CurbSitter is expanding neighborhood routes weekly. Vote for your ZIP code (<span className="text-electric-cyan font-mono font-bold">{zipCode}</span>).
              </>
            ) : (
              "Provide your contact and portfolio details to qualify for fast-track route activation."
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="w-firstname" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">First Name *</label>
            <input
              id="w-firstname"
              type="text"
              required
              className={inputClass}
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="w-lastname" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Last Name *</label>
            <input
              id="w-lastname"
              type="text"
              required
              className={inputClass}
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="w-email" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Email Address *</label>
          <input
            id="w-email"
            type="email"
            required
            className={inputClass}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {accountType === "single_home" ? (
          // Single Home fields
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="w-phone" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Phone Number (Optional)</label>
              <input
                id="w-phone"
                type="tel"
                className={inputClass}
                placeholder="(928) 555-1234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="w-zip" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Zip Code *</label>
              <input
                id="w-zip"
                type="text"
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
                value={zipCode}
              />
            </div>
          </div>
        ) : (
          // Business fields
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="w-phone" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Phone Number (Optional)</label>
                <input
                  id="w-phone"
                  type="tel"
                  className={inputClass}
                  placeholder="(928) 555-1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="w-orgname" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Organization Name *</label>
                <input
                  id="w-orgname"
                  type="text"
                  required
                  className={inputClass}
                  placeholder="e.g. Whispering Pines HOA"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="w-business-type" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Business Type *</label>
                <div className="relative">
                  <select
                    id="w-business-type"
                    className={selectClass}
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  >
                    <option value="Short-Term Rental Host">Short-Term Rental Host</option>
                    <option value="Property Management">Property Management</option>
                    <option value="HOA/Community Board">HOA / Community Board</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="w-portfolio-size" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Portfolio Size *</label>
                <div className="relative">
                  <select
                    id="w-portfolio-size"
                    className={selectClass}
                    value={portfolioSize}
                    onChange={(e) => setPortfolioSize(e.target.value)}
                  >
                    <option value="2-5 Properties">2-5 Properties</option>
                    <option value="6-15 Properties">6-15 Properties</option>
                    <option value="16-50 Properties">16-50 Properties</option>
                    <option value="50+ Properties">50+ Properties</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
            {error}
          </p>
        )}

        <div className="flex gap-4 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 h-14 text-sm font-bold"
            onClick={() => {
              setError("");
              setAccountType(null);
            }}
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 h-14 text-sm font-extrabold uppercase tracking-wider"
            isLoading={isSubmitting}
          >
            Submit Waitlist
          </Button>
        </div>
      </form>
    </div>
  );
};
