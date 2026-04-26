export default function ProjectsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="h-5 w-3/5 rounded bg-slate-600/50" />
          <div className="mt-4 h-4 w-full rounded bg-slate-700/50" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-700/50" />
          <div className="mt-6 h-4 w-24 rounded bg-slate-600/50" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-slate-700/50" />
            <div className="h-6 w-20 rounded-full bg-slate-700/50" />
          </div>
        </div>
      ))}
    </div>
  );
}
