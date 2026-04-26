export default function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-300">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-300 tech-chip" />
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold text-white md:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-sm text-slate-300 md:text-base">{description}</p> : null}
    </div>
  );
}
