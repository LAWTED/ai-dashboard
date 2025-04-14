"use client";

import {
  BookOpen,
  MessageSquare,
  ChevronRight,
  Code,
  PlayCircle,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Documentation",
    url: "/readme",
    icon: BookOpen,
  },
];

// Alice 分组及其子项目
const aliceGroup = {
  title: "Alice",
  icon: MessageSquare,
  subItems: [
    {
      title: "Prompt",
      url: "/alice/prompt",
      icon: Code,
    },
    {
      title: "Demo",
      url: "/alice/demo",
      icon: PlayCircle,
    },
    {
      title: "Config",
      url: "/alice/config",
      icon: Settings,
    },
  ],
};

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>AI Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* 常规菜单项 */}
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Alice 分组 */}
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <aliceGroup.icon className="h-4 w-4" />
                  <span>{aliceGroup.title}</span>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {aliceGroup.subItems.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          {subItem.icon && (
                            <subItem.icon className="h-4 w-4 mr-2" />
                          )}
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
