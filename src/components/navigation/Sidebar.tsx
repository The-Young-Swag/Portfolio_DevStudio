import { ConnectList } from "./ConnectList";
import { NavigationList } from "./NavigationList";
import { SidebarFooter } from "./SidebarFooter";

export function Sidebar() {
    return (
        <aside
        className="
        fixed
        left-4
        top-4
        bottom-4
        z-50
    
        hidden
        lg:flex
    
        w-70
        shrink-0
        flex-col
        overflow-hidden
    
        rounded-[28px]
    
        border
        border-white/70
        bg-white/45
    
        shadow-[0_12px_40px_rgba(31,38,135,0.10)]
    
        backdrop-blur-xl
        backdrop-saturate-160
    
        dark:border-white/15
        dark:bg-black/25
        dark:shadow-[0_12px_40px_rgba(0,0,0,0.28)]
    "
        >
            <div className="min-h-0 flex-1 overflow-y-auto">
                <nav
                    className="
                        px-3
                        pb-2
                        pt-2
                        lg:pt-0
                    "
                    aria-label="Primary navigation"
                >
                    <NavigationList />
                    <ConnectList />
                </nav>
            </div>

            <SidebarFooter />
        </aside>
    );
}