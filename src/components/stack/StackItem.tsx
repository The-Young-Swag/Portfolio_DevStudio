type StackItemProps = {
    name: string;
};

export function StackItem({ name }: StackItemProps) {
    return (
        <span
            className="
                inline-flex
                items-center
                rounded-md
                border
                border-(--glass-border)
                bg-(--glass-bg)
                px-2.5
                py-1
                font-mono
                text-[11px]
                text-(--graphite)
                shadow-[inset_0_1px_0_var(--glass-highlight)]
                backdrop-blur-md
                transition-colors
                duration-150
                hover:border-(--accent-strong)
                hover:text-(--accent-strong)
            "
        >
            {name}
        </span>
    );
}