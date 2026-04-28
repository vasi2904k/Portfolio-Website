# 🚀 Premium AI/ML Engineer Portfolio Template

A stunning, high-performance portfolio template built specifically for AI, Machine Learning, and Data Science professionals. Built with Next.js App Router, Tailwind CSS, and Framer Motion.

## ✨ Features
- **Neural Network Aesthetics**: Includes a beautiful 3D glowing neural brain visual, an interactive mouse spotlight, and an animated data grid background.
- **Live GitHub Integration**: Automatically fetches and displays your actual public GitHub repositories.
- **AI Chatbot**: A built-in AI assistant interface that can answer questions about your experience.
- **Zero-Code Customization**: Everything (name, links, skills, experience) is controlled from a single configuration file!

---

## 🛠️ How to Customize (Zero Coding Required!)

If you want to use this template for yourself, you **do not** need to know how to code. All of the text, links, and project data are stored in one single file.

1. Open the project folder.
2. Navigate to `src/config/config.js` and open it in any text editor (like Notepad or VS Code).
3. Change the details! You will see clear sections for:
   - `GITHUB_USERNAME`: Change this to your exact GitHub username to automatically load your repos in the Projects section.
   - `LINKEDIN_URL` & `EMAIL`: Add your contact info.
   - `PROFILE`: Update the name, title, and tagline shown at the top of the page.
   - `experienceData`: Update the companies, roles, and dates you worked there.
   - `PROJECT_IMAGES`: Map your repository names to custom cover images you put in the `/public` folder.
4. Save the file. The website will automatically update with your new information!

## 🖼️ Update Your Profile Photo

If you want to replace the profile picture shown on the homepage:

1. Put your image file inside the `public` folder.
2. Name it `profile.png` so the site can load it automatically.
3. If you want to use a different file name, update the image path in `src/components/Hero.jsx`.
4. Refresh the site after saving your changes.

For example, the current profile image is loaded from `public/profile.png`.

---

## 💻 How to Run Locally

To test the website on your own computer, you just need Node.js installed.

1. Open your terminal or command prompt.
2. Navigate into this project folder:
   ```bash
   cd C:\Users\dell\Desktop\portfolio
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:3000` to see your portfolio.

If you want to run the production version instead:

1. Build the app:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```

If Node.js is not installed, install the latest LTS version first, then repeat the steps above.

---

## 🌍 How to Deploy (Host for Free)

The easiest and fastest way to get your portfolio live on the internet is using **Vercel** (the creators of Next.js).

1. Upload/Push this code to your own GitHub repository.
2. Go to [Vercel.com](https://vercel.com/) and sign up with your GitHub account.
3. Click **"Add New Project"** and select your portfolio repository.
4. *(Optional)*: Before clicking Deploy, expand the "Environment Variables" section to add a `GITHUB_TOKEN` (if you want higher API limits for fetching projects) or a `GEMINI_API_KEY` (if you connect the chatbot to an external API).
5. Click **Deploy**. In about 2 minutes, Vercel will give you a live, fast URL that you can put on your resume!
