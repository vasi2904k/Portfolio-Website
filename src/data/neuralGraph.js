import { PROFILE, EMAIL, GITHUB_USERNAME, LINKEDIN_URL, FEATURED_PROJECTS, PROJECT_IMAGES, experienceData, linkedinHighlights } from "@/config/config";
const normal = (value) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const names = { ecommercesales: "E-commerce analysis", globalpollutionanalysis: "Global pollution", portfoliowebsite: "Neural portfolio", agrolensai: "AgroLens AI", fooddeliverytimeprediction: "Delivery prediction", decisiontreeregression: "Decision trees", admissionpredictionlinearregression: "Admission prediction", imdbmovieeda: "IMDb analysis" };
const tool = (id, label, summary, tags = []) => ({ id, label, kind: "skill", eyebrow: "TOOLKIT / CONNECTION", title: label, summary, tags });
function groupArchive(collections, level = 0) {
  if (collections.length <= 6) return collections;
  const groups = Array.from({ length: Math.ceil(collections.length / 6) }, (_, index) => ({
    id: `archive-hub-${level}-${index}`, label: `Archive branch ${index + 1}`,
    kind: "branch", title: `Repository archive / branch ${index + 1}`,
    summary: "Follow a connection to explore these repository collections.",
    children: collections.slice(index * 6, index * 6 + 6),
  }));
  return groupArchive(groups, level + 1);
}
function projectNode(repo) {
  return { id: `project-${encodeURIComponent(repo.name.toLowerCase())}`, label: names[normal(repo.name)] || repo.name.replace(/[-_]/g, " "), kind: "project", eyebrow: "PROJECT / OPEN EXPERIMENT", title: names[normal(repo.name)] || repo.name.replace(/[-_]/g, " "), summary: repo.description || `Explore the ${repo.name} repository, its implementation, and the ideas behind the work.`, image: PROJECT_IMAGES[repo.name], tags: [repo.language, ...(repo.topics || []).slice(0, 3)].filter(Boolean), actions: [{ label: "Explore repository", href: repo.html_url || `https://github.com/${GITHUB_USERNAME}/${repo.name}` }, ...(repo.homepage && /^https?:\/\//.test(repo.homepage) ? [{ label: "Open live project", href: repo.homepage }] : [])] };
}
export function createPortfolioGraph(repos = []) {
  const featured = FEATURED_PROJECTS.map(name => repos.find(repo => normal(repo.name) === normal(name)) || { name });
  const remaining = repos.filter(repo => !FEATURED_PROJECTS.some(name => normal(name) === normal(repo.name)));
  const archiveGroups = Array.from({ length: Math.ceil(remaining.length / 6) }, (_, index) => ({ id: `archive-group-${index}`, label: `Collection ${index + 1}`, kind: "branch", title: `Repository collection ${index + 1}`, summary: "More experiments and open source work. Follow a connection to explore the repository.", children: remaining.slice(index * 6, index * 6 + 6).map(projectNode) }));
  return {
    id: "root", label: "VASI KHAN", kind: "root", eyebrow: "MACHINE LEARNING ENGINEER",
    title: "A mind.\nA network.\nPossibilities.", summary: "I’m Mohammed Vasi Khan. I turn complex data into useful systems, and curiosity into real-world experiments.",
    detail: "This is my portfolio, connected. Choose a neuron to explore. Switch to Travel to follow the next connection.",
    children: [
      { id: "about", label: "About", kind: "branch", eyebrow: "01 / THE HUMAN", title: "The human behind\nthe network.", summary: "I’m a machine learning engineer who enjoys connecting data, ideas, and the problems people need solved.", image: "/profile.png", imageType: "portrait", detail: "My path through business, customer experience, and autonomous systems gives me a practical perspective on AI. I care about understanding a problem before choosing the model.", children: [
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
      { id: "projects", label: "Projects", kind: "branch", eyebrow: "03 / THE WORK", title: "Ideas, connected\nto the real world.", summary: "Open experiments in machine learning, data analysis, and engineering. Select a project node to see the work behind it.", children: [...featured.map(projectNode), ...(archiveGroups.length ? [{ id: "archive", label: "More experiments", kind: "branch", title: "The wider archive.", summary: "More public repositories and ideas in progress.", children: groupArchive(archiveGroups) }] : [])] },
      { id: "journey", label: "Journey", kind: "branch", eyebrow: "04 / THE PATH", title: "Every experience.\nAnother connection.", summary: "An evolving journey through people, technology, and real-world problem solving.", children: experienceData.map((job, index) => ({ id: `experience-${index}`, label: job.company.split(" (")[0], kind: "experience", eyebrow: job.date, title: job.title, summary: job.company, detail: job.location, bullets: job.description, tags: [job.date.includes("Present") ? "Current" : "Previous"] })) },
      { id: "connect", label: "Connect", kind: "branch", eyebrow: "05 / WHAT COMES NEXT", title: "Great things start\nwith a connection.", summary: "Have an interesting problem, an idea worth exploring, or an opportunity to build something meaningful? Let’s talk.", children: [
        { id: "email", label: "Email", kind: "contact", title: "Start a conversation.", summary: EMAIL, detail: "Open to ML opportunities, engineering conversations, and thoughtful collaborations.", copy: EMAIL, actions: [{ label: "Send an email", href: `mailto:${EMAIL}` }] },
        { id: "github", label: "GitHub", kind: "contact", title: "Explore the source.", summary: "Code, experiments, and projects in progress.", detail: `github.com/${GITHUB_USERNAME}`, actions: [{ label: "Open GitHub", href: `https://github.com/${GITHUB_USERNAME}` }] },
        { id: "linkedin", label: "LinkedIn", kind: "contact", title: "Keep the connection.", summary: "Follow my learning journey and connect professionally.", actions: [{ label: "Open LinkedIn", href: LINKEDIN_URL }] },
      ] },
    ],
  };
}
