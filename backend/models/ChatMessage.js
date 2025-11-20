const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: String,
    required: true,
    enum: ['user', 'ai'],
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  meta: {
    type: Map,
    of: String,
    default: {}
  }
});

// Compound index for efficient querying
chatMessageSchema.index({ userId: 1, timestamp: -1 });

// Virtual for message ID
chatMessageSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtuals are included in JSON
chatMessageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
