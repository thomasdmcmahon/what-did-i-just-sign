def chunk_text(text: str, max_chars: int = 12000) -> str:
    """Truncate long policy text for the GA6 prototype."""
    return text[:max_chars] if len(text) > max_chars else text