import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/login/LoginPage';
import { AppLayout } from './layouts/AppLayout';
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
import { HomePage } from './components/homepage/HomePage';
import { CartPage } from './components/cart/CartPage';
import { UserPage } from './components/user/UserPage';
import { AboutUsPage } from './components/about-us/AboutUsPage';
import { ReviewsPage } from './components/review/ReviewsPage';
import { GoogleAuthCallback } from './components/settings/GoogleAuthCallback';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/scheduler" />} />
          <Route path="/app/dashboard" element={<DashboardPage />} />
          <Route path="/app/scheduler" element={<SchedulerPage />} />
          <Route path="/app/product" element={<ProductPage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
          <Route path="/app/settings/callback" element={<GoogleAuthCallback />} />
          <Route path="/app/about" element={<AboutUsPage />} />
          <Route path="/app/cost-calculator" element={<CostCalculator />} />
          <Route path="/app/cart" element={<CartPage />} />
          <Route path="/app/users" element={<UserPage />} />
          <Route path="/app/review" element={<ReviewsPage />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
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
