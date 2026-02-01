import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { MainLayout } from "./layouts/MainLayout";
import HotelAudit from "./pages/HotelAudit";
import HotelEdit from "./pages/HotelEdit"; 
// 临时占位组件 
const HotelList = () => <div>酒店管理列表页</div>;

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          {/* 主布局路由 */}
          <Route path="/" element={<MainLayout />}>
            {/* 首页重定向到列表 */}
            <Route index element={<Navigate to="/hotels" replace />} />

            {/* 酒店管理相关路由 */}
            <Route path="hotels">
              <Route index element={<HotelList />} />
              <Route path="new" element={<HotelEdit />} />
              <Route path="edit/:id" element={<HotelEdit />} />
              <Route path="audit" element={<HotelAudit />} />
            </Route>

            {/* 404 页面 */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;