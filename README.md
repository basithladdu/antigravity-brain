# antigravity-brain

The missing UI for your Antigravity conversation logs. Stop digging through raw text files and start exploring your history with a proper editorial interface.

### What is this?
Basically a sleek, local-first explorer for everything you've ever built with Antigravity. It pulls directly from your local `/brain` and renders everything in a clean, searchable dashboard.

### 🛠️ Configuration (Required)
Before running, you need to tell the app where your logs are stored:

1.  **Create a `.env.local` file** in the root directory.
2.  **Add your `BRAIN_DIR` path**:
    ```env
    BRAIN_DIR=C:\Users\YourName\.gemini\antigravity\brain
    ```
    *(Note: Replace `YourName` with your actual Windows username)*

### 🚀 Setup
1. Clone it.
2. `npm install`
3. `npm run dev`
4. Open [localhost:3000](http://localhost:3000)

### Features
- **Editorial UI**: Minimalist Monochrome design with Playfair Display typography.
- **Advanced Filtering**: Sort by session size, date, or title. Filter by time (Today, Week, Month).
- **Session Pinning**: Hit the `#` icon to keep important sessions at the top.
- **Fast Search**: `Cmd/Ctrl + K` or `/` to search through session titles.
- **Copy Everything**: One-click copy for code blocks and full messages.

### How to Use
1. **Explore**: Use the sidebar to search through all historical sessions indexed from your local brain.
2. **Filter**: Narrow down results by date or sort by session size.
3. **Retrieve**: Instantly copy prompts or AI responses to your clipboard.

---
built for the builders.
