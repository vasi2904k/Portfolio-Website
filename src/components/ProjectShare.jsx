"use client";

import { useState } from "react";
import { shareToLinkedIn, shareToTwitter, shareToGithub, copyToClipboard } from "@/utils/shareUtils";

export default function ProjectShare({ repo }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(repo.html_url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkedInShare = () => {
    shareToLinkedIn(repo.html_url, `Check out ${repo.name} by Mohammed Vasi Khan`);
  };

  const handleTwitterShare = () => {
    const text = `Impressive project: ${repo.name} - ${repo.description || repo.name}`;
    shareToTwitter(repo.html_url, text);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleLinkedInShare}
        title="Share on LinkedIn"
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#0A66C2]/20 hover:bg-[#0A66C2]/40 text-[#0A66C2] transition-colors duration-200"
        aria-label="Share on LinkedIn"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.047-8.733 0-9.636h3.554v1.364c.429-.663 1.196-1.602 2.905-1.602 2.121 0 3.71 1.388 3.71 4.372v5.502zM5.337 8.855c-1.144 0-1.915-.761-1.915-1.712 0-.951.77-1.71 1.954-1.71 1.185 0 1.916.759 1.94 1.71 0 .951-.755 1.712-1.979 1.712zm1.581 11.597H3.635V9.816h3.283v10.636zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      </button>

      <button
        onClick={handleTwitterShare}
        title="Share on Twitter"
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-black/30 hover:bg-black/50 text-white transition-colors duration-200"
        aria-label="Share on Twitter"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 002.856-9.86 10.02 10.02 0 01-2.857 2.856c-5.034-5.034-13.136-5.034-18.17 0-5.044 5.034-5.034 13.136 0 18.17 5.034 5.034 13.136 5.034 18.17 0a9.937 9.937 0 001.414-3.848c.119-.355.179-.74.179-1.129 0-5.068-4.113-9.181-9.181-9.181-.39 0-.775.06-1.129.179A9.937 9.937 0 0023.953 4.57zM8.149 20.66a8.147 8.147 0 01-4.743-1.53c3.341 3.432 8.975 3.432 12.316 0a8.147 8.147 0 01-7.573 1.53z" />
          <path d="M12 14.3a2.3 2.3 0 100-4.6 2.3 2.3 0 000 4.6z" />
        </svg>
      </button>

      <button
        onClick={handleCopyLink}
        title="Copy link"
        className="relative inline-flex items-center justify-center h-8 w-8 rounded-lg bg-sky-500/20 hover:bg-sky-500/40 text-sky-400 transition-colors duration-200"
        aria-label="Copy link"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {copied && <span className="absolute -top-8 text-xs bg-slate-900 px-2 py-1 rounded whitespace-nowrap border border-slate-700">Copied!</span>}
      </button>

      <a
        href={repo.html_url}
        target="_blank"
        rel="noreferrer"
        title="Open on GitHub"
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-700/30 hover:bg-slate-600/50 text-slate-300 transition-colors duration-200"
        aria-label="Open on GitHub"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>
    </div>
  );
}
