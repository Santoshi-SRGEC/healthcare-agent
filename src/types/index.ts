export type Role = 'receptionist' | 'doctor' | 'lab' | 'pharmacy' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
  organization: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  email?: string;
  emergencyContact: string;
  registeredDate: string;
  lastVisit?: string;
  nextAppointment?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  bloodGroup?: string;
  address?: string;
  conditions?: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  reason?: string;
}

export interface Document {
  id: string;
  name: string;
  patientId: string;
  patientName: string;
  type: 'Lab Report' | 'Prescription' | 'Medical Record' | 'Imaging' | 'Referral';
  uploadedBy: string;
  uploadedById: string;
  date: string;
  status: 'Uploaded' | 'AI Summary Available' | 'Reviewed' | 'Needs Review';
  aiSummary?: string;
  workflowAction?: string;
  size?: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  requestedBy: string;
  requestedById: string;
  dateRequested: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Needs Review';
  reportDate?: string;
  result?: string;
  uploadedBy?: string;
  aiSummary?: string;
}

export interface Task {
  id: string;
  title: string;
  patientId: string;
  patientName: string;
  assignedTo: string;
  assignedToId: string;
  department: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Needs Approval' | 'Needs Review';
  dueDate: string;
  createdBy?: string;
  aiGenerated?: boolean;
}

export interface Notification {
  id: string;
  type: 'lab_report' | 'appointment' | 'task' | 'prescription' | 'followup' | 'ai_alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  patientName?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: Medication[];
  status: 'Sent' | 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  reason: string;
  requestedDate: string;
  suggestedDate?: string;
  suggestedTime?: string;
  status: 'Requested' | 'AI Suggested' | 'Awaiting Approval' | 'Approved' | 'Rejected' | 'Scheduled';
  aiSuggestion?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'Success' | 'Failed' | 'Warning';
  details?: string;
}

export interface AIWorkflow {
  id: string;
  trigger: string;
  patientId: string;
  patientName: string;
  status: 'Active' | 'Completed' | 'Awaiting Approval' | 'Failed';
  steps: AIWorkflowStep[];
  agentActivity: AgentActivity[];
  createdAt: string;
  suggestion?: string;
  suggestionType?: 'appointment' | 'task' | 'notification' | 'review';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export interface AIWorkflowStep {
  id: string;
  step: number;
  action: string;
  tool?: string;
  status: 'completed' | 'in_progress' | 'pending' | 'awaiting_approval';
  timestamp?: string;
}

export interface AgentActivity {
  id: string;
  timestamp: string;
  agent: string;
  tool: string;
  action: string;
  result: string;
  status: 'Success' | 'Failed' | 'Pending';
}

export interface WorkflowTimelineItem {
  id: string;
  step: string;
  label: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Needs Review' | 'Awaiting Approval';
  timestamp?: string;
  actor?: string;
}
