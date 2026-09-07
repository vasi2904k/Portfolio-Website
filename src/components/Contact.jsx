"use client";
import { useEffect, useRef, useState } from "react";
import { EMAIL, GITHUB_USERNAME, LINKEDIN_URL } from "@/config/config";
import Reveal from "@/components/Reveal";
export default function Contact() {
  const [copyState, setCopyState] = useState("Copy email");
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setCopyState("Email copied"); }
    catch { setCopyState("Please select the email to copy"); }
    clearTimeout(timer.current); timer.current = setTimeout(() => setCopyState("Copy email"), 3000);
  };
  return <><section id="contact" className="content-section contact-section"><Reveal><div className="contact-panel"><div className="contact-network" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><p className="eyebrow"><span className="status-dot" /> 06 / THE NEXT CONNECTION</p><h2>Great things start<br />with a <span className="gradient-text">connection.</span></h2><p className="contact-description">Have an interesting problem, an idea worth exploring,<br className="desktop-break" /> or an opportunity to build something meaningful? Let’s talk.</p><div className="contact-actions"><a className="button button-primary" href={`mailto:${EMAIL}`}>Start a conversation <span aria-hidden="true">↗</span></a><button type="button" className="copy-email" onClick={copyEmail} aria-live="polite">{copyState} <span aria-hidden="true">⧉</span></button></div><a className="contact-email" href={`mailto:${EMAIL}`}>{EMAIL}</a><div className="contact-socials mono"><a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">GITHUB ↗</a><a href={LINKEDIN_URL} target="_blank" rel="noreferrer">LINKEDIN ↗</a><span><span className="status-dot" /> OPEN TO IDEAS & OPPORTUNITIES</span></div></div></Reveal></section><footer className="site-footer"><a href="#home" className="brand"><span className="brand-symbol" aria-hidden="true">V<span>.</span></span><span>VASI KHAN</span></a><p className="mono">© {new Date().getFullYear()} MOHAMMED VASI KHAN <span>BUILT WITH CURIOSITY.</span></p><a href="#home" className="back-top mono">BACK TO TOP ↑</a></footer></>;
}
