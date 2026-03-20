#!/usr/bin/env python3
"""
fetch_news.py — Pulls AI news from multiple sources, deduplicates, outputs JSON.
Usage: python scripts/fetch_news.py > /tmp/articles.json
Env:   NEWS_API_KEY (required for NewsAPI)
"""

import os
import sys
import json
import hashlib
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from typing import Any

NEWS_API_KEY = os.environ.get("NEWS_API_KEY", "")
MAX_ARTICLES = 60  # cap before Claude sees them
LOOKBACK_HOURS = 26  # slightly > 24h to catch timezone gaps

AI_KEYWORDS = [
    "artificial intelligence", "machine learning", "large language model",
    "LLM", "GPT", "Claude", "Gemini", "OpenAI", "Anthropic", "DeepMind",
    "neural network", "deep learning", "generative AI", "AI agent",
    "transformer model", "foundation model", "diffusion model",
]

RSS_FEEDS = [
    # Tech news with strong AI coverage
    ("TechCrunch AI",   "https://techcrunch.com/category/artificial-intelligence/feed/"),
    ("VentureBeat AI",  "https://venturebeat.com/category/ai/feed/"),
    ("MIT Tech Review", "https://www.technologyreview.com/topic/artificial-intelligence/feed"),
    ("The Verge AI",    "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"),
    ("Wired AI",        "https://www.wired.com/feed/tag/artificial-intelligence/latest/rss"),
    ("Ars Technica AI", "https://feeds.arstechnica.com/arstechnica/index"),
    ("ZDNet AI",        "https://www.zdnet.com/topic/artificial-intelligence/rss.xml"),
    # AI lab blogs (no key needed)
    ("Google DeepMind", "https://deepmind.google/blog/rss.xml"),
    ("OpenAI Blog",     "https://openai.com/news/rss.xml"),
    ("Anthropic Blog",  "https://www.anthropic.com/rss.xml"),
    # Dedicated AI news
    ("AI News",         "https://www.artificialintelligence-news.com/feed/"),
]

def fetch_url(url: str, timeout: int = 10) -> bytes | None:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AI-News-Digest/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()
    except Exception as e:
        print(f"[WARN] fetch failed {url}: {e}", file=sys.stderr)
        return None

def cutoff_dt() -> datetime:
    return datetime.now(timezone.utc) - timedelta(hours=LOOKBACK_HOURS)

def parse_rss_date(s: str) -> datetime | None:
    for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ"):
        try:
            return datetime.strptime(s.strip(), fmt)
        except ValueError:
            continue
    return None

# ── Sources ──────────────────────────────────────────────────────────────────

def from_newsapi() -> list[dict]:
    if not NEWS_API_KEY:
        print("[WARN] NEWS_API_KEY not set, skipping NewsAPI", file=sys.stderr)
        return []
    query = urllib.parse.quote("artificial intelligence OR machine learning OR LLM OR OpenAI OR Anthropic")
    url = (
        f"https://newsapi.org/v2/everything?q={query}"
        f"&sortBy=publishedAt&pageSize=40&language=en"
        f"&apiKey={NEWS_API_KEY}"
    )
    data = fetch_url(url)
    if not data:
        return []
    try:
        parsed = json.loads(data)
        articles = []
        cutoff = cutoff_dt()
        for a in parsed.get("articles", []):
            published = a.get("publishedAt", "")
            try:
                dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
                if dt < cutoff:
                    continue
            except ValueError:
                pass
            articles.append({
                "title":       a.get("title", ""),
                "description": a.get("description", "") or a.get("content", ""),
                "url":         a.get("url", ""),
                "source":      a.get("source", {}).get("name", "NewsAPI"),
                "publishedAt": published,
            })
        return articles
    except Exception as e:
        print(f"[WARN] NewsAPI parse error: {e}", file=sys.stderr)
        return []

def from_rss(name: str, feed_url: str) -> list[dict]:
    data = fetch_url(feed_url)
    if not data:
        return []
    try:
        root = ET.fromstring(data)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        cutoff = cutoff_dt()
        articles = []

        # RSS 2.0
        for item in root.findall(".//item"):
            title = item.findtext("title", "").strip()
            desc  = item.findtext("description", "").strip()
            url   = item.findtext("link", "").strip()
            date_str = item.findtext("pubDate", "")
            dt = parse_rss_date(date_str)
            if dt and dt < cutoff:
                continue
            # relevance filter
            text = (title + " " + desc).lower()
            if not any(kw.lower() in text for kw in AI_KEYWORDS):
                continue
            articles.append({
                "title": title, "description": desc[:400],
                "url": url, "source": name,
                "publishedAt": dt.isoformat() if dt else date_str,
            })

        # Atom feeds
        for entry in root.findall("atom:entry", ns):
            title = entry.findtext("atom:title", "", ns).strip()
            desc  = entry.findtext("atom:summary", "", ns).strip()
            url_el = entry.find("atom:link", ns)
            url   = url_el.get("href", "") if url_el is not None else ""
            date_str = entry.findtext("atom:updated", "", ns)
            dt = parse_rss_date(date_str)
            if dt and dt < cutoff:
                continue
            text = (title + " " + desc).lower()
            if not any(kw.lower() in text for kw in AI_KEYWORDS):
                continue
            articles.append({
                "title": title, "description": desc[:400],
                "url": url, "source": name,
                "publishedAt": dt.isoformat() if dt else date_str,
            })

        return articles
    except Exception as e:
        print(f"[WARN] RSS parse error {name}: {e}", file=sys.stderr)
        return []

def from_hackernews() -> list[dict]:
    """Top HN stories mentioning AI — uses the public Algolia API."""
    query = urllib.parse.quote("AI OR LLM OR GPT OR Anthropic OR OpenAI")
    url = f"https://hn.algolia.com/api/v1/search?query={query}&tags=story&hitsPerPage=20"
    data = fetch_url(url)
    if not data:
        return []
    try:
        parsed = json.loads(data)
        cutoff_ts = cutoff_dt().timestamp()
        articles = []
        for hit in parsed.get("hits", []):
            if hit.get("created_at_i", 0) < cutoff_ts:
                continue
            if hit.get("points", 0) < 50:  # filter low-signal
                continue
            articles.append({
                "title":       hit.get("title", ""),
                "description": f"HackerNews · {hit.get('points',0)} points · {hit.get('num_comments',0)} comments",
                "url":         hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                "source":      "HackerNews",
                "publishedAt": datetime.fromtimestamp(hit["created_at_i"], timezone.utc).isoformat(),
            })
        return articles
    except Exception as e:
        print(f"[WARN] HackerNews parse error: {e}", file=sys.stderr)
        return []

# ── Dedup ─────────────────────────────────────────────────────────────────────

def fingerprint(article: dict) -> str:
    """Normalise title for dedup — strip punctuation, lowercase, first 60 chars."""
    t = article.get("title", "").lower()
    t = "".join(c for c in t if c.isalnum() or c == " ")
    return hashlib.md5(t[:60].encode()).hexdigest()

def deduplicate(articles: list[dict]) -> list[dict]:
    seen: set[str] = set()
    out = []
    for a in articles:
        fp = fingerprint(a)
        if fp not in seen:
            seen.add(fp)
            out.append(a)
    return out

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    all_articles: list[dict] = []

    all_articles += from_newsapi()
    for name, url in RSS_FEEDS:
        all_articles += from_rss(name, url)
    all_articles += from_hackernews()

    deduped = deduplicate(all_articles)

    # Sort newest first, cap
    deduped.sort(key=lambda a: a.get("publishedAt", ""), reverse=True)
    deduped = deduped[:MAX_ARTICLES]

    print(f"[INFO] {len(deduped)} articles after dedup", file=sys.stderr)
    print(json.dumps(deduped, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
