import httpx
from bs4 import BeautifulSoup


async def fetch_policy_text(url: str) -> str:
    headers = {"User-Agent": "Mozilla/5.0"}

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url, headers=headers, follow_redirects=True)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    return soup.get_text(separator="\n", strip=True)
