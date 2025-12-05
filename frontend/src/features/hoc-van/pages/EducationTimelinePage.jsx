// src/features/hoc-van/pages/EducationTimelinePage.jsx

import React from "react";
import Timeline from "@components/common/Timeline";
import { educationService } from "@services";
import { formatDate } from "@utils";

// Education level configurations
const educationLevelConfig = {
  primary: {
    label: "Tiểu học",
    icon: "fas fa-child",
    className: "level-primary",
  },
  secondary: {
    label: "Trung học cơ sở",
    icon: "fas fa-school",
    className: "level-secondary",
  },
  high_school: {
    label: "Trung học phổ thông",
    icon: "fas fa-graduation-cap",
    className: "level-high_school",
  },
  college: {
    label: "Cao đẳng",
    icon: "fas fa-university",
    className: "level-college",
  },
  university: {
    label: "Đại học",
    icon: "fas fa-user-graduate",
    className: "level-university",
  },
  masters: {
    label: "Thạc sĩ",
    icon: "fas fa-award",
    className: "level-masters",
  },
  doctorate: {
    label: "Tiến sĩ",
    icon: "fas fa-trophy",
    className: "level-doctorate",
  },
  certificate: {
    label: "Chứng chỉ",
    icon: "fas fa-certificate",
    className: "level-college",
  },
  vocational: {
    label: "Nghề",
    icon: "fas fa-tools",
    className: "level-secondary",
  },
  religious: {
    label: "Đào tạo tu trì",
    icon: "fas fa-cross",
    className: "level-university",
  },
};

const getEducationConfig = (level) => {
  return (
    educationLevelConfig[level] || {
      label: level || "Khác",
      icon: "fas fa-book",
      className: "type-education",
    }
  );
};

const EducationTimelinePage = () => {
  // Fetch education records by sister
  const fetchDataBySister = async (sisterId) => {
    try {
      const response = await educationService.getBySister(sisterId);
      if (response && response.success) {
        const items = response.data || [];
        // Sort by start_date descending
        return items.sort(
          (a, b) =>
            new Date(b.start_date || b.created_at) -
            new Date(a.start_date || a.created_at)
        );
      }
      return [];
    } catch (error) {
      console.error("Error fetching education records:", error);
      return [];
    }
  };

  // Get item config based on education level
  const getItemConfig = (item) => {
    return getEducationConfig(item.level);
  };

  // Render item content
  const renderItemContent = (item, config) => (
    <>
      <div className="timeline-date">
        <i className="fas fa-calendar"></i>
        {formatDate(item.start_date)}
        {item.end_date && ` - ${formatDate(item.end_date)}`}
      </div>
      <h3 className="timeline-title">
        {item.degree || item.major || config.label}
      </h3>
      <span className={`timeline-stage ${config.className}`}>
        {config.label}
      </span>

      {item.institution && (
        <div className="timeline-info">
          <i className="fas fa-university"></i>
          {item.institution}
        </div>
      )}

      {item.major && item.major !== item.degree && (
        <div className="timeline-info">
          <i className="fas fa-book-open"></i>
          Chuyên ngành: {item.major}
        </div>
      )}

      {item.grade && (
        <div className="timeline-info">
          <i className="fas fa-star"></i>
          Xếp loại: {item.grade}
        </div>
      )}

      {item.certificate_number && (
        <div className="timeline-info">
          <i className="fas fa-certificate"></i>
          Số bằng: {item.certificate_number}
        </div>
      )}

      {item.notes && <p className="timeline-description mt-2">{item.notes}</p>}
    </>
  );

  // Calculate stats
  const calculateStats = (items, sister) => {
    const total = items.length;
    const highestLevel = items.reduce((highest, item) => {
      const levels = [
        "primary",
        "secondary",
        "high_school",
        "college",
        "university",
        "masters",
        "doctorate",
      ];
      const currentIndex = levels.indexOf(item.level);
      const highestIndex = levels.indexOf(highest);
      return currentIndex > highestIndex ? item.level : highest;
    }, "primary");
    const certificates = items.filter((i) => i.certificate_number).length;

    return [
      {
        icon: "fas fa-graduation-cap",
        label: "Tổng bằng cấp",
        value: total,
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      {
        icon: "fas fa-trophy",
        label: "Trình độ cao nhất",
        value: getEducationConfig(highestLevel).label,
        gradient: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
      },
      {
        icon: "fas fa-certificate",
        label: "Có chứng chỉ",
        value: certificates,
        gradient: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
      },
      {
        icon: "fas fa-book",
        label: "Học tập",
        value: "Liên tục",
        gradient: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
      },
    ];
  };

  return (
    <Timeline
      title="Timeline Học Vấn"
      subtitle="Xem lịch sử học vấn và bằng cấp của nữ tu"
      icon="fas fa-graduation-cap"
      backUrl="/hoc-van"
      fetchDataBySister={fetchDataBySister}
      getItemConfig={getItemConfig}
      renderItemContent={renderItemContent}
      calculateStats={calculateStats}
      emptyMessage="Chưa có hồ sơ học vấn"
      emptyDescription="Nữ tu này chưa có thông tin học vấn nào được ghi nhận."
    />
  );
};

export default EducationTimelinePage;
