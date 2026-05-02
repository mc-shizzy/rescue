import mongoose, { Schema, Document, Model } from "mongoose"

export interface IWatchProgress extends Document {
  userId: mongoose.Types.ObjectId
  contentId: string
  contentType: "movie" | "series"
  contentTitle: string
  contentPoster: string
  season: number | null
  episode: number | null
  episodeTitle: string | null
  progressSeconds: number
  durationSeconds: number
  progressPercent: number
  lastWatched: Date
  completed: boolean
}

const WatchProgressSchema = new Schema<IWatchProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["movie", "series"],
      required: true,
    },
    contentTitle: {
      type: String,
      required: true,
    },
    contentPoster: {
      type: String,
      default: "",
    },
    season: {
      type: Number,
      default: null,
    },
    episode: {
      type: Number,
      default: null,
    },
    episodeTitle: {
      type: String,
      default: null,
    },
    progressSeconds: {
      type: Number,
      required: true,
      default: 0,
    },
    durationSeconds: {
      type: Number,
      required: true,
      default: 0,
    },
    progressPercent: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    lastWatched: {
      type: Date,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for efficient queries
WatchProgressSchema.index({ userId: 1, contentId: 1, season: 1, episode: 1 }, { unique: true })
WatchProgressSchema.index({ userId: 1, lastWatched: -1 })
WatchProgressSchema.index({ userId: 1, completed: 1 })

// Prevent model recompilation in development
const WatchProgress: Model<IWatchProgress> =
  mongoose.models.WatchProgress || mongoose.model<IWatchProgress>("WatchProgress", WatchProgressSchema)

export default WatchProgress
