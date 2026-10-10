/**
 * URL helpers for certification links and uploads. Stored text is
 * untrusted, so every URL used as an href or src goes through here:
 * same-origin root-relative paths (the /api uploads) and http(s)
 * links are allowed, everything else is treated as empty.
 */
export function safeHttpUrl(url: string): string {
    const trimmed = url.trim();

    if (trimmed.startsWith("/")) {
        return trimmed.startsWith("//") ? "" : trimmed;
    }

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    return "";
}

/** A verify link counts only when it is a usable http(s) URL. */
export function verifiableLink(link: string): string {
    const url = safeHttpUrl(link);

    if (url.startsWith("/")) {
        return "";
    }

    return url;
}

/** Host shown beside the verify action. Empty when parsing fails. */
export function linkHostname(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
}
