import { ConnectList } from "./ConnectList";
import { NavigationList } from "./NavigationList";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";

export function Sidebar() {
    return (
        <aside
            className="
                hidden
                lg:flex
                w-64
                shrink-0
                flex-col
                border-r
                border-neutral-200
                p-6
            "
        >
            <SidebarHeader />

            <NavigationList />

            <ConnectList />

            <SidebarFooter />
        </aside>
    );
}