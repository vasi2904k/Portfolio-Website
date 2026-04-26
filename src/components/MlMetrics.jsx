import { modelInsights } from "@/config/config";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";

export default function MlMetrics() {
  return (
    <section id="metrics" className="pt-20">
      <SectionTitle
        eyebrow="Model Insights"
        title="Project-wise Metrics and Diagnostics"
        description="Each card maps metrics to a specific GitHub project so the numbers have clear context."
      />

      <div className="grid gap-6">
        {modelInsights.map((insight, index) => (
          <Reveal key={insight.project} delay={index * 90}>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Project</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{insight.project}</h3>
                  <p className="mt-1 text-sm text-slate-300">{insight.task}</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {insight.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4 lg:col-span-1">
                  <p className="text-sm text-white">Confusion Matrix</p>
                  {insight.confusionMatrix ? (
                    <div className="mt-4 grid aspect-square grid-cols-2 gap-2 text-center text-sm">
                      <div className="rounded bg-emerald-400/45 p-3 text-white">TN {insight.confusionMatrix.tn}</div>
                      <div className="rounded bg-rose-400/55 p-3 text-white">FP {insight.confusionMatrix.fp}</div>
                      <div className="rounded bg-rose-400/40 p-3 text-white">FN {insight.confusionMatrix.fn}</div>
                      <div className="rounded bg-emerald-400/55 p-3 text-white">TP {insight.confusionMatrix.tp}</div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-300">
                      Not applicable for this project because it is a regression or EDA workflow.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4 lg:col-span-1">
                  <p className="text-sm text-white">{insight.trendLabel}</p>
                  <div className="mt-4 flex h-40 items-end gap-2">
                    {insight.trend.map((bar, trendIndex) => (
                      <div key={trendIndex} className="flex w-full flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-sky-500/45 to-sky-300/85"
                          style={{ height: `${bar}%` }}
                        />
                        <span className="text-[10px] text-slate-400">{trendIndex + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
