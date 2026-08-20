type BreadcrumbProps = {
    parent?: string;
    current?: string;
};

export function Breadcrumb({
    parent = "Portfolio",
    current = "Profile",
}: BreadcrumbProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="
                flex
                items-center
                gap-3
                font-mono
                text-[11px]
                leading-none
            "
        >
            <span className="text-(--graphite)">
                {parent}
            </span>

            <span
                aria-hidden="true"
                className="text-(--graphite-soft)"
            >
                &gt;
            </span>

            <span className="text-(--ink)">
                {current}
            </span>
        </nav>
    );
}