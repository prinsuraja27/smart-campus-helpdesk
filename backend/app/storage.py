import json
from pathlib import Path
from threading import Lock
from typing import Any

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_FILE = DATA_DIR / "requests.json"

_lock = Lock()


def ensure_data_file() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text("{}", encoding="utf-8")


def read_requests() -> dict[str, Any]:
    ensure_data_file()
    with _lock:
        try:
            content = DATA_FILE.read_text(encoding="utf-8").strip()
            if not content:
                return {}
            return json.loads(content)
        except json.JSONDecodeError:
            return {}


def write_requests(data: dict[str, Any]) -> None:
    ensure_data_file()
    with _lock:
        DATA_FILE.write_text(
            json.dumps(data, indent=4, ensure_ascii=False),
            encoding="utf-8",
        )
