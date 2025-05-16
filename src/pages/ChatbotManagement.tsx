
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ChatbotSettings from "@/components/chatbot/admin/ChatbotSettings";
import ChatbotTrainingPrompts from "@/components/chatbot/admin/ChatbotTrainingPrompts";
import { useAdminAuth } from "@/hooks/category/useAdminAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const ChatbotManagement = () => {
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");

  useEffect(() => {
    if (!isAdmin) {
      navigate('/almizan');
    }
  }, [isAdmin, navigate]);

  // Return early if not admin, the redirect will happen in the useEffect
  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />

        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Chatbot Management</h1>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="settings">General Settings</TabsTrigger>
              <TabsTrigger value="training">Training & Prompts</TabsTrigger>
            </TabsList>
            <TabsContent value="settings">
              <ChatbotSettings />
            </TabsContent>
            <TabsContent value="training">
              <ChatbotTrainingPrompts />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ChatbotManagement;
