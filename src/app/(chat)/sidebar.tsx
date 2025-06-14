import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Profile from "./profile";
import ThreadManager from "@/components/ThreadManager";

export default function ChatSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <Profile />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <ThreadManager />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
