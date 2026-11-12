import { Router } from 'express';
import { saveAttendance, upsertStaff, deleteStaff } from './attendanceService.mjs';
import { dispatchRealtimeSync } from '../../sheetSync.mjs';

const router = Router();

router.post('/attendance', async (req, res) => {
  try {
    const { staffId, dateIso, val, staffName } = req.body;
    const att = await saveAttendance(staffId, dateIso, val);

    await dispatchRealtimeSync({
      table: 'attendance',
      action: 'UPDATE',
      id: staffId,
      data: { staffId, staffName: staffName || staffId, date: dateIso, val },
      actor: 'Operator',
      details: `Chấm công ngày ${dateIso} cho nhân sự ${staffId}: ${val || 0}`
    });

    res.json({ success: true, data: att });
  } catch (err) {
    console.error('❌ Lỗi lưu chấm công:', err);
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
