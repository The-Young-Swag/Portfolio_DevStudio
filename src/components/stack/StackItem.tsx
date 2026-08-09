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
                border-neutral-200
                px-2.5
                py-1
                font-mono
                text-[11px]
                text-neutral-600
                transition-colors
                duration-150
                hover:border-[#059669]
                hover:text-[#059669]
            "
        >
            {name}
        </span>
    );
}