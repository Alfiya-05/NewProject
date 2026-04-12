import { Router, Response } from 'express';
import User from '../models/User';
import Case from '../models/Case';
import AuditLog from '../models/AuditLog';
import { authenticate, AuthRequest } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { auditLogger } from '../utils/auditLogger';

const router = Router();

// All admin routes require admin role
router.use(authenticate, roleGuard(['admin']));

// GET /api/admin/users
router.get('/users', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req: AuthRequest, res: Response): Promise<void> => {
  const { role } = req.body;
  const admin = req.user!;

  const validRoles = ['citizen', 'lawyer', 'judge', 'admin'];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    await auditLogger({
      action: 'USER_ROLE_CHANGED',
      performedBy: admin._id,
      performedByRole: admin.role,
      targetEntity: 'user',
      targetId: req.params.id,
      metadata: { newRole: role, email: user.email },
      ipAddress: req.ip,
    });

    res.json({ user });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ error: 'Failed to change user role' });
  }
});

// PATCH /api/admin/users/:id/verify
router.patch('/users/:id/verify', async (req: AuthRequest, res: Response): Promise<void> => {
  const admin = req.user!;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    await auditLogger({
      action: 'USER_VERIFIED',
      performedBy: admin._id,
      performedByRole: admin.role,
      targetEntity: 'user',
      targetId: req.params.id,
      metadata: { email: user.email, role: user.role },
      ipAddress: req.ip,
    });

    res.json({ user, message: 'User verified successfully' });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// GET /api/admin/audit — paginated audit log
router.get('/audit', async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  try {
    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('performedBy', 'profile.name email systemUid')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(),
    ]);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// GET /api/admin/stats
router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalCases, activeCases, pendingCases] = await Promise.all([
      User.countDocuments(),
      Case.countDocuments(),
      Case.countDocuments({ status: 'active' }),
      Case.countDocuments({ status: 'pending' }),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.json({
      stats: {
        totalUsers,
        totalCases,
        activeCases,
        pendingCases,
        usersByRole: Object.fromEntries(usersByRole.map((r) => [r._id, r.count])),
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
