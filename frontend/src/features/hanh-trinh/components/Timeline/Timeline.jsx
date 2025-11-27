// src/features/hanh-trinh/components/Timeline/Timeline.jsx

import React from "react";
import { Card } from "react-bootstrap";
import TimelineItem from "../TimelineItem";
import EmptyState from "@components/common/EmptyState";
import "./Timeline.css";

const Timeline = ({ journeys, onEdit, onDelete }) => {
  if (!journeys || journeys.length === 0) {
    return (
      <EmptyState
        icon="fas fa-route"
        message="Chưa có hành trình nào"
        description="Thêm hành trình đầu tiên để theo dõi quá trình ơn gọi"
      />
    );
  }

  return (
    <Card className="timeline-card">
      <Card.Body>
        <div className="journey-timeline">
          {journeys.map((journey, index) => (
            <TimelineItem
              key={journey.id}
              journey={journey}
              isFirst={index === 0}
              isLast={index === journeys.length - 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Timeline;
