import mongoose from 'mongoose';

const trackingLogSchema = new mongoose.Schema({
  cycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cycle',
    required: true
  },
  eventType: {
    type: String,
    enum: ['LOCATION_UPDATE', 'LOCK_TOGGLE', 'MOTION_DETECTED'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

trackingLogSchema.index({ location: '2dsphere' });

export default mongoose.model('TrackingLog', trackingLogSchema);