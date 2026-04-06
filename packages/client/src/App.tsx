import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

// 导入页面组件
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import { MainLayout } from "./layouts/MainLayout";
import HotelAudit from "./pages/HotelAudit";
import HotelEdit from "./pages/HotelEdit";
import AuditStatusPage from "./pages/AuditStatus";
import ProfilePage from "./pages/Profile/ProfilePage";
import FeedbackManager from "./layouts/components/Navbar/FeedbackManager";
import AuditRecords from "./pages/AuditRecords";
import HotelList from "./pages/HotelList";
import IncompleteHotels from "./pages/IncompleteHotels";
import MerchantDashboard from "./pages/Dashboard/MerchantDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import OrderList from "./pages/OrderList";

// 路由守卫组件
interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: "merchant" | "admin";
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRole,
  redirectTo = "/login",
}) => {
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    return <Navigate to={redirectTo} replace />;
  }

  try {
    const user = JSON.parse(userStr);

    if (requiredRole && user.role !== requiredRole) {
      // 如果角色不符合，根据当前角色重定向
      if (user.role === "merchant") {
        return <Navigate to="/merchant/dashboard" replace />;
      } else if (user.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
  } catch {
    return <Navigate to={redirectTo} replace />;
  }
};

// 公开路由组件（已登录用户不能访问）
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userStr = localStorage.getItem("user");

  if (userStr) {
    // 如果已登录，根据角色重定向
    try {
      const user = JSON.parse(userStr);
      if (user.role === "merchant") {
        return <Navigate to="/merchant/dashboard" replace />;
      } else if (user.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      }
    } catch {
      // 解析失败，清除本地存储
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          {/* 公开路由（不需要登录） */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* 主布局路由（需要登录） */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route
              index
              element={(() => {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                  const user = JSON.parse(userStr);
                  if (user.role === "merchant") {
                    return <Navigate to="/merchant/dashboard" replace />;
                  } else if (user.role === "admin") {
                    return <Navigate to="/admin/dashboard" replace />;
                  }
                }
                return <Navigate to="/login" replace />;
              })()}
            />

            {/* 商户专属路由 */}
            <Route path="merchant">
              <Route
                path="dashboard"
                element={
                  <PrivateRoute requiredRole="merchant">
                    <MerchantDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="records"
                element={
                  <PrivateRoute requiredRole="merchant">
                    <AuditRecords />
                  </PrivateRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <PrivateRoute requiredRole="merchant">
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
            </Route>

            {/* 管理员专属路由 */}
            <Route path="admin">
              <Route
                path="dashboard"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <PrivateRoute requiredRole="admin">
                    <ProfilePage />
                  </PrivateRoute>
                }
              />

              <Route
                path="feedback"
                element={
                  <PrivateRoute requiredRole="admin">
                    <FeedbackManager />
                  </PrivateRoute>
                }
              />
            </Route>

            {/* 酒店管理相关路由（商户可访问） */}
            <Route path="hotels">
              <Route
                index
                element={
                  <PrivateRoute requiredRole="merchant">
                    <HotelList />
                  </PrivateRoute>
                }
              />
              <Route
                path="incomplete"
                element={
                  <PrivateRoute requiredRole="merchant">
                    <IncompleteHotels />
                  </PrivateRoute>
                }
              />
              <Route
                path="new"
                element={
                  <PrivateRoute requiredRole="merchant">
                    <HotelEdit />
                  </PrivateRoute>
                }
              />
              <Route
                path="edit/:id"
                element={
                  <PrivateRoute requiredRole="merchant">
                    <HotelEdit />
                  </PrivateRoute>
                }
              />
              <Route
                path="audit"
                element={
                  <PrivateRoute requiredRole="admin">
                    <HotelAudit />
                  </PrivateRoute>
                }
              />
            </Route>

            {/* 订单管理路由 */}
            <Route
              path="orders"
              element={
                <PrivateRoute requiredRole="merchant">
                  <OrderList />
                </PrivateRoute>
              }
            />

            <Route
              path="/audit-status/:hotelId"
              element={
                <PrivateRoute requiredRole="merchant">
                  <AuditStatusPage />
                </PrivateRoute>
              }
            />

            {/* 404 页面 */}
            <Route path="*" element={<div>404 - 页面未找到</div>} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
