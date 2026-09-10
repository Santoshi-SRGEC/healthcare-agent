import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { CalendarDays, Plus, Clock, Calendar, AlertCircle } from 'lucide-react';
import type { Appointment, Patient } from '@/types';

export function AppointmentsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const [newApt, setNewApt] = useState({
    patientId: '',
    doctorName: 'Dr. James Patel',
    department: 'General Medicine',
    date: '',
    time: '09:00 AM',
    reason: '',
  });

  const canCreate = user?.role === 'receptionist' || user?.role === 'doctor';

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
      const data = await api.getPatients();
      setPatients(data);
    } catch {
      setError('Failed to load patients.');
    }
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setNewApt({
      patientId: '',
      doctorName: 'Dr. James Patel',
      department: 'General Medicine',
      date: '',
      time: '09:00 AM',
      reason: '',
    });
    setFormError(null);
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = (): string | null => {
    if (!newApt.patientId) return 'Please select a patient';
    if (!newApt.date) return 'Please select a date';
    if (!newApt.doctorName) return 'Please select a doctor';
    if (!newApt.department) return 'Please select a department';

    // Date must not be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(newApt.date + 'T00:00:00');
    if (isNaN(chosen.getTime())) return 'Invalid date';
    if (chosen < today) return 'Appointment date cannot be in the past';

    return null;
  };

  // ============================================================
  // CREATE APPOINTMENT
  // ============================================================

  const handleCreate = async () => {
    setFormError(null);

    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }

    const patient = patients.find((p) => p.id === newApt.patientId);

    setSubmitting(true);
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

      setAppointments((prev) => [...prev, created]);
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // CANCEL APPOINTMENT
  // ============================================================

  const handleCancel = async (id: string) => {
    try {
      await api.updateAppointment(id, { status: 'Cancelled' });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a))
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel appointment.');
    }
  };

  // ============================================================
  // LOADING / ERROR SCREENS
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
  // FILTER + GROUP
  // ============================================================

  const filtered =
    filter === 'all'
      ? appointments
      : appointments.filter((a) => a.status === filter);

  const grouped = filtered.reduce((acc, apt) => {
    if (!acc[apt.date]) acc[apt.date] = [];
    acc[apt.date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(grouped).sort();

  // Today's date in YYYY-MM-DD for min attr
  const todayStr = new Date().toISOString().split('T')[0];

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-5 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">
            {appointments.length} total appointments
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Appointment
          </button>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map((f) => (
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

      {/* LIST */}
      {sortedDates.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No appointments found"
          description="Try a different filter or schedule a new appointment."
        />
      ) : (
        <div className="space-y-5">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-slate-700">
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <span className="text-xs text-slate-400">
                  ({grouped[date].length} appointment
                  {grouped[date].length > 1 ? 's' : ''})
                </span>
              </div>

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
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-brand-50 text-brand-700 flex-shrink-0">
                      <Clock className="w-4 h-4 mb-0.5" />
                      <span className="text-xs font-semibold">{apt.time}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {apt.patientName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {apt.doctorName} · {apt.department}
                      </p>
                      {apt.reason && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {apt.reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge type={getStatusType(apt.status)} dot>
                        {apt.status}
                      </StatusBadge>

                      {canCreate &&
                        apt.status !== 'Completed' &&
                        apt.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancel(apt.id)}
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

      {/* MODAL */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Schedule New Appointment"
        size="md"
      >
        <div className="space-y-4">
          {/* SERVER ERROR */}
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* PATIENT */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Patient <span className="text-rose-500">*</span>
            </label>
            <select
              value={newApt.patientId}
              onChange={(e) =>
                setNewApt({ ...newApt, patientId: e.target.value })
              }
              className="input-field"
            >
              <option value="">Select patient...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
            {patients.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No patients available. Add a patient first.
              </p>
            )}
          </div>

          {/* DOCTOR */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Doctor <span className="text-rose-500">*</span>
            </label>
            <select
              value={newApt.doctorName}
              onChange={(e) =>
                setNewApt({ ...newApt, doctorName: e.target.value })
              }
              className="input-field"
            >
              <option>Dr. James Patel</option>
              <option>Dr. Emily Ross</option>
              <option>Dr. Meera Sharma</option>
              <option>Dr. Arjun Patel</option>
            </select>
          </div>

          {/* DEPARTMENT */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={newApt.department}
              onChange={(e) =>
                setNewApt({ ...newApt, department: e.target.value })
              }
              className="input-field"
            >
              <option>General Medicine</option>
              <option>Cardiology</option>
              <option>Neurology</option>
              <option>Orthopedics</option>
              <option>Pediatrics</option>
            </select>
          </div>

          {/* DATE + TIME */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={newApt.date}
                onChange={(e) =>
                  setNewApt({ ...newApt, date: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Time
              </label>
              <select
                value={newApt.time}
                onChange={(e) =>
                  setNewApt({ ...newApt, time: e.target.value })
                }
                className="input-field"
              >
                {[
                  '09:00 AM',
                  '09:30 AM',
                  '10:00 AM',
                  '10:30 AM',
                  '11:00 AM',
                  '11:30 AM',
                  '12:00 PM',
                  '01:00 PM',
                  '02:00 PM',
                  '03:00 PM',
                  '04:00 PM',
                  '05:00 PM',
                ].map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* REASON */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason
            </label>
            <input
              value={newApt.reason}
              onChange={(e) =>
                setNewApt({ ...newApt, reason: e.target.value })
              }
              className="input-field"
              placeholder="Reason for visit"
              maxLength={500}
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="btn-primary"
              disabled={submitting || !newApt.patientId || !newApt.date}
            >
              {submitting ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}