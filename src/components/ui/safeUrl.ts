/**
 * Stored text is untrusted, so every URL used as an href or src goes
 * through here: same-origin root-relative paths (the /api uploads)
 * and http(s) links are allowed, everything else is treated as empty.
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
