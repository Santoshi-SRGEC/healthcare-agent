import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Search, Plus, Users, Filter, ChevronRight, UserPlus } from 'lucide-react';
import type { Patient } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function PatientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Male', contact: '', email: '', emergencyContact: '', bloodGroup: '', address: '' });

  const canCreate = user?.role === 'receptionist' || user?.role === 'doctor' || user?.role === 'admin';

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

  const filtered = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.contact.includes(search);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    if (!newPatient.name || !newPatient.age || !newPatient.contact) return;
    try {
      const created = await api.createPatient({
        name: newPatient.name,
        age: parseInt(newPatient.age),
        gender: newPatient.gender as Patient['gender'],
        contact: newPatient.contact,
        email: newPatient.email,
        emergencyContact: newPatient.emergencyContact,
        bloodGroup: newPatient.bloodGroup,
        address: newPatient.address,
      });
      setPatients([...patients, created]);
      setShowAddModal(false);
      setNewPatient({ name: '', age: '', gender: 'Male', contact: '', email: '', emergencyContact: '', bloodGroup: '', address: '' });
    } catch {
      setError('Failed to create patient.');
    }
  };

  if (loading) return <PageLoading label="Loading patients..." />;
  if (error) return <ErrorState message={error} onRetry={loadPatients} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500 mt-1">{patients.length} registered patients</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Patient
          </button>
        )}
      </div>

      {/* Filters */}
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
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field pl-10 pr-8">
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No patients found" description="Try adjusting your search or filters, or add a new patient." />
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
                  <th className="table-header hidden md:table-cell">Last Visit</th>
                  <th className="table-header hidden lg:table-cell">Next Appointment</th>
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
                    <td className="table-cell font-mono text-xs text-slate-500">{p.id.toUpperCase()}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                          {p.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">{p.age}</td>
                    <td className="table-cell">{p.gender}</td>
                    <td className="table-cell text-slate-500">{p.contact}</td>
                    <td className="table-cell hidden md:table-cell text-slate-500">{p.lastVisit || '—'}</td>
                    <td className="table-cell hidden lg:table-cell text-slate-500">{p.nextAppointment || '—'}</td>
                    <td className="table-cell">
                      <StatusBadge type={getStatusType(p.status)} dot>{p.status}</StatusBadge>
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

      {/* Add Patient Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Register New Patient" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
              <input value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Age *</label>
              <input type="number" value={newPatient.age} onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })} className="input-field" placeholder="35" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
              <select value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })} className="input-field">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Blood Group</label>
              <select value={newPatient.bloodGroup} onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })} className="input-field">
                <option value="">Unknown</option>
                <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact *</label>
              <input value={newPatient.contact} onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })} className="input-field" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} className="input-field" placeholder="patient@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Emergency Contact</label>
              <input value={newPatient.emergencyContact} onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })} className="input-field" placeholder="+91 98765 11111" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <input value={newPatient.address} onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })} className="input-field" placeholder="123 Main St, City" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Register Patient
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
