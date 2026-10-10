export const DEFAULT_NEURAL_THEME = "blue";

export const NEURAL_PALETTES = {
  green: {
    background: "#14251e", field: "#5a6a5e", dendrite: "#6b7e6f", fiber: "#3a5a4e", mist: "#2a4a3a",
    signal: "#8fbfa8", selected: "#eefaf5", hover: "#c7e8d8", available: "#a8c9b5", expanded: "#7a9e8c", inactive: "#5a7a6f",
    edge: "#7a9e8c", aura: "#8cbf9b", text: "#dce8e0", muted: "#8a9bab", panel: "#0e1c15", border: "#5a6a5e",
  },
  blue: {
    background: "#091e2a", field: "#3a5a6e", dendrite: "#4a6b82", fiber: "#2a4a5a", mist: "#1a2a3a",
    signal: "#6bcbce", selected: "#e6f9f8", hover: "#a8d8e8", available: "#5cb3c9", expanded: "#4a95b0", inactive: "#3a6b82",
    edge: "#4a95b0", aura: "#6bb6ce", text: "#e0e8e5", muted: "#8a9bab", panel: "#071627", border: "#3a5a6e",
  },
};

export const NEURAL_QUALITY = {
  desktop: { clusters: 20, fieldNodes: 400, dust: 200, signals: 30, mist: 10, dendriteDepth: 2, spread: 0.8, dpr: 1.5 },
  mobile: { clusters: 8, fieldNodes: 150, dust: 70, signals: 12, mist: 6, dendriteDepth: 1, spread: 0.5, dpr: 1 },
  lite: { clusters: 5, fieldNodes: 100, dust: 40, signals: 8, mist: 4, dendriteDepth: 1, spread: 0.5, dpr: 1 },
};
