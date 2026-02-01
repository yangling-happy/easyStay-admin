import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import HotelAudit from "./pages/HotelAudit";

// 临时占位组件
const HotelList = () => <div>酒店管理列表页</div>;
const HotelEdit = () => <div>酒店录入/编辑页</div>;

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* 默认跳转到列表页 */}
            <Route index element={<Navigate to="/hotels" replace />} />

            {/* 酒店管理主路由 */}
            <Route path="hotels" element={<HotelList />} />
            <Route path="hotels/new" element={<HotelEdit />} />
            <Route path="hotels/edit/:id" element={<HotelEdit />} />
            <Route path="hotels/audit" element={<HotelAudit />} />

            {/* 404 页面 */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
