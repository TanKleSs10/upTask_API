import mongoose, { Document, Schema, PopulatedDoc, Types } from "mongoose";

export interface INote extends Document {
  content: string;
  createdBy: Types.ObjectId;
  task: Types.ObjectId;
}

const NoteSchema: Schema = new Schema(
  {
    content: {
      type: String,
      require: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      require: true,
    },
    task: {
      type: Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true }
);

const Note = mongoose.model<INote>("Note", NoteSchema);
export default Note;
