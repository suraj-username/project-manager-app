import mongoose from 'mongoose';
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Task name is required.'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending Approval', 'To Do', 'In Progress', 'Done'],
      default: 'Pending Approval',
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to quickly find all tasks for a project
taskSchema.index({ project: 1 });

// Create a sparse index to quickly find top-level tasks (where parentId is null)
taskSchema.index({ parentId: 1 }, { sparse: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;