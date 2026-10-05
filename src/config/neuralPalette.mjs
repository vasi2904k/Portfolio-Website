export const DEFAULT_NEURAL_THEME = "blue";

export const NEURAL_PALETTES = {
  green: {
    background: "#050b09", field: "#42705b", dendrite: "#568b73", fiber: "#285341", mist: "#154c37",
    signal: "#5befb2", selected: "#d9ffed", hover: "#aff4d4", available: "#8fceb2", expanded: "#659a80", inactive: "#47665a",
    edge: "#68b491", aura: "#70d7a3", text: "#e0eee5", muted: "#91b2a0", panel: "#0e1c15", border: "#42654e",
  },
  blue: {
    background: "#030914", field: "#1677bd", dendrite: "#168bdd", fiber: "#124774", mist: "#063d7b",
    signal: "#38bfff", selected: "#d5f5ff", hover: "#8be2ff", available: "#39b8fa", expanded: "#2989c4", inactive: "#275d88",
    edge: "#1faeff", aura: "#139fff", text: "#e3f3ff", muted: "#9abbd6", panel: "#071627", border: "#245578",
  },
};

export const NEURAL_QUALITY = {
  desktop: { clusters: 30, fieldNodes: 780, dust: 420, signals: 52, mist: 22, dendriteDepth: 3, spread: 1, dpr: 1.5 },
  mobile: { clusters: 13, fieldNodes: 290, dust: 140, signals: 20, mist: 10, dendriteDepth: 2, spread: .6, dpr: 1 },
  lite: { clusters: 8, fieldNodes: 170, dust: 75, signals: 12, mist: 6, dendriteDepth: 2, spread: .65, dpr: 1 },
};
