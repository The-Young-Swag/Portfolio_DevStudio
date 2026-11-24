type SkeletonProps = {
    className?: string;
};

/**
 * Decorative shimmer placeholder. Sizing and radius come from the caller so
 * the placeholder can mirror the shape of the content it replaces. The shared
 * media-shimmer animation is already disabled under reduced motion.
 */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <span
            aria-hidden="true"
            className={`media-shimmer block rounded-lg ${className ?? ""}`}
        />
    );
}
