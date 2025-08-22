import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed';
  dueDate?: Date;
  userId: mongoose.Types.ObjectId; // Task creator
  assignedTo: mongoose.Types.ObjectId; // Task assignee (NEW FIELD)
  tags: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  dueDate: {
    type: Date
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // NEW FIELD: Task assignee (defaults to creator)
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: [30, 'Tag cannot exceed 30 characters']
  }],
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret: any) => {
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Auto-assign to creator if no assignee specified
taskSchema.pre('save', function(next) {
  if (this.isNew && !this.assignedTo) {
    this.assignedTo = this.userId;
  }
  
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status === 'active') {
      this.completedAt = undefined;
    }
  }
  next();
});

export default mongoose.model<ITask>('Task', taskSchema);
