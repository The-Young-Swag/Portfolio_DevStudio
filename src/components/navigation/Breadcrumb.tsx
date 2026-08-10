export function Breadcrumb() {
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
            <span className="text-neutral-500">
                Portfolio
            </span>

            <span
                aria-hidden="true"
                className="text-neutral-400"
            >
                &gt;
            </span>

            <span className="hairline">
                Profile
            </span>
        </nav>
    );
}