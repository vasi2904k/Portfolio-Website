export const GITHUB_USERNAME = "vasi2904k";
export const LINKEDIN_URL = "https://www.linkedin.com/in/mohammed-vasi-khan/";
export const EMAIL = "vk64375@gmail.com";

export const PROFILE = {
  name: "Mohammed Vasi Khan",
  title: "Machine Learning Engineer",
  tagline: "Machine Learning Engineer striving to build impactful AI solutions and solve real-world problems"
};

export const PORTFOLIO_CHATBOT = {
  intro: "A lightweight portfolio assistant for quick answers about projects, skills, and contact details.",
  prompts: ["What do you build?", "Show me your best projects.", "What tools do you use?", "How can I contact you?"],
  systemPrompt:
    "You are a warm, natural-sounding portfolio assistant for Mohammed Vasi Khan. Reply like a real person in a professional but friendly tone. Keep answers concise, specific, and conversational. Use the portfolio details provided to answer questions about projects, skills, contact, and background. If the user asks something outside the portfolio, be honest, say you are best at portfolio-related questions, and offer a helpful next step. Avoid sounding robotic, avoid mentioning policies, and do not claim to have capabilities you do not have."
};

export const CHAT_PROVIDER = "gemini";

export const FEATURED_PROJECTS = [
  "ecommerce-sales",
  "Global-Pollution-Analysis",
  "Portfolio-Website",
  "AgroLens-AI",
  "Food-Delivery-Time-Prediction",
  "decision-tree-regression",
  "Admission-Prediction-Linear-Regression",
  "imdb-movie-eda"
];

// Project section behavior control:
// mode: "manual" uses FEATURED_PROJECTS order; "auto" uses topic/star fallback.
// strictManual: when true and mode is "manual", only FEATURED_PROJECTS are shown.
// showCount: maximum number of cards rendered.
export const PROJECT_SETTINGS = {
  mode: "manual",
  strictManual: true,
  showCount: 7
};

// Optional cover image per repository. Use paths from /public or full external URLs.
export const PROJECT_IMAGES = {
  "ecommerce-sales": "/projects/ecommerce-sales.png",
  "Portfolio-Website": "/projects/portfolio.png",
  "AgroLens-AI": "/projects/agro-lens.png",
  "Food-Delivery-Time-Prediction": "/projects/food-delivery.png",
  "decision-tree-regression": "/projects/decision-tree.png",
  "Admission-Prediction-Linear-Regression": "/projects/admission.png",
  "imdb-movie-eda": "/projects/imdb-eda.png",
  "Global-Pollution-Analysis": "/projects/global-pollution.png"
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

// Map insights to specific projects so this section is meaningful and editable.
export const modelInsights = [
  {
    project: "decision-tree-regression",
    task: "Insurance charge prediction",
    metrics: [
      { label: "R2", value: "0.86" },
      { label: "MAE", value: "2390" },
      { label: "RMSE", value: "4120" }
    ],
    confusionMatrix: null,
    trend: [58, 64, 69, 74, 79, 84],
    trendLabel: "Validation score trend"
  },
  {
    project: "Admission-Prediction-Linear-Regression",
    task: "Admission chance regression",
    metrics: [
      { label: "R2", value: "0.82" },
      { label: "MAE", value: "0.06" },
      { label: "RMSE", value: "0.09" }
    ],
    confusionMatrix: null,
    trend: [52, 60, 67, 71, 76, 81],
    trendLabel: "Cross-validation trend"
  },
  {
    project: "imdb-movie-eda",
    task: "Exploratory analysis",
    metrics: [
      { label: "Rows", value: "5K+" },
      { label: "Features", value: "12" },
      { label: "Null Fixes", value: "7 columns" }
    ],
    confusionMatrix: null,
    trend: [40, 50, 63, 70, 74, 78],
    trendLabel: "Analysis completion trend"
  }
];
