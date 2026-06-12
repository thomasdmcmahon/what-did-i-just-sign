import httpx
from bs4 import BeautifulSoup


def clean_text(text: str) -> str:
    return " ".join(text.split())


def extract_structured_text(soup: BeautifulSoup) -> str:
    heading_stack: list[tuple[int, str]] = []
    sections: list[str] = []
    last_text = ""

    body = soup.body or soup
    for tag in body.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li"]):
        text = clean_text(tag.get_text(" ", strip=True))
        if not text:
            continue

        if tag.name and tag.name.startswith("h"):
            level = int(tag.name[1])
            heading_stack = [
                (existing_level, heading)
                for existing_level, heading in heading_stack
                if existing_level < level
            ]
            heading_stack.append((level, text))
            continue

        if len(text) < 35 or text == last_text:
            continue

        context = " > ".join(heading for _, heading in heading_stack)
        heading = heading_stack[-1][1] if heading_stack else "Privacy Policy"
        if context:
            sections.append(f"Section: {heading}\nContext: {context}\nText: {text}")
        else:
            sections.append(f"Section: {heading}\nText: {text}")
        last_text = text

    return "\n\n".join(sections)


async def fetch_policy_text(url: str) -> str:
    headers = {"User-Agent": "Mozilla/5.0"}

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url, headers=headers, follow_redirects=True)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    structured_text = extract_structured_text(soup)
    if structured_text:
        return structured_text

    return soup.get_text(separator="\n", strip=True)
