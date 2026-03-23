import sys
import re
import urllib.request
import urllib.error

def verify_and_clean_links(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        sys.exit(1)

    pattern = re.compile(r'\[([^\]]+)\]\((https?://[^\)]+)\)')
    
    def replacer(match):
        text = match.group(1)
        url = match.group(2)
        
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.getcode() >= 400:
                    print(f"❌ Broken link detected ({response.getcode()}): {url}")
                    return f"{text} *(🔗 Broken Link Removed)*"
                else:
                    print(f"✅ Link OK: {url}")
                    return match.group(0)
        except urllib.error.HTTPError as e:
            if e.code in [404, 410]:
                print(f"❌ Broken link detected ({e.code}): {url}")
                return f"{text} *(🔗 Broken Link Removed)*"
            else:
                print(f"⚠️ Link returned {e.code}, but keeping it: {url}")
                return match.group(0)
        except Exception as e:
            print(f"❌ Broken link detected (Error: {e}): {url}")
            return f"{text} *(🔗 Broken Link Removed)*"

    print("Verifying links...")
    new_content = pattern.sub(replacer, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Link verification complete.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 verify_links.py <path_to_markdown_file>")
        sys.exit(1)
    
    verify_and_clean_links(sys.argv[1])
