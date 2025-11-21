const fs = require('fs');
const path = require('path');
const SisterModel = require('../models/SisterModel');
const VocationJourneyModel = require('../models/VocationJourneyModel');
const CommunityAssignmentModel = require('../models/CommunityAssignmentModel');
const MissionModel = require('../models/MissionModel');
const AuditLogModel = require('../models/AuditLogModel');

const UPLOADS_ROOT = path.resolve(__dirname, '../uploads');

const permittedViewerRoles = ['admin', 'superior_general', 'superior_provincial', 'superior_community', 'secretary', 'viewer'];
const permittedEditorRoles = ['admin', 'superior_general', 'superior_provincial', 'superior_community', 'secretary'];

const ensurePermission = (req, res, allowedRoles) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return false;
  }

  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({ message: 'Forbidden' });
    return false;
  }

  return true;
};

const getPagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const generateSisterCode = () => `SIS-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const logAudit = async (req, action, recordId, oldValue, newValue) => {
  try {
    await AuditLogModel.create({
      user_id: req.user ? req.user.id : null,
      action,
      table_name: 'sisters',
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: req.ip
    });
  } catch (error) {
    console.error('Failed to log audit entry:', error.message);
  }
};

const buildFilters = ({ status, search, minAge, maxAge }) => {
  const clauses = [];
  const params = [];

  if (status) {
    clauses.push('status = ?');
    params.push(status);
  }

  if (search) {
    clauses.push('(birth_name LIKE ? OR religious_name LIKE ? OR code LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (Number.isInteger(minAge)) {
    clauses.push('TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) >= ?');
    params.push(minAge);
  }

  if (Number.isInteger(maxAge)) {
    clauses.push('TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) <= ?');
    params.push(maxAge);
  }

  return { clauses, params };
};

const getAllSisters = async (req, res) => {
  try {
    if (!ensurePermission(req, res, permittedViewerRoles)) {
      return;
    }

    const { page, limit, offset } = getPagination(req);
    const minAge = req.query.minAge ? parseInt(req.query.minAge, 10) : undefined;
    const maxAge = req.query.maxAge ? parseInt(req.query.maxAge, 10) : undefined;
    const search = req.query.search ? req.query.search.trim() : '';
    const status = req.query.status || '';

    const { clauses, params } = buildFilters({ status, search, minAge, maxAge });
    const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const totalRows = await SisterModel.executeQuery(
      `SELECT COUNT(*) AS total FROM sisters ${whereClause}`,
      params
    );
    const total = totalRows[0] ? totalRows[0].total : 0;

    const rows = await SisterModel.executeQuery(
      `SELECT * FROM sisters ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      data: rows,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        limit
      }
    });
  } catch (error) {
    console.error('getAllSisters error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch sisters' });
  }
};

const getSisterById = async (req, res) => {
  try {
    if (!ensurePermission(req, res, permittedViewerRoles)) {
      return;
    }

    const { id } = req.params;
    const sister = await SisterModel.findById(id);
    if (!sister) {
      return res.status(404).json({ message: 'Sister not found' });
    }

    const [profile, currentCommunity, currentMission] = await Promise.all([
      SisterModel.getFullProfile(id),
      CommunityAssignmentModel.getCurrentAssignment(id),
      MissionModel.executeQuery(
        `SELECT * FROM missions WHERE sister_id = ? AND (end_date IS NULL OR end_date >= CURDATE()) ORDER BY start_date DESC LIMIT 1`,
        [id]
      ).then((rows) => rows[0] || null)
    ]);

    return res.status(200).json({
      ...profile,
      currentCommunity,
      currentMission
    });
  } catch (error) {
    console.error('getSisterById error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch sister detail' });
  }
};

const createSister = async (req, res) => {
  try {
    if (!ensurePermission(req, res, permittedEditorRoles)) {
      return;
    }

    const payload = {
      ...req.body,
      code: req.body.code || generateSisterCode(),
      status: req.body.status || 'active',
      created_by: req.user ? req.user.id : null
    };

    const newSister = await SisterModel.create(payload);
    await logAudit(req, 'CREATE', newSister.id, null, newSister);

    return res.status(201).json({ sister: newSister });
  } catch (error) {
    console.error('createSister error:', error.message);
    return res.status(500).json({ message: 'Failed to create sister' });
  }
};

const updateSister = async (req, res) => {
  try {
    if (!ensurePermission(req, res, permittedEditorRoles)) {
      return;
    }

    const { id } = req.params;
    const existing = await SisterModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Sister not found' });
    }

    const updated = await SisterModel.update(id, req.body);
    await logAudit(req, 'UPDATE', id, existing, updated);

    return res.status(200).json({ sister: updated });
  } catch (error) {
    console.error('updateSister error:', error.message);
    return res.status(500).json({ message: 'Failed to update sister' });
  }
};

const deleteSister = async (req, res) => {
  try {
    if (!ensurePermission(req, res, permittedEditorRoles)) {
      return;
    }

    const { id } = req.params;
    const sister = await SisterModel.findById(id);
    if (!sister) {
      return res.status(404).json({ message: 'Sister not found' });
    }

    const inactiveStatus = 'inactive';
    const updated = await SisterModel.update(id, { status: inactiveStatus });
    await logAudit(req, 'DELETE', id, sister, updated);

    return res.status(200).json({ message: 'Sister deactivated successfully' });
  } catch (error) {
    console.error('deleteSister error:', error.message);
    return res.status(500).json({ message: 'Failed to deactivate sister' });
  }
};

const removeOldPhoto = (photoUrl) => {
  if (!photoUrl) {
    return;
  }

  try {
    const relativePath = photoUrl.startsWith('/uploads')
      ? photoUrl.replace('/uploads', '')
      : photoUrl;
    const absolutePath = path.join(UPLOADS_ROOT, relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (error) {
    console.error('Failed to remove old photo:', error.message);
  }
};

const updateSisterPhoto = async (req, res) => {
  try {
    if (!ensurePermission(req, res, permittedEditorRoles)) {
      return;
    }

    const { id } = req.params;
    const sister = await SisterModel.findById(id);
    if (!sister) {
      return res.status(404).json({ message: 'Sister not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Photo file is required' });
    }

    removeOldPhoto(sister.photo_url);

    const relativePath = path.relative(UPLOADS_ROOT, req.file.path).replace(/\\/g, '/');
    const photoUrl = `/uploads/${relativePath}`;

    const updated = await SisterModel.update(id, { photo_url: photoUrl });
    await logAudit(req, 'UPDATE', id, sister, updated);

    return res.status(200).json({ photoUrl });
  } catch (error) {
    console.error('updateSisterPhoto error:', error.message);
    return res.status(500).json({ message: 'Failed to update photo' });
  }
};

const searchSisters = async (req, res) => {
  try {
    if (!ensurePermission(req, res, permittedViewerRoles)) {
      return;
    }

    const { page, limit, offset } = getPagination(req);
    const filters = [];
    const params = [];

    if (req.query.name) {
      filters.push('(s.birth_name LIKE ? OR s.religious_name LIKE ? OR s.code LIKE ?)');
      params.push(`%${req.query.name}%`, `%${req.query.name}%`, `%${req.query.name}%`);
    }

    if (req.query.code) {
      filters.push('s.code = ?');
      params.push(req.query.code);
    }

    if (req.query.community) {
      filters.push('ca.community_id = ?');
      params.push(req.query.community);
    }

    if (req.query.stage) {
      filters.push('vj.stage = ?');
      params.push(req.query.stage);
    }

    if (req.query.missionField) {
      filters.push('mi.field = ?');
      params.push(req.query.missionField);
    }

    const minAge = req.query.minAge ? parseInt(req.query.minAge, 10) : undefined;
    const maxAge = req.query.maxAge ? parseInt(req.query.maxAge, 10) : undefined;
    if (Number.isInteger(minAge)) {
      filters.push('TIMESTAMPDIFF(YEAR, s.date_of_birth, CURDATE()) >= ?');
      params.push(minAge);
    }
    if (Number.isInteger(maxAge)) {
      filters.push('TIMESTAMPDIFF(YEAR, s.date_of_birth, CURDATE()) <= ?');
      params.push(maxAge);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const baseQuery = `
      FROM sisters s
      LEFT JOIN community_assignments ca
        ON ca.sister_id = s.id AND (ca.end_date IS NULL OR ca.end_date >= CURDATE())
      LEFT JOIN vocation_journey vj
        ON vj.sister_id = s.id AND (vj.end_date IS NULL OR vj.end_date >= CURDATE())
      LEFT JOIN missions mi
        ON mi.sister_id = s.id AND (mi.end_date IS NULL OR mi.end_date >= CURDATE())
      ${whereClause}
    `;

    const totalRows = await SisterModel.executeQuery(`SELECT COUNT(DISTINCT s.id) AS total ${baseQuery}`, params);
    const total = totalRows[0] ? totalRows[0].total : 0;

    const data = await SisterModel.executeQuery(
      `SELECT DISTINCT s.* ${baseQuery} ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      data,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        limit
      }
    });
  } catch (error) {
    console.error('searchSisters error:', error.message);
    return res.status(500).json({ message: 'Failed to search sisters' });
  }
};

module.exports = {
  getAllSisters,
  getSisterById,
  createSister,
  updateSister,
  updateSisterPhoto,
  deleteSister,
  searchSisters
};
