import { GlassCard } from '../ui/glass-card';

export const WaitlistFooter = () => (
  <section id="waitlist" className="py-24 px-8">
    <GlassCard imageBacked={true} className="max-w-3xl mx-auto p-16 text-center transition-all duration-500">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E5E7EB] tracking-widest uppercase mb-6">
        Not in a service zone yet?
      </h2>
      <p className="text-slate-300 mb-8 font-light text-sm">
        Join our exclusive waitlist. We notify residents based on route density requests.
      </p>
      <form className="flex flex-col sm:flex-row gap-4">
        <input 
          type="email" 
          placeholder="Enter your email" 
          className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 text-[#E5E7EB] placeholder-slate-500 focus:outline-none focus:border-electric-cyan/50" 
        />
        <button className="bg-electric-cyan/20 hover:bg-electric-cyan/35 border border-electric-cyan/30 text-[#E5E7EB] px-8 py-3 rounded-lg font-bold transition-all duration-300">
          Join Waitlist
        </button>
      </form>
    </GlassCard>
  </section>
);
