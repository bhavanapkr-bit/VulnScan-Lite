
import re


def detect_technology(headers, html):
    """Passively identify CMS and software clues from a web response."""

    technologies = []
    recommendations = []

    server = headers.get("Server")
    powered_by = headers.get("X-Powered-By")

    if server:
        technologies.append({
            "name": "Web server",
            "value": server,
            "source": "Server response header",
        })

    if powered_by:
        technologies.append({
            "name": "Server technology",
            "value": powered_by,
            "source": "X-Powered-By response header",
        })

    generator = re.search(
        r'<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"\']+)',
        html,
        re.IGNORECASE,
    )

    if generator:
        generator_value = generator.group(1)
        technologies.append({
            "name": "CMS / generator",
            "value": generator_value,
            "source": "HTML generator metadata",
        })

        version_match = re.search(
            r"(WordPress|Drupal)\s+(\d+(?:\.\d+)+)",
            generator_value,
            re.IGNORECASE,
        )

        if version_match:
            cms = version_match.group(1)
            version = version_match.group(2)

            technologies.append({
                "name": cms,
                "value": version,
                "source": "Generator metadata",
            })

            recommendations.append(
                f"Verify whether {cms} {version} is supported and up to date."
            )

    return {
        "technologies": technologies,
        "recommendations": recommendations,
        "note": (
            "Technology clues are passive observations, not proof of a vulnerability."
        ),
    }
