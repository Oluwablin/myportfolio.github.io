from pathlib import Path
from playwright.sync_api import sync_playwright


def main() -> None:
    project_root = Path(__file__).resolve().parent.parent
    resume_html = project_root / "resume.html"
    output_dir = project_root / "img"

    output_files = [
        output_dir / "OyelekeOluseunEmmanuelresume.pdf",
        output_dir / "Oyeleke_Oluseun_Emmanuel_engineer_resume.pdf",
        output_dir / "oyelekeseun_resume.pdf",
        output_dir / "oyelekeseun_updated_resume.pdf",
    ]

    resume_uri = resume_html.resolve().as_uri()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(resume_uri, wait_until="networkidle")
        page.wait_for_timeout(1500)

        for output_path in output_files:
            page.pdf(
                path=str(output_path),
                format="A4",
                print_background=True,
                margin={"top": "12mm", "right": "12mm", "bottom": "12mm", "left": "12mm"},
                prefer_css_page_size=True,
            )
            print(f"Updated {output_path}")

        browser.close()


if __name__ == "__main__":
    main()
