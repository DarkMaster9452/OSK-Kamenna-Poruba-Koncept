const express = require('express');
const { z } = require('zod');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  createTraining,
  listTrainings,
  findTrainingById,
  closeTraining,
  deleteTraining,
  upsertTrainingAttendance,
  createAuditLog
} = require('../data/repository');

const router = express.Router();

const createTrainingSchema = z.object({
  date: z.string().min(5).max(20),
  time: z.string().min(3).max(10),
  type: z.enum(['technical', 'tactical', 'physical', 'friendly']),
  duration: z.number().int().min(30).max(180),
  category: z.enum(['pripravky', 'ziaci', 'dorastenci', 'adults_young', 'adults_pro'])
});

const attendanceSchema = z.object({
  playerUsername: z.string().min(3).max(100),
  status: z.enum(['yes', 'no', 'unknown'])
});

async function writeAuditSafe(payload) {
  try {
    await createAuditLog(payload);
  } catch (error) {
    console.error('Audit log write failed:', error);
  }
}

router.get('/', requireAuth, async (req, res) => {
  const rows = await listTrainings();
  const items = rows.map((row) => ({
    id: row.id,
    date: row.date,
    time: row.time,
    type: row.type,
    duration: row.duration,
    category: row.category,
    isActive: row.isActive,
    attendance: row.attendances,
    createdAt: row.createdAt,
    createdBy: row.createdBy.username
  }));
  return res.json({ items });
});

router.post('/', requireAuth, requireRole('coach'), validateBody(createTrainingSchema), async (req, res) => {
  const row = await createTraining(req.body, req.user.id);
  const item = {
    id: row.id,
    date: row.date,
    time: row.time,
    type: row.type,
    duration: row.duration,
    category: row.category,
    isActive: row.isActive,
    createdAt: row.createdAt,
    createdBy: row.createdBy.username
  };

  await writeAuditSafe({
    actorUserId: req.user.id,
    action: 'training_created',
    entityType: 'training',
    entityId: row.id,
    details: {
      date: row.date,
      time: row.time,
      category: row.category,
      type: row.type
    }
  });

  return res.status(201).json({ item });
});

router.post('/:id/attendance', requireAuth, validateBody(attendanceSchema), async (req, res) => {
  const training = await findTrainingById(req.params.id);
  if (!training) {
    return res.status(404).json({ message: 'Tréning neexistuje.' });
  }

  if (!training.isActive) {
    return res.status(400).json({ message: 'Tréning je uzavretý.' });
  }

  const row = await upsertTrainingAttendance(
    training.id,
    req.body.playerUsername,
    req.body.status,
    req.user.id
  );

  await writeAuditSafe({
    actorUserId: req.user.id,
    action: 'training_attendance_updated',
    entityType: 'attendance',
    entityId: row.id,
    details: {
      trainingId: training.id,
      playerUsername: row.playerUsername,
      status: row.status
    }
  });

  return res.json({
    item: {
      id: row.id,
      trainingId: row.trainingId,
      playerUsername: row.playerUsername,
      status: row.status,
      updatedAt: row.updatedAt
    }
  });
});

router.patch('/:id/close', requireAuth, requireRole('coach'), async (req, res) => {
  const training = await findTrainingById(req.params.id);
  if (!training) {
    return res.status(404).json({ message: 'Tréning neexistuje.' });
  }

  if (!training.isActive) {
    return res.status(400).json({ message: 'Tréning je už uzavretý.' });
  }

  const row = await closeTraining(training.id);

  await writeAuditSafe({
    actorUserId: req.user.id,
    action: 'training_closed',
    entityType: 'training',
    entityId: row.id,
    details: {
      date: row.date,
      time: row.time
    }
  });

  return res.json({
    item: {
      id: row.id,
      isActive: row.isActive
    }
  });
});

router.delete('/:id', requireAuth, requireRole('coach'), async (req, res) => {
  const training = await findTrainingById(req.params.id);
  if (!training) {
    return res.status(404).json({ message: 'Tréning neexistuje.' });
  }

  await deleteTraining(training.id);

  await writeAuditSafe({
    actorUserId: req.user.id,
    action: 'training_deleted',
    entityType: 'training',
    entityId: training.id,
    details: {
      date: training.date,
      time: training.time
    }
  });

  return res.status(204).send();
});

module.exports = router;