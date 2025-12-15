// src/features/dashboard/components/RecentActivities/RecentActivities.jsx

import React from "react";
import { Card, ListGroup } from "react-bootstrap";
import { formatRelativeTime } from "@utils";

const RecentActivities = ({ activities = [] }) => {
  // If no activities from props, show placeholder
  const displayActivities = activities.length > 0 ? activities : [];

  return (
    <Card className="h-100">
      <Card.Header className="bg-white border-bottom">
        <h5 className="mb-0">
          <i className="fas fa-history me-2"></i>
          Hoạt động gần đây
        </h5>
      </Card.Header>
      <Card.Body className="p-0">
        {displayActivities.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="fas fa-clock fa-3x mb-3 opacity-50"></i>
            <p className="mb-0">Chưa có hoạt động nào</p>
          </div>
        ) : (
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <ListGroup variant="flush">
              {displayActivities.map((activity) => (
                <ListGroup.Item
                  key={activity.id}
                  className="border-0 border-bottom"
                >
                  <div className="d-flex align-items-start">
                    <div
                      className={`activity-icon bg-${activity.type} bg-opacity-10 text-${activity.type} me-3`}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i className={activity.icon}></i>
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-1">{activity.message}</p>
                      <small className="text-muted">
                        {activity.user} •{" "}
                        {formatRelativeTime(new Date(activity.timestamp))}
                      </small>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecentActivities;
