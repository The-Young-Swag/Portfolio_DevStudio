import { getJson, sendDelete, sendJson } from "../api";

export type StackGroup = {
    id: number;
    group: string;
    items: string[];
    sort_order: number;
    created_at: string;
};

export type StackGroupInput = {
    group: string;
    items: string[];
    sort_order: number;
};

export async function getStack(): Promise<StackGroup[]> {
    return getJson<StackGroup[]>("/api/stack", "Failed to load stack.");
}

export function createStackGroup(
    input: StackGroupInput,
    token: string,
): Promise<StackGroup> {
    return sendJson<StackGroup>(
        "/api/stack",
        token,
        "POST",
        input,
        "Failed to save stack group.",
    );
}

export function updateStackGroup(
    id: number,
    input: StackGroupInput,
    token: string,
): Promise<StackGroup> {
    return sendJson<StackGroup>(
        `/api/stack/${id}`,
        token,
        "PUT",
        input,
        "Failed to save stack group.",
    );
}

export async function deleteStackGroup(
    id: number,
    token: string,
): Promise<void> {
    return sendDelete(`/api/stack/${id}`, token, "Failed to delete stack group.");
}
