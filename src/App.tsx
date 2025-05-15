
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChatbotProvider } from "@/components/chatbot/ChatbotProvider";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import SubCategory from "./pages/SubCategory";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductCategories from "./pages/ProductCategories";
import ProductList from "./pages/ProductList";
import BlogManagement from "./pages/BlogManagement";
import BlogPostFormPage from "./pages/BlogPostFormPage";
import WebContentsManagement from "./pages/WebContentsManagement";
import YupooUpload from "./pages/YupooUpload";
import ChatbotManagement from "./pages/ChatbotManagement";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <ChatbotProvider>
            <div className="min-h-screen w-full bg-background text-foreground antialiased">
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/category/:category" element={<SubCategory />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/almizan" element={<Login />} />
                <Route path="/login" element={<Navigate to="/almizan" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/categories" element={<ProductCategories />} />
                <Route path="/dashboard/products" element={<ProductList />} />
                <Route path="/dashboard/blog-management" element={<BlogManagement />} />
                <Route path="/dashboard/blog-management/add-blog" element={<BlogPostFormPage />} />
                <Route path="/dashboard/blog-management/edit/:id" element={<BlogPostFormPage />} />
                <Route path="/dashboard/web-contents" element={<WebContentsManagement />} />
                <Route path="/dashboard/yupoo-upload" element={<YupooUpload />} />
                <Route path="/dashboard/chatbot" element={<ChatbotManagement />} />
              </Routes>
            </div>
          </ChatbotProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
