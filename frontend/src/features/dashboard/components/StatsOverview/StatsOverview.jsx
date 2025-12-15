// src/features/dashboard/components/StatsOverview/StatsOverview.jsx

import React from "react";
import { Row, Col } from "react-bootstrap";
import StatCard from "@components/cards/StatCard";
import { formatNumber } from "@utils";
import "./StatsOverview.css";

const StatsOverview = ({ stats }) => {
  if (!stats) return null;

  const activePercentage =
    stats.totalSisters > 0
      ? ((stats.activeSisters / stats.totalSisters) * 100).toFixed(1)
      : 0;

  return (
    <Row className="g-4">
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          title="Tổng số Nữ Tu"
          value={formatNumber(stats.totalSisters || 0)}
          icon="fas fa-users"
          color="primary"
          trend={stats.newSistersThisMonth > 0 ? "up" : null}
          trendValue={
            stats.newSistersThisMonth > 0
              ? `+${stats.newSistersThisMonth}`
              : null
          }
          trendLabel={stats.newSistersThisMonth > 0 ? "trong tháng này" : null}
        />
      </Col>

      <Col xs={12} sm={6} lg={3}>
        <StatCard
          title="Đang hoạt động"
          value={formatNumber(stats.activeSisters || 0)}
          icon="fas fa-user-check"
          color="success"
          subtitle={`${activePercentage}% tổng số`}
        />
      </Col>

      <Col xs={12} sm={6} lg={3}>
        <StatCard
          title="Cộng đoàn"
          value={formatNumber(stats.totalCommunities || 0)}
          icon="fas fa-home"
          color="info"
        />
      </Col>

      <Col xs={12} sm={6} lg={3}>
        <StatCard
          title="Tuổi trung bình"
          value={stats.averageAge ? `${stats.averageAge} tuổi` : "N/A"}
          icon="fas fa-birthday-cake"
          color="warning"
        />
      </Col>
    </Row>
  );
};

export default StatsOverview;
