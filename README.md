# ⚡ Anti-Gravity AI News Digest

A fully automated daily AI news digest — articles fetched from NewsAPI, RSS feeds, and HackerNews, summarized by **Claude Code** running headlessly in **GitHub Actions**, served via a **Next.js** site on **GitHub Pages**.

---

## Architecture

```
News APIs / RSS / HackerNews
        ↓
GitHub Actions (cron 07:00 UTC)
        ↓
scripts/fetch_news.py  →  /tmp/articles.json
        ↓
claude -p "..." --output-format text  ←  CLAUDE.md instructions
        ↓
digests/YYYY-MM-DD.md  →  git commit
        ↓
GitHub Pages (Next.js static site)
```

---

## Step 1 — Clone and init the repo

```bash
git clone https://github.com/YOUR_USERNAME/ai-news-digest.git
cd ai-news-digest
git init    # if starting fresh
```

---

## Step 2 — Install Claude Code locally

```bash
# Requires Node.js 18+
npm install -g @anthropic-ai/claude-code

# Verify
claude --version
```

---

## Step 3 — Get your API keys

| Key | Where to get it | Required |
|-----|----------------|----------|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com → API Keys | ✅ Yes |
| `NEWS_API_KEY` | https://newsapi.org/register (free tier: 100 req/day) | Recommended |

---

## Step 4 — Add secrets to GitHub

1. Go to your repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add:
   - `ANTHROPIC_API_KEY` = your Anthropic key
   - `NEWS_API_KEY` = your NewsAPI key

---

## Step 5 — Install Claude GitHub App

```bash
# In your project directory, with Claude Code installed:
claude

# Then inside Claude Code, run:
/install-github-app
```

This guides you through installing the GitHub App to your repo and wiring up the workflow secrets.

Alternatively: visit https://github.com/apps/claude and install manually.

---

## Step 6 — Enable GitHub Pages

1. Repo → **Settings → Pages**
2. Source: **GitHub Actions**
3. Save

The `deploy_site.yml` workflow handles the rest on every push to `main`.

---

## Step 7 — Test locally

```bash
# Set env vars
export ANTHROPIC_API_KEY=sk-ant-...
export NEWS_API_KEY=your-newsapi-key

# Fetch articles
python3 scripts/fetch_news.py > /tmp/articles.json
cat /tmp/articles.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d), 'articles')"

# Run the full digest generation
bash scripts/generate_digest.sh

# View the output
cat digests/$(date +%Y-%m-%d).md
```

---

## Step 8 — Trigger manually in GitHub

1. Go to **Actions → Daily AI News Digest**
2. Click **Run workflow**
3. Set `dry_run: false`
4. Watch the logs

---

## Step 9 — Run the site locally

```bash
cd site
npm install
npm run dev
# Open http://localhost:3000
```

---

## Tuning CLAUDE.md

The `CLAUDE.md` file controls everything Claude does. Edit it to:
- Change topic categories
- Adjust summary length / tone
- Add domain-specific filters (e.g. "focus on enterprise AI, ignore consumer apps")
- Require structured JSON output instead of markdown

No workflow changes needed — Claude reads `CLAUDE.md` automatically from the working directory.

---

## Cost estimate

| Run type | Approx tokens | Approx cost |
|----------|--------------|-------------|
| Daily digest (60 articles) | ~18K in / 1.5K out | ~$0.02 |
| Monthly | ~540K in / 45K out | ~$0.60 |

Using `claude-sonnet-4-6` (default). Set `--model claude-haiku-4-5-20251001` for ~10× cheaper.

---

## Troubleshooting

**Workflow runs but digest is empty**
→ Check `ANTHROPIC_API_KEY` secret is set correctly. Check article count step log.

**NewsAPI returns 0 articles**
→ Free tier is 100 req/day and news may be cached. Check API key. RSS feeds still work without it.

**GitHub Pages shows 404**
→ Make sure Pages source is set to "GitHub Actions" not "Deploy from branch".

**Claude output has preamble text**
→ Tighten the CLAUDE.md instructions: add "Do not write any text before the `# AI News Digest` heading."

**Scheduled workflow stopped running**
→ GitHub disables cron workflows after 60 days of repo inactivity. Trigger manually to re-enable.
