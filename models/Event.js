const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  allDay: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: [
      'Task', 'task',
      'Meeting', 'meeting',
      'Appointment', 'appointment',
      'Reminder', 'reminder',
      'Event', 'event',
      'Deadline', 'deadline'
    ],
    default: 'Event'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  location: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
      default: 'Daily'
    },
    interval: {
      type: Number,
      default: 1
    },
    endAfter: {
      type: Number // Number of occurrences
    },
    endDate: {
      type: Date
    }
  },
  attendees: [{
    email: String,
    name: String,
    response: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined', 'Tentative'],
      default: 'Pending'
    }
  }],
  relatedItems: {
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    goals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal'
    }],
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }]
  },
  reminders: [{
    time: {
      type: String, // Format: 'HH:MM'
      required: true
    },
    type: {
      type: String,
      enum: ['Email', 'Push', 'SMS'],
      default: 'Push'
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
