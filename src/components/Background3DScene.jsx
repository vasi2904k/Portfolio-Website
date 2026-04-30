"use client";

export default function Background3DScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(14,165,233,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(45,212,191,0.06),transparent_50%),radial-gradient(circle_at_10%_80%,rgba(56,189,248,0.04),transparent_40%)]" />
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
        }}
      />
    </div>
  );
}