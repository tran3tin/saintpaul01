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
import CommunityTimelinePage from "@features/cong-doan/pages/CommunityTimelinePage";

// Suc Khoe
import {
  HealthRecordListPage,
  HealthRecordFormPage,
  HealthRecordDetailPage,
  HealthTimelinePage,
  DepartureListPage,
  DepartureFormPage,
  DepartureDetailPage,
} from "@features/suc-khoe";

// Danh Gia (Evaluation)
import {
  EvaluationListPage,
  EvaluationDetailPage,
  EvaluationFormPage,
  EvaluationTimelinePage,
} from "@features/danh-gia";

// Hoc Van (Education)
import {
  EducationListPage,
  EducationListAllPage,
  EducationFormPage,
  EducationDetailPage,
  EducationTimelinePage,
} from "@features/hoc-van";

// Su Vu (Mission)
import {
  MissionListPage,
  MissionDetailPage,
  MissionFormPage,
  MissionTimelinePage,
} from "@features/su-vu";

// Bao Cao (Reports)
import {
  ReportDashboardPage,
  ReportListPage,
  ReportDetailPage,
  ReportGeneratePage,
  SisterReportPage,
  JourneyReportPage,
  HealthReportPage,
  EvaluationReportPage,
} from "@features/bao-cao";

// Users
import {
  UserListPage,
  UserDetailPage,
  UserFormPage,
  ProfilePage,
} from "@features/users";

// Settings
import {
  SettingsIndexPage,
  GeneralSettingsPage,
  SystemSettingsPage,
  PreferencesPage,
  BackupSettingsPage,
} from "@features/settings";

// Audit Log
import { AuditLogPage } from "@features/audit-log";

// Error Pages
import { ForbiddenPage, ServerErrorPage } from "@pages/errors";
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
          <Route path="/hanh-trinh/timeline" element={<TimelinePage />} />
          <Route
            path="/hanh-trinh/timeline/:sisterId"
            element={<TimelinePage />}
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
          <Route path="/cong-doan/assignment" element={<AssignmentPage />} />
          <Route
            path="/cong-doan/timeline"
            element={<CommunityTimelinePage />}
          />
          <Route
            path="/cong-doan/timeline/:communityId"
            element={<CommunityTimelinePage />}
          />
          <Route path="/cong-doan/create" element={<CommunityFormPage />} />
          <Route path="/cong-doan/:id" element={<CommunityDetailPage />} />
          <Route path="/cong-doan/:id/edit" element={<CommunityFormPage />} />
          <Route path="/cong-doan/:id/assign" element={<AssignmentPage />} />

          {/* Suc Khoe */}
          <Route path="/suc-khoe" element={<HealthRecordListPage />} />
          <Route path="/suc-khoe/timeline" element={<HealthTimelinePage />} />
          <Route
            path="/suc-khoe/timeline/:sisterId"
            element={<HealthTimelinePage />}
          />
          <Route path="/suc-khoe/create" element={<HealthRecordFormPage />} />
          <Route path="/suc-khoe/:id" element={<HealthRecordDetailPage />} />
          <Route path="/suc-khoe/:id/edit" element={<HealthRecordFormPage />} />
          <Route
            path="/nu-tu/:sisterId/suc-khoe"
            element={<HealthRecordListPage />}
          />
          <Route
            path="/nu-tu/:sisterId/suc-khoe/create"
            element={<HealthRecordFormPage />}
          />

          {/* Di Vang */}
          <Route path="/di-vang" element={<DepartureListPage />} />
          <Route path="/di-vang/:id" element={<DepartureDetailPage />} />
          <Route path="/di-vang/create" element={<DepartureFormPage />} />
          <Route path="/di-vang/:id/edit" element={<DepartureFormPage />} />
          <Route
            path="/nu-tu/:sisterId/di-vang"
            element={<DepartureListPage />}
          />
          <Route
            path="/nu-tu/:sisterId/di-vang/:id"
            element={<DepartureDetailPage />}
          />
          <Route
            path="/nu-tu/:sisterId/di-vang/create"
            element={<DepartureFormPage />}
          />

          {/* Danh Gia (Evaluation) */}
          <Route path="/danh-gia" element={<EvaluationListPage />} />
          <Route
            path="/danh-gia/timeline"
            element={<EvaluationTimelinePage />}
          />
          <Route
            path="/danh-gia/timeline/:sisterId"
            element={<EvaluationTimelinePage />}
          />
          <Route path="/danh-gia/create" element={<EvaluationFormPage />} />
          <Route path="/danh-gia/:id" element={<EvaluationDetailPage />} />
          <Route path="/danh-gia/:id/edit" element={<EvaluationFormPage />} />
          <Route
            path="/nu-tu/:sisterId/danh-gia"
            element={<EvaluationListPage />}
          />
          <Route
            path="/nu-tu/:sisterId/danh-gia/create"
            element={<EvaluationFormPage />}
          />

          {/* Hoc Van (Education) */}
          <Route path="/hoc-van" element={<EducationListAllPage />} />
          <Route path="/hoc-van/timeline" element={<EducationTimelinePage />} />
          <Route
            path="/hoc-van/timeline/:sisterId"
            element={<EducationTimelinePage />}
          />
          <Route path="/hoc-van/create" element={<EducationFormPage />} />
          <Route path="/hoc-van/:id" element={<EducationDetailPage />} />
          <Route path="/hoc-van/:id/edit" element={<EducationFormPage />} />
          <Route
            path="/nu-tu/:sisterId/hoc-van"
            element={<EducationListPage />}
          />
          <Route
            path="/nu-tu/:sisterId/hoc-van/create"
            element={<EducationFormPage />}
          />

          {/* Su Vu (Mission) */}
          <Route path="/su-vu" element={<MissionListPage />} />
          <Route path="/su-vu/timeline" element={<MissionTimelinePage />} />
          <Route
            path="/su-vu/timeline/:sisterId"
            element={<MissionTimelinePage />}
          />
          <Route path="/su-vu/create" element={<MissionFormPage />} />
          <Route path="/su-vu/:id" element={<MissionDetailPage />} />
          <Route path="/su-vu/:id/edit" element={<MissionFormPage />} />
          <Route path="/nu-tu/:sisterId/su-vu" element={<MissionListPage />} />
          <Route
            path="/nu-tu/:sisterId/su-vu/create"
            element={<MissionFormPage />}
          />

          {/* Bao Cao (Reports) */}
          <Route path="/bao-cao" element={<ReportDashboardPage />} />
          <Route path="/bao-cao/list" element={<ReportListPage />} />
          <Route path="/bao-cao/generate" element={<ReportGeneratePage />} />
          <Route path="/bao-cao/:id" element={<ReportDetailPage />} />
          <Route path="/bao-cao/nu-tu" element={<SisterReportPage />} />
          <Route path="/bao-cao/hanh-trinh" element={<JourneyReportPage />} />
          <Route path="/bao-cao/suc-khoe" element={<HealthReportPage />} />
          <Route path="/bao-cao/danh-gia" element={<EvaluationReportPage />} />

          {/* Users */}
          <Route path="/users" element={<UserListPage />} />
          <Route path="/users/create" element={<UserFormPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/users/:id/edit" element={<UserFormPage />} />

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsIndexPage />} />
          <Route path="/settings/general" element={<GeneralSettingsPage />} />
          <Route path="/settings/system" element={<SystemSettingsPage />} />
          <Route path="/settings/preferences" element={<PreferencesPage />} />
          <Route path="/settings/backup" element={<BackupSettingsPage />} />
          <Route path="/settings/audit-log" element={<AuditLogPage />} />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Error Pages */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
