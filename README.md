# HR Helper Suite

This is a React project built with Vite.

## Setup

1. Make sure you have Node.js installed.
2. Clone the repository.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key.

## Local Development

Start the development server:

```bash
npm run dev
```

## Deployment

This project is configured with a GitHub Action (`.github/workflows/deploy.yml`) to automatically deploy to GitHub Pages whenever code is pushed to the `main` branch.

To enable GitHub Pages:

1. Go to your repository settings on GitHub.
2. Navigate to "Pages" under Code and automation.
3. Under "Build and deployment", set the source to "GitHub Actions".
