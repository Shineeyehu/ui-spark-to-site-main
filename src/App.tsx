import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BirthdayPage from "./pages/BirthdayPage";
import DeepTalkPage from "./pages/DeepTalkPage";
import ReportPage from "./pages/ReportPage";
// 测试页面导入 - 生产环境已注释
// import CozeTestPage from "./pages/CozeTestPage";
// import TestPage from "./pages/TestPage";
// import ContextTestPage from "./pages/ContextTestPage";
// import DeepTalkTestPage from "./pages/DeepTalkTestPage";
// import InputBoxTestPage from "./pages/InputBoxTestPage";
import SimpleDeepTalkPage from "./pages/SimpleDeepTalkPage";
import OAuthCallback from "./pages/OAuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/birthday" element={<BirthdayPage />} />
          <Route path="/deeptalk" element={<DeepTalkPage />} />
          <Route path="/report" element={<ReportPage />} />
          {/* 测试路由 - 生产环境已注释 */}
        {/* <Route path="/coze-test" element={<CozeTestPage />} /> */}
        {/* <Route path="/test" element={<TestPage />} /> */}
        {/* <Route path="/context-test" element={<ContextTestPage />} /> */}
        {/* <Route path="/deeptalk-test" element={<DeepTalkTestPage />} /> */}
        {/* <Route path="/input-test" element={<InputBoxTestPage />} /> */}
        <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;