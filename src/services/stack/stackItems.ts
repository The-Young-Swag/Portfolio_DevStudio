import { getJson, sendDelete, sendJson } from "../api";

export type StackItemCategory =
    | "language"
    | "framework"
    | "library"
    | "database"
    | "tool";

export type StackItemLevel = "learning" | "comfortable" | "confident";

export type StackItem = {
    id: number;
    name: string;
    category: StackItemCategory;
    level: StackItemLevel;
    since_year: number | null;
    is_core: boolean;
    sort_order: number;
    created_at: string;
};

export type StackItemInput = {
    name: string;
    category: StackItemCategory;
    level: StackItemLevel;
    since_year: number | null;
    is_core: boolean;
    sort_order: number;
};

export async function getStackItems(): Promise<StackItem[]> {
    return getJson<StackItem[]>("/api/stack-items", "Failed to load stack.");
}

export function createStackItem(
    input: StackItemInput,
    token: string,
): Promise<StackItem> {
    return sendJson<StackItem>(
        "/api/stack-items",
        token,
        "POST",
        input,
        "Failed to save stack item.",
    );
}

export function updateStackItem(
    id: number,
    input: StackItemInput,
    token: string,
): Promise<StackItem> {
    return sendJson<StackItem>(
        `/api/stack-items/${id}`,
        token,
        "PUT",
        input,
        "Failed to save stack item.",
    );
}

export async function deleteStackItem(
    id: number,
    token: string,
): Promise<void> {
    return sendDelete(`/api/stack-items/${id}`, token, "Failed to delete stack item.");
}
