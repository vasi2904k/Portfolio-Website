export default function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="technical-label mb-2 inline-flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 bg-[#b8f35c]" />
        {eyebrow}
      </p>
      <h2 className="text-4xl font-medium text-[#f0f2ed] md:text-5xl">{title}</h2>
      {description ? <p className="mt-3 text-sm text-slate-400 md:text-base">{description}</p> : null}
    </div>
  );
}
