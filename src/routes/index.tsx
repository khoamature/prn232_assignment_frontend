import { RouteObject } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { AdminDashboard } from "../pages/AdminDashboard";
import { StaffDashboard } from "../pages/StaffDashboard";

// Định nghĩa các routes cho ứng dụng
const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/staff",
    element: <StaffDashboard />,
  },
];

export default routes;
