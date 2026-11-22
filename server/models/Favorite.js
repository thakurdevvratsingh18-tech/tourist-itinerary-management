const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination reference is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Unique compound index: one favorite per user per destination ─────────────
FavoriteSchema.index({ user: 1, destination: 1 }, { unique: true });
FavoriteSchema.index({ user: 1, createdAt: -1 });
FavoriteSchema.index({ destination: 1 });

// ─── Static: Toggle favorite; return {added: bool} ───────────────────────────
FavoriteSchema.statics.toggle = async function (userId, destinationId) {
  const existing = await this.findOne({ user: userId, destination: destinationId });
  if (existing) {
    await existing.deleteOne();
    return { added: false, message: 'Removed from favorites' };
  }
  await this.create({ user: userId, destination: destinationId });
  return { added: true, message: 'Added to favorites' };
};

// ─── Static: Check if a destination is favorited by a user ───────────────────
FavoriteSchema.statics.isFavorited = async function (userId, destinationId) {
  const doc = await this.findOne({ user: userId, destination: destinationId });
  return !!doc;
};

module.exports = mongoose.model('Favorite', FavoriteSchema);
