import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { SectionCard, AIBadge } from '@/components/ui/KPICard';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { FileText, Plus, Upload, Brain, Eye, FileCheck, Search } from 'lucide-react';
import type { Document } from '@/types';

export function DocumentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);

  const canUpload = user?.role === 'doctor' || user?.role === 'lab' || user?.role === 'admin';

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading label="Loading documents..." />;
  if (error) return <ErrorState message={error} onRetry={loadDocuments} />;

  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.patientName.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerateSummary = (doc: Document) => {
    setGeneratingSummary(doc.id);
    setTimeout(() => {
      setDocuments(docs => docs.map(d =>
        d.id === doc.id ? {
          ...d,
          status: 'AI Summary Available',
          aiSummary: `This document contains a ${d.type.toLowerCase()} for patient ${d.patientName}. The AI workflow agent has analyzed the document content. The assigned healthcare professional may need to review this document for clinical correlation and workflow action.`,
          workflowAction: 'Doctor Review Required',
        } : d
      ));
      setGeneratingSummary(null);
    }, 1500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents & Reports</h1>
          <p className="text-sm text-slate-500 mt-1">{documents.length} documents</p>
        </div>
        {canUpload && (
          <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search documents by name or patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No documents found" description="Upload a document to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <div key={doc.id} className="card card-hover p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{doc.patientName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <StatusBadge type={getStatusType(doc.status)}>{doc.status}</StatusBadge>
                <span className="text-xs text-slate-400">{doc.type}</span>
              </div>

              <div className="text-xs text-slate-500 space-y-1 mb-3">
                <p>Uploaded by: <span className="text-slate-700 font-medium">{doc.uploadedBy}</span></p>
                <p>Date: <span className="text-slate-700 font-medium">{doc.date}</span></p>
                {doc.size && <p>Size: <span className="text-slate-700 font-medium">{doc.size}</span></p>}
              </div>

              {doc.aiSummary && (
                <div className="p-3 rounded-lg bg-violet-50 border border-violet-100 mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Brain className="w-3.5 h-3.5 text-violet-600" />
                    <span className="text-xs font-semibold text-violet-700">AI Workflow Summary</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{doc.aiSummary}</p>
                  <div className="mt-2">
                    <AIBadge />
                  </div>
                </div>
              )}

              {doc.workflowAction && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {doc.workflowAction}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setViewDoc(doc)} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                {!doc.aiSummary && user?.role === 'doctor' && (
                  <button
                    onClick={() => handleGenerateSummary(doc)}
                    disabled={generatingSummary === doc.id}
                    className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
                  >
                    {generatingSummary === doc.id ? (
                      <><Brain className="w-3.5 h-3.5 animate-pulse" /> Generating...</>
                    ) : (
                      <><Brain className="w-3.5 h-3.5" /> AI Summary</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Document Modal */}
      <Modal open={!!viewDoc} onClose={() => setViewDoc(null)} title={viewDoc?.name || 'Document'} size="lg">
        {viewDoc && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Patient</p>
                <p className="text-sm font-medium text-slate-700">{viewDoc.patientName}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Type</p>
                <p className="text-sm font-medium text-slate-700">{viewDoc.type}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Uploaded By</p>
                <p className="text-sm font-medium text-slate-700">{viewDoc.uploadedBy}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Date</p>
                <p className="text-sm font-medium text-slate-700">{viewDoc.date}</p>
              </div>
            </div>
            {viewDoc.aiSummary && (
              <div className="p-4 rounded-lg bg-violet-50 border border-violet-100">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-semibold text-violet-700">AI Workflow Summary</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{viewDoc.aiSummary}</p>
                <div className="mt-3">
                  <AIBadge />
                </div>
              </div>
            )}
            <div className="p-4 rounded-lg border-2 border-dashed border-slate-200 text-center">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Document preview would appear here in production.</p>
              <p className="text-xs text-slate-400 mt-1">Secure document viewer with access-controlled rendering.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Document" size="md">
        <div className="space-y-4">
          <div className="p-6 rounded-lg border-2 border-dashed border-slate-300 text-center">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Drag and drop a file here, or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Name</label>
            <input className="input-field" placeholder="e.g. CBC_Report_Patient.pdf" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Type</label>
            <select className="input-field">
              <option>Lab Report</option>
              <option>Prescription</option>
              <option>Medical Record</option>
              <option>Imaging</option>
              <option>Referral</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowUpload(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => setShowUpload(false)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
