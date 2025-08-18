"use client";

import {
  BookOpen,
  MessageSquare,
  ChevronRight,
  Code,
  PlayCircle,
  Settings,
  FileText,
  GraduationCap,
  Globe,
  Gamepad2,
  Users,
  Coffee,
  Heart,
  Sparkles,
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
import { usePathname } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Documentation",
    url: "/readme",
    icon: BookOpen,
  },
  {
    title: "Professor",
    url: "/professor",
    icon: GraduationCap,
  },
  {
    title: "Professor Chat",
    url: "/professor-chat",
    icon: MessageSquare,
  },
  {
    title: "OpenHatch",
    url: "/openhatch",
    icon: Globe,
  },
  {
    title: "Games",
    url: "/games",
    icon: Gamepad2,
  },
  {
    title: "PUA Game",
    url: "/pua-game",
    icon: Heart,
  },
  {
    title: "Manifestation",
    url: "/manifestation",
    icon: Sparkles,
  },
];

// Student 分组及其子项目
const studentGroup = {
  title: "Student",
  icon: Users,
  subItems: [
    {
      title: "Home",
      url: "/student",
      icon: GraduationCap,
    },
    {
      title: "Professor Cafe",
      url: "/student/cafe",
      icon: Coffee,
    },
    {
      title: "Chat",
      url: "/student/chat",
      icon: MessageSquare,
    },
  ],
};

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
      title: "File",
      url: "/alice/file",
      icon: FileText,
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
  const pathname = usePathname();

  // 检查路径是否与给定的URL匹配
  const isActive = (url: string) => {
    // 对于readme路径特殊处理，因为主页也会重定向到这里
    if (url === "/readme" && (pathname === "/" || pathname === "/readme")) {
      return true;
    }
    // 对于其他路径，检查是否以url开头
    if (url !== "/readme") {
      return pathname?.startsWith(url);
    }
    return pathname === url;
  };

  // 检查当前路径是否是Student的子路径
  const isStudentActive = pathname?.startsWith("/student");

  // 检查当前路径是否是Alice的子路径
  const isAliceActive = pathname?.startsWith("/alice");

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupLabel>AI Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* 常规菜单项 */}
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Student 分组 */}
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isStudentActive}>
                  <studentGroup.icon className="h-4 w-4" />
                  <span>{studentGroup.title}</span>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {studentGroup.subItems.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive(subItem.url)}
                      >
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

              {/* Alice 分组 */}
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isAliceActive}>
                  <aliceGroup.icon className="h-4 w-4" />
                  <span>{aliceGroup.title}</span>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {aliceGroup.subItems.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive(subItem.url)}
                      >
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
