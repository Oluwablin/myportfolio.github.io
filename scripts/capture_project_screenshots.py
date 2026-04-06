from pathlib import Path
from urllib.request import urlopen
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError


PROJECTS = [
    {
        "name": "ai-cv-tailoring-tool",
        "url": "https://ai-cv-tailoring-tool-89cy.vercel.app/",
        "wait_ms": 3500,
    },
    {
        "name": "volunteer-africa",
        "url": "https://volunteer.africa/",
        "wait_ms": 4500,
    },
    {
        "name": "bulksmslive",
        "url": "https://www.bulksmslive.com/",
        "wait_ms": 5000,
    },
    {
        "name": "inventory-system",
        "url": "http://66.70.202.147/inventory/#/",
        "wait_ms": 7000,
    },
    {
        "name": "page-financials",
        "url": "https://pagefinancials.com/",
        "wait_ms": 4500,
    },
    {
        "name": "alumunite",
        "url": "https://alumunite.co/",
        "wait_ms": 4500,
    },
    {
        "name": "nwantas",
        "url": "https://nwantas.com/",
        "wait_ms": 4500,
    },
    {
        "name": "stagingdc",
        "url": "https://stagingdc.com/",
        "wait_ms": 4500,
    },
    {
        "name": "craneburg-erp",
        "url": "https://craneburg.vercel.app/",
        "wait_ms": 4500,
    },
]


def capture_page(page, url: str, out_file: Path, wait_ms: int) -> None:
    try:
        page.goto(url, wait_until="networkidle", timeout=45000)
    except PlaywrightTimeoutError:
        page.goto(url, wait_until="domcontentloaded", timeout=45000)

    page.wait_for_timeout(wait_ms)
    page.screenshot(path=str(out_file), type="jpeg", quality=88, full_page=False)


def save_fallback_screenshot(url: str, out_file: Path) -> None:
    fallback_url = "https://image.thum.io/get/maxAge/1/width/1440/crop/900/" + url
    with urlopen(fallback_url, timeout=45) as response:
        out_file.write_bytes(response.read())


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    out_dir = root / "img" / "projects"
    out_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()

        for project in PROJECTS:
            out_file = out_dir / f"{project['name']}.jpg"
            context = browser.new_context(viewport={"width": 1440, "height": 900}, java_script_enabled=True)
            page = context.new_page()

            try:
                capture_page(page, project["url"], out_file, project["wait_ms"])
                print(f"Captured {project['url']} -> {out_file}")
            except Exception as exc:  # best-effort capture
                print(f"FAILED browser capture {project['url']} -> {exc}")
                try:
                    save_fallback_screenshot(project["url"], out_file)
                    print(f"Saved fallback screenshot for {project['url']} -> {out_file}")
                except Exception as fallback_exc:
                    print(f"FAILED fallback {project['url']} -> {fallback_exc}")
            finally:
                context.close()

        browser.close()


if __name__ == "__main__":
    main()
