import { navigation } from "@/constants/navigation";

export function NavigationList() {
    return (
        <>
            <p
                className="
                    px-3
                    pb-3
                    pt-2
                    font-mono
                    text-[10.5px]
                    uppercase
                    tracking-[0.11em]
                    text-neutral-500
                "
            >
                Navigate
            </p>

            <div className="space-y-0.5">
                {navigation
                    .filter((item) => item.id !== "contact")
                    .map((item) => {
                        const Icon = item.icon;

                        return (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-[14px]
                                    px-3
                                    py-2.5
                                    font-mono
                                    text-[12px]
                                    text-[var(--graphite)]
                                    transition-colors
                                    duration-150
                                    hover:text-[var(--ink)]
                                "
                            >
                                <Icon
                                    size={14}
                                    strokeWidth={1.75}
                                />

                                {item.label}
                            </a>
                        );
                    })}
            </div>
        </>
    );
}