import { safeHttpUrl } from "@/components/ui";

export { safeHttpUrl };

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
