
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import SubCategory from "./pages/SubCategory";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProductDetail from "./pages/ProductDetail";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ProductCategories from "./pages/ProductCategories";
import ProductList from "./pages/ProductList";
import BlogManagement from "./pages/BlogManagement";
import BlogPostFormPage from "./pages/BlogPostFormPage";
import WebContentsManagement from "./pages/WebContentsManagement";
import YupooUpload from "./pages/YupooUpload";
import ChatbotManagement from "./pages/ChatbotManagement";
import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
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
                
                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Legacy redirects */}
                <Route path="/almizan" element={<Navigate to="/login" replace />} />
                <Route path="/admin" element={<Navigate to="/login" replace />} />
                
                {/* Protected dashboard routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/categories" element={
                  <ProtectedRoute>
                    <ProductCategories />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/products" element={
                  <ProtectedRoute>
                    <ProductList />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/blog-management" element={
                  <ProtectedRoute>
                    <BlogManagement />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/blog-management/add-blog" element={
                  <ProtectedRoute>
                    <BlogPostFormPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/blog-management/edit/:id" element={
                  <ProtectedRoute>
                    <BlogPostFormPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/web-contents" element={
                  <ProtectedRoute>
                    <WebContentsManagement />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/yupoo-upload" element={
                  <ProtectedRoute>
                    <YupooUpload />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/chatbot" element={
                  <ProtectedRoute>
                    <ChatbotManagement />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
