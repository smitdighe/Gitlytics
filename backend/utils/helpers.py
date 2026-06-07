import colorsys
import secrets
import string
from datetime import datetime, timezone


def format_date(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def bytes_to_mb(b: int) -> float:
    return round(b / (1024 * 1024), 2)


def truncate(s: str, max_len: int) -> str:
    if len(s) <= max_len:
        return s
    return s[: max_len - 1] + "…"


def generate_token(length: int = 8) -> str:
    alphabet = string.ascii_letters + string.digits + "-_"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def get_color_palette(n: int) -> list[str]:
    if n <= 0:
        return []
    colors: list[str] = []
    for i in range(n):
        hue = i / n
        r, g, b = colorsys.hsv_to_rgb(hue, 0.65, 0.85)
        hex_color = "#{:02x}{:02x}{:02x}".format(
            int(r * 255), int(g * 255), int(b * 255)
        )
        colors.append(hex_color)
    return colors
