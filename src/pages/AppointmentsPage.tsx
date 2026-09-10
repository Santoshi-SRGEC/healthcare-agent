import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import {
  CalendarDays,
  Plus,
  Clock,
  Calendar,
} from 'lucide-react';
import type { Appointment, Patient } from '@/types';

export function AppointmentsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real appointments from backend
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Real patients from backend / SQLite
  const [patients, setPatients] = useState<Patient[]>([]);

  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const [newApt, setNewApt] = useState({
    patientId: '',
    doctorName: 'Dr. James Patel',
    department: 'General Medicine',
    date: '',
    time: '09:00 AM',
    reason: '',
  });

  const canCreate =
    user?.role === 'receptionist' || user?.role === 'doctor';

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getAppointments();
      setAppointments(data);
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      // Gets REAL patients from the backend / SQLite database
      const data = await api.getPatients();
      setPatients(data);
    } catch {
      setError('Failed to load patients.');
    }
  };

  // ============================================================
  // CREATE APPOINTMENT
  // ============================================================

  const handleCreate = async () => {
    if (!newApt.patientId || !newApt.date) {
      return;
    }

    // Find selected patient from REAL database patients
    const patient = patients.find(
      p => p.id === newApt.patientId
    );

    try {
      const created = await api.createAppointment({
        patientId: newApt.patientId,
        patientName: patient?.name || '',
        doctorName: newApt.doctorName,
        department: newApt.department,
        date: newApt.date,
        time: newApt.time,
        reason: newApt.reason,
      });

      setAppointments(prev => [...prev, created]);

      setShowModal(false);

      // Reset form
      setNewApt({
        patientId: '',
        doctorName: 'Dr. James Patel',
        department: 'General Medicine',
        date: '',
        time: '09:00 AM',
        reason: '',
      });
    } catch {
      setError('Failed to create appointment.');
    }
  };

  // ============================================================
  // CANCEL APPOINTMENT
  // ============================================================

  const handleCancel = async (id: string) => {
    try {
      await api.updateAppointment(id, {
        status: 'Cancelled',
      });

      setAppointments(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, status: 'Cancelled' }
            : a
        )
      );
    } catch {
      setError('Failed to cancel appointment.');
    }
  };

  // ============================================================
  // LOADING / ERROR
  // ============================================================

  if (loading) {
    return <PageLoading label="Loading appointments..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null);
          loadAppointments();
          loadPatients();
        }}
      />
    );
  }

  // ============================================================
  // FILTER APPOINTMENTS
  // ============================================================

  const filtered =
    filter === 'all'
      ? appointments
      : appointments.filter(
          a => a.status === filter
        );

  // ============================================================
  // GROUP APPOINTMENTS BY DATE
  // ============================================================

  const grouped = filtered.reduce(
    (acc, apt) => {
      if (!acc[apt.date]) {
        acc[apt.date] = [];
      }

      acc[apt.date].push(apt);

      return acc;
    },
    {} as Record<string, Appointment[]>
  );

  const sortedDates = Object.keys(grouped).sort();

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Appointments
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            {appointments.length} total appointments
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Appointment
          </button>
        )}
      </div>

      {/* ======================================================
          FILTER TABS
      ====================================================== */}

      <div className="flex gap-2 flex-wrap">
        {[
          'all',
          'Confirmed',
          'Pending',
          'Completed',
          'Cancelled',
        ].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* ======================================================
          APPOINTMENTS LIST
      ====================================================== */}

      {sortedDates.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No appointments found"
          description="Try a different filter or schedule a new appointment."
        />
      ) : (
        <div className="space-y-5">

          {sortedDates.map(date => (
            <div key={date}>

              {/* DATE HEADER */}

              <div className="flex items-center gap-2 mb-3">

                <Calendar className="w-4 h-4 text-brand-500" />

                <h3 className="text-sm font-semibold text-slate-700">
                  {new Date(date).toLocaleDateString(
                    'en-US',
                    {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </h3>

                <span className="text-xs text-slate-400">
                  (
                  {grouped[date].length}
                  {' '}
                  appointment
                  {grouped[date].length > 1 ? 's' : ''}
                  )
                </span>

              </div>

              {/* APPOINTMENTS */}

              <div className="card overflow-hidden">

                {grouped[date].map((apt, i) => (

                  <div
                    key={apt.id}
                    className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${
                      i !== grouped[date].length - 1
                        ? 'border-b border-slate-100'
                        : ''
                    }`}
                  >

                    {/* TIME */}

                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-brand-50 text-brand-700 flex-shrink-0">

                      <Clock className="w-4 h-4 mb-0.5" />

                      <span className="text-xs font-semibold">
                        {apt.time}
                      </span>

                    </div>

                    {/* PATIENT INFO */}

                    <div className="flex-1 min-w-0">

                      <p className="text-sm font-semibold text-slate-900">
                        {apt.patientName}
                      </p>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {apt.doctorName}
                        {' · '}
                        {apt.department}
                      </p>

                      {apt.reason && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {apt.reason}
                        </p>
                      )}

                    </div>

                    {/* STATUS + CANCEL */}

                    <div className="flex items-center gap-2">

                      <StatusBadge
                        type={getStatusType(apt.status)}
                        dot
                      >
                        {apt.status}
                      </StatusBadge>

                      {canCreate &&
                        apt.status !== 'Completed' &&
                        apt.status !== 'Cancelled' && (
                          <button
                            onClick={() =>
                              handleCancel(apt.id)
                            }
                            className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                          >
                            Cancel
                          </button>
                        )}

                    </div>

                  </div>

                ))}

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ======================================================
          SCHEDULE APPOINTMENT MODAL
      ====================================================== */}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Schedule New Appointment"
        size="md"
      >

        <div className="space-y-4">

          {/* ==================================================
              PATIENT
          ================================================== */}

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Patient *
            </label>

            <select
              value={newApt.patientId}
              onChange={e =>
                setNewApt({
                  ...newApt,
                  patientId: e.target.value,
                })
              }
              className="input-field"
            >

              <option value="">
                Select patient...
              </option>

              {/* REAL PATIENTS FROM SQLITE */}

              {patients.map(patient => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.name}
                </option>
              ))}

            </select>

          </div>

          {/* ==================================================
              DOCTOR
          ================================================== */}

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Doctor
            </label>

            <select
              value={newApt.doctorName}
              onChange={e =>
                setNewApt({
                  ...newApt,
                  doctorName: e.target.value,
                })
              }
              className="input-field"
            >

              <option>
                Dr. James Patel
              </option>

              <option>
                Dr. Emily Ross
              </option>

            </select>

          </div>

          {/* ==================================================
              DEPARTMENT
          ================================================== */}

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Department
            </label>

            <select
              value={newApt.department}
              onChange={e =>
                setNewApt({
                  ...newApt,
                  department: e.target.value,
                })
              }
              className="input-field"
            >

              <option>
                General Medicine
              </option>

              <option>
                Cardiology
              </option>

              <option>
                Neurology
              </option>

              <option>
                Orthopedics
              </option>

            </select>

          </div>

          {/* ==================================================
              DATE + TIME
          ================================================== */}

          <div className="grid grid-cols-2 gap-4">

            {/* DATE */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date *
              </label>

              <input
                type="date"
                value={newApt.date}
                onChange={e =>
                  setNewApt({
                    ...newApt,
                    date: e.target.value,
                  })
                }
                className="input-field"
              />

            </div>

            {/* TIME */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Time
              </label>

              <select
                value={newApt.time}
                onChange={e =>
                  setNewApt({
                    ...newApt,
                    time: e.target.value,
                  })
                }
                className="input-field"
              >

                {[
                  '09:00 AM',
                  '10:00 AM',
                  '10:30 AM',
                  '11:00 AM',
                  '11:30 AM',
                  '01:00 PM',
                  '02:00 PM',
                  '03:00 PM',
                  '04:00 PM',
                ].map(time => (
                  <option
                    key={time}
                    value={time}
                  >
                    {time}
                  </option>
                ))}

              </select>

            </div>

          </div>

          {/* ==================================================
              REASON
          ================================================== */}

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason
            </label>

            <input
              value={newApt.reason}
              onChange={e =>
                setNewApt({
                  ...newApt,
                  reason: e.target.value,
                })
              }
              className="input-field"
              placeholder="Reason for visit"
            />

          </div>

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="flex justify-end gap-3 pt-2">

            <button
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              className="btn-primary"
              disabled={!newApt.patientId || !newApt.date}
            >
              Schedule
            </button>

          </div>

        </div>

      </Modal>

    </div>
  );
}