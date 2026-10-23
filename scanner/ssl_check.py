
import socket
import ssl
from datetime import datetime, timezone


def check_ssl(hostname):
    """Check HTTPS certificate validity, expiry, and cipher strength."""

    result = {
        "hostname": hostname,
        "status": "PASS",
        "certificate_valid": False,
        "days_until_expiry": None,
        "cipher": None,
        "recommendations": [],
    }

    try:
        context = ssl.create_default_context()

        with socket.create_connection(
            (hostname, 443), timeout=8
        ) as connection:
            with context.wrap_socket(
                connection, server_hostname=hostname
            ) as secure_socket:
                certificate = secure_socket.getpeercert()
                cipher = secure_socket.cipher()

        expiry_text = certificate.get("notAfter")
        if not expiry_text:
            raise ValueError("Certificate expiry date is unavailable.")

        expiry_date = datetime.strptime(
            expiry_text, "%b %d %H:%M:%S %Y %Z"
        ).replace(tzinfo=timezone.utc)

        days_left = (expiry_date - datetime.now(timezone.utc)).days

        result["certificate_valid"] = True
        result["days_until_expiry"] = days_left
        result["cipher"] = {
            "name": cipher[0],
            "protocol": cipher[1],
            "bits": cipher[2],
        }

        if days_left < 0:
            result["status"] = "FAIL"
            result["recommendations"].append(
                "Renew the expired TLS certificate."
            )
        elif days_left <= 30:
            result["status"] = "WARNING"
            result["recommendations"].append(
                "Renew the certificate before it expires."
            )

        if cipher[2] < 128:
            result["status"] = "FAIL"
            result["recommendations"].append(
                "Configure a stronger TLS cipher."
            )

    except (OSError, ssl.SSLError, ValueError) as error:
        result["status"] = "FAIL"
        result["error"] = str(error)
        result["recommendations"].append(
            "Verify HTTPS availability and certificate configuration."
        )

    return result
