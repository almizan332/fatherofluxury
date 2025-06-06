
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarProvider 
} from "@/components/ui/sidebar";
import { 
  Box, 
  List, 
  Package, 
  FileText, 
  Home, 
  Upload, 
  Globe,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <div className="flex flex-col gap-1 p-2">
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/dashboard/categories">
                <Button variant="ghost" className="w-full justify-start">
                  <Box className="mr-2 h-4 w-4" />
                  Categories
                </Button>
              </Link>
              <Link to="/dashboard/products">
                <Button variant="ghost" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Products
                </Button>
              </Link>
              <Link to="/dashboard/blog-management">
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Blog
                </Button>
              </Link>
              <Link to="/dashboard/web-contents">
                <Button variant="ghost" className="w-full justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  Web Contents
                </Button>
              </Link>
              <Link to="/dashboard/chatbot">
                <Button variant="ghost" className="w-full justify-start bg-purple-100 dark:bg-purple-900/20">
                  <MessageSquare className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-purple-600 dark:text-purple-400 font-medium">Chatbot</span>
                </Button>
              </Link>
              <Link to="/dashboard/yupoo-upload">
                <Button variant="ghost" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Yupoo Upload
                </Button>
              </Link>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <ScrollArea className="h-full">
            <h1 className="text-3xl font-bold gradient-text mb-6">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/dashboard/products" className="block">
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 mr-4 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold">Products</h2>
                      <p className="text-muted-foreground">Manage your products</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link to="/dashboard/categories" className="block">
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <Box className="h-8 w-8 mr-4 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold">Categories</h2>
                      <p className="text-muted-foreground">Manage product categories</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link to="/dashboard/blog-management" className="block">
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 mr-4 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold">Blog</h2>
                      <p className="text-muted-foreground">Manage your blog posts</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link to="/dashboard/chatbot" className="block">
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-700">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 mr-4 text-purple-600" />
                    <div>
                      <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-400">Chatbot</h2>
                      <p className="text-muted-foreground">Customize and train your AI assistant</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link to="/dashboard/web-contents" className="block">
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <Globe className="h-8 w-8 mr-4 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold">Web Contents</h2>
                      <p className="text-muted-foreground">Manage your website contents</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link to="/dashboard/yupoo-upload" className="block">
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <Upload className="h-8 w-8 mr-4 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold">Yupoo Upload</h2>
                      <p className="text-muted-foreground">Upload products from Yupoo</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
