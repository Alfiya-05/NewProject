'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, ShieldAlert } from 'lucide-react';

interface RegRequest {
  _id: string;
  name: string;
  email: string;
  role: 'lawyer' | 'judge';
  licenseNumber: string;
  mobile: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RegRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/requests');
      setRequests(res.data.requests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    try {
      await api.post(`/admin/requests/${id}/${action}`);
      await fetchRequests(); // Refresh list
    } catch (e) {
      console.error(`${action} failed`, e);
      alert(`Failed to ${action} request`);
    } finally {
      setProcessing(null);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (loading) return <div className="p-8 text-center text-navy/50 font-bold uppercase"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading Requests</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Professional Registrations</h1>
        <p className="text-sm text-navy/60 font-bold uppercase tracking-wider mt-1">Pending Approval Queue</p>
      </div>

      {pendingRequests.length === 0 ? (
        <Card className="border-dashed border-navy/10 bg-navy/5">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <ShieldAlert className="h-10 w-10 text-navy/20 mb-3" />
            <p className="text-navy/40 font-bold uppercase tracking-widest text-sm">No Pending Requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingRequests.map(req => (
            <Card key={req._id} className="glass-card hover:shadow-lg transition-all border-l-4 border-l-saffron">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-navy text-lg leading-none">{req.name}</h3>
                    <span className="px-2 py-0.5 bg-navy/5 rounded-full text-[10px] font-black uppercase tracking-widest text-navy/60">
                      {req.role}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1 text-xs text-navy/70 mt-2">
                    <p><span className="font-bold text-navy/40 uppercase">Email:</span> {req.email}</p>
                    <p><span className="font-bold text-navy/40 uppercase">Phone:</span> {req.mobile}</p>
                    <p><span className="font-bold text-navy/40 uppercase">License:</span> <span className="font-mono text-xs">{req.licenseNumber}</span></p>
                    <p><span className="font-bold text-navy/40 uppercase">Applied:</span> {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={processing === req._id}
                    onClick={() => handleAction(req._id, 'reject')}
                  >
                    {processing === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4 mr-1" /> Reject</>}
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-gov-green hover:bg-gov-green/90 text-white"
                    disabled={processing === req._id}
                    onClick={() => handleAction(req._id, 'approve')}
                  >
                    {processing === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Verify & Approve</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {requests.filter(r => r.status !== 'pending').length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-bold text-navy/40 uppercase tracking-widest mb-4">Past Decisions</h3>
          <div className="grid gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
            {requests.filter(r => r.status !== 'pending').map(req => (
              <div key={req._id} className="flex justify-between items-center text-xs p-3 glass-panel rounded-lg">
                <div>
                  <span className="font-bold text-navy">{req.name} ({req.role})</span> — {req.email}
                </div>
                <div className={`font-bold uppercase tracking-widest ${req.status === 'approved' ? 'text-gov-green' : 'text-red-600'}`}>
                  {req.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
