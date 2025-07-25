import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  // Token localStorage эсвэл context-оос уншиж болно
  const token = localStorage.getItem("token");

  // Token байхгүй бол SignIn page рүү чиглүүлнэ
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  // Token байгаа бол child route-уудыг харуулна
  return <Outlet />;
}
