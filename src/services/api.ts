// src/services/api.ts
import type {
  User, Patient, Appointment, Document, LabReport, Task,
  Notification, Prescription, FollowUp, AuditLog, AIWorkflow, Role
} from '@/types';
import {
  mockUsers, loginCredentials, mockPatients, mockAppointments,
  mockDocuments, mockLabReports, mockTasks, mockNotifications,
  mockPrescriptions, mockFollowUps, mockAuditLogs, mockAIWorkflows
} from '@/data/mockData';

const API_URL = import.meta.env.VITE_API_URL || '';
const USE_BACKEND = !!API_URL;

/* ============================================================
   Custom error
   ============================================================ */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/* ============================================================
   Helpers
   ============================================================ */

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('careflow_auth');
    if (!raw) return null;
    return JSON.parse(raw).token || null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      'Cannot reach the server. Please check your connection and try again.',
      0
    );
  }

  if (!res.ok) {
    let detail = `Something went wrong (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) {
        detail =
          typeof body.detail === 'string'
            ? body.detail
            : Array.isArray(body.detail)
            ? body.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
            : JSON.stringify(body.detail);
      }
    } catch {
      /* ignore */
    }

    if (res.status === 401) detail = 'Session expired. Please log in again.';
    else if (res.status === 403)
      detail = detail || 'You do not have permission for this action.';
    else if (res.status === 404) detail = detail || 'Resource not found.';
    else if (res.status === 409) detail = detail || 'This record already exists.';
    else if (res.status === 422) detail = detail || 'Please check the input values.';
    else if (res.status >= 500)
      detail = detail || 'Server error. Please try again in a moment.';

    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Convert "11:00 AM" or "02:30 PM" to 24-hour "11:00" or "14:30".
 * If the input is already 24-hour ("11:00", "14:30"), it returns as-is.
 */
function to24Hour(timeStr: string): string {
  if (!timeStr) return '09:00';
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return '09:00';

  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3];

  if (ampm) {
    const isPM = ampm.toUpperCase() === 'PM';
    if (isPM && h !== 12) h += 12;
    if (!isPM && h === 12) h = 0;
  }

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* ============================================================
   Adapters — Backend response → Frontend type
   ============================================================ */

function adaptPatient(b: any): Patient {
  return {
    id: String(b.id),
    name: b.name,
    age: b.age,
    gender: b.gender,
    contact: b.phone || '',
    email: b.email || undefined,
    emergencyContact: '',
    registeredDate:
      (b.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
    status: b.status || 'Active',
    bloodGroup: undefined,
    address: b.address || undefined,
    conditions: [],
  };
}

function adaptAppointment(b: any, patientName?: string): Appointment {
  const dt = new Date(b.scheduled_at);
  return {
    id: String(b.id),
    patientId: String(b.patient_id),
    patientName: patientName || `Patient #${b.patient_id}`,
    doctorId: '',
    doctorName: b.doctor_name || '',
    department: b.department || '',
    date: dt.toISOString().split('T')[0],
    time: dt.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: b.status || 'Pending',
    reason: b.notes || undefined,
  };
}

function adaptTask(b: any, patientName?: string): Task {
  return {
    id: String(b.id),
    title: b.title,
    patientId: b.patient_id ? String(b.patient_id) : '',
    patientName: patientName || '',
    assignedTo: b.assigned_to || '',
    assignedToId: '',
    department: b.department || '',
    priority: b.priority || 'Medium',
    status: b.status || 'Pending',
    dueDate: b.due_date ? b.due_date.split('T')[0] : '',
    createdBy: undefined,
    aiGenerated:
      b.title?.toLowerCase().includes('review') || b.status === 'Needs Approval',
  };
}

function adaptLabReport(b: any, patientName?: string): LabReport {
  return {
    id: String(b.id),
    patientId: String(b.patient_id),
    patientName: patientName || '',
    reportName: b.report_name,
    type: b.report_type,
    uploadedBy: b.uploaded_by,
    date: (b.uploaded_at || '').split('T')[0],
    status: b.status,
    aiSummary: b.ai_summary || undefined,
    needsReview: b.needs_doctor_review === 'true',
  } as any;
}

function adaptNotification(b: any): Notification {
  return {
    id: String(b.id),
    title: b.title,
    message: b.message,
    type: 'system',
    timestamp: b.createdAt || '',
    read: b.isRead || false,
  } as any;
}

function adaptFollowUp(b: any): FollowUp {
  return {
    id: String(b.id),
    patientId: String(b.patientId || ''),
    patientName: b.patientName || '',
    doctorId: '',
    doctorName: '',
    reason: b.reason || '',
    requestedDate: b.requestedDate || '',
    status: b.status || 'Requested',
    aiSuggestion: undefined,
  } as any;
}

function adaptPrescription(b: any): Prescription {
  return {
    id: String(b.id),
    patientId: String(b.patientId || ''),
    patientName: b.patientName || '',
    doctorId: '',
    doctorName: '',
    date: b.date || '',
    status: b.status || 'Pending',
    medications: b.medications
      ? [{ name: b.medications, dosage: '', frequency: '' }]
      : [],
    notes: undefined,
  } as any;
}

function adaptDocument(b: any): Document {
  return {
    id: String(b.id),
    name: b.name,
    patientId: String(b.patientId || ''),
    patientName: b.patientName || '',
    type: b.type || 'Medical Record',
    uploadedBy: b.uploadedBy || '',
    uploadedById: '',
    date: b.date || '',
    status: b.status || 'Uploaded',
    size: '—',
  } as any;
}

/* ============================================================
   API
   ============================================================ */

export const api = {
  /* ---------------- AUTH ---------------- */
  async login(
    email: string,
    password: string,
    role: Role
  ): Promise<{ user: User; token: string }> {
    if (USE_BACKEND) {
      const res = await apiFetch<any>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      return {
        user: {
          id: String(res.user.id),
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          organization: res.user.organization,
        } as User,
        token: res.access_token,
      };
    }
    await delay(600);
    const cred = loginCredentials[email];
    if (!cred || cred.password !== password || cred.role !== role) {
      throw new ApiError(
        'Invalid email, password, or role. Please check your credentials.',
        401
      );
    }
    const user = mockUsers.find((u) => u.id === cred.userId);
    if (!user) throw new ApiError('User not found.', 404);
    return { user, token: 'mock-token' };
  },

  async me(): Promise<User | null> {
    if (!USE_BACKEND) return null;
    try {
      const res = await apiFetch<any>('/api/auth/me');
      return {
        id: String(res.id),
        name: res.name,
        email: res.email,
        role: res.role,
        organization: res.organization,
      } as User;
    } catch {
      return null;
    }
  },

  /* ---------------- PATIENTS ---------------- */
  async getPatients(): Promise<Patient[]> {
    if (USE_BACKEND) {
      try {
        const res = await apiFetch<any[]>('/api/patients');
        return res.map(adaptPatient);
      } catch (err) {
        console.warn('getPatients failed:', err);
        return [];
      }
    }
    await delay(300);
    return mockPatients;
  },

  async getPatient(id: string): Promise<Patient | undefined> {
    if (USE_BACKEND) {
      try {
        const res = await apiFetch<any>(`/api/patients/${id}`);
        return adaptPatient(res);
      } catch {
        return undefined;
      }
    }
    await delay(200);
    return mockPatients.find((p) => p.id === id);
  },

  async createPatient(data: Partial<Patient>): Promise<Patient> {
    if (USE_BACKEND) {
      const res = await apiFetch<any>('/api/patients', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          age: data.age,
          gender: data.gender,
          phone: data.contact,
          email: data.email || null,
          address: data.address || null,
        }),
      });
      return adaptPatient(res);
    }
    await delay(400);
    return {
      id: `p${Date.now()}`,
      name: data.name || 'Unknown',
      age: data.age || 0,
      gender: data.gender || 'Other',
      contact: data.contact || '',
      email: data.email,
      emergencyContact: data.emergencyContact || '',
      registeredDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      bloodGroup: data.bloodGroup,
      address: data.address,
      conditions: data.conditions || [],
    };
  },

  /* ---------------- APPOINTMENTS ---------------- */
  async getAppointments(): Promise<Appointment[]> {
    if (USE_BACKEND) {
      try {
        const [appts, patients] = await Promise.all([
          apiFetch<any[]>('/api/appointments'),
          apiFetch<any[]>('/api/patients').catch(() => []),
        ]);
        const nameById = new Map(patients.map((p: any) => [p.id, p.name]));
        return appts.map((a) => adaptAppointment(a, nameById.get(a.patient_id)));
      } catch (err) {
        console.warn('getAppointments failed:', err);
        return [];
      }
    }
    await delay(300);
    return mockAppointments;
  },

  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    if (USE_BACKEND) {
      // Convert "11:00 AM" → "11:00" (24-hour)
      const time24 = to24Hour(data.time || '09:00');
      const date = data.date || new Date().toISOString().split('T')[0];
      const scheduled_at = `${date}T${time24}:00`;

      const res = await apiFetch<any>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: Number(data.patientId),
          doctor_name: data.doctorName || 'Unassigned',
          department: data.department || 'General',
          scheduled_at,
          notes: data.reason || null,
        }),
      });
      return adaptAppointment(res, data.patientName);
    }
    await delay(400);
    return {
      id: `a${Date.now()}`,
      patientId: data.patientId || '',
      patientName: data.patientName || '',
      doctorId: data.doctorId || '',
      doctorName: data.doctorName || '',
      department: data.department || '',
      date: data.date || '',
      time: data.time || '',
      status: 'Pending',
      reason: data.reason,
    };
  },

  async updateAppointment(
    id: string,
    data: Partial<Appointment>
  ): Promise<Appointment> {
    if (USE_BACKEND && data.status) {
      await apiFetch(
        `/api/appointments/${id}/status?status=${encodeURIComponent(data.status)}`,
        { method: 'PATCH' }
      );
      const list = await api.getAppointments();
      return list.find((a) => a.id === id) as Appointment;
    }
    await delay(300);
    const apt = mockAppointments.find((a) => a.id === id);
    if (!apt) throw new ApiError('Appointment not found', 404);
    return { ...apt, ...data };
  },

  /* ---------------- DOCUMENTS ---------------- */
  async getDocuments(): Promise<Document[]> {
    if (USE_BACKEND) {
      try {
        const res = await apiFetch<any[]>('/api/documents');
        return res.map(adaptDocument);
      } catch {
        return [];
      }
    }
    await delay(300);
    return mockDocuments;
  },

  async createDocument(data: Partial<Document>): Promise<Document> {
    if (USE_BACKEND) {
      return {
        id: `d${Date.now()}`,
        name: data.name || 'Untitled.pdf',
        patientId: data.patientId || '',
        patientName: data.patientName || '',
        type: data.type || 'Medical Record',
        uploadedBy: data.uploadedBy || '',
        uploadedById: data.uploadedById || '',
        date: new Date().toISOString().split('T')[0],
        status: 'Uploaded',
        size: '100 KB',
      };
    }
    await delay(400);
    return {
      id: `d${Date.now()}`,
      name: data.name || 'Untitled.pdf',
      patientId: data.patientId || '',
      patientName: data.patientName || '',
      type: data.type || 'Medical Record',
      uploadedBy: data.uploadedBy || '',
      uploadedById: data.uploadedById || '',
      date: new Date().toISOString().split('T')[0],
      status: 'Uploaded',
      size: '100 KB',
    };
  },

  /* ---------------- LAB REPORTS ---------------- */
  async getLabReports(): Promise<LabReport[]> {
    if (USE_BACKEND) {
      try {
        const [reports, patients] = await Promise.all([
          apiFetch<any[]>('/api/reports'),
          apiFetch<any[]>('/api/patients').catch(() => []),
        ]);
        const nameById = new Map(patients.map((p: any) => [p.id, p.name]));
        return reports.map((r) => adaptLabReport(r, nameById.get(r.patient_id)));
      } catch (err) {
        console.warn('getLabReports failed:', err);
        return [];
      }
    }
    await delay(300);
    return mockLabReports;
  },

  async summarizeReport(reportId: string): Promise<any> {
    if (USE_BACKEND) {
      return await apiFetch<any>(`/api/ai/summarize-report/${reportId}`, {
        method: 'POST',
      });
    }
    await delay(600);
    return {
      workflow: 'summarize_report_by_id',
      ai_summary: 'Mock AI summary.',
      human_approval_required: true,
    };
  },

  /* ---------------- TASKS ---------------- */
  async getTasks(): Promise<Task[]> {
    if (USE_BACKEND) {
      try {
        const [tasks, patients] = await Promise.all([
          apiFetch<any[]>('/api/tasks'),
          apiFetch<any[]>('/api/patients').catch(() => []),
        ]);
        const nameById = new Map(patients.map((p: any) => [p.id, p.name]));
        return tasks.map((t) => adaptTask(t, nameById.get(t.patient_id)));
      } catch (err) {
        console.warn('getTasks failed:', err);
        return [];
      }
    }
    await delay(300);
    return mockTasks;
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    if (USE_BACKEND) {
      const res = await apiFetch<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          patient_id: data.patientId ? Number(data.patientId) : null,
          assigned_to: data.assignedTo,
          department: data.department,
          priority: data.priority || 'Medium',
          due_date: data.dueDate || null,
        }),
      });
      return adaptTask(res, data.patientName);
    }
    await delay(400);
    return {
      id: `t${Date.now()}`,
      title: data.title || 'New Task',
      patientId: data.patientId || '',
      patientName: data.patientName || '',
      assignedTo: data.assignedTo || '',
      assignedToId: data.assignedToId || '',
      department: data.department || '',
      priority: data.priority || 'Medium',
      status: 'Pending',
      dueDate: data.dueDate || '',
      createdBy: data.createdBy,
      aiGenerated: data.aiGenerated,
    };
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    if (USE_BACKEND && data.status) {
      await apiFetch(
        `/api/tasks/${id}/status?status=${encodeURIComponent(data.status)}`,
        { method: 'PATCH' }
      );
      const list = await api.getTasks();
      return list.find((t) => t.id === id) as Task;
    }
    await delay(300);
    const task = mockTasks.find((t) => t.id === id);
    if (!task) throw new ApiError('Task not found', 404);
    return { ...task, ...data };
  },

  async approveTask(taskId: string): Promise<void> {
    if (USE_BACKEND) {
      await apiFetch(`/api/tasks/${taskId}/status?status=Completed`, {
        method: 'PATCH',
      });
    }
  },

  async rejectTask(taskId: string): Promise<void> {
    if (USE_BACKEND) {
      await apiFetch(`/api/tasks/${taskId}/status?status=Rejected`, {
        method: 'PATCH',
      });
    }
  },

  /* ---------------- NOTIFICATIONS ---------------- */
  async getNotifications(): Promise<Notification[]> {
    if (USE_BACKEND) {
      try {
        const res = await apiFetch<any[]>('/api/notifications');
        return res.map(adaptNotification);
      } catch {
        return [];
      }
    }
    await delay(300);
    return mockNotifications;
  },

  async markNotificationRead(id: string): Promise<void> {
    if (USE_BACKEND) {
      try {
        await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      } catch {
        /* ignore */
      }
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    if (USE_BACKEND) {
      try {
        await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
      } catch {
        /* ignore */
      }
    }
  },

  /* ---------------- PRESCRIPTIONS ---------------- */
  async getPrescriptions(): Promise<Prescription[]> {
    if (USE_BACKEND) {
      try {
        const res = await apiFetch<any[]>('/api/prescriptions');
        return res.map(adaptPrescription);
      } catch {
        return [];
      }
    }
    await delay(300);
    return mockPrescriptions;
  },

  async createPrescription(
    data: Partial<Prescription>
  ): Promise<Prescription> {
    if (USE_BACKEND) {
      const meds = (data.medications || [])
        .map((m) => `${m.name} ${m.dosage || ''} ${m.frequency || ''}`)
        .join('\n');
      const res = await apiFetch<any>('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: Number(data.patientId),
          medications: meds,
          notes: data.notes || null,
        }),
      });
      return adaptPrescription(res);
    }
    await delay(400);
    return {
      id: `rx${Date.now()}`,
      patientId: data.patientId || '',
      patientName: data.patientName || '',
      doctorId: data.doctorId || '',
      doctorName: data.doctorName || '',
      date: new Date().toISOString().split('T')[0],
      status: 'Sent',
      medications: data.medications || [],
      notes: data.notes,
    };
  },

  async updatePrescription(
    id: string,
    data: Partial<Prescription>
  ): Promise<Prescription> {
    if (USE_BACKEND && data.status) {
      await apiFetch(
        `/api/prescriptions/${id}/status?status=${encodeURIComponent(data.status)}`,
        { method: 'PATCH' }
      );
      const list = await api.getPrescriptions();
      return list.find((p) => p.id === id) as Prescription;
    }
    await delay(300);
    const rx = mockPrescriptions.find((p) => p.id === id);
    if (!rx) throw new ApiError('Prescription not found', 404);
    return { ...rx, ...data };
  },

  /* ---------------- FOLLOW UPS ---------------- */
  async getFollowUps(): Promise<FollowUp[]> {
    if (USE_BACKEND) {
      try {
        const res = await apiFetch<any[]>('/api/followups');
        return res.map(adaptFollowUp);
      } catch {
        return [];
      }
    }
    await delay(300);
    return mockFollowUps;
  },

  async createFollowUp(data: Partial<FollowUp>): Promise<FollowUp> {
    if (USE_BACKEND) {
      const res = await apiFetch<any>('/api/followups', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: Number(data.patientId),
          reason: data.reason || '',
        }),
      });
      return adaptFollowUp(res);
    }
    await delay(400);
    return {
      id: `f${Date.now()}`,
      patientId: data.patientId || '',
      patientName: data.patientName || '',
      doctorId: data.doctorId || '',
      doctorName: data.doctorName || '',
      reason: data.reason || '',
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'Requested',
      aiSuggestion: data.aiSuggestion,
    };
  },

  /* ---------------- AI WORKFLOW ---------------- */
  async getAIWorkflows(): Promise<AIWorkflow[]> {
    if (USE_BACKEND) {
      try {
        return await apiFetch<AIWorkflow[]>('/api/ai/workflows');
      } catch {
        return [];
      }
    }
    await delay(400);
    return mockAIWorkflows;
  },

  async getAIAgentStatus(): Promise<any> {
    if (USE_BACKEND) {
      try {
        return await apiFetch<any>('/api/ai/status');
      } catch {
        return null;
      }
    }
    return {
      agent: 'CareFlow AI Workflow Coordinator',
      status: 'Active',
      capabilities: [
        'read_medical_documents',
        'summarize_documents',
        'identify_pending_workflow_actions',
        'create_workflow_tasks',
        'suggest_followups',
      ],
      restrictions: [
        'no_diagnosis',
        'no_prescribing',
        'no_unsupervised_clinical_decisions',
      ],
      human_approval_required_for: [
        'doctor_review',
        'appointment_scheduling',
        'clinical_decisions',
      ],
    };
  },

  async runAIWorkflow(patientId: string): Promise<AIWorkflow> {
    if (USE_BACKEND) {
      const res = await apiFetch<any>('/api/ai/run', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: Number(patientId),
          action: 'summarize_report',
        }),
      });

      const steps = (res.steps || []).map((s: any) => ({
        id: `s${s.step}`,
        step: s.step,
        action: s.action,
        tool: undefined,
        status:
          s.status === 'done'
            ? 'completed'
            : s.status === 'pending'
            ? 'awaiting_approval'
            : 'completed',
        timestamp: 'just now',
      }));

      const agentActivity = (res.steps || []).map((s: any, i: number) => ({
        id: `aa${i}`,
        timestamp: 'just now',
        agent: 'CareFlow Agent',
        tool:
          s.step === 1
            ? 'get_patient()'
            : s.step === 2
            ? 'get_lab_reports()'
            : s.step === 3
            ? 'extract_pdf_text()'
            : s.step === 4
            ? 'summarize_medical_document()'
            : s.step === 5
            ? 'db.commit()'
            : s.step === 6
            ? 'create_task()'
            : 'wait_for_human_approval()',
        action: s.action,
        result: s.status === 'done' ? 'Success' : 'Awaiting review',
        status: s.status === 'done' ? 'Success' : 'Pending',
      }));

      return {
        id: `wf${Date.now()}`,
        trigger: `AI summarized report for ${res.patient?.name || 'patient'}`,
        patientId,
        patientName: res.patient?.name || '',
        status: res.human_approval_required ? 'In Progress' : 'Completed',
        createdAt: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        suggestion: res.ai_summary || 'No summary generated.',
        suggestionType: 'review',
        approvalStatus: res.human_approval_required ? 'pending' : 'approved',
        steps,
        agentActivity,
      } as any;
    }

    await delay(800);
    const patient = mockPatients.find((p) => p.id === patientId);
    return {
      id: `wf${Date.now()}`,
      trigger: `Manual workflow run for ${patient?.name || 'patient'}`,
      patientId,
      patientName: patient?.name || 'Unknown',
      status: 'Completed',
      createdAt: new Date().toISOString(),
      suggestion: 'Workflow analysis complete.',
      suggestionType: 'review',
      approvalStatus: 'approved',
      steps: [
        {
          id: 's1',
          step: 1,
          action: 'Patient context retrieved',
          tool: 'get_patient()',
          status: 'completed',
        },
        {
          id: 's2',
          step: 2,
          action: 'Appointments checked',
          tool: 'get_appointments()',
          status: 'completed',
        },
        {
          id: 's3',
          step: 3,
          action: 'Lab reports reviewed',
          tool: 'get_lab_reports()',
          status: 'completed',
        },
        {
          id: 's4',
          step: 4,
          action: 'Documents analyzed',
          tool: 'get_documents()',
          status: 'completed',
        },
        { id: 's5', step: 5, action: 'Workflow completed', status: 'completed' },
      ],
      agentActivity: [],
    };
  },

  /* ---------------- AUDIT + USERS ---------------- */
  async getAuditLogs(): Promise<AuditLog[]> {
    if (USE_BACKEND) {
      try {
        return await apiFetch<AuditLog[]>('/api/audit-logs');
      } catch {
        return [];
      }
    }
    await delay(300);
    return mockAuditLogs;
  },

  async getUsers(): Promise<User[]> {
    if (USE_BACKEND) {
      try {
        const res = await apiFetch<any[]>('/api/users');
        return res.map(
          (u) =>
            ({
              id: String(u.id),
              name: u.name,
              email: u.email,
              role: u.role,
              organization: u.organization,
            } as User)
        );
      } catch {
        return [];
      }
    }
    await delay(300);
    return mockUsers;
  },
};