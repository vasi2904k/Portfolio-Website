import { EMAIL, GITHUB_USERNAME, LINKEDIN_URL, experienceData, linkedinHighlights } from "@/config/config";
import { classifyProject, stableProjectId } from "@/utils/projectClassifier.mjs";
const tool = (id, label, summary, tags = []) => ({ id, label, kind: "skill", eyebrow: "TOOLKIT / CONNECTION", title: label, summary, tags });
function limitBranching(nodes, prefix, level = 0) {
  if (nodes.length <= 6) return nodes;
  const groups = Array.from({ length: Math.ceil(nodes.length / 6) }, (_, index) => ({
    id: `${prefix}-hub-${level}-${index}`, label: `Collection ${index + 1}`,
    kind: "branch", title: `Repository collection ${index + 1}`,
    summary: "Follow a connection to explore this focused collection of repositories.",
    children: nodes.slice(index * 6, index * 6 + 6),
  }));
  return limitBranching(groups, prefix, level + 1);
}
function projectNode(repo) {
  const classification = { ...classifyProject(repo), featured: repo.featured, priority: repo.priority, displayName: repo.title || classifyProject(repo).displayName, category: repo.category || classifyProject(repo).category, subcategory: repo.subcategory || classifyProject(repo).subcategory };
  const displayName = classification.displayName;
  const tags = (repo.tags?.length ? repo.tags : [repo.language, ...(repo.topics || [])]).filter(Boolean).slice(0, 8);
  const github = repo.github || repo.html_url || `https://github.com/${GITHUB_USERNAME}/${repo.name}`;
  const demo = repo.demo || (repo.homepage && /^https?:\/\//.test(repo.homepage) ? repo.homepage : null);
  return {
    id: repo.projectId || stableProjectId(repo),
    label: displayName,
    kind: "project",
    eyebrow: `${classification.featured ? "FEATURED" : "GITHUB SYNC"} / ${(classification.category || "archive").toUpperCase()}`,
    title: displayName,
    summary: repo.description || `Explore the ${displayName} repository, its implementation, and the ideas behind the work.`,
    problem: repo.problem,
    solution: repo.solution,
    architecture: repo.architecture,
    technologies: repo.technologies || [],
    metrics: repo.metrics || [],
    highlights: repo.highlights || [],
    featured: classification.featured,
    priority: classification.priority,
    projectCategory: classification.category,
    subcategory: classification.subcategory,
    repositoryId: repo.repositoryId || String(repo.id || repo.node_id || repo.name),
    tags,
    actions: [
      { label: "Explore repository", href: github },
      ...(demo ? [{ label: "Open live project", href: demo }] : []),
    ],
  };
}
export function createPortfolioGraph(repos = []) {
  const projects = [...new Map(repos.map(repo => [repo.projectId || stableProjectId(repo), repo])).values()]
    .map(repo => ({ ...repo, ...classifyProject(repo), ...(repo.title ? { title: repo.title } : {}) }))
    .filter(repo => !repo.hidden)
    .sort((a, b) => a.priority - b.priority || new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  const categories = [
    { id: "featured", label: "Featured work", title: "Start with the strongest signals.", summary: "Selected projects with the clearest technical evidence, product intent, or deployment story.", match: repo => repo.featured },
    { id: "ai", label: "AI systems", title: "Intelligence beyond the notebook.", summary: "Language, vision, and neural-system experiments classified from repository topics and project evidence.", match: repo => !repo.featured && repo.category === "ai" },
    { id: "ml", label: "Machine learning", title: "Models connected to real problems.", summary: "Regression, classification, training, and evaluation work.", match: repo => !repo.featured && repo.category === "ml" },
    { id: "data", label: "Data & analysis", title: "Patterns before predictions.", summary: "Exploration, preparation, visualization, and data-centered engineering.", match: repo => !repo.featured && repo.category === "data" },
    { id: "web", label: "Web & tools", title: "Interfaces for useful systems.", summary: "Applications, APIs, and engineering tools that turn ideas into usable products.", match: repo => !repo.featured && repo.category === "web" },
    { id: "archive", label: "Experiments", title: "The wider repository archive.", summary: "Meaningful public experiments that remain available without competing with featured work.", match: repo => !repo.featured && !["ai", "ml", "data", "web"].includes(repo.category) },
  ];
  const projectBranches = categories.map(category => {
    const nodes = projects.filter(category.match).map(projectNode);
    if (!nodes.length) return null;
    return { id: `projects-${category.id}`, label: category.label, kind: "branch", eyebrow: `PROJECTS / ${category.label.toUpperCase()}`, title: category.title, summary: category.summary, children: limitBranching(nodes, `projects-${category.id}`) };
  }).filter(Boolean);
  if (!projectBranches.length) projectBranches.push({ id: "projects-empty", label: "Sync pending", kind: "story", title: "Projects are reconnecting.", summary: "GitHub project data is temporarily unavailable. The rest of the portfolio remains ready to explore." });
  return {
    id: "root", label: "VASI KHAN", kind: "root", eyebrow: "MACHINE LEARNING ENGINEER",
    title: "A mind.\nA network.\nPossibilities.", summary: "I’m Mohammed Vasi Khan. I turn complex data into useful systems, and curiosity into real-world experiments.",
    detail: "This is my portfolio, connected. Choose a neuron to explore.",
    children: [
      { id: "about", label: "About", kind: "branch", eyebrow: "01 / THE HUMAN", title: "The human behind\nthe network.", summary: "I'm a machine learning engineer who enjoys connecting data, ideas, and the problems people need solved.", detail: "My path through business, customer experience, and autonomous systems gives me a practical perspective on AI. I care about understanding a problem before choosing the model.", children: [
        { id: "approach", label: "My approach", kind: "story", title: "Understand. Build.\nKeep learning.", summary: "I approach machine learning as an iterative engineering process.", bullets: ["Start with the problem and the people it affects.", "Explore the data and establish a useful baseline.", "Evaluate honestly, document decisions, and improve with every experiment."] },
        { id: "background", label: "Perspective", kind: "story", title: "A perspective built\nin the real world.", summary: "Before and alongside machine learning, I’ve worked in business operations, customer experience, brand reputation, and autonomous delivery support.", detail: "These experiences keep my engineering grounded in practical needs: reliable systems, clear communication, and useful outcomes.", tags: ["India", "Problem solving", "Cross-functional experience"] },
        { id: "learning", label: "Open notebook", kind: "branch", title: "Learning in public.", summary: "Technical practices that make every experiment more useful and repeatable.", children: linkedinHighlights.map((item, index) => ({ id: `note-${index}`, label: ["Regression", "Data exploration", "Open source"][index], kind: "note", title: item.title, summary: item.description, actions: [{ label: "Connect on LinkedIn", href: LINKEDIN_URL }] })) },
      ] },
      { id: "skills", label: "Skills", kind: "branch", eyebrow: "02 / THE TOOLKIT", title: "Different tools.\nOne connected system.", summary: "Follow a branch from the first data point to the final prediction. These are the tools and techniques I use and explore.", children: [
        { id: "python", label: "Python & data", kind: "branch", title: "Good models start\nwith good data.", summary: "Python connects my exploration, data preparation, and machine learning workflows.", tags: ["Python", "Data preparation", "Analysis"], children: [
          tool("python-workflows", "Python", "Building clear, reproducible workflows for data analysis, modeling, and practical automation.", ["Scripts", "Notebooks", "Automation"]),
          tool("pandas", "Pandas", "Cleaning, joining, aggregating, and exploring structured datasets before model training.", ["DataFrames", "EDA", "Preprocessing"]),
          tool("numpy", "NumPy", "Working with numerical arrays and vectorized operations that underpin data and model pipelines.", ["Arrays", "Numerical computing"]),
          tool("sql", "SQL", "Querying and organizing structured data to answer questions and prepare reliable inputs.", ["Queries", "Structured data"]),
        ] },
        { id: "ml", label: "Machine learning", kind: "branch", title: "From patterns\nto predictions.", summary: "Building and comparing models with useful baselines, feature engineering, and thoughtful validation.", children: [
          tool("scikit-learn", "Scikit-learn", "Developing reproducible regression and classification workflows, preprocessing data, and evaluating models.", ["Pipelines", "Regression", "Evaluation"]),
          tool("xgboost", "XGBoost", "Exploring gradient-boosted trees for tabular prediction tasks and comparing their performance against baselines.", ["Boosting", "Tabular data"]),
          tool("features", "Feature engineering", "Turning raw inputs into meaningful representations while watching for leakage and misleading signals.", ["Encoding", "Selection", "Preprocessing"]),
          tool("training", "Model training", "Iterating on training and validation to understand where a model works, where it fails, and what to improve.", ["Validation", "Error analysis", "Iteration"]),
        ] },
        { id: "ai", label: "AI systems", kind: "branch", title: "Beyond\nthe notebook.", summary: "Exploring deep learning, language models, and the interfaces that turn experiments into useful applications.", children: [
          tool("pytorch", "PyTorch", "Exploring neural networks, tensor operations, and flexible deep learning workflows.", ["Deep learning", "Tensors", "Exploring"]),
          tool("llms", "Language models", "Exploring how language models can support useful AI applications and practical workflows.", ["LLMs", "AI applications", "Exploring"]),
          tool("apis", "APIs", "Connecting models and services through clear interfaces so intelligent systems can work together.", ["Integration", "Services"]),
          tool("automation", "Automation", "Connecting repetitive steps into reliable workflows, with attention to inputs, outputs, and failure cases.", ["Workflows", "Python"]),
        ] },
      ] },
      { id: "projects", label: "Projects", kind: "branch", eyebrow: "03 / THE WORK", title: "Ideas, connected\nto the real world.", summary: "Projects synchronize from GitHub, then organize into stable neural branches using topics, languages, README evidence, and manual overrides.", children: projectBranches },
      { id: "journey", label: "Journey", kind: "branch", eyebrow: "04 / THE PATH", title: "Every experience.\nAnother connection.", summary: "An evolving journey through people, technology, and real-world problem solving.", children: experienceData.map((job, index) => ({ id: `experience-${index}`, label: job.company.split(" (")[0], kind: "experience", eyebrow: job.date, title: job.title, summary: job.company, detail: job.location, bullets: job.description, tags: [job.date.includes("Present") ? "Current" : "Previous"] })) },
      { id: "connect", label: "Connect", kind: "branch", eyebrow: "05 / WHAT COMES NEXT", title: "Great things start\nwith a connection.", summary: "Have an interesting problem, an idea worth exploring, or an opportunity to build something meaningful? Let’s talk.", children: [
        { id: "email", label: "Email", kind: "contact", title: "Start a conversation.", summary: EMAIL, detail: "Open to ML opportunities, engineering conversations, and thoughtful collaborations.", copy: EMAIL, actions: [{ label: "Send an email", href: `mailto:${EMAIL}` }] },
        { id: "github", label: "GitHub", kind: "contact", title: "Explore the source.", summary: "Code, experiments, and projects in progress.", detail: `github.com/${GITHUB_USERNAME}`, actions: [{ label: "Open GitHub", href: `https://github.com/${GITHUB_USERNAME}` }] },
        { id: "linkedin", label: "LinkedIn", kind: "contact", title: "Keep the connection.", summary: "Follow my learning journey and connect professionally.", actions: [{ label: "Open LinkedIn", href: LINKEDIN_URL }] },
      ] },
    ],
  };
}
