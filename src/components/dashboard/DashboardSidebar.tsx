
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  MonitorDot, 
  Users2, 
  ShoppingBag, 
  Files, 
  Boxes, 
  Search, 
  Mail, 
  UserCog, 
  MessageSquare,
  ChevronDown,
  ListPlus,
  Upload,
  ExternalLink
} from "lucide-react";

const DashboardSidebar = () => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (menuTitle: string) => {
    setOpenMenus(prev => 
      prev.includes(menuTitle) 
        ? prev.filter(title => title !== menuTitle)
        : [...prev, menuTitle]
    );
  };

  const mainMenuItems = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  ];

  const adminMenuItems = [
    { title: "Website Contents", icon: MonitorDot, url: "/dashboard/web-contents" },
    { title: "User List", icon: Users2, url: "#" },
    { 
      title: "Product", 
      icon: ShoppingBag,
      url: "#",
      submenu: [
        { title: "Category List", icon: ListPlus, url: "/dashboard/categories" },
        { title: "Product List", icon: Upload, url: "/dashboard/products" },
        { title: "Upload from Yupoo", icon: ExternalLink, url: "/dashboard/yupoo-upload" }
      ]
    },
    { title: "Blog Management", icon: Files, url: "/dashboard/blog-management" },
    { title: "Dynamic Pages", icon: Boxes, url: "#" },
    { title: "SEO Pages", icon: Search, url: "#" },
    { title: "Mail-settings", icon: Mail, url: "#" },
    { title: "Role Management", icon: UserCog, url: "#" },
    { title: "Chatbot", icon: MessageSquare, url: "/dashboard/chatbot" },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <h1 className="text-xl font-bold">
            <span className="text-primary">Mizan</span>
            <span className="text-muted-foreground">Ahmed</span>
          </h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>MAIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>ADMIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.submenu ? (
                    <div className="w-full">
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className="flex items-center justify-between w-full px-2 py-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            openMenus.includes(item.title) ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openMenus.includes(item.title) && item.submenu && (
                        <div className="pl-6 space-y-1 mt-1">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.title}
                              to={subItem.url}
                              className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
                            >
                              <subItem.icon className="h-4 w-4" />
                              <span>{subItem.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
