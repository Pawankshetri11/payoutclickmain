// Shared data store for synchronization between admin and user panels
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  totalEarnings: number;
  joinedAt: string;
  status: 'active' | 'pending' | 'suspended';
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycDetails?: {
    aadharNumber: string;
    panNumber: string;
    bankAccount: string;
    ifscCode: string;
    accountHolder: string;
    documents: string[];
  };
  completedTasks: number;
  level: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'code' | 'image';
  amount: number;
  vacancy: number;
  completed: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  requirements?: string[];
  codes?: string[];
  imageUrl?: string;
  approvalRequired: boolean;
}

export interface Task {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  jobTitle: string;
  amount: number;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  submittedCode?: string;
  submittedImage?: string;
  adminNotes?: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'upi' | 'bank' | 'wallet';
  status: 'active' | 'inactive';
  config: any;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earning' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  createdAt: string;
  description: string;
}

// Initialize with empty data - all data comes from Supabase
export const initialUsers: User[] = [];

export const initialJobs: Job[] = [];

export const initialTasks: Task[] = [];

// Global store state
class AppStore {
  users: User[] = [...initialUsers];
  jobs: Job[] = [...initialJobs];
  tasks: Task[] = [...initialTasks];
  
  // User management
  updateUser(userId: string, updates: Partial<User>) {
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
    }
  }

  // Job management
  updateJob(jobId: string, updates: Partial<Job>) {
    const index = this.jobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      this.jobs[index] = { ...this.jobs[index], ...updates };
    }
  }

  addJob(job: Omit<Job, 'id'>) {
    const newJob: Job = {
      ...job,
      id: `job_${Date.now()}`
    };
    this.jobs.push(newJob);
    return newJob;
  }

  // Task management
  submitTask(task: Omit<Task, 'id'>) {
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`
    };
    this.tasks.push(newTask);
    
    // Update job completion count
    const job = this.jobs.find(j => j.id === task.jobId);
    if (job) {
      job.completed += 1;
    }
    
    return newTask;
  }

  approveTask(taskId: string, adminNotes?: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'approved';
      task.approvedAt = new Date().toISOString();
      task.adminNotes = adminNotes;
      
      // Update user balance
      const user = this.users.find(u => u.id === task.userId);
      if (user) {
        user.balance += task.amount;
        user.totalEarnings += task.amount;
      }
    }
  }

  rejectTask(taskId: string, adminNotes?: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'rejected';
      task.adminNotes = adminNotes;
    }
  }

  // Analytics
  getUserStats() {
    return {
      total: this.users.length,
      active: this.users.filter(u => u.status === 'active').length,
      kycVerified: this.users.filter(u => u.kycStatus === 'verified').length,
      kycPending: this.users.filter(u => u.kycStatus === 'pending').length
    };
  }

  getTaskStats() {
    return {
      total: this.tasks.length,
      pending: this.tasks.filter(t => t.status === 'pending').length,
      approved: this.tasks.filter(t => t.status === 'approved').length,
      rejected: this.tasks.filter(t => t.status === 'rejected').length
    };
  }
}

export const appStore = new AppStore();