const AuditLogModel = require("../models/AuditLogModel");

const buildPayload = ({
  req,
  action,
  tableName,
  recordId = null,
  oldValue = null,
  newValue = null,
}) => ({
  user_id: req.user ? req.user.id : null,
  action,
  table_name: tableName,
  record_id: recordId,
  old_value: oldValue ? JSON.stringify(oldValue) : null,
  new_value: newValue ? JSON.stringify(newValue) : null,
  ip_address: req.ip,
});

const logAction =
  ({ action, tableName, getRecordId, getOldValue, getNewValue }) =>
  async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode >= 400) {
        return;
      }

      try {
        const payload = buildPayload({
          req,
          action,
          tableName,
          recordId: getRecordId ? await getRecordId(req, res) : null,
          oldValue: getOldValue ? await getOldValue(req, res) : null,
          newValue: getNewValue ? await getNewValue(req, res) : null,
        });

        await AuditLogModel.create(payload);
      } catch (error) {
        console.error("Failed to write audit log:", error.message);
      }
    });

    next();
  };

const logSensitiveAccess =
  ({ tableName = "health_records", getRecordId }) =>
  async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode >= 400) {
        return;
      }

      try {
        const payload = buildPayload({
          req,
          action: "READ_SENSITIVE",
          tableName,
          recordId: getRecordId ? await getRecordId(req, res) : null,
          oldValue: null,
          newValue: null,
        });

        await AuditLogModel.create(payload);
      } catch (error) {
        console.error("Failed to write sensitive audit log:", error.message);
      }
    });

    next();
  };

module.exports = {
  logAction,
  logSensitiveAccess,
};
