import Image from 'next/image';
import { GlassCard } from '../ui/glass-card';

export const EditorialHowItWorks = () => (
  <section id="how-it-works" className="py-32 sm:py-40 border-t border-white/5 pt-20 space-y-20 max-w-7xl mx-auto px-6 lg:px-8">
    <div className="text-center max-w-2xl mx-auto space-y-4">
      <span className="text-xs font-semibold uppercase tracking-widest text-electric-cyan">
        The Concierge Process
      </span>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest uppercase leading-[1.2]">
        Trash Day, Handled. How It Works.
      </h2>
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-light">
        We bridge the gap between municipal waste trucks and your property boundary. Complete rollout and return, with zero homeowner effort.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
      {[
        { 
          step: "01",
          title: "Concierge Placement", 
          desc: "Our professional, uniform-clad runners are dispatched to your property on trash day to move bins safely from your garage or backyard to the curb.",
          image: "/images/concierge_placement.png"
        },
        { 
          step: "02",
          title: "Visual Verification", 
          desc: "Once municipal trucks complete their collection, we return your bins, lock your side gates, and send automated, timestamped photo confirmation.",
          image: "/images/visual_verification.png"
        },
        { 
          step: "03",
          title: "Total Control", 
          desc: "Manage your pickup calendar, track active routes, request custom service dates, and pause service while traveling via our web client dashboard.",
          image: "/images/total_control.png"
        }
      ].map((item, i) => (
        <GlassCard key={i} imageBacked={true} className="group p-0 overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col h-full">
            <div className="relative h-64 overflow-hidden bg-deep-onyx">
              {/* Grayscale base image that transitions to color/brightness on hover */}
              <Image 
                src={item.image} 
                alt={item.title} 
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover filter grayscale contrast-110 brightness-90 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-105"
              />
              {/* Soft Onyx to Cyan duotone overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-60 pointer-events-none" />
              <div className="absolute inset-0 bg-electric-cyan/20 mix-blend-color opacity-100 transition-opacity duration-500 group-hover:opacity-40 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0f1d]/40 via-transparent to-electric-cyan/15 pointer-events-none" />
              
              {/* Large Step Indicator Badge */}
              <div className="absolute top-4 left-4 w-10 h-10 rounded-lg bg-deep-onyx/80 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <span className="text-sm font-black text-electric-cyan">{item.step}</span>
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  </section>
);
