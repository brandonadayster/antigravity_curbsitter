import { GlassCard } from '../ui/glass-card';

export const PricingGrid = () => (
  <section id="pricing" className="py-24 px-8">
    <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-[#E5E7EB] tracking-widest uppercase mb-16">
      Select Your Concierge Tier
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
      {['Starter', 'Premium', 'Concierge'].map((tier) => (
        <GlassCard key={tier} imageBacked={true} className="p-8 flex flex-col justify-between h-full transition-all duration-500">
          <div>
            <h3 className="text-xl font-bold text-[#E5E7EB] mb-4">{tier}</h3>
            <p className="text-electric-cyan text-3xl font-extrabold mb-6">
              {tier === 'Starter' ? '$49/mo' : tier === 'Premium' ? '$79/mo' : '$129/mo'}
            </p>
            <ul className="text-[#E5E7EB] space-y-3 mb-8 font-light text-sm">
              <li>✓ Valet Bin Service</li>
              <li>✓ Proof-of-Work Photos</li>
              <li>✓ 24/7 Portal Access</li>
              {tier !== 'Starter' && <li>✓ HOA Violation Protection</li>}
              {tier === 'Concierge' && <li>✓ Custom STR Scheduling</li>}
            </ul>
          </div>
          <button className="w-full bg-electric-cyan/20 hover:bg-electric-cyan/35 border border-electric-cyan/30 text-[#E5E7EB] py-3 rounded-lg font-bold transition-all duration-300">
            Select Tier
          </button>
        </GlassCard>
      ))}
    </div>
  </section>
);
