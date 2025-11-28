// src/routes/index.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

// Layouts
import MainLayout from "@layouts/MainLayout";
import AuthLayout from "@layouts/AuthLayout";

// Auth Pages
import LoginPage from "@features/auth/pages/LoginPage";
import ForgotPasswordPage from "@features/auth/pages/ForgotPasswordPage";

// Dashboard
import DashboardPage from "@features/dashboard/pages/DashboardPage";

// Nu Tu
import SisterListPage from "@features/nu-tu/pages/SisterListPage";
import SisterDetailPage from "@features/nu-tu/pages/SisterDetailPage";
import SisterFormPage from "@features/nu-tu/pages/SisterFormPage";

// Hanh Trinh
import TimelinePage from "@features/hanh-trinh/pages/TimelinePage";
import VocationJourneyListPage from "@features/hanh-trinh/pages/VocationJourneyListPage";
import VocationJourneyDetailPage from "@features/hanh-trinh/pages/VocationJourneyDetailPage";
import VocationJourneyFormPage from "@features/hanh-trinh/pages/VocationJourneyFormPage";

// Cong Doan
import CongDoanListPage from "@features/cong-doan/pages/CongDoanListPage";
import CommunityDetailPage from "@features/cong-doan/pages/CommunityDetailPage";
import CommunityFormPage from "@features/cong-doan/pages/CommunityFormPage";
import AssignmentPage from "@features/cong-doan/pages/AssignmentPage";

// Suc Khoe
import {
  HealthRecordListPage,
  HealthRecordFormPage,
  DepartureListPage,
  DepartureFormPage,
} from "@features/suc-khoe";

// Not Found
import NotFoundPage from "@pages/NotFound/NotFoundPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Nu Tu */}
          <Route path="/nu-tu" element={<SisterListPage />} />
          <Route path="/nu-tu/create" element={<SisterFormPage />} />
          <Route path="/nu-tu/:id" element={<SisterDetailPage />} />
          <Route path="/nu-tu/:id/edit" element={<SisterFormPage />} />

          {/* Hanh Trinh - Timeline cua Nu Tu */}
          <Route
            path="/nu-tu/:sisterId/hanh-trinh"
            element={<TimelinePage />}
          />

          {/* Hanh Trinh - Quan ly chung */}
          <Route path="/hanh-trinh" element={<VocationJourneyListPage />} />
          <Route
            path="/hanh-trinh/create"
            element={<VocationJourneyFormPage />}
          />
          <Route
            path="/hanh-trinh/:id"
            element={<VocationJourneyDetailPage />}
          />
          <Route
            path="/hanh-trinh/:id/edit"
            element={<VocationJourneyFormPage />}
          />

          {/* Cong Doan */}
          <Route path="/cong-doan" element={<CongDoanListPage />} />
          <Route path="/cong-doan/create" element={<CommunityFormPage />} />
          <Route path="/cong-doan/:id" element={<CommunityDetailPage />} />
          <Route path="/cong-doan/:id/edit" element={<CommunityFormPage />} />
          <Route path="/cong-doan/:id/assign" element={<AssignmentPage />} />

          {/* Suc Khoe */}
          <Route path="/suc-khoe" element={<HealthRecordListPage />} />
          <Route path="/suc-khoe/create" element={<HealthRecordFormPage />} />
          <Route path="/suc-khoe/:id/edit" element={<HealthRecordFormPage />} />
          <Route path="/nu-tu/:sisterId/suc-khoe" element={<HealthRecordListPage />} />
          <Route path="/nu-tu/:sisterId/suc-khoe/create" element={<HealthRecordFormPage />} />

          {/* Di Vang */}
          <Route path="/di-vang" element={<DepartureListPage />} />
          <Route path="/di-vang/create" element={<DepartureFormPage />} />
          <Route path="/di-vang/:id/edit" element={<DepartureFormPage />} />
          <Route path="/nu-tu/:sisterId/di-vang" element={<DepartureListPage />} />
          <Route path="/nu-tu/:sisterId/di-vang/create" element={<DepartureFormPage />} />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
