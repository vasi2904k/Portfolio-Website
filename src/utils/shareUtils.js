/**
 * Social sharing utility functions
 */

export const shareToLinkedIn = (url, title) => {
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInShareUrl, "LinkedInShare", "width=500,height=400");
};

export const shareToTwitter = (url, text) => {
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(twitterShareUrl, "TwitterShare", "width=500,height=400");
};

export const shareToGithub = (url) => {
  window.open(url, "GitHubOpen");
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};
