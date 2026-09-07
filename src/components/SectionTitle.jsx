export default function SectionTitle({ eyebrow, title, description, children }) {
  return <div className="section-heading"><div><p className="eyebrow"><span className="section-tick" />{eyebrow}</p><h2>{title}</h2>{description && <p className="section-description">{description}</p>}</div>{children}</div>;
}
