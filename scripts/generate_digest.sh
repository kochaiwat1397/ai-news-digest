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

echo "▶ Running Claude to generate digest..."

# Build the prompt that references CLAUDE.md implicitly (Claude Code reads it from CWD)
PROMPT="Today is ${TODAY}. Using the instructions in CLAUDE.md, generate the daily AI news digest from the following articles. Output only the markdown digest, nothing else.

Articles JSON:
$(cat "$ARTICLES_FILE")"

# Run Claude headlessly — -p flag = non-interactive / pipe mode
claude -p "$PROMPT" \
  --output-format text \
  --max-turns 3 \
  > "$DIGEST_PATH"

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
