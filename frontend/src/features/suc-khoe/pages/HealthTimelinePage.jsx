// src/features/suc-khoe/pages/HealthTimelinePage.jsx

import React from "react";
import Timeline from "@components/common/Timeline";
import { healthService } from "@services";
import { formatDate } from "@utils";

// Health status configurations
const healthStatusConfig = {
  good: {
    label: "Tốt",
    icon: "fas fa-smile",
    className: "type-good",
  },
  average: {
    label: "Trung bình",
    icon: "fas fa-meh",
    className: "type-average",
  },
  weak: {
    label: "Yếu",
    icon: "fas fa-frown",
    className: "type-weak",
  },
};

const getHealthConfig = (status) => {
  return (
    healthStatusConfig[status] || {
      label: status || "Chưa xác định",
      icon: "fas fa-heartbeat",
      className: "type-health",
    }
  );
};

const HealthTimelinePage = () => {
  // Fetch health records by sister
  const fetchDataBySister = async (sisterId) => {
    try {
      const response = await healthService.getList({
        sister_id: sisterId,
        limit: 100,
      });
      if (response && response.success) {
        const items = response.data?.items || response.data || [];
        // Sort by checkup_date descending
        return items.sort(
          (a, b) => new Date(b.checkup_date) - new Date(a.checkup_date)
        );
      }
      return [];
    } catch (error) {
      console.error("Error fetching health records:", error);
      return [];
    }
  };

  // Get item config based on health status
  const getItemConfig = (item) => {
    return getHealthConfig(item.general_health);
  };

  // Render item content
  const renderItemContent = (item, config) => (
    <>
      <div className="timeline-date">
        <i className="fas fa-calendar"></i>
        {formatDate(item.checkup_date)}
      </div>
      <h3 className="timeline-title">
        Khám sức khỏe {item.checkup_place ? `tại ${item.checkup_place}` : ""}
      </h3>
      <span className={`timeline-stage ${config.className}`}>
        Sức khỏe: {config.label}
      </span>

      {/* Health metrics */}
      <div className="d-flex flex-wrap gap-2 mb-2">
        {item.blood_pressure && (
          <span className="badge bg-light text-dark">
            <i className="fas fa-tint text-danger me-1"></i>
            {item.blood_pressure}
          </span>
        )}
        {item.heart_rate && (
          <span className="badge bg-light text-dark">
            <i className="fas fa-heartbeat text-danger me-1"></i>
            {item.heart_rate} bpm
          </span>
        )}
        {item.weight && (
          <span className="badge bg-light text-dark">
            <i className="fas fa-weight text-primary me-1"></i>
            {item.weight} kg
          </span>
        )}
        {item.height && (
          <span className="badge bg-light text-dark">
            <i className="fas fa-ruler-vertical text-success me-1"></i>
            {item.height} cm
          </span>
        )}
      </div>

      {item.diagnosis && (
        <p className="timeline-description">
          <strong>Chẩn đoán:</strong> {item.diagnosis}
        </p>
      )}

      {item.doctor && (
        <div className="timeline-info">
          <i className="fas fa-user-md"></i>
          Bác sĩ: {item.doctor}
        </div>
      )}

      {item.next_checkup_date && (
        <div className="timeline-info">
          <i className="fas fa-calendar-check"></i>
          Khám tiếp theo: {formatDate(item.next_checkup_date)}
        </div>
      )}
    </>
  );

  // Calculate stats
  const calculateStats = (items, sister) => {
    const total = items.length;
    const goodCount = items.filter((i) => i.general_health === "good").length;
    const latestRecord = items[0];

    return [
      {
        icon: "fas fa-notes-medical",
        label: "Tổng lần khám",
        value: total,
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      {
        icon: "fas fa-heartbeat",
        label: "Sức khỏe tốt",
        value: goodCount,
        gradient: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
      },
      {
        icon: "fas fa-calendar-check",
        label: "Lần khám gần nhất",
        value: latestRecord ? formatDate(latestRecord.checkup_date) : "N/A",
        gradient: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
      },
      {
        icon: "fas fa-stethoscope",
        label: "Tình trạng hiện tại",
        value: latestRecord
          ? getHealthConfig(latestRecord.general_health).label
          : "N/A",
        gradient: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
      },
    ];
  };

  return (
    <Timeline
      title="Timeline Sức Khỏe"
      subtitle="Xem lịch sử khám sức khỏe của nữ tu"
      icon="fas fa-heartbeat"
      backUrl="/suc-khoe"
      fetchDataBySister={fetchDataBySister}
      getItemConfig={getItemConfig}
      renderItemContent={renderItemContent}
      calculateStats={calculateStats}
      emptyMessage="Chưa có hồ sơ sức khỏe"
      emptyDescription="Nữ tu này chưa có thông tin khám sức khỏe nào được ghi nhận."
    />
  );
};

export default HealthTimelinePage;
