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

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `API error: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    time: dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
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
      throw new Error(
        'Invalid email, password, or role. Please check your credentials.'
      );
    }
    const user = mockUsers.find((u) => u.id === cred.userId);
    if (!user) throw new Error('User not found.');
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
        console.warn('getPatients failed (maybe 403):', err);
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
      } catch (err) {
        console.warn('getPatient failed:', err);
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
      const res = await apiFetch<any>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: Number(data.patientId),
          doctor_name: data.doctorName,
          department: data.department,
          scheduled_at:
            data.date && data.time
              ? `${data.date}T${data.time}:00`
              : new Date().toISOString(),
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
    if (!apt) throw new Error('Appointment not found');
    return { ...apt, ...data };
  },

  /* ---------------- DOCUMENTS ---------------- */
  async getDocuments(): Promise<Document[]> {
    if (USE_BACKEND) {
      try {
        return await apiFetch<Document[]>('/api/documents');
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
    if (!task) throw new Error('Task not found');
    return { ...task, ...data };
  },

  /* ---------------- NOTIFICATIONS ---------------- */
  async getNotifications(): Promise<Notification[]> {
    if (USE_BACKEND) {
      try {
        return await apiFetch<Notification[]>('/api/notifications');
      } catch {
        return [];
      }
    }
    await delay(300);
    return mockNotifications;
  },

  /* ---------------- PRESCRIPTIONS ---------------- */
  async getPrescriptions(): Promise<Prescription[]> {
    if (USE_BACKEND) {
      try {
        return await apiFetch<Prescription[]>('/api/prescriptions');
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
    await delay(300);
    const rx = mockPrescriptions.find((p) => p.id === id);
    if (!rx) throw new Error('Prescription not found');
    return { ...rx, ...data };
  },

  /* ---------------- FOLLOW UPS ---------------- */
  async getFollowUps(): Promise<FollowUp[]> {
    if (USE_BACKEND) {
      try {
        return await apiFetch<FollowUp[]>('/api/followups');
      } catch {
        return [];
      }
    }
    await delay(300);
    return mockFollowUps;
  },

  async createFollowUp(data: Partial<FollowUp>): Promise<FollowUp> {
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
            ? 'pending'
            : 'completed',
      }));
      return {
        id: `wf${Date.now()}`,
        trigger: `AI workflow for patient #${patientId}`,
        patientId,
        patientName: '',
        status: 'Completed',
        createdAt: new Date().toISOString(),
        suggestion: res.ai_summary || 'No summary available.',
        suggestionType: 'review',
        approvalStatus: res.human_approval_required ? 'pending' : 'approved',
        steps,
        agentActivity: (res.steps || []).map((s: any, i: number) => ({
          id: `aa${i}`,
          timestamp: 'now',
          agent: 'CareFlow Agent',
          tool: 'get_context()',
          action: s.action,
          result: 'Success',
          status: 'Success',
        })),
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
      suggestion: 'Workflow analysis complete. No immediate actions required.',
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
        return await apiFetch<User[]>('/api/users');
      } catch {
        return [];
      }
    }
    await delay(300);
    return mockUsers;
  },
};