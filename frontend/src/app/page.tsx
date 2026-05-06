"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function Home() {
  const [providers, setProviders] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [p, a, s] = await Promise.all([
        apiFetch("/providers/top"),
        apiFetch("/analyses/latest"),
        apiFetch("/sponsors")
      ]);

      setProviders(p);
      setAnalyses(a);
      setSponsors(s);
    } catch (error) {
      console.error("Failed to load home data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00D4FF]"></div>
    </div>
  );
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6 space-y-10 pb-32">

      {/* 🏆 Top Providers */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Top Providers</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      </section>

      {/* 🎬 Sponsors */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Sponsors</h2>

        <SponsorSlider sponsors={sponsors} />
      </section>

      {/* 📊 Analyses */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Latest Analyses</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {analyses.map((a) => (
            <AnalysisCard key={a.id} analysis={a} />
          ))}
        </div>
      </section>

    </div>
  );
}

// 🧱 2. Provider Card (Premium)
function ProviderCard({ provider }: { provider: any }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.2)] transition-shadow"
    >
      <h3 className="text-lg font-semibold">{provider.name}</h3>

      <p className="text-sm text-gray-400 mt-1">
        Score: {provider.score}
      </p>

      <button className="mt-4 w-full bg-[#00D4FF] text-black py-2 rounded-xl font-bold hover:opacity-80 transition">
        Subscribe
      </button>
    </motion.div>
  );
}

// 🎬 3. Sponsor Slider
function SponsorSlider({ sponsors }: { sponsors: any[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
      {sponsors.map((s) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[140px] bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex items-center justify-center hover:border-[#00D4FF]/30 transition-colors"
        >
          <img src={s.logo} className="h-8 object-contain grayscale hover:grayscale-0 transition-all" alt="Sponsor" />
        </a>
      ))}
    </div>
  );
}

// 📊 4. Analysis Card
function AnalysisCard({ analysis }: { analysis: any }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg hover:border-[#00D4FF]/20 transition-colors"
    >
      <h3 className="text-lg font-semibold">{analysis.title}</h3>

      <p className="text-sm text-gray-400 mt-2">
        by {analysis.author}
      </p>

      <button className="mt-4 text-[#00D4FF] text-sm font-bold hover:underline">
        View Analysis →
      </button>
    </motion.div>
  );
}
