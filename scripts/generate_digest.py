#!/usr/bin/env python3
"""
generate_digest.py — Reads articles JSON from stdin/file, calls OpenAI to produce digest.

Usage:
    python3 scripts/generate_digest.py /tmp/articles.json > digests/YYYY-MM-DD.md

Env:
    OPENAI_API_KEY   — required
    OPENAI_MODEL     — optional, default: gpt-4o-mini
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime, timezone

try:
    from openai import OpenAI
except ImportError:
    print("[ERROR] openai package not installed. Run: pip install openai", file=sys.stderr)
    sys.exit(1)

OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

def load_claude_md() -> str:
    """Read CLAUDE.md instructions if present."""
    p = Path("CLAUDE.md")
    if p.exists():
        return p.read_text(encoding="utf-8")
    return "Summarize the AI news articles into a clear, well-structured daily digest."

def build_prompt(articles: list[dict], today: str, instructions: str) -> str:
    articles_text = json.dumps(articles, indent=2, ensure_ascii=False)
    return (
        f"Today is {today}.\n\n"
        f"Instructions:\n{instructions}\n\n"
        f"Articles:\n{articles_text}\n\n"
        "Output ONLY the markdown digest — no preamble, no code fences."
    )

def main():
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        print("[ERROR] OPENAI_API_KEY is not set.", file=sys.stderr)
        sys.exit(1)

    # Load articles
    if len(sys.argv) > 1:
        articles_path = sys.argv[1]
        with open(articles_path, encoding="utf-8") as f:
            articles = json.load(f)
    else:
        articles = json.load(sys.stdin)

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    instructions = load_claude_md()

    print(f"[INFO] Generating digest for {today} using {OPENAI_MODEL} ({len(articles)} articles)", file=sys.stderr)

    client = OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an expert AI news curator. You produce clean, well-structured markdown digests.",
            },
            {
                "role": "user",
                "content": build_prompt(articles, today, instructions),
            },
        ],
        temperature=0.3,
        max_tokens=2048,
    )

    digest = response.choices[0].message.content.strip()
    print(digest)
    print(f"[INFO] Done. {response.usage.total_tokens} tokens used.", file=sys.stderr)

if __name__ == "__main__":
    main()
