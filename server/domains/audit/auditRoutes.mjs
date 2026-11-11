import { Router } from 'express';
import { getAuditLogs, recordAuditLog } from './auditService.mjs';
import { syncToGoogleSheet } from '../../sheetSync.mjs';

const router = Router();

router.get('/audit-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 200;
    const logs = await getAuditLogs(limit);
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error('❌ Lỗi lấy nhật ký kiểm toán:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/audit-logs', async (req, res) => {
  try {
    const { action, tableName, recordId, actor, details, payload } = req.body;
    const log = await recordAuditLog({ action, tableName, recordId, actor, details, payload });
    syncToGoogleSheet('logActivity', {
      logData: {
        id: `LOG-${log.id}`,
        timestamp: log.timestamp,
        action: log.action,
        tableName: log.tableName,
        recordId: log.recordId,
        actor: log.actor,
        details: log.details
      }
    });
    res.json({ success: true, data: log });
  } catch (err) {
    console.error('❌ Lỗi ghi nhật ký kiểm toán:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
