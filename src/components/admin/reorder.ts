type Orderable = {
    id: number;
    sort_order: number;
};

type OrderSwap<T> = {
    item: T;
    neighbor: T;
    itemOrder: number;
    neighborOrder: number;
};

/**
 * Finds the adjacent item to swap sort positions with, ordered by
 * (sort_order, id) like the API. Returns null at either end of the
 * list. When two neighbors share a sort order, the neighbor is nudged
 * one step instead so the move always takes effect.
 */
export function reorderSwap<T extends Orderable>(
    items: T[],
    id: number,
    direction: -1 | 1,
): OrderSwap<T> | null {
    const ordered = [...items].sort(
        (a, b) => a.sort_order - b.sort_order || a.id - b.id,
    );
    const index = ordered.findIndex((candidate) => candidate.id === id);
    const item = ordered[index];
    const neighbor = ordered[index + direction];

    if (item === undefined || neighbor === undefined) {
        return null;
    }

    return {
        item,
        neighbor,
        itemOrder: neighbor.sort_order,
        neighborOrder:
            neighbor.sort_order === item.sort_order
                ? item.sort_order - direction
                : item.sort_order,
    };
}
