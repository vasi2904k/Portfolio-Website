import { linkedinHighlights, LINKEDIN_URL } from "@/config/config";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
export default function LinkedIn() {
  return <section id="linkedin" className="content-section"><SectionTitle eyebrow="05 / OPEN NOTEBOOK" title={<>Learning in public.<br /><span className="muted-heading">Growing through practice.</span></>}><a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="text-link">Follow on LinkedIn ↗</a></SectionTitle><div className="notes-grid">{linkedinHighlights.map((item, index) => <Reveal key={item.title} delay={index * 70}><article className="note-card"><div className="note-top mono"><span>FIELD NOTE / 0{index + 1}</span><span aria-hidden="true">↗</span></div><div className={`note-glyph glyph-${index}`} aria-hidden="true"><i /><i /><i /><i /><i /></div><h3>{item.title}</h3><p>{item.description}</p><span className="note-bottom mono">EXPERIMENT. DOCUMENT. REPEAT.</span></article></Reveal>)}</div></section>;
}
