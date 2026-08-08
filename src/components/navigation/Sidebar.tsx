import { ConnectList } from "./ConnectList";
import { NavigationList } from "./NavigationList";
import { SidebarFooter } from "./SidebarFooter";

export function Sidebar() {
    return (
        <aside
            className="
                hidden
                lg:flex
                lg:sticky
                lg:top-0
                lg:h-screen
                w-[270px]
                shrink-0
                flex-col
                border-r
                border-neutral-200
                bg-white
            "
        >
            <nav className="flex-1 px-3 pb-2 pt-2">
                <NavigationList />

                <ConnectList />
            </nav>

            <SidebarFooter />
        </aside>
    );
}