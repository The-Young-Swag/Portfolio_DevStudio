import type { QueryClient } from "@tanstack/react-query";

export type ListedRecord = {
    id: number;
    sort_order: number;
};

function byListOrder(a: ListedRecord, b: ListedRecord): number {
    return a.sort_order - b.sort_order || a.id - b.id;
}

/**
 * Applies a server-confirmed write directly to the list cache so the UI
 * reflects it immediately, without waiting for a refetch. In-flight
 * reads are cancelled first so a stale response cannot overwrite the
 * fresh row.
 */
function writeList<T extends ListedRecord>(
    queryClient: QueryClient,
    queryKey: string[],
    update: (current: T[]) => T[],
): void {
    void queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData<T[]>(queryKey, (current) => update(current ?? []));
}

export function insertListed<T extends ListedRecord>(
    queryClient: QueryClient,
    queryKey: string[],
    row: T,
): void {
    writeList<T>(queryClient, queryKey, (current) =>
        [...current.filter((item) => item.id !== row.id), row].sort(byListOrder),
    );
}

export function replaceListed<T extends ListedRecord>(
    queryClient: QueryClient,
    queryKey: string[],
    row: T,
): void {
    writeList<T>(queryClient, queryKey, (current) =>
        (current.some((item) => item.id === row.id)
            ? current.map((item) => (item.id === row.id ? row : item))
            : [...current, row]
        ).sort(byListOrder),
    );
}

export function removeListed<T extends ListedRecord>(
    queryClient: QueryClient,
    queryKey: string[],
    id: number,
): void {
    writeList<T>(queryClient, queryKey, (current) =>
        current.filter((item) => item.id !== id),
    );
}
