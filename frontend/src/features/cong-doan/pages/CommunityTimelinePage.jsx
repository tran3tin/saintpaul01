// src/features/cong-doan/pages/CommunityTimelinePage.jsx

import React from "react";
import Timeline from "@components/common/Timeline";
import { communityService, sisterService } from "@services";
import { formatDate } from "@utils";

// Role configurations
const roleConfig = {
  superior: {
    label: "Bề trên",
    icon: "fas fa-crown",
    className: "level-doctorate",
  },
  assistant: {
    label: "Phó Bề trên",
    icon: "fas fa-user-tie",
    className: "level-masters",
  },
  councilor: {
    label: "Cố vấn",
    icon: "fas fa-users",
    className: "level-university",
  },
  treasurer: {
    label: "Thủ quỹ",
    icon: "fas fa-coins",
    className: "type-mission",
  },
  secretary: {
    label: "Thư ký",
    icon: "fas fa-pen",
    className: "type-education",
  },
  member: {
    label: "Thành viên",
    icon: "fas fa-user",
    className: "type-community",
  },
};

const getRoleConfig = (role) => {
  return (
    roleConfig[role] || {
      label: role || "Thành viên",
      icon: "fas fa-home",
      className: "type-community",
    }
  );
};

const CommunityTimelinePage = () => {
  // Fetch community assignments by sister
  const fetchDataBySister = async (sisterId) => {
    try {
      // Get sister detail which includes community assignments history
      const response = await sisterService.getDetail(sisterId);
      if (response && response.success && response.data) {
        const sister = response.data;

        // Try to get community assignments from sister data
        // or fetch from API if available
        let assignments = sister.community_assignments || [];

        // If no assignments in sister data, try to get current community
        if (assignments.length === 0 && sister.current_community_id) {
          assignments = [
            {
              id: 1,
              community_id: sister.current_community_id,
              community_name: sister.current_community_name,
              role: sister.role_in_community || "member",
              start_date: sister.community_start_date || sister.created_at,
              end_date: null,
              is_current: true,
            },
          ];
        }

        // Sort by start_date descending
        return assignments.sort(
          (a, b) =>
            new Date(b.start_date || b.created_at) -
            new Date(a.start_date || a.created_at)
        );
      }
      return [];
    } catch (error) {
      console.error("Error fetching community assignments:", error);
      return [];
    }
  };

  // Get item config based on role
  const getItemConfig = (item) => {
    return getRoleConfig(item.role);
  };

  // Render item content
  const renderItemContent = (item, config) => (
    <>
      <div className="timeline-date">
        <i className="fas fa-calendar"></i>
        {formatDate(item.start_date)}
        {item.end_date ? ` - ${formatDate(item.end_date)}` : " - Hiện tại"}
      </div>
      <h3 className="timeline-title">
        {item.community_name || `Cộng đoàn #${item.community_id}`}
      </h3>
      <span className={`timeline-stage ${config.className}`}>
        {config.label}
      </span>

      {item.address && (
        <div className="timeline-location">
          <i className="fas fa-map-marker-alt"></i>
          {item.address}
        </div>
      )}

      {item.diocese && (
        <div className="timeline-info">
          <i className="fas fa-church"></i>
          Giáo phận: {item.diocese}
        </div>
      )}

      {item.notes && <p className="timeline-description mt-2">{item.notes}</p>}

      {item.is_current && (
        <div className="mt-2">
          <span className="badge bg-success">
            <i className="fas fa-check me-1"></i>
            Hiện tại
          </span>
        </div>
      )}
    </>
  );

  // Calculate stats
  const calculateStats = (items, sister) => {
    const total = items.length;
    const currentCommunity = items.find((i) => !i.end_date || i.is_current);
    const leadershipRoles = items.filter((i) =>
      ["superior", "assistant", "councilor"].includes(i.role)
    ).length;
    const totalYears = items.reduce((total, item) => {
      const start = new Date(item.start_date);
      const end = item.end_date ? new Date(item.end_date) : new Date();
      return total + (end - start) / (365.25 * 24 * 60 * 60 * 1000);
    }, 0);

    return [
      {
        icon: "fas fa-home",
        label: "Tổng cộng đoàn",
        value: total,
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      {
        icon: "fas fa-map-marker-alt",
        label: "Cộng đoàn hiện tại",
        value: currentCommunity?.community_name?.substring(0, 15) || "N/A",
        gradient: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
      },
      {
        icon: "fas fa-crown",
        label: "Vai trò lãnh đạo",
        value: leadershipRoles,
        gradient: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
      },
      {
        icon: "fas fa-clock",
        label: "Năm sinh hoạt",
        value: Math.round(totalYears),
        gradient: "linear-gradient(135deg, #2ad7c5 0%, #20c997 100%)",
      },
    ];
  };

  return (
    <Timeline
      title="Timeline Cộng Đoàn"
      subtitle="Xem lịch sử các cộng đoàn và vai trò của nữ tu"
      icon="fas fa-home"
      backUrl="/cong-doan"
      fetchDataBySister={fetchDataBySister}
      getItemConfig={getItemConfig}
      renderItemContent={renderItemContent}
      calculateStats={calculateStats}
      emptyMessage="Chưa có lịch sử cộng đoàn"
      emptyDescription="Nữ tu này chưa có thông tin cộng đoàn nào được ghi nhận."
    />
  );
};

export default CommunityTimelinePage;
