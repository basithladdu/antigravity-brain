# antigravity-brain

The missing UI for your Antigravity conversation logs. Stop digging through raw text files and start exploring your history with a proper editorial interface.

### What is this?
Basically a sleek, local-first explorer for everything you've ever built with Antigravity. It pulls directly from your local `/brain` and renders everything in a clean, searchable dashboard.

### Features
- **Editorial UI**: Minimalist Monochrome design with Playfair Display typography.
- **Advanced Filtering**: Sort by session size, date, or title. Filter by time (Today, Week, Month).
- **Fast Search**: Find that one snippet you forgot weeks ago.
- **Copy Everything**: One-click copy for code blocks and full messages.
- **Local First**: Reads directly from your filesystem. No cloud, no lag.

### How to Use
1. **Explore**: Use the sidebar to search through all historical sessions indexed from your local brain.
2. **Filter**: Narrow down results by date or sort by session size to find specific technical discussions.
3. **Retrieve**: Instantly copy prompts or AI responses to your clipboard with editorial-style controls.

### Setup
1. Clone it.
2. `npm install`
3. `npm run dev`
4. Open [localhost:3000](http://localhost:3000)

### Config
By default, it looks here: `C:\Users\basit\.gemini\antigravity\brain`.
If you moved your brain or are on a non-Windows machine, change the `BRAIN_DIR` path in `src/lib/config.ts`.

---
built for the builders.
