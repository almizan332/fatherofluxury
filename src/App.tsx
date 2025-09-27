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
import ProductImportSimple from "./pages/ProductImportSimple";
import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <div className="min-h-screen w-full bg-background text-foreground antialiased">
            <Toaster />
            <Sonner />
            <Routes>
              {/* PUBLIC ROUTES - NO AUTH PROVIDER WRAPPER */}
              <Route path="/" element={<Index />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:category" element={<SubCategory />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              
              {/* AUTH ROUTES - WITH AUTH PROVIDER WRAPPER */}
              <Route path="/auth/*" element={
                <AuthProvider>
                  <Routes>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                  </Routes>
                </AuthProvider>
              } />
              
              {/* ADMIN ROUTES - WITH AUTH PROVIDER + PROTECTED ROUTE */}
              <Route path="/admin/*" element={
                <AuthProvider>
                  <Routes>
                    <Route path="dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="categories" element={
                      <ProtectedRoute>
                        <ProductCategories />
                      </ProtectedRoute>
                    } />
                    <Route path="products" element={
                      <ProtectedRoute>
                        <ProductList />
                      </ProtectedRoute>
                    } />
                    <Route path="blog-management" element={
                      <ProtectedRoute>
                        <BlogManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="blog/new" element={
                      <ProtectedRoute>
                        <BlogPostFormPage />
                      </ProtectedRoute>
                    } />
                    <Route path="blog/edit/:id" element={
                      <ProtectedRoute>
                        <BlogPostFormPage />
                      </ProtectedRoute>
                    } />
                    <Route path="web-contents" element={
                      <ProtectedRoute>
                        <WebContentsManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="yupoo-upload" element={
                      <ProtectedRoute>
                        <YupooUpload />
                      </ProtectedRoute>
                    } />
                    <Route path="chatbot" element={
                      <ProtectedRoute>
                        <ChatbotManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="import" element={
                      <ProtectedRoute>
                        <ProductImportSimple />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </AuthProvider>
              } />
              
              {/* LEGACY REDIRECTS */}
              <Route path="/login" element={<Navigate to="/auth/login" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
              <Route path="/reset-password" element={<Navigate to="/auth/reset-password" replace />} />
              <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/product-categories" element={<Navigate to="/admin/categories" replace />} />
              <Route path="/product-list" element={<Navigate to="/admin/products" replace />} />
              <Route path="/blog-management" element={<Navigate to="/admin/blog-management" replace />} />
              <Route path="/web-contents" element={<Navigate to="/admin/web-contents" replace />} />
              <Route path="/yupoo-upload" element={<Navigate to="/admin/yupoo-upload" replace />} />
              <Route path="/chatbot-management" element={<Navigate to="/admin/chatbot" replace />} />
              <Route path="/product-import-simple" element={<Navigate to="/admin/import" replace />} />
            </Routes>
          </div>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;