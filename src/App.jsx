import { useRoutes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import routes from "./routes";

function App() {
  const element = useRoutes(routes);

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
      {element}
    </>
  );
}

export default App;
