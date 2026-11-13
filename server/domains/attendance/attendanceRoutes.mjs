import { Router } from 'express';
import { saveAttendance, saveAttendanceBatch, saveStaffAdvance, upsertStaff, deleteStaff } from './attendanceService.mjs';
import { dispatchRealtimeSync } from '../../sheetSync.mjs';

const router = Router();

router.post('/attendance', async (req, res) => {
  try {
    const { staffId, dateIso, val, staffName } = req.body;
    const att = await saveAttendance(staffId, dateIso, val);

    try {
      await dispatchRealtimeSync({
        table: 'attendance',
        action: 'UPDATE',
        id: staffId,
        data: { staffId, staffName: staffName || staffId, date: dateIso, val },
        actor: 'Operator',
        details: `Chấm công ngày ${dateIso} cho nhân sự ${staffId}: ${val || 0}`
      });
    } catch (syncError) {
      console.warn('⚠️ Chấm công đã lưu vào PostgreSQL nhưng đồng bộ Google Sheet thất bại:', syncError.message);
    }

    res.json({ success: true, data: att });
  } catch (err) {
    console.error('❌ Lỗi lưu chấm công:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/attendance/batch', async (req, res) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, error: 'Cần ít nhất một ô chấm công.' });
    }

    await saveAttendanceBatch(entries);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi lưu hàng loạt chấm công:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/staff', async (req, res) => {
  try {
    const s = req.body;
    const saved = await upsertStaff(s);

    await dispatchRealtimeSync({
      table: 'staff',
      action: 'UPDATE',
      id: saved.id,
      data: saved,
      actor: 'Admin',
      details: `Lưu thông tin nhân sự ${saved.name} (${saved.role})`
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('❌ Lỗi lưu nhân sự:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/staff/:id/advance', async (req, res) => {
  try {
    const saved = await saveStaffAdvance(req.params.id, req.body.advance, req.body.month);
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('❌ Lỗi lưu tạm ứng nhân sự:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteStaff(id);

    await dispatchRealtimeSync({
      table: 'staff',
      action: 'DELETE',
      id,
      data: deleted || {},
      actor: 'Admin',
      details: `Xóa nhân sự ${id}`
    });

    res.json({ success: true, data: deleted });
  } catch (err) {
    console.error('❌ Lỗi xóa nhân sự:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
