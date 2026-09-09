export const NEURAL_PALETTES = {
  green: {
    background: "#050b09", field: "#42705b", dendrite: "#568b73", fiber: "#285341", mist: "#154c37",
    signal: "#5befb2", selected: "#d9ffed", hover: "#aff4d4", available: "#8fceb2", expanded: "#659a80", inactive: "#47665a",
    edge: "#68b491", aura: "#70d7a3", text: "#e0eee5", muted: "#91b2a0", panel: "#0e1c15", border: "#42654e",
  },
  blue: {
    background: "#06090f", field: "#767e8d", dendrite: "#a0adbf", fiber: "#495768", mist: "#243b5b",
    signal: "#53aaff", selected: "#f0f6ff", hover: "#c9e4ff", available: "#a1ccef", expanded: "#7b96b2", inactive: "#596a7b",
    edge: "#599ad2", aura: "#559cde", text: "#e5ebf3", muted: "#a3b3c6", panel: "#101923", border: "#46586c",
  },
};

export const NEURAL_QUALITY = {
  desktop: { clusters: 30, fieldNodes: 780, dust: 420, signals: 52, mist: 22, dendriteDepth: 3, spread: 1, dpr: 1.5 },
  mobile: { clusters: 13, fieldNodes: 290, dust: 140, signals: 20, mist: 10, dendriteDepth: 2, spread: .6, dpr: 1 },
  lite: { clusters: 8, fieldNodes: 170, dust: 75, signals: 12, mist: 6, dendriteDepth: 2, spread: .65, dpr: 1 },
};
