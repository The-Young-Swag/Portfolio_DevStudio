import { navigation } from "@/constants/navigation";

export function NavigationList() {
    return (
        <nav>
            <ul className="space-y-2">
                {navigation.map((item) => {
                    const Icon = item.icon;

                    return (
                        <li key={item.id}>
                            <a
                                href={`#${item.id}`}
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-lg
                                    px-3
                                    py-2
                                    text-sm
                                    text-neutral-600
                                    transition-colors
                                    hover:bg-neutral-100
                                    hover:text-neutral-950
                                "
                            >
                                <Icon size={16} />
                                {item.label}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}