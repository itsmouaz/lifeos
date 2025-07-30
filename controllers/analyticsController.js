const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const Task = require('../models/Task');
const mongoose = require('mongoose');

// Helper: Get start of week (Monday)
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Helper: Get start of month
function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper: Format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Helper: Get all days between two dates
function getDaysBetween(start, end) {
  const days = [];
  let d = new Date(start);
  while (d <= end) {
    days.push(formatDate(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

// --- GOALS ---
exports.getGoalProgressByPeriod = async (req, res, next) => {
  try {
    const userId = req.userId;
    const period = req.query.period === 'month' ? 'month' : 'week';
    const now = new Date();
    const periods = [];
    let start;
    if (period === 'week') {
      // Last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const monday = startOfWeek(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7));
        periods.push(formatDate(monday));
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const first = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
        periods.push(formatDate(first));
      }
    }
    // Fetch all goals
    const goals = await Goal.find({ userId });
    // For each period, count completed and total goals created in that period
    const data = periods.map(periodLabel => {
      let periodStart, periodEnd;
      if (period === 'week') {
        periodStart = new Date(periodLabel);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 6);
      } else {
        periodStart = new Date(periodLabel);
        periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
      }
      const createdInPeriod = goals.filter(g => {
        const created = new Date(g.createdAt);
        return created >= periodStart && created <= periodEnd;
      });
      const completedInPeriod = createdInPeriod.filter(g => g.status === 'Completed');
      return {
        periodLabel,
        completedCount: completedInPeriod.length,
        totalCount: createdInPeriod.length,
        percent: createdInPeriod.length > 0 ? Math.round((completedInPeriod.length / createdInPeriod.length) * 100) : 0
      };
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// --- HABITS ---
exports.getHabitProgressByPeriod = async (req, res, next) => {
  try {
    const userId = req.userId;
    const period = req.query.period === 'month' ? 'month' : 'week';
    const now = new Date();
    const periods = [];
    if (period === 'week') {
      // Last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const monday = startOfWeek(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7));
        periods.push(formatDate(monday));
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const first = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
        periods.push(formatDate(first));
      }
    }
    // Fetch all habits
    const habits = await Habit.find({ userId });
    // For each period, count completed habits (by completedDates)
    const data = periods.map(periodLabel => {
      let periodStart, periodEnd;
      if (period === 'week') {
        periodStart = new Date(periodLabel);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 6);
      } else {
        periodStart = new Date(periodLabel);
        periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
      }
      // For each habit, count completions in this period
      let completedCount = 0;
      let totalCount = 0;
      habits.forEach(habit => {
        const completions = (habit.completedDates || []).filter(dateStr => {
          const date = new Date(dateStr);
          return date >= periodStart && date <= periodEnd;
        });
        completedCount += completions.length;
        totalCount += 1;
      });
      return {
        periodLabel,
        completedCount,
        totalCount,
        percent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
      };
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// --- STREAKS & BEST PERIODS ---
exports.getGoalStreaks = async (req, res, next) => {
  try {
    const userId = req.userId;
    const goals = await Goal.find({ userId }).sort({ createdAt: 1 });
    // Streak: consecutive completed goals by createdAt date
    let currentStreak = 0, bestStreak = 0, lastCompleted = null;
    goals.forEach(goal => {
      if (goal.status === 'Completed') {
        if (lastCompleted) {
          const diff = (new Date(goal.createdAt) - new Date(lastCompleted)) / (1000 * 60 * 60 * 24);
          if (diff <= 7) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        lastCompleted = goal.createdAt;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });
    res.json({ currentStreak, bestStreak });
  } catch (err) {
    next(err);
  }
};

exports.getHabitStreaks = async (req, res, next) => {
  try {
    const userId = req.userId;
    const habits = await Habit.find({ userId });
    // Streak: consecutive days with at least one habit completed
    let bestStreak = 0, currentStreak = 0, lastDate = null;
    const allDates = habits.flatMap(h => h.completedDates || []);
    const uniqueDates = Array.from(new Set(allDates)).sort();
    uniqueDates.forEach(dateStr => {
      if (!lastDate) {
        currentStreak = 1;
      } else {
        const diff = (new Date(dateStr) - new Date(lastDate)) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      lastDate = dateStr;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    });
    res.json({ currentStreak, bestStreak });
  } catch (err) {
    next(err);
  }
}; 