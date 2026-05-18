import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/login/LoginPage';
import { AppLayout } from './layouts/AppLayout';
import { Welcome } from './components/welcome/welcome';
import { ProtectedLayout } from './layouts/ProtectedLayout';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { SchedulerPage } from './components/scheduler/SchedulerPage';
import { ProductPage } from './components/product/ProductPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { CostCalculator } from './components/recipe/CostCalculator';
import { SignUp } from './components/login/SignUp';
import { ForgotPassword } from './components/login/ForgotPassword';
import { ResetPassword } from './components/login/ResetPassword';
import { Validate2FA } from './components/login/Validate2FA';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scheduler" element={<SchedulerPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/cost-calculator" element={<CostCalculator />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Welcome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/validate-2fa" element={<Validate2FA />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
