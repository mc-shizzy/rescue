import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUserList extends Document {
  userId: mongoose.Types.ObjectId
  contentIds: string[]
  updatedAt: Date
}

const UserListSchema = new Schema<IUserList>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    contentIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development
const UserList: Model<IUserList> =
  mongoose.models.UserList || mongoose.model<IUserList>("UserList", UserListSchema)

export default UserList
