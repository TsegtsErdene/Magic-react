import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp?: number;
}

const isTokenExpired = (token: string) => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  // Token байхгүй, эсвэл expiry болсон бол signin руу явуулах
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    return <Navigate to="/signin" replace />;
  }

  // Token байна, expiry болоогүй бол зөвшөөрөх
  return <Outlet />;
};

export default ProtectedRoute;