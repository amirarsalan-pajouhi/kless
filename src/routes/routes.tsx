import { createBrowserRouter } from "react-router-dom";
import Home from "../components/Home";
import Admin from "../components/Admin";
import Login from "../components/Login";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/admin/:username", element: <Admin /> },
  { path: "/login", element: <Login /> },
]);

export default router;
