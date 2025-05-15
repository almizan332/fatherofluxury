
import { useState } from "react";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ChatbotSettings from "@/components/chatbot/admin/ChatbotSettings";
import { useAdminAuth } from "@/hooks/category/useAdminAuth";

const ChatbotManagement = () => {
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  if (!isAdmin) {
    navigate('/almizan');
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            {/* Sidebar content will be inherited from Dashboard */}
          </SidebarContent>
        </Sidebar>

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

          <ChatbotSettings />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ChatbotManagement;
