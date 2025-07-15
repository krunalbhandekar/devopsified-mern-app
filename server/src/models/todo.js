import mongoose from "mongoose";

const { Schema } = mongoose;

const TodoSchema = new Schema(
  {
    title: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Todo", TodoSchema);
