import { getJson, sendDelete, sendJson } from "../api";

export type SocialLink = {
    id: number;
    label: string;
    href: string;
    icon: string;
    sort_order: number;
    created_at: string;
};

export type SocialLinkInput = {
    label: string;
    href: string;
    icon: string;
    sort_order: number;
};

export async function getSocialLinks(): Promise<SocialLink[]> {
    return getJson<SocialLink[]>("/api/social-links", "Failed to load social links.");
}

export function createSocialLink(
    input: SocialLinkInput,
    token: string,
): Promise<SocialLink> {
    return sendJson<SocialLink>(
        "/api/social-links",
        token,
        "POST",
        input,
        "Failed to save social link.",
    );
}

export function updateSocialLink(
    id: number,
    input: SocialLinkInput,
    token: string,
): Promise<SocialLink> {
    return sendJson<SocialLink>(
        `/api/social-links/${id}`,
        token,
        "PUT",
        input,
        "Failed to save social link.",
    );
}

export async function deleteSocialLink(
    id: number,
    token: string,
): Promise<void> {
    return sendDelete(
        `/api/social-links/${id}`,
        token,
        "Failed to delete social link.",
    );
}
