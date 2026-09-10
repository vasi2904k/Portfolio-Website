export const GITHUB_USERNAME = "vasi2904k";
export const LINKEDIN_URL = "https://www.linkedin.com/in/mohammed-vasi-khan/";
export const EMAIL = "vk64375@gmail.com";

export const PROFILE = {
  name: "Mohammed Vasi Khan",
  title: "Machine Learning Engineer",
  tagline: "Machine Learning Engineer striving to build impactful AI solutions and solve real-world problems"
};

export const experienceData = [
  {
    title: "BRM Executive",
    company: "Gozoop Group (Client: Club Mahindra)",
    date: "Mar 2026 - Present",
    location: "Remote",
    description: [
      "Manage Brand Reputation Management (BRM) for Club Mahindra by monitoring online sentiment across social media platforms.",
      "Proactively engage with customers to resolve queries, escalating critical issues to ensure high customer satisfaction.",
      "Analyze customer feedback trends and provide actionable insights to improve brand perception."
    ]
  },
  {
    title: "Machine Learning Engineer (Internship)",
    company: "Codmek Softech",
    date: "Mar 2026 - Present",
    location: "Jaipur, Rajasthan, India (Remote)",
    description: [
      "Develop and deploy machine learning models using Python and data analysis techniques.",
      "Collaborate with the engineering team to optimize data pipelines and improve model accuracy.",
      "Contribute to real-world AI projects and implement data-driven solutions."
    ]
  },
  {
    title: "Remote Assistant Specialist",
    company: "TaskUs (Client: Starship Technologies)",
    date: "Jan 2026 - Feb 2026",
    location: "Indore, Madhya Pradesh, India (On-site)",
    description: [
      "Supported operations for autonomous delivery systems under the Starship Technologies project.",
      "Monitored deliveries and assisted in resolving real-time operational issues.",
      "Maintained accuracy and quick response time in a fast-paced support environment."
    ]
  },
  {
    title: "Customer Support Executive",
    company: "Teleperformance (Client: Flipkart)",
    date: "Aug 2025 - Dec 2025",
    location: "Remote",
    description: [
      "Handled L2-level escalations for Flipkart customers via social media platforms.",
      "Resolved complex issues related to orders, refunds, cancellations, and delivery delays.",
      "Coordinated with internal teams to ensure quick resolution, adhering to SLA and TAT policies."
    ]
  },
  {
    title: "Business Owner",
    company: "Self-employed",
    date: "2020 - 2025",
    location: "India",
    description: [
      "Managed end-to-end operations including production, sales, inventory, and customer service.",
      "Built customer loyalty through consistent service quality and direct problem resolution.",
      "Ensured product quality, hygiene standards, and timely delivery for repeat orders."
    ]
  }
];

export const linkedinHighlights = [
  {
    title: "Advanced Regression Techniques",
    description: "Implemented comprehensive regression pipelines, comparing model outputs and feature engineering impact on diverse datasets."
  },
  {
    title: "Exploratory Data Analysis (EDA)",
    description: "Mastered data visualization and statistical analysis workflows to extract actionable feature-level insights."
  },
  {
    title: "Open Source Contributions",
    description: "Consistently documented and published ML projects to GitHub, focusing on clean code and reproducible results."
  }
];

// Manual display name and priority overrides for auto-synced GitHub projects.
// Keys are exact repository names. Only include repos you want to customise.
export const PROJECT_OVERRIDES = {
  "AgroLens-AI":                        { featured: true, displayName: "AgroLens AI",              category: "ai",   priority: 1 },
  "ecommerce-sales":                    { featured: true, displayName: "E-commerce Analysis",       category: "data", priority: 2 },
  "Global-Pollution-Analysis":          { featured: true, displayName: "Global Pollution Analysis", category: "data", priority: 3 },
  "Food-Delivery-Time-Prediction":      { featured: true, displayName: "Delivery Prediction",       category: "ml",   priority: 4 },
  "decision-tree-regression":           { featured: true, displayName: "Decision Tree Regression",  category: "ml",   priority: 5 },
  "Admission-Prediction-Linear-Regression": { featured: true, displayName: "Admission Prediction", category: "ml",   priority: 6 },
  "imdb-movie-eda":                     { featured: true, displayName: "IMDb Movie EDA",            category: "data", priority: 7 },
  "Portfolio-Website":                  { featured: true, displayName: "Neural Portfolio",          category: "web",  priority: 8 },
};

// GitHub topic → graph category mapping. Topics are checked in order.
// The first matching topic wins the classification.
export const TOPIC_CATEGORIES = [
  { topic: "machine-learning",  category: "ml" },
  { topic: "deep-learning",     category: "ml" },
  { topic: "scikit-learn",      category: "ml" },
  { topic: "xgboost",           category: "ml" },
  { topic: "regression",        category: "ml" },
  { topic: "classification",    category: "ml" },
  { topic: "computer-vision",   category: "ai" },
  { topic: "nlp",               category: "ai" },
  { topic: "llm",               category: "ai" },
  { topic: "neural-network",    category: "ai" },
  { topic: "data-analysis",     category: "data" },
  { topic: "pandas",            category: "data" },
  { topic: "eda",               category: "data" },
  { topic: "visualization",     category: "data" },
  { topic: "sql",               category: "data" },
  { topic: "nextjs",            category: "web" },
  { topic: "react",             category: "web" },
  { topic: "api",               category: "web" },
];

// Repos tagged with any of these topics are hidden from the portfolio graph.
export const HIDDEN_TOPICS = ["portfolio-hidden", "practice", "fork-only", "wip"];

// Explicit publishing signals. Other meaningful repositories remain available
// in their deterministic category without automatically becoming prominent.
export const FEATURED_TOPICS = ["portfolio-featured", "portfolio-project"];

export const GITHUB_SYNC = {
  revalidateSeconds: 3600,
  // Anonymous REST requests have a small shared rate limit. Newest repositories
  // are enriched first; GITHUB_TOKEN enables the one-call GraphQL path.
  anonymousEnrichmentLimit: 12,
};
