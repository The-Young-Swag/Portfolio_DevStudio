import { NavLink } from "react-router";
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
                        text-(--graphite-soft)
                    "
                >
                Navigate
            </p>

            <div className="space-y-0.5">
                {navigation.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.id}
                            to={item.href}
                            end={item.href === "/"}
                            className={({ isActive }) => `
                                flex
                                items-center
                                gap-3
                                rounded-[14px]
                                px-3
                                py-2.5
                                font-mono
                                text-[12px]
                                transition-colors
                                duration-150

                                ${
                                    isActive
                                        ? `
                                            border
                                            border-(--glass-border)
                                            bg-(--glass-bg)
                                            text-(--ink)
                                            shadow-[inset_0_1px_0_var(--glass-highlight)]
                                            backdrop-blur-md
                                        `
                                        : `
                                            border
                                            border-transparent
                                            text-(--graphite)
                                            hover:bg-(--glass-bg)
                                            hover:text-(--ink)
                                        `
                                }
                            `}
                        >
                            <Icon
                                size={14}
                                strokeWidth={1.75}
                            />

                            {item.label}
                        </NavLink>
                    );
                })}
            </div>
        </>
    );
}