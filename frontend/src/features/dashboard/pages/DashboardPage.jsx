// src/features/dashboard/pages/DashboardPage.jsx

import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useAuth } from "@context";
import { dashboardService } from "@services";
import StatsOverview from "../components/StatsOverview";
import RecentActivities from "../components/RecentActivities/RecentActivities";
import QuickActions from "../components/QuickActions/QuickActions";

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats and activities in parallel
      const [statsResponse, activitiesResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivities(100),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (activitiesResponse.success) {
        setActivities(activitiesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Welcome Section */}
      <div className="mb-4">
        <h2 className="mb-1">Chào mừng, {user?.full_name || "Admin"}!</h2>
        <p className="text-muted">Tổng quan hệ thống quản lý hội dòng</p>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Recent Activities & Quick Actions */}
      <Row className="g-4 mt-2">
        <Col lg={8}>
          <RecentActivities activities={activities} />
        </Col>
        <Col lg={4}>
          <QuickActions />
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
