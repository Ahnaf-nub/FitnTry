import importlib
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def test_imports():
    mod = importlib.import_module("app.auth")
    assert hasattr(mod, "router")
