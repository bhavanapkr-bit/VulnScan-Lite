
def check_security_headers(headers):
    """Check important HTTP security response headers."""

    required_headers = {
        "Content-Security-Policy": (
            "Helps control which content a browser may load."
        ),
        "X-Frame-Options": (
            "Helps prevent clickjacking through embedded frames."
        ),
        "Strict-Transport-Security": (
            "Tells browsers to use HTTPS for future connections."
        ),
    }

    results = {}

    for header, description in required_headers.items():
        value = headers.get(header)

        if value:
            results[header] = {
                "status": "PASS",
                "value": value,
                "description": description,
            }
        else:
            results[header] = {
                "status": "FAIL",
                "value": None,
                "description": description,
                "recommendation": (
                    f"Configure the {header} response header."
                ),
            }

    return results
