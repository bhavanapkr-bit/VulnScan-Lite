
from urllib.parse import urlparse

import requests

from scanner.headers import check_security_headers
from scanner.ssl_check import check_ssl
from scanner.technology import detect_technology


def scan_website(url):
    """Run passive security checks on an authorized website."""

    parsed_url = urlparse(url)

    if parsed_url.scheme not in ("http", "https") or not parsed_url.hostname:
        raise ValueError("Enter a valid HTTP or HTTPS website URL.")

    response = requests.get(
        url,
        timeout=15,
        allow_redirects=False,
        headers={"User-Agent": "VulnScan-Lite/1.0"},
    )

    results = {
        "target": url,
        "status_code": response.status_code,
        "security_headers": check_security_headers(response.headers),
        "ssl_tls": (
            check_ssl(parsed_url.hostname)
            if parsed_url.scheme == "https"
            else {"status": "Not checked", "reason": "Target uses HTTP"}
        ),
        "technology": detect_technology(
            response.headers,
            response.text,
        ),
    }

    return results
