"use client";

import { useEffect } from "react";

export default function LinkedInBadge() {
  useEffect(() => {
    // Reload LinkedIn badge script after component mounts
    if (typeof window !== "undefined" && window.LI_Ready !== undefined) {
      window.LI_Ready();
    }
  }, []);

  return (
    <div
      className="badge-base LI-profile-badge"
      data-locale="en_US"
      data-size="medium"
      data-theme="dark"
      data-type="VERTICAL"
      data-vanity="mohammed-vasi-khan"
      data-version="v1"
    >
      <a 
        className="badge-base__link LI-simple-link" 
        href="https://www.linkedin.com/in/mohammed-vasi-khan?trk=profile-badge"
      >
        Mohammed Vasi Khan
      </a>
    </div>
  );
}
