import { useRoutes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import routes from "./routes";
import { PageLoader } from "./components/PageLoader";

function App() {
  const element = useRoutes(routes);
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loading when route changes
    setLoading(true);

    // Minimum loading time for smooth UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "10px",
            fontWeight: "500",
            padding: "16px",
          },
          success: {
            icon: null,
            style: {
              background: "oklch(72.3% 0.219 149.579)",
              color: "#fff",
            },
          },
          error: {
            icon: null,
            style: {
              background: "oklch(57.7% 0.245 27.325)",
              color: "#fff",
            },
          },
        }}
      />
      {loading && <PageLoader />}
      {element}
    </>
  );
}

export default App;
