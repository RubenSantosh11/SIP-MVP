"""Local dev server: serves the static site and /api/help on http://localhost:8000."""
import http.server
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from api.help import handler as ApiHandler  # noqa: E402


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def do_GET(self):
        if self.path.startswith("/api/help"):
            return ApiHandler.do_GET(self)
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/help"):
            return ApiHandler.do_POST(self)
        self.send_error(404)

    _send = ApiHandler._send


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1]) if len(sys.argv) > 1 else 8000), H).serve_forever()
