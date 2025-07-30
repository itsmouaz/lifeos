const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const goalRoutes = require('./goalRoutes');
const projectRoutes = require('./projectRoutes');
const objectiveRoutes = require('./objectiveRoutes');
const taskRoutes = require('./taskRoutes');
const habitRoutes = require('./habitRoutes');
const noteRoutes = require('./noteRoutes');
const eventRoutes = require('./eventRoutes');
const analyticsController = require('../controllers/analyticsController');

// Use routes
router.use('/auth', authRoutes);
router.use('/goals', goalRoutes);
router.use('/projects', projectRoutes);
router.use('/objectives', objectiveRoutes);
router.use('/tasks', taskRoutes);
router.use('/habits', habitRoutes);
router.use('/notes', noteRoutes);
router.use('/events', eventRoutes);

// Analytics endpoints
router.get('/analytics/goals/progress', analyticsController.getGoalProgressByPeriod);
router.get('/analytics/habits/progress', analyticsController.getHabitProgressByPeriod);
router.get('/analytics/goals/streaks', analyticsController.getGoalStreaks);
router.get('/analytics/habits/streaks', analyticsController.getHabitStreaks);

// Base route
router.get('/', (req, res) => {
    res.send('🚀 LifeSync API is running!');
});

module.exports = router;