export function NeuralMark() {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M7 9 17 31 26 9M23 22l10-13M23 22l10 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7" cy="9" r="3" fill="currentColor"/><circle cx="17" cy="31" r="3" fill="currentColor"/><circle cx="26" cy="9" r="3" fill="currentColor"/><circle cx="23" cy="22" r="3" fill="currentColor"/></svg>;
}
export default function NeuralIcon({ name, ...props }) {
  const paths = {
    back: <path d="m12 5-7 7 7 7M5 12h14" />,
    home: <><path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/></>,
    focus: <><circle cx="12" cy="12" r="5"/><path d="M3 8V3h5m8 0h5v5m0 8v5h-5M8 21H3v-5"/></>,
    map: <><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M7 5h10M6 7l5 10m7-10-5 10"/></>,
    arrow: <path d="M6 18 18 6M6 6h12v12"/>,
    theme: <><path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M16 3v5m3-2h-6"/></>,
    pause: <path d="M8 5v14M16 5v14"/>,
    play: <path d="m7 4 13 8-13 8z"/>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3h.01"/></>,
    brief: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8m-8 4h8m-8 4h5"/></>,
    lite: <><path d="m12 3 9 9-9 9-9-9zM7 12h10"/></>,
    down: <path d="M12 4v16m-6-6 6 6 6-6"/>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,
  };
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.arrow}</svg>;
}
