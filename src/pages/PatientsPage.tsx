import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import {
  Search,
  Plus,
  Users,
  Filter,
  ChevronRight,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import type { Patient } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  validateName,
  validatePhone,
  validateEmail,
  validateAge,
} from '@/utils/validation';

export function PatientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    email: '',
    emergencyContact: '',
    bloodGroup: '',
    address: '',
  });

  /**
   * Only receptionist and admin can register patients.
   * Doctors can VIEW patients but cannot create them.
   */
  const canCreate =
    user?.role === 'receptionist' || user?.role === 'admin';

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch {
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.contact.includes(search);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setNewPatient({
      name: '',
      age: '',
      gender: 'Male',
      contact: '',
      email: '',
      emergencyContact: '',
      bloodGroup: '',
      address: '',
    });
    setFormError(null);
  };

  const validateForm = (): string | null => {
    const nameErr = validateName(newPatient.name);
    if (nameErr) return nameErr;

    const ageErr = validateAge(newPatient.age);
    if (ageErr) return ageErr;

    const phoneErr = validatePhone(newPatient.contact);
    if (phoneErr) return phoneErr;

    if (newPatient.email && newPatient.email.trim()) {
      const emailErr = validateEmail(newPatient.email);
      if (emailErr) return emailErr;
    }

    return null;
  };

  const handleCreate = async () => {
    setFormError(null);

    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createPatient({
        name: newPatient.name.trim(),
        age: parseInt(newPatient.age, 10),
        gender: newPatient.gender as Patient['gender'],
        contact: newPatient.contact.trim(),
        email: newPatient.email.trim() || undefined,
        emergencyContact: newPatient.emergencyContact.trim() || undefined,
        bloodGroup: newPatient.bloodGroup || undefined,
        address: newPatient.address.trim() || undefined,
      });
      setPatients([created, ...patients]);
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create patient.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoading label="Loading patients..." />;
  if (error) return <ErrorState message={error} onRetry={loadPatients} />;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500 mt-1">
            {patients.length} registered patients
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Patient
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field pl-10 pr-8"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description="Try adjusting your search or filters, or add a new patient."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-header">Patient ID</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Age</th>
                  <th className="table-header">Gender</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header hidden md:table-cell">
                    Last Visit
                  </th>
                  <th className="table-header hidden lg:table-cell">
                    Next Appointment
                  </th>
                  <th className="table-header">Status</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="table-row-hover cursor-pointer"
                  >
                    <td className="table-cell font-mono text-xs text-slate-500">
                      {p.id.toUpperCase()}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                          {p.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">{p.age}</td>
                    <td className="table-cell">{p.gender}</td>
                    <td className="table-cell text-slate-500">{p.contact}</td>
                    <td className="table-cell hidden md:table-cell text-slate-500">
                      {p.lastVisit || '—'}
                    </td>
                    <td className="table-cell hidden lg:table-cell text-slate-500">
                      {p.nextAppointment || '—'}
                    </td>
                    <td className="table-cell">
                      <StatusBadge type={getStatusType(p.status)} dot>
                        {p.status}
                      </StatusBadge>
                    </td>
                    <td className="table-cell">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD PATIENT MODAL — only rendered for allowed roles */}
      {canCreate && (
        <Modal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          title="Register New Patient"
          size="lg"
        >
          <div className="space-y-4">
            {/* SERVER ERROR */}
            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  value={newPatient.name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, name: e.target.value })
                  }
                  className="input-field"
                  placeholder="John Doe"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={newPatient.age}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, age: e.target.value })
                  }
                  className="input-field"
                  placeholder="35"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  value={newPatient.gender}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, gender: e.target.value })
                  }
                  className="input-field"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Blood Group
                </label>
                <select
                  value={newPatient.bloodGroup}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      bloodGroup: e.target.value,
                    })
                  }
                  className="input-field"
                >
                  <option value="">Unknown</option>
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contact <span className="text-rose-500">*</span>
                </label>
                <input
                  value={newPatient.contact}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, contact: e.target.value })
                  }
                  className="input-field"
                  placeholder="+91 98765 43210"
                  maxLength={15}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, email: e.target.value })
                  }
                  className="input-field"
                  placeholder="patient@email.com"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Emergency Contact
                </label>
                <input
                  value={newPatient.emergencyContact}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      emergencyContact: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="+91 98765 11111"
                  maxLength={15}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Address
                </label>
                <input
                  value={newPatient.address}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, address: e.target.value })
                  }
                  className="input-field"
                  placeholder="123 Main St, City"
                  maxLength={500}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
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
                className="btn-primary flex items-center gap-2"
                disabled={
                  submitting ||
                  !newPatient.name.trim() ||
                  !newPatient.age ||
                  !newPatient.contact.trim()
                }
              >
                <UserPlus className="w-4 h-4" />
                {submitting ? 'Registering...' : 'Register Patient'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}