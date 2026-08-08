type StackItemProps = {
    name: string;
};

export function StackItem({ name }: StackItemProps) {
    return (
        <div className="rounded-xl border border-neutral-200 p-5">
            <span className="text-sm font-medium">
                {name}
            </span>
        </div>
    );
}