import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import History from "./pages/History";
import AdminDashboard from "./pages/AdminDashboard";
import Gallery from "./pages/Gallery";
import ProductDetail from "./pages/ProductDetail";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/about" element={<About />} />
      <Route path="/history" element={<History />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
