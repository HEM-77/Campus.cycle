import mongoose from 'mongoose';

const cycleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  model: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  isLocked: {
    type: Boolean,
    default: true
  },
  lastLocation: {
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
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

cycleSchema.index({ lastLocation: '2dsphere' });

export default mongoose.model('Cycle', cycleSchema);