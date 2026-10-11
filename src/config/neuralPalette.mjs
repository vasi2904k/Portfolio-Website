export const DEFAULT_NEURAL_THEME = "blue";

export const NEURAL_PALETTES = {
  green: {
    background: "#ffffff", field: "#528675", dendrite: "#287d64", fiber: "#478b76", mist: "#e4f2ec",
    signal: "#167354", selected: "#124e3c", hover: "#20805f", available: "#388b71", expanded: "#50937e", inactive: "#83a89b",
    edge: "#3b8b73", aura: "#75baa1", text: "#173c31", muted: "#526e63", panel: "#ffffff", border: "#c7ded3",
  },
  blue: {
    background: "#ffffff", field: "#5491b8", dendrite: "#168bdd", fiber: "#508fba", mist: "#e6f3fb",
    signal: "#0877b5", selected: "#075580", hover: "#0786c5", available: "#258fbd", expanded: "#4a95b0", inactive: "#82a8bf",
    edge: "#3c96c1", aura: "#68bbdf", text: "#173449", muted: "#526b7c", panel: "#ffffff", border: "#c7dce9",
  },
};

export const NEURAL_QUALITY = {
  desktop: { clusters: 36, fieldNodes: 560, dust: 200, signals: 64, mist: 10, dendriteDepth: 2, spread: 0.6, dpr: 1.5 },
  mobile: { clusters: 14, fieldNodes: 210, dust: 70, signals: 28, mist: 6, dendriteDepth: 1, spread: 0.45, dpr: 1 },
  lite: { clusters: 8, fieldNodes: 140, dust: 40, signals: 16, mist: 4, dendriteDepth: 1, spread: 0.45, dpr: 1 },
};
