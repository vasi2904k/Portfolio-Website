import Reveal from "@/components/Reveal";

const skillGroups = [
  {
    title: "Programming",
    items: ["Python"]
  },
  {
    title: "Machine Learning",
    items: ["Scikit-learn", "XGBoost"]
  },
  {
    title: "Deep Learning",
    items: ["PyTorch"]
  },
  {
    title: "Data & Tools",
    items: ["Pandas", "NumPy", "Streamlit"]
  }
];

export default function Skills() {
  return (
    <section id="skills" className="pt-20">
      <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-glass backdrop-blur-xl">
        {skillGroups.map((group, index) => (
          <Reveal key={group.title} delay={index * 50}>
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8 border-b border-white/5 pb-6 last:border-0 last:pb-0">
              <h3 className="w-40 shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
                {group.title}
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/10 bg-slate-900/50 px-4 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:border-sky-400/50 hover:text-sky-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
