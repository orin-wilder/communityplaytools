"""Build the deployable CPT site into an allowlisted _site directory.

The source tree keeps shared partials and internal working files. The public
artifact receives real navigation/footer HTML, extensionless primary routes,
and only the files that are intentionally deployable.
"""

from __future__ import annotations

import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"

ROUTES = {
    "index.html": "index.html",
    "leadership.html": "leadership/index.html",
    "work.html": "work/index.html",
    "builds.html": "builds/index.html",
    "about.html": "about/index.html",
    "contact.html": "contact/index.html",
    "signal-fire.html": "signal-fire/index.html",
    "success.html": "success/index.html",
    "404.html": "404.html",
    "tools.html": "tools/index.html",
    "approach.html": "approach/index.html",
    "events/index.html": "events/index.html",
}

# These are intentionally public demonstrations or compatibility surfaces.
# Admin is deliberately absent. noindex controls discovery, not access.
PUBLIC_STANDALONE = [
    "cityverse.html",
    "cmapp.html",
    "did-sentiment.html",
    "ga-attend.html",
    "ga-host.html",
    "gather-room.html",
    "gelato-selector_demo.html",
    "gelato-sorter_demo.html",
    "idea-mashup.html",
    "links.html",
    "meeting-stone.html",
    "poll.html",
    "polls.html",
    "results.html",
    "stpete-overlay.html",
    "williams-park.html",
]

PRIMARY_LINKS = {
    "index.html": "/",
    "leadership.html": "/leadership",
    "work.html": "/work",
    "builds.html": "/builds",
    "about.html": "/about",
    "contact.html": "/contact",
    "signal-fire.html": "/signal-fire",
    "success.html": "/success",
    "tools.html": "/builds",
    "approach.html": "/contact#consulting",
}


def clean_output() -> None:
    expected = ROOT / "_site"
    if OUT.resolve() != expected.resolve():
        raise RuntimeError(f"Refusing to clean unexpected output path: {OUT}")
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)


def inline_partials(text: str) -> str:
    nav = (ROOT / "partials/nav.html").read_text(encoding="utf-8").strip()
    footer = (ROOT / "partials/footer.html").read_text(encoding="utf-8").strip()
    text = re.sub(
        r'<div\s+data-include=["\']partials/nav\.html["\']\s*>\s*</div>',
        nav,
        text,
    )
    text = re.sub(
        r'<div\s+data-include=["\']partials/footer\.html["\']\s*>\s*</div>',
        footer,
        text,
    )
    return text


def normalize_public_links(text: str) -> str:
    for source, target in PRIMARY_LINKS.items():
        escaped = re.escape(source)
        text = re.sub(
            rf'(?P<attr>href|action)=(?P<q>["\'])(?:/)?{escaped}(?P<suffix>#[^"\']*)?(?P=q)',
            lambda match: (
                f'{match.group("attr")}={match.group("q")}'
                f'{target.split("#", 1)[0]}{match.group("suffix") or ("#" + target.split("#", 1)[1] if "#" in target else "")}'
                f'{match.group("q")}'
            ),
            text,
        )

    # Directory routes need root-relative shared assets.
    text = re.sub(r'(?P<attr>href|src|srcset)=(?P<q>["\'])assets/', r'\g<attr>=\g<q>/assets/', text)
    text = re.sub(
        r'href=(?P<q>["\'])(?P<path>[A-Za-z0-9_-]+\.html(?:#[^"\']*)?)(?P=q)',
        r'href=\g<q>/\g<path>\g<q>',
        text,
    )
    return text


def write_html(source_rel: str, output_rel: str) -> None:
    source = ROOT / source_rel
    destination = OUT / output_rel
    destination.parent.mkdir(parents=True, exist_ok=True)
    text = source.read_text(encoding="utf-8")
    text = inline_partials(text)
    text = normalize_public_links(text)
    destination.write_text(text, encoding="utf-8", newline="\n")


def copy_public_tree() -> None:
    shutil.copytree(ROOT / "assets", OUT / "assets")

    for source_rel, output_rel in ROUTES.items():
        write_html(source_rel, output_rel)

    for rel in PUBLIC_STANDALONE:
        write_html(rel, rel)

    for rel in ["_redirects", "robots.txt", "sitemap.xml"]:
        shutil.copy2(ROOT / rel, OUT / rel)


def assert_private_sources_absent() -> None:
    forbidden = [
        OUT / "_reference",
        OUT / "scripts",
        OUT / "admin.html",
        OUT / "733a273ea290022319690eb94e8a9442.txt",
        OUT / "events/spdetection/index.html",
    ]
    leaked = [str(path.relative_to(OUT)) for path in forbidden if path.exists()]
    if leaked:
        raise RuntimeError(f"Private or stale files entered public output: {leaked}")


def main() -> None:
    clean_output()
    copy_public_tree()
    assert_private_sources_absent()
    count = sum(1 for path in OUT.rglob("*") if path.is_file())
    print(f"Built {count} public files in {OUT}")


if __name__ == "__main__":
    main()
