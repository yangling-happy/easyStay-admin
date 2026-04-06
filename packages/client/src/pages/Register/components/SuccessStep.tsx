// src/pages/Register/components/SuccessStep.tsx
import React from 'react';
import { Typography, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface SuccessStepProps {
  selectedRole: 'merchant' | 'admin';
  navigate: any;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ selectedRole, navigate }) => {
  return (
    <div style={{ textAlign: 'center', padding: '30px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#1890ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <UserOutlined style={{ fontSize: 28, color: '#fff' }} />
        </div>
        <Title level={4} style={{ marginBottom: 8, color: '#1890ff' }}>
          注册成功！
        </Title>
        <Text style={{ color: '#666', fontSize: 14 }}>
          {selectedRole === 'merchant' 
            ? '商户账号已创建完成' 
            : '管理员账号已创建完成'}
        </Text>
      </div>

      <div style={{ 
        background: '#f0f9ff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        border: '1px solid #e6f7ff'
      }}>
        <Text style={{ color: '#666', fontSize: 13 }}>
          正在跳转到{selectedRole === 'merchant' ? '商户' : '管理员'}后台...
          <Button 
            type="link" 
            onClick={() => {
              const userStr = localStorage.getItem('user');
              if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role === 'merchant') {
                  navigate('/merchant/dashboard');
                } else {
                  navigate('/admin/dashboard');
                }
              }
            }}
            style={{ 
              padding: '0 4px',
              fontSize: 13
            }}
          >
            立即进入
          </Button>
        </Text>
      </div>
    </div>
  );
};

export default SuccessStep;