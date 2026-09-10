import type {
  User, Patient, Appointment, Document, LabReport, Task,
  Notification, Prescription, FollowUp, AuditLog, AIWorkflow, Role
} from '@/types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'reception@careflow.ai', role: 'receptionist', department: 'Front Desk', organization: 'City General Hospital' },
  { id: 'u2', name: 'Dr. James Patel', email: 'doctor@careflow.ai', role: 'doctor', department: 'General Medicine', organization: 'City General Hospital' },
  { id: 'u3', name: 'Dr. Emily Ross', email: 'doctor2@careflow.ai', role: 'doctor', department: 'Cardiology', organization: 'City General Hospital' },
  { id: 'u4', name: 'Mike Johnson', email: 'lab@careflow.ai', role: 'lab', department: 'Laboratory', organization: 'City General Hospital' },
  { id: 'u5', name: 'Lisa Park', email: 'pharmacy@careflow.ai', role: 'pharmacy', department: 'Pharmacy', organization: 'City General Hospital' },
  { id: 'u6', name: 'Admin User', email: 'admin@careflow.ai', role: 'admin', department: 'Administration', organization: 'City General Hospital' },
];

export const loginCredentials: Record<string, { password: string; role: Role; userId: string }> = {
  'reception@careflow.ai': { password: 'demo123', role: 'receptionist', userId: 'u1' },
  'doctor@careflow.ai': { password: 'demo123', role: 'doctor', userId: 'u2' },
  'doctor2@careflow.ai': { password: 'demo123', role: 'doctor', userId: 'u3' },
  'lab@careflow.ai': { password: 'demo123', role: 'lab', userId: 'u4' },
  'pharmacy@careflow.ai': { password: 'demo123', role: 'pharmacy', userId: 'u5' },
  'admin@careflow.ai': { password: 'demo123', role: 'admin', userId: 'u6' },
};

export const mockPatients: Patient[] = [
  { id: 'p1', name: 'Ravi Kumar', age: 45, gender: 'Male', contact: '+91 98765 43210', email: 'ravi.kumar@email.com', emergencyContact: '+91 98765 11111', registeredDate: '2025-08-15', lastVisit: '2025-09-01', nextAppointment: '2025-09-10', status: 'Active', bloodGroup: 'O+', address: '123 MG Road, Bangalore', conditions: ['Hypertension', 'Diabetes Type 2'] },
  { id: 'p2', name: 'Anita Sharma', age: 38, gender: 'Female', contact: '+91 98765 43211', email: 'anita.sharma@email.com', emergencyContact: '+91 98765 22222', registeredDate: '2025-07-20', lastVisit: '2025-09-05', nextAppointment: '2025-09-10', status: 'Active', bloodGroup: 'A+', address: '456 Brigade Road, Bangalore', conditions: ['Asthma'] },
  { id: 'p3', name: 'Rahul Verma', age: 52, gender: 'Male', contact: '+91 98765 43212', email: 'rahul.verma@email.com', emergencyContact: '+91 98765 33333', registeredDate: '2025-06-10', lastVisit: '2025-08-28', nextAppointment: '2025-09-12', status: 'Active', bloodGroup: 'B+', address: '789 Indiranagar, Bangalore', conditions: ['Coronary Artery Disease'] },
  { id: 'p4', name: 'Priya Reddy', age: 29, gender: 'Female', contact: '+91 98765 43213', email: 'priya.reddy@email.com', emergencyContact: '+91 98765 44444', registeredDate: '2025-09-01', lastVisit: '2025-09-08', status: 'Active', bloodGroup: 'AB+', address: '321 Koramangala, Bangalore', conditions: ['Migraine'] },
  { id: 'p5', name: 'Arjun Singh', age: 67, gender: 'Male', contact: '+91 98765 43214', email: 'arjun.singh@email.com', emergencyContact: '+91 98765 55555', registeredDate: '2025-05-15', lastVisit: '2025-08-20', nextAppointment: '2025-09-15', status: 'Active', bloodGroup: 'O-', address: '654 Jayanagar, Bangalore', conditions: ['Arthritis', 'Hypertension'] },
  { id: 'p6', name: 'Meera Nair', age: 34, gender: 'Female', contact: '+91 98765 43215', email: 'meera.nair@email.com', emergencyContact: '+91 98765 66666', registeredDate: '2025-08-25', lastVisit: '2025-09-03', status: 'Active', bloodGroup: 'A-', address: '987 Whitefield, Bangalore', conditions: ['Thyroid Disorder'] },
  { id: 'p7', name: 'Vikram Rao', age: 41, gender: 'Male', contact: '+91 98765 43216', email: 'vikram.rao@email.com', emergencyContact: '+91 98765 77777', registeredDate: '2025-09-05', status: 'Pending', bloodGroup: 'B-', address: '147 HSR Layout, Bangalore', conditions: [] },
  { id: 'p8', name: 'Deepika Gupta', age: 56, gender: 'Female', contact: '+91 98765 43217', email: 'deepika.gupta@email.com', emergencyContact: '+91 98765 88888', registeredDate: '2025-04-12', lastVisit: '2025-08-15', status: 'Active', bloodGroup: 'O+', address: '258 Marathahalli, Bangalore', conditions: ['Diabetes Type 2', 'Cholesterol'] },
];

export const mockAppointments: Appointment[] = [
  { id: 'a1', patientId: 'p1', patientName: 'Ravi Kumar', doctorId: 'u2', doctorName: 'Dr. James Patel', department: 'General Medicine', date: '2025-09-10', time: '09:00 AM', status: 'Confirmed', reason: 'Routine checkup' },
  { id: 'a2', patientId: 'p2', patientName: 'Anita Sharma', doctorId: 'u3', doctorName: 'Dr. Emily Ross', department: 'Cardiology', date: '2025-09-10', time: '10:30 AM', status: 'Confirmed', reason: 'Follow-up consultation' },
  { id: 'a3', patientId: 'p3', patientName: 'Rahul Verma', doctorId: 'u2', doctorName: 'Dr. James Patel', department: 'General Medicine', date: '2025-09-10', time: '11:30 AM', status: 'Pending', reason: 'New symptoms' },
  { id: 'a4', patientId: 'p4', patientName: 'Priya Reddy', doctorId: 'u3', doctorName: 'Dr. Emily Ross', department: 'Cardiology', date: '2025-09-10', time: '02:00 PM', status: 'Confirmed', reason: 'Test results review' },
  { id: 'a5', patientId: 'p5', patientName: 'Arjun Singh', doctorId: 'u2', doctorName: 'Dr. James Patel', department: 'General Medicine', date: '2025-09-12', time: '09:30 AM', status: 'Pending', reason: 'Medication review' },
  { id: 'a6', patientId: 'p1', patientName: 'Ravi Kumar', doctorId: 'u2', doctorName: 'Dr. James Patel', department: 'General Medicine', date: '2025-08-28', time: '10:00 AM', status: 'Completed', reason: 'Blood pressure check' },
  { id: 'a7', patientId: 'p6', patientName: 'Meera Nair', doctorId: 'u3', doctorName: 'Dr. Emily Ross', department: 'Cardiology', date: '2025-09-03', time: '11:00 AM', status: 'Completed', reason: 'Thyroid panel review' },
  { id: 'a8', patientId: 'p8', patientName: 'Deepika Gupta', doctorId: 'u2', doctorName: 'Dr. James Patel', department: 'General Medicine', date: '2025-09-15', time: '01:00 PM', status: 'Confirmed', reason: 'Diabetes management' },
];

export const mockDocuments: Document[] = [
  { id: 'd1', name: 'CBC_Report_Ravi.pdf', patientId: 'p1', patientName: 'Ravi Kumar', type: 'Lab Report', uploadedBy: 'Mike Johnson', uploadedById: 'u4', date: '2025-09-09', status: 'AI Summary Available', aiSummary: 'This document contains a Complete Blood Count (CBC) laboratory report for patient Ravi Kumar. Key indicators appear to be within normal ranges with slight elevation in hemoglobin levels. The assigned doctor may need to review the uploaded report for clinical correlation.', workflowAction: 'Doctor Review Required', size: '245 KB' },
  { id: 'd2', name: 'Lipid_Panel_Anita.pdf', patientId: 'p2', patientName: 'Anita Sharma', type: 'Lab Report', uploadedBy: 'Mike Johnson', uploadedById: 'u4', date: '2025-09-08', status: 'Reviewed', aiSummary: 'This document contains a lipid panel report. Cholesterol levels indicate mild elevation. This report has been reviewed by the attending physician.', size: '198 KB' },
  { id: 'd3', name: 'ECG_Rahul.pdf', patientId: 'p3', patientName: 'Rahul Verma', type: 'Imaging', uploadedBy: 'Mike Johnson', uploadedById: 'u4', date: '2025-09-07', status: 'Needs Review', workflowAction: 'Doctor Review Required', size: '512 KB' },
  { id: 'd4', name: 'Thyroid_Panel_Meera.pdf', patientId: 'p6', patientName: 'Meera Nair', type: 'Lab Report', uploadedBy: 'Mike Johnson', uploadedById: 'u4', date: '2025-09-05', status: 'Reviewed', aiSummary: 'Thyroid function test results indicating TSH levels within normal range. Reviewed by Dr. Emily Ross.', size: '187 KB' },
  { id: 'd5', name: 'Medical_History_Arjun.pdf', patientId: 'p5', patientName: 'Arjun Singh', type: 'Medical Record', uploadedBy: 'Sarah Chen', uploadedById: 'u1', date: '2025-08-20', status: 'Uploaded', size: '324 KB' },
  { id: 'd6', name: 'Glucose_Test_Deepika.pdf', patientId: 'p8', patientName: 'Deepika Gupta', type: 'Lab Report', uploadedBy: 'Mike Johnson', uploadedById: 'u4', date: '2025-09-08', status: 'AI Summary Available', aiSummary: 'Fasting blood glucose test results showing elevated levels (142 mg/dL). The assigned doctor may need to review for potential medication adjustment.', workflowAction: 'Doctor Review Required', size: '156 KB' },
];

export const mockLabReports: LabReport[] = [
  { id: 'lr1', patientId: 'p1', patientName: 'Ravi Kumar', testType: 'Complete Blood Count (CBC)', requestedBy: 'Dr. James Patel', requestedById: 'u2', dateRequested: '2025-09-05', status: 'Completed', reportDate: '2025-09-09', result: 'Hemoglobin: 14.2 g/dL, WBC: 7,200/mL, Platelets: 250,000/mL', uploadedBy: 'Mike Johnson', aiSummary: 'CBC results within normal ranges. Slight hemoglobin elevation noted.' },
  { id: 'lr2', patientId: 'p2', patientName: 'Anita Sharma', testType: 'Lipid Panel', requestedBy: 'Dr. Emily Ross', requestedById: 'u3', dateRequested: '2025-09-02', status: 'Completed', reportDate: '2025-09-06', result: 'Total Cholesterol: 215 mg/dL, LDL: 140 mg/dL, HDL: 45 mg/dL', uploadedBy: 'Mike Johnson' },
  { id: 'lr3', patientId: 'p3', patientName: 'Rahul Verma', testType: 'ECG', requestedBy: 'Dr. James Patel', requestedById: 'u2', dateRequested: '2025-09-04', status: 'Needs Review', reportDate: '2025-09-07', result: 'Sinus rhythm with occasional PVCs', uploadedBy: 'Mike Johnson' },
  { id: 'lr4', patientId: 'p4', patientName: 'Priya Reddy', testType: 'MRI Brain', requestedBy: 'Dr. Emily Ross', requestedById: 'u3', dateRequested: '2025-09-06', status: 'In Progress' },
  { id: 'lr5', patientId: 'p5', patientName: 'Arjun Singh', testType: 'HbA1c', requestedBy: 'Dr. James Patel', requestedById: 'u2', dateRequested: '2025-09-07', status: 'Pending' },
  { id: 'lr6', patientId: 'p8', patientName: 'Deepika Gupta', testType: 'Fasting Blood Glucose', requestedBy: 'Dr. James Patel', requestedById: 'u2', dateRequested: '2025-09-04', status: 'Completed', reportDate: '2025-09-08', result: 'Fasting glucose: 142 mg/dL (elevated)', uploadedBy: 'Mike Johnson', aiSummary: 'Fasting glucose elevated at 142 mg/dL. Doctor review recommended for medication assessment.' },
  { id: 'lr7', patientId: 'p6', patientName: 'Meera Nair', testType: 'Thyroid Panel (TSH, T3, T4)', requestedBy: 'Dr. Emily Ross', requestedById: 'u3', dateRequested: '2025-08-28', status: 'Completed', reportDate: '2025-09-03', result: 'TSH: 2.1 mIU/L, T3: 120 ng/dL, T4: 8.5 μg/dL', uploadedBy: 'Mike Johnson' },
];

export const mockTasks: Task[] = [
  { id: 't1', title: 'Review CBC report for Ravi Kumar', patientId: 'p1', patientName: 'Ravi Kumar', assignedTo: 'Dr. James Patel', assignedToId: 'u2', department: 'General Medicine', priority: 'High', status: 'Needs Review', dueDate: '2025-09-10', createdBy: 'AI Agent', aiGenerated: true },
  { id: 't2', title: 'Process prescription for Anita Sharma', patientId: 'p2', patientName: 'Anita Sharma', assignedTo: 'Lisa Park', assignedToId: 'u5', department: 'Pharmacy', priority: 'Medium', status: 'Pending', dueDate: '2025-09-10' },
  { id: 't3', title: 'Confirm follow-up appointment for Rahul Verma', patientId: 'p3', patientName: 'Rahul Verma', assignedTo: 'Sarah Chen', assignedToId: 'u1', department: 'Front Desk', priority: 'Medium', status: 'Needs Approval', dueDate: '2025-09-11', createdBy: 'AI Agent', aiGenerated: true },
  { id: 't4', title: 'Upload MRI report for Priya Reddy', patientId: 'p4', patientName: 'Priya Reddy', assignedTo: 'Mike Johnson', assignedToId: 'u4', department: 'Laboratory', priority: 'High', status: 'In Progress', dueDate: '2025-09-10' },
  { id: 't5', title: 'Review ECG report for Rahul Verma', patientId: 'p3', patientName: 'Rahul Verma', assignedTo: 'Dr. James Patel', assignedToId: 'u2', department: 'General Medicine', priority: 'Urgent', status: 'Needs Review', dueDate: '2025-09-10' },
  { id: 't6', title: 'Review glucose test for Deepika Gupta', patientId: 'p8', patientName: 'Deepika Gupta', assignedTo: 'Dr. James Patel', assignedToId: 'u2', department: 'General Medicine', priority: 'High', status: 'Needs Review', dueDate: '2025-09-11', createdBy: 'AI Agent', aiGenerated: true },
  { id: 't7', title: 'Complete HbA1c test for Arjun Singh', patientId: 'p5', patientName: 'Arjun Singh', assignedTo: 'Mike Johnson', assignedToId: 'u4', department: 'Laboratory', priority: 'Medium', status: 'Pending', dueDate: '2025-09-12' },
  { id: 't8', title: 'Register new patient Vikram Rao', patientId: 'p7', patientName: 'Vikram Rao', assignedTo: 'Sarah Chen', assignedToId: 'u1', department: 'Front Desk', priority: 'Low', status: 'Pending', dueDate: '2025-09-12' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'lab_report', title: 'New lab report uploaded', message: 'CBC report uploaded for Ravi Kumar. Doctor review required.', timestamp: '2025-09-09 10:42 AM', read: false, patientName: 'Ravi Kumar' },
  { id: 'n2', type: 'ai_alert', title: 'AI workflow alert', message: '3 workflow actions require attention.', timestamp: '2025-09-09 10:44 AM', read: false },
  { id: 'n3', type: 'task', title: 'Doctor review required', message: 'ECG report for Rahul Verma needs urgent review.', timestamp: '2025-09-09 09:15 AM', read: false, patientName: 'Rahul Verma' },
  { id: 'n4', type: 'prescription', title: 'Prescription sent to pharmacy', message: 'Prescription for Anita Sharma sent to pharmacy for processing.', timestamp: '2025-09-08 04:30 PM', read: true, patientName: 'Anita Sharma' },
  { id: 'n5', type: 'followup', title: 'Follow-up appointment requires approval', message: 'AI suggested follow-up appointment for Rahul Verma. Awaiting approval.', timestamp: '2025-09-08 03:20 PM', read: false, patientName: 'Rahul Verma' },
  { id: 'n6', type: 'appointment', title: 'Appointment scheduled', message: 'New appointment booked for Deepika Gupta on Sep 15.', timestamp: '2025-09-08 02:10 PM', read: true, patientName: 'Deepika Gupta' },
  { id: 'n7', type: 'lab_report', title: 'Lab report uploaded', message: 'Fasting glucose test results uploaded for Deepika Gupta.', timestamp: '2025-09-08 11:00 AM', read: true, patientName: 'Deepika Gupta' },
];

export const mockPrescriptions: Prescription[] = [
  { id: 'rx1', patientId: 'p2', patientName: 'Anita Sharma', doctorId: 'u3', doctorName: 'Dr. Emily Ross', date: '2025-09-08', status: 'Pending', medications: [{ name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take at bedtime' }], notes: 'Monitor lipid levels in 3 months' },
  { id: 'rx2', patientId: 'p1', patientName: 'Ravi Kumar', doctorId: 'u2', doctorName: 'Dr. James Patel', date: '2025-09-01', status: 'Completed', medications: [{ name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '90 days', instructions: 'Take with meals' }, { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '90 days' }] },
  { id: 'rx3', patientId: 'p6', patientName: 'Meera Nair', doctorId: 'u3', doctorName: 'Dr. Emily Ross', date: '2025-09-03', status: 'Completed', medications: [{ name: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily', duration: '60 days', instructions: 'Take on empty stomach' }] },
  { id: 'rx4', patientId: 'p8', patientName: 'Deepika Gupta', doctorId: 'u2', doctorName: 'Dr. James Patel', date: '2025-09-08', status: 'Processing', medications: [{ name: 'Glipizide', dosage: '5mg', frequency: 'Once daily', duration: '30 days' }, { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', duration: '30 days' }] },
  { id: 'rx5', patientId: 'p5', patientName: 'Arjun Singh', doctorId: 'u2', doctorName: 'Dr. James Patel', date: '2025-09-07', status: 'Sent', medications: [{ name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', duration: '15 days', instructions: 'Take with food' }] },
];

export const mockFollowUps: FollowUp[] = [
  { id: 'f1', patientId: 'p3', patientName: 'Rahul Verma', doctorId: 'u2', doctorName: 'Dr. James Patel', reason: 'Review ECG results and assess cardiac function', requestedDate: '2025-09-07', suggestedDate: '2025-09-14', suggestedTime: '10:00 AM', status: 'Awaiting Approval', aiSuggestion: true },
  { id: 'f2', patientId: 'p1', patientName: 'Ravi Kumar', doctorId: 'u2', doctorName: 'Dr. James Patel', reason: 'Monitor blood pressure medication effectiveness', requestedDate: '2025-09-01', suggestedDate: '2025-09-15', suggestedTime: '09:00 AM', status: 'Approved' },
  { id: 'f3', patientId: 'p8', patientName: 'Deepika Gupta', doctorId: 'u2', doctorName: 'Dr. James Patel', reason: 'Review glucose test results and adjust medication', requestedDate: '2025-09-08', suggestedDate: '2025-09-15', suggestedTime: '01:00 PM', status: 'Approved' },
  { id: 'f4', patientId: 'p4', patientName: 'Priya Reddy', doctorId: 'u3', doctorName: 'Dr. Emily Ross', reason: 'Discuss MRI results and treatment plan', requestedDate: '2025-09-06', status: 'Requested' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'al1', timestamp: '2025-09-09 10:44 AM', user: 'CareFlow AI Agent', userId: 'ai', action: 'create_task', resource: 'Task', resourceId: 't1', result: 'Success', details: 'Created doctor review task for CBC report' },
  { id: 'al2', timestamp: '2025-09-09 10:42 AM', user: 'Mike Johnson', userId: 'u4', action: 'upload_lab_report', resource: 'LabReport', resourceId: 'lr1', result: 'Success', details: 'Uploaded CBC report for Ravi Kumar' },
  { id: 'al3', timestamp: '2025-09-09 10:43 AM', user: 'CareFlow AI Agent', userId: 'ai', action: 'summarize_document', resource: 'Document', resourceId: 'd1', result: 'Success', details: 'Generated AI summary for CBC_Report_Ravi.pdf' },
  { id: 'al4', timestamp: '2025-09-09 10:44 AM', user: 'CareFlow AI Agent', userId: 'ai', action: 'send_notification', resource: 'Notification', resourceId: 'n1', result: 'Success', details: 'Notified doctor of pending lab report review' },
  { id: 'al5', timestamp: '2025-09-08 04:30 PM', user: 'Dr. Emily Ross', userId: 'u3', action: 'create_prescription', resource: 'Prescription', resourceId: 'rx1', result: 'Success', details: 'Prescription sent to pharmacy for Anita Sharma' },
  { id: 'al6', timestamp: '2025-09-08 03:20 PM', user: 'CareFlow AI Agent', userId: 'ai', action: 'suggest_followup', resource: 'FollowUp', resourceId: 'f1', result: 'Success', details: 'Suggested follow-up appointment for Rahul Verma' },
  { id: 'al7', timestamp: '2025-09-08 02:10 PM', user: 'Sarah Chen', userId: 'u1', action: 'create_appointment', resource: 'Appointment', resourceId: 'a8', result: 'Success', details: 'Scheduled appointment for Deepika Gupta' },
  { id: 'al8', timestamp: '2025-09-08 11:00 AM', user: 'Mike Johnson', userId: 'u4', action: 'upload_lab_report', resource: 'LabReport', resourceId: 'lr6', result: 'Success', details: 'Uploaded fasting glucose test for Deepika Gupta' },
  { id: 'al9', timestamp: '2025-09-07 09:00 AM', user: 'Dr. James Patel', userId: 'u2', action: 'review_lab_report', resource: 'LabReport', resourceId: 'lr2', result: 'Success', details: 'Reviewed lipid panel for Anita Sharma' },
  { id: 'al10', timestamp: '2025-09-07 08:30 AM', user: 'Lisa Park', userId: 'u5', action: 'update_prescription', resource: 'Prescription', resourceId: 'rx3', result: 'Success', details: 'Marked prescription as completed for Meera Nair' },
  { id: 'al11', timestamp: '2025-09-06 01:15 PM', user: 'Dr. Emily Ross', userId: 'u3', action: 'request_lab_test', resource: 'LabReport', resourceId: 'lr4', result: 'Success', details: 'Requested MRI Brain for Priya Reddy' },
  { id: 'al12', timestamp: '2025-09-05 10:00 AM', user: 'Sarah Chen', userId: 'u1', action: 'register_patient', resource: 'Patient', resourceId: 'p7', result: 'Success', details: 'Registered new patient Vikram Rao' },
];

export const mockAIWorkflows: AIWorkflow[] = [
  {
    id: 'wf1',
    trigger: 'New lab report uploaded (CBC_Report_Ravi.pdf)',
    patientId: 'p1',
    patientName: 'Ravi Kumar',
    status: 'Awaiting Approval',
    createdAt: '2025-09-09 10:42 AM',
    suggestion: 'Doctor review required for CBC report. Results show slight hemoglobin elevation. Recommend scheduling follow-up if clinically indicated.',
    suggestionType: 'review',
    approvalStatus: 'pending',
    steps: [
      { id: 's1', step: 1, action: 'New lab report detected', status: 'completed', timestamp: '10:42 AM' },
      { id: 's2', step: 2, action: 'Patient context retrieved', tool: 'get_patient()', status: 'completed', timestamp: '10:42 AM' },
      { id: 's3', step: 3, action: 'Document retrieved', tool: 'get_documents()', status: 'completed', timestamp: '10:42 AM' },
      { id: 's4', step: 4, action: 'AI summary generated', tool: 'summarize_document()', status: 'completed', timestamp: '10:43 AM' },
      { id: 's5', step: 5, action: 'Workflow action identified', status: 'completed', timestamp: '10:43 AM' },
      { id: 's6', step: 6, action: 'Doctor review task created', tool: 'create_task()', status: 'completed', timestamp: '10:44 AM' },
      { id: 's7', step: 7, action: 'Doctor notified', tool: 'send_notification()', status: 'completed', timestamp: '10:44 AM' },
      { id: 's8', step: 8, action: 'Waiting for human review', status: 'awaiting_approval', timestamp: '10:44 AM' },
    ],
    agentActivity: [
      { id: 'aa1', timestamp: '10:42', agent: 'CareFlow Agent', tool: 'get_patient()', action: 'Retrieved patient context', result: 'Patient: Ravi Kumar, 45M', status: 'Success' },
      { id: 'aa2', timestamp: '10:42', agent: 'CareFlow Agent', tool: 'get_lab_reports()', action: 'Retrieved report', result: 'CBC report found', status: 'Success' },
      { id: 'aa3', timestamp: '10:43', agent: 'CareFlow Agent', tool: 'summarize_document()', action: 'Generated workflow summary', result: 'Summary created', status: 'Success' },
      { id: 'aa4', timestamp: '10:44', agent: 'CareFlow Agent', tool: 'create_task()', action: 'Doctor review task created', result: 'Task #t1 created', status: 'Success' },
      { id: 'aa5', timestamp: '10:44', agent: 'CareFlow Agent', tool: 'send_notification()', action: 'Doctor notified', result: 'Notification sent', status: 'Success' },
    ],
  },
  {
    id: 'wf2',
    trigger: 'Follow-up appointment requested for Rahul Verma',
    patientId: 'p3',
    patientName: 'Rahul Verma',
    status: 'Awaiting Approval',
    createdAt: '2025-09-08 03:20 PM',
    suggestion: 'Suggested follow-up appointment on Sep 14 at 10:00 AM based on doctor availability and ECG report pending review.',
    suggestionType: 'appointment',
    approvalStatus: 'pending',
    steps: [
      { id: 's1', step: 1, action: 'Follow-up requested by doctor', status: 'completed', timestamp: '03:15 PM' },
      { id: 's2', step: 2, action: 'Patient context retrieved', tool: 'get_patient()', status: 'completed', timestamp: '03:16 PM' },
      { id: 's3', step: 3, action: 'Appointment availability checked', tool: 'get_appointments()', status: 'completed', timestamp: '03:18 PM' },
      { id: 's4', step: 4, action: 'Suitable slot identified', status: 'completed', timestamp: '03:19 PM' },
      { id: 's5', step: 5, action: 'Appointment suggestion created', tool: 'create_appointment()', status: 'completed', timestamp: '03:20 PM' },
      { id: 's6', step: 6, action: 'Awaiting doctor/staff approval', status: 'awaiting_approval', timestamp: '03:20 PM' },
    ],
    agentActivity: [
      { id: 'aa1', timestamp: '03:16', agent: 'CareFlow Agent', tool: 'get_patient()', action: 'Retrieved patient context', result: 'Patient: Rahul Verma, 52M', status: 'Success' },
      { id: 'aa2', timestamp: '03:18', agent: 'CareFlow Agent', tool: 'get_appointments()', action: 'Checked availability', result: 'Sep 14, 10:00 AM available', status: 'Success' },
      { id: 'aa3', timestamp: '03:20', agent: 'CareFlow Agent', tool: 'create_appointment()', action: 'Suggested appointment slot', result: 'Pending approval', status: 'Success' },
    ],
  },
  {
    id: 'wf3',
    trigger: 'Prescription sent to pharmacy for Anita Sharma',
    patientId: 'p2',
    patientName: 'Anita Sharma',
    status: 'Completed',
    createdAt: '2025-09-08 04:30 PM',
    suggestion: 'Prescription forwarded to pharmacy. Notification sent to pharmacy staff.',
    suggestionType: 'notification',
    approvalStatus: 'approved',
    steps: [
      { id: 's1', step: 1, action: 'Prescription created by doctor', status: 'completed', timestamp: '04:25 PM' },
      { id: 's2', step: 2, action: 'Patient context retrieved', tool: 'get_patient()', status: 'completed', timestamp: '04:26 PM' },
      { id: 's3', step: 3, action: 'Pharmacy notified', tool: 'send_notification()', status: 'completed', timestamp: '04:30 PM' },
      { id: 's4', step: 4, action: 'Workflow completed', status: 'completed', timestamp: '04:30 PM' },
    ],
    agentActivity: [
      { id: 'aa1', timestamp: '04:26', agent: 'CareFlow Agent', tool: 'get_patient()', action: 'Retrieved patient context', result: 'Patient: Anita Sharma, 38F', status: 'Success' },
      { id: 'aa2', timestamp: '04:30', agent: 'CareFlow Agent', tool: 'send_notification()', action: 'Pharmacy notified', result: 'Notification sent', status: 'Success' },
    ],
  },
];

export const rolePermissions: Record<Role, string[]> = {
  receptionist: ['patients.read', 'patients.create', 'appointments.read', 'appointments.create', 'appointments.update', 'tasks.read', 'notifications.read'],
  doctor: ['patients.read', 'appointments.read', 'lab_reports.read', 'documents.read', 'documents.create', 'tasks.read', 'tasks.create', 'prescriptions.read', 'prescriptions.create', 'followups.read', 'followups.create', 'ai_workflow.review', 'ai_workflow.run'],
  lab: ['lab_requests.read', 'lab_reports.read', 'lab_reports.create', 'lab_reports.update', 'notifications.read'],
  pharmacy: ['prescriptions.read', 'prescriptions.update', 'notifications.read'],
  admin: ['users.manage', 'roles.manage', 'audit.read', 'security.read', 'patients.read', 'appointments.read', 'documents.read', 'lab_reports.read', 'tasks.read', 'prescriptions.read', 'followups.read', 'ai_workflow.read'],
};

export const roleLabels: Record<Role, string> = {
  receptionist: 'Receptionist',
  doctor: 'Doctor',
  lab: 'Lab Staff',
  pharmacy: 'Pharmacy Staff',
  admin: 'Admin',
};

export const roleBadgeColors: Record<Role, string> = {
  receptionist: 'bg-blue-100 text-blue-700 border-blue-200',
  doctor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  lab: 'bg-amber-100 text-amber-700 border-amber-200',
  pharmacy: 'bg-purple-100 text-purple-700 border-purple-200',
  admin: 'bg-rose-100 text-rose-700 border-rose-200',
};
