from pathlib import Path
from urllib.parse import urlsplit

from lxml import html


SOURCE = Path(__file__).resolve().parents[1]
ROOT = SOURCE / "_site"
MAIN = [
    "index.html",
    "leadership/index.html",
    "work/index.html",
    "builds/index.html",
    "about/index.html",
    "contact/index.html",
]
INDEXABLE = MAIN + ["signal-fire/index.html"]
issues = []


if not ROOT.exists():
    raise SystemExit("_site does not exist. Run scripts/build_site.py first.")


def parse(path):
    return html.fromstring(path.read_text(encoding="utf-8"))


def local_target(base, value):
    if not value or value.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc:
        return None
    clean = parsed.path
    if not clean or "{" in clean or "<" in clean:
        return None
    path = ROOT / clean.lstrip("/") if clean.startswith("/") else base / clean
    if path.is_dir():
        path = path / "index.html"
    elif path.suffix == "":
        directory_index = path / "index.html"
        html_path = path.with_suffix(".html")
        if directory_index.exists():
            path = directory_index
        elif html_path.exists():
            path = html_path
    return path.resolve()


for rel in INDEXABLE:
    path = ROOT / rel
    tree = parse(path)
    checks = {
        "title": bool(tree.xpath("//title[normalize-space()]")),
        "description": len(tree.xpath('//meta[@name="description" and @content]')) == 1,
        "theme color": bool(tree.xpath('//meta[@name="theme-color" and @content]')),
        "canonical": bool(tree.xpath('//link[contains(concat(" ", normalize-space(@rel), " "), " canonical ") and @href]')),
        "og:image": bool(tree.xpath('//meta[@property="og:image" and @content]')),
        "og:image dimensions": bool(tree.xpath('//meta[@property="og:image:width" and @content]')) and bool(tree.xpath('//meta[@property="og:image:height" and @content]')),
        "og:image alt": bool(tree.xpath('//meta[@property="og:image:alt" and @content]')),
        "one h1": len(tree.xpath("//h1")) == 1,
        "main target": bool(tree.xpath('//main[@id="main-content"]')),
        "inlined nav": bool(tree.xpath('//nav[contains(@class,"site-nav")]')),
        "inlined footer": bool(tree.xpath('//footer[contains(@class,"site-footer")]')),
        "no runtime include placeholders": not bool(tree.xpath('//*[@data-include]')),
    }
    for label, ok in checks.items():
        if not ok:
            issues.append(f"{rel}: missing/invalid {label}")
    for img in tree.xpath("//img"):
        if not img.get("width") or not img.get("height"):
            issues.append(f"{rel}: image missing width/height: {img.get('src')}")
    for href in tree.xpath('//a/@href'):
        parsed = urlsplit(href)
        if parsed.path in {
            "index.html", "leadership.html", "work.html", "builds.html",
            "about.html", "contact.html", "signal-fire.html",
        }:
            issues.append(f"{rel}: primary internal link is not extensionless: {href}")


for rel in INDEXABLE:
    tree = parse(ROOT / rel)
    for content in tree.xpath('//meta[@name="robots"]/@content'):
        if "noindex" in content.lower():
            issues.append(f"{rel}: unexpectedly noindex")


for path in ROOT.rglob("*.html"):
    tree = parse(path)
    if tree.xpath('//meta[starts-with(@name,"twitter:")]'):
        issues.append(f"{path.relative_to(ROOT)}: unused Twitter/X metadata present")
    for tag, attr in [("a", "href"), ("img", "src"), ("source", "srcset"), ("script", "src"), ("link", "href")]:
        for node in tree.xpath(f"//{tag}[@{attr}]"):
            value = node.get(attr)
            if attr == "srcset" and value:
                value = value.split(",", 1)[0].strip().split(" ", 1)[0]
            target = local_target(path.parent, value)
            if target and not target.exists():
                rel = path.relative_to(ROOT)
                issues.append(f"{rel}: missing local {attr} target {value}")


contact = parse(ROOT / "contact/index.html")
forms = contact.xpath('//form[@name="contact"]')
if not forms:
    issues.append("contact/index.html: missing contact form")
else:
    form = forms[0]
    if form.get("data-netlify") != "true":
        issues.append("contact/index.html: Netlify form attribute missing")
    if not form.xpath('.//input[@name="form-name" and @value="contact"]'):
        issues.append("contact/index.html: hidden form-name missing")


for forbidden in [
    "_reference",
    "scripts",
    "admin.html",
    "733a273ea290022319690eb94e8a9442.txt",
    "events/spdetection/index.html",
]:
    if (ROOT / forbidden).exists():
        issues.append(f"public output contains forbidden source: {forbidden}")


if issues:
    print("\n".join(sorted(set(issues))))
    raise SystemExit(1)
print(f"PASS: {len(MAIN)} primary pages, {len(INDEXABLE)} indexable pages, inlined navigation, public assets, and Netlify form markup.")
