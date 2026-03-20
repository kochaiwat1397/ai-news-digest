#!/usr/bin/env bash
# generate_digest.sh — fetch articles then run Claude headlessly to produce digest
# Called by GitHub Actions; also runnable locally.
#
# Required env vars:
#   ANTHROPIC_API_KEY  — your Anthropic API key
#   NEWS_API_KEY       — NewsAPI.org key (optional but recommended)
#
# Output: digests/YYYY-MM-DD.md committed to repo

set -euo pipefail

TODAY=$(date -u +%Y-%m-%d)
DIGEST_PATH="digests/${TODAY}.md"
ARTICLES_FILE="/tmp/ai_articles_${TODAY}.json"

echo "▶ Fetching articles..."
python3 scripts/fetch_news.py > "$ARTICLES_FILE"

ARTICLE_COUNT=$(python3 -c "import json,sys; data=json.load(open('$ARTICLES_FILE')); print(len(data))")
echo "▶ Got ${ARTICLE_COUNT} articles"

if [ "$ARTICLE_COUNT" -lt 5 ]; then
  echo "❌ Too few articles (${ARTICLE_COUNT}). Aborting to avoid empty digest." >&2
  exit 1
fi

echo "▶ Running OpenAI to generate digest..."

# Call OpenAI via the Python script (reads CLAUDE.md automatically)
python3 scripts/generate_digest.py "$ARTICLES_FILE" > "$DIGEST_PATH"

echo "▶ Digest written to ${DIGEST_PATH}"

# Validate — must be > 200 chars
DIGEST_LEN=$(wc -c < "$DIGEST_PATH")
if [ "$DIGEST_LEN" -lt 200 ]; then
  echo "❌ Digest too short (${DIGEST_LEN} chars). Something went wrong." >&2
  cat "$DIGEST_PATH" >&2
  exit 1
fi

echo "✅ Digest ready (${DIGEST_LEN} chars)"
cat "$DIGEST_PATH"
