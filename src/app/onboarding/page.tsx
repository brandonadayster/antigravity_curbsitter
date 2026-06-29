"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Navigation, Star, Phone, MessageSquare, 
  Send, ChevronDown, Check, Loader2, X 
} from "lucide-react";

// Testimonials data for rotating block
const TESTIMONIALS = [
  {
    name: "Eleanor V. (Seniors Community)",
    rating: 5,
    text: "At 78, hauling heavy bins in the Prescott winters was a major struggle. CurbSitter is a lifesaver. Bins go out, bins come back, and the gates are locked perfectly. True peace of mind."
  },
  {
    name: "Marcus K. (Short-Term Rental Host)",
    rating: 5,
    text: "Coordinate guest check-outs with municipal waste day was my biggest headache. CurbSitter automated everything. The photo proof is invaluable for absentee owners!"
  },
  {
    name: "Sarah & David G. (HOA Residents)",
    rating: 4.8,
    text: "Our HOA is extremely strict about bin storage. We used to get notices constantly when traveling. Not anymore. CurbSitter handles it flawlessly and on time."
  }
];

// Dynamic FAQs based on Property Type
const FAQS: Record<"Residential" | "Vacation Rental" | "HOA", { q: string; a: string }[]> = {
  "Residential": [
    {
      q: "Where do I leave my bins?",
      a: "Leave your bins in their standard storage location (side gate, garage, or backyard). Our professional runners retrieve them, pull them to the curb, and return them securely after pickup."
    },
    {
      q: "When is service scheduled?",
      a: "Our runners are dispatched on your local municipal trash day. Bins are rolled out to the curb in the morning, and returned safely to their designated storage spot once collection is complete."
    },
    {
      q: "Do you provide service on holidays?",
      a: "Yes. If municipal collection services are delayed or rescheduled due to a public holiday, we align our dispatch schedule accordingly to ensure zero service gaps."
    },
    {
      q: "What happens in bad weather?",
      a: "We operate through all standard Prescott weather conditions (rain, snow, heat). In the event of extreme winter storms, we coordinate schedule adjustments via text/email alerts."
    },
    {
      q: "Can I adjust my bin counts later?",
      a: "Absolutely. You can easily add or remove bins, change your collection frequency, or update billing cycles at any time through the secure client portal."
    }
  ],
  "HOA": [
    {
      q: "Are you compliant with strict HOA rules?",
      a: "Yes. CurbSitter was designed specifically to protect homeowners from HOA fines. We guarantee bins are returned from the curb within the strict hours mandated by your association rules."
    },
    {
      q: "Do you service gated HOA communities?",
      a: "Yes. Our professional runners are background checked and fully credentialed. We coordinate gate codes and security access protocols directly."
    },
    {
      q: "Are you licensed and insured?",
      a: "CurbSitter LLC is fully licensed and carries comprehensive general liability insurance, ensuring absolute protection for your property during valet entry."
    },
    {
      q: "Do you offer neighborhood-wide bulk pricing?",
      a: "Yes. We partner with HOA boards and community developers to offer group discounts and bulk rates for entire streets or subdivisions."
    },
    {
      q: "How do you track special storage guidelines?",
      a: "Each home has a custom property profile. Our runners access GPS-located photos and detailed instructions showing exactly where your HOA rules require bins to be stored."
    }
  ],
  "Vacation Rental": [
    {
      q: "How do you handle guest turnover days?",
      a: "We coordinate seamlessly with your check-out schedules. Bins are cleared immediately, keeping the property pristine for incoming guests."
    },
    {
      q: "What if guests leave excessive trash?",
      a: "We offer custom add-on cleanup services, including extra waste bagging, excess bin handling, and driveway cleanup, to ensure guest overflows are cleared."
    },
    {
      q: "How do runners access locked side gates or properties?",
      a: "We store secure access notes (lockbox codes, keypad entry keys, mechanical gate clickers) using encrypted systems, allowing runners keyless entry only on service days."
    },
    {
      q: "Do you send visual proof to property managers?",
      a: "Yes. After every service, we send real-time, timestamped photos of the bins safely returned and gates locked, giving absentee property managers complete verification."
    },
    {
      q: "Can I pause service between bookings?",
      a: "Yes. You can activate vacation holds, occupancy pauses, or scale service days up/down directly through the CurbSitter client app."
    }
  ]
};

function OnboardingContent() {
  const searchParams = useSearchParams();
  const zipQuery = searchParams.get("zip") || "";
  const [propertyType, setPropertyType] = useState<"Residential" | "Vacation Rental" | "HOA">("Residential");
  
  // Testimonial rotation state
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  
  // FAQ accordion active indices
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Modal contact form states
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMsg.trim()) return;
    
    setIsSubmittingContact(true);
    // Mock API delay
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMsg("");
      // Auto close success message
      setTimeout(() => {
        setContactSuccess(false);
        setShowContactModal(false);
      }, 2500);
    }, 1200);
  };

  const activeFaqList = FAQS[propertyType] || FAQS.Residential;

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070')] bg-fixed bg-cover bg-center">
      <div className="min-h-screen bg-gradient-to-b from-black/80 via-[#0A0F1D]/90 to-[#0A0F1D] text-foreground flex flex-col justify-between relative overflow-hidden">
        
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-electric-cyan/5 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3 z-0" />
        
        {/* Minimal Header */}
        <header className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-6 z-30 border-b border-white/5">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg bg-electric-cyan flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Navigation className="w-5 h-5 text-deep-onyx rotate-45" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Curb<span className="text-electric-cyan">Sitter</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a href="#login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                Client Login
              </a>
              <Button variant="glow" size="sm">
                Get Started
              </Button>
            </div>
          </nav>
        </header>

        {/* Main Grid Content */}
        <main className="relative flex-1 py-16 z-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-[1400px] mx-auto px-6 lg:px-12">
            
            {/* Left Column: Onboarding Form */}
            <div className="col-span-1 lg:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 lg:p-16 shadow-2xl">
              <OnboardingFlow 
                initialZip={zipQuery} 
                onPropertyTypeChange={(type) => {
                  if (type === "single_family") setPropertyType("Residential");
                  else if (type === "short_term_rental") setPropertyType("Vacation Rental");
                  else if (type === "hoa") setPropertyType("HOA");
                }} 
              />
            </div>

            {/* Right Column: Trust Panel */}
            <div className="col-span-1 lg:col-span-4 sticky top-32 self-start h-fit space-y-8">
              
              {/* Customer Reviews Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-electric-cyan">What Clients Say</h3>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-electric-cyan text-electric-cyan" />
                    ))}
                  </div>
                </div>
                
                <div className="h-44 relative flex flex-col justify-between">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentReviewIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-slate-300 italic leading-relaxed font-light">
                        &quot;{TESTIMONIALS[currentReviewIndex].text}&quot;
                      </p>
                      <span className="block text-xs font-bold text-[#E5E7EB] pt-1">
                        {TESTIMONIALS[currentReviewIndex].name}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Testimonial navigation dots */}
                  <div className="flex gap-1.5 justify-center mt-4">
                    {TESTIMONIALS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentReviewIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentReviewIndex === i ? "bg-electric-cyan w-4" : "bg-slate-700"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic FAQs Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-electric-cyan mb-4">
                  {propertyType} FAQs
                </h3>
                
                <div className="space-y-3">
                  {activeFaqList.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div key={index} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full flex items-center justify-between text-left py-1 text-sm font-semibold text-[#E5E7EB] hover:text-white transition-colors"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p className="text-xs text-slate-400 font-light leading-relaxed mt-2 pl-1">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Support Block */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-electric-cyan">Still have questions?</h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Our local Prescott client support team is standing by to help secure your property.
                </p>
                
                <div className="space-y-3 pt-2">
                  <a 
                    href="tel:5202259713" 
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[#E5E7EB] py-2.5 rounded-lg text-xs font-semibold transition-all duration-300"
                  >
                    <Phone className="w-3.5 h-3.5 text-electric-cyan" />
                    Call (520) 225-9713
                  </a>
                  
                  <button 
                    onClick={() => alert("Connecting with live agent... chat service will load shortly.")}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[#E5E7EB] py-2.5 rounded-lg text-xs font-semibold transition-all duration-300"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-electric-cyan" />
                    Chat with a Live Agent
                  </button>
                  
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-electric-cyan/20 hover:bg-electric-cyan/35 border border-electric-cyan/30 text-[#E5E7EB] py-2.5 rounded-lg text-xs font-semibold transition-all duration-300"
                  >
                    <Send className="w-3.5 h-3.5 text-electric-cyan" />
                    Send a Message
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Empty space/offset for spacing, hiding global footer on this page */}
        <div className="h-6" />

        {/* Support Contact Modal */}
        <AnimatePresence>
          {showContactModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="w-full max-w-md bg-gradient-to-b from-[#0A0F1D] to-[#131B2E] border border-white/10 rounded-2xl p-6 relative shadow-2xl overflow-hidden"
              >
                {/* Corner accent glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-electric-cyan/20 to-transparent blur-md rounded-tr-2xl pointer-events-none" />

                <button 
                  onClick={() => setShowContactModal(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">Send a Message</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Complete the form below. A Prescott route coordinator will respond within 15 minutes.
                    </p>
                  </div>

                  {contactSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-8 text-center space-y-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 flex items-center justify-center mx-auto text-electric-cyan">
                        <Check className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-white">Message Sent Successfully</p>
                      <p className="text-xs text-slate-400">Thank you. We will be in touch shortly.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Your Name</label>
                        <input 
                          type="text" 
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-[#E5E7EB] placeholder-slate-600 focus:outline-none focus:border-electric-cyan/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-[#E5E7EB] placeholder-slate-600 focus:outline-none focus:border-electric-cyan/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Message</label>
                        <textarea 
                          rows={4}
                          required
                          value={contactMsg}
                          onChange={(e) => setContactMsg(e.target.value)}
                          placeholder="How can we help you today?"
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-[#E5E7EB] placeholder-slate-600 focus:outline-none focus:border-electric-cyan/50 resize-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={isSubmittingContact}
                        className="w-full flex items-center justify-center gap-2 bg-electric-cyan/20 hover:bg-electric-cyan/35 border border-electric-cyan/30 text-[#E5E7EB] py-3 rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50"
                      >
                        {isSubmittingContact ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-electric-cyan" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-electric-cyan" />
                            Submit Inquiry
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen bg-[#0A0F1D] text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-electric-cyan mx-auto" />
          <p className="text-sm text-slate-400 font-light">Loading premium concierge setup...</p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
