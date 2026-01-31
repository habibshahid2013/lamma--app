'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, orderBy, limit, getDocs, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function PipelinePage() {
  const { user, userData } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Real-time listener for top 50 jobs
    const q = query(
      collection(db, 'creator_queue'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(items);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleRetry = async (jobId: string) => {
      if (!confirm('Retry this job?')) return;
      try {
          await updateDoc(doc(db, 'creator_queue', jobId), {
              status: 'pending',
              error: null,
              createdAt: new Date(), // Bump to top of queue
          });
          
          // Trigger cron manually for immediate feedback
          fetch('/api/cron/process-queue');
          
      } catch (err) {
          alert('Failed to retry');
      }
  };

  if (!user || userData?.role !== 'admin') return <div className="p-8">🔒 Admin only</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏭 Pipeline Monitor</h1>
            <p className="text-gray-500">Real-time view of the AI Creator Factory</p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => fetch('/api/cron/process-queue')}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-mono text-sm"
             >
                ▶ Run Worker
             </button>
             <Link href="/admin/add-creator" className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-deep">
                + New Job
             </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Pending" value={jobs.filter(j => j.status === 'pending').length} color="bg-yellow-100 text-yellow-800" />
            <StatCard label="Processing" value={jobs.filter(j => j.status === 'processing').length} color="bg-blue-100 text-blue-800" />
            <StatCard label="Completed" value={jobs.filter(j => j.status === 'completed').length} color="bg-green-100 text-green-800" />
            <StatCard label="Failed" value={jobs.filter(j => j.status === 'failed').length} color="bg-red-100 text-red-800" />
        </div>

        {/* Job List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Started</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Result</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium">{job.name}</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={job.status} />
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-4">
                                {job.status === 'completed' ? (
                                    <Link href={`/creator/${job.result?.firestoreData?.slug}`} className="text-teal hover:underline block truncate max-w-[150px]">
                                        View Profile
                                    </Link>
                                ) : job.status === 'failed' ? (
                                    <span className="text-red-500 truncate block max-w-[200px]" title={job.error}>{job.error}</span>
                                ) : (
                                    <span className="text-gray-400 italic">Processing...</span>
                                )}
                            </td>
                             <td className="px-6 py-4">
                                {job.status === 'failed' && (
                                    <button onClick={() => handleRetry(job.id)} className="text-blue-600 hover:underline">Retry</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {jobs.length === 0 && !loading && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                No jobs in queue.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: any) {
    return (
        <div className={`p-4 rounded-xl border-l-4 ${color.replace('text', 'border')} bg-white shadow-sm`}>
            <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800 animate-pulse',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
}
