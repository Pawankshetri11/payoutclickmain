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

// Dummy data
export const initialUsers: User[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 9876543210',
    balance: 2580.50,
    totalEarnings: 12450.75,
    joinedAt: '2024-01-15',
    status: 'active',
    kycStatus: 'verified',
    kycDetails: {
      aadharNumber: '1234-5678-9012',
      panNumber: 'ABCDE1234F',
      bankAccount: '1234567890',
      ifscCode: 'HDFC0001234',
      accountHolder: 'Priya Sharma',
      documents: ['aadhar.jpg', 'pan.jpg', 'bank_statement.pdf']
    },
    completedTasks: 156,
    level: 'Gold'
  },
  {
    id: '2',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    phone: '+91 9876543211',
    balance: 1250.00,
    totalEarnings: 8750.25,
    joinedAt: '2024-02-20',
    status: 'active',
    kycStatus: 'pending',
    completedTasks: 89,
    level: 'Silver'
  },
  {
    id: '3',
    name: 'Sneha Patel',
    email: 'sneha@example.com',
    phone: '+91 9876543212',
    balance: 3200.75,
    totalEarnings: 18900.50,
    joinedAt: '2024-01-10',
    status: 'active',
    kycStatus: 'verified',
    kycDetails: {
      aadharNumber: '5678-9012-3456',
      panNumber: 'FGHIJ5678K',
      bankAccount: '0987654321',
      ifscCode: 'ICICI0001234',
      accountHolder: 'Sneha Patel',
      documents: ['aadhar.jpg', 'pan.jpg']
    },
    completedTasks: 234,
    level: 'Platinum'
  }
];

export const initialJobs: Job[] = [
  {
    id: '1',
    title: 'Google Play Store App Review',
    description: 'Download the app and give a 5-star review on Google Play Store',
    category: 'App Review',
    type: 'code',
    amount: 25,
    vacancy: 100,
    completed: 67,
    status: 'active',
    createdAt: '2024-03-01',
    requirements: ['Android device', 'Google account'],
    codes: ['GREV123', 'GREV124', 'GREV125', 'GREV126', 'GREV127'],
    approvalRequired: false
  },
  {
    id: '2',
    title: 'Instagram Post Engagement',
    description: 'Like and comment on specific Instagram posts',
    category: 'Social Media',
    type: 'image',
    amount: 15,
    vacancy: 200,
    completed: 134,
    status: 'active',
    createdAt: '2024-03-02',
    requirements: ['Instagram account with 100+ followers'],
    approvalRequired: true
  },
  {
    id: '3',
    title: 'Website Survey Completion',
    description: 'Complete a detailed survey about shopping preferences',
    category: 'Survey',
    type: 'code',
    amount: 35,
    vacancy: 50,
    completed: 23,
    status: 'active',
    createdAt: '2024-03-03',
    codes: ['SURV001', 'SURV002', 'SURV003', 'SURV004', 'SURV005'],
    approvalRequired: false
  }
];

export const initialTasks: Task[] = [
  {
    id: '1',
    jobId: '1',
    userId: '1',
    userName: 'Priya Sharma',
    jobTitle: 'Google Play Store App Review',
    amount: 25,
    status: 'completed',
    submittedAt: '2024-03-10T10:30:00Z',
    approvedAt: '2024-03-10T11:00:00Z',
    submittedCode: 'GREV123'
  },
  {
    id: '2',
    jobId: '2',
    userId: '2',
    userName: 'Rahul Kumar',
    jobTitle: 'Instagram Post Engagement',
    amount: 15,
    status: 'pending',
    submittedAt: '2024-03-11T14:20:00Z',
    submittedImage: 'instagram_screenshot.jpg'
  },
  {
    id: '3',
    jobId: '3',
    userId: '3',
    userName: 'Sneha Patel',
    jobTitle: 'Website Survey Completion',
    amount: 35,
    status: 'approved',
    submittedAt: '2024-03-12T09:15:00Z',
    approvedAt: '2024-03-12T10:00:00Z',
    submittedCode: 'SURV001'
  }
];

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