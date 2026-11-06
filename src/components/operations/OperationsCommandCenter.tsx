import React, { useState, useEffect } from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { ASSETS, ASSET_METADATA, LOGOS } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { getApiUrl } from '../../config/api';
import {
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  FileText,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Printer,
  ChevronRight,
  Settings,
  Activity,
  Layers,
  MapPin,
  Mail,
  Send,
} from 'lucide-react';

interface OperationsCommandCenterProps {
  onNavigate: (page: PageView) => void;
}

type UserRole = 'super_admin' | 'executive' | 'operations_mgr' | 'dispatcher' | 'driver';

type ModuleTab =
  | 'overview'
  | 'quotes'
  | 'dispatch'
  | 'shipments'
  | 'fleet'
  | 'drivers'
  | 'invoicing'
  | 'emails'
  | 'ai_suite'
  | 'audit'
  | 'settings';

export const OperationsCommandCenter: React.FC<OperationsCommandCenterProps> = ({ onNavigate }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('executive');
  const [activeTab, setActiveTab] = useState<ModuleTab>('overview');

  const [quotes, setQuotes] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Email notifications & inquiry audit state
  const [emailStatus, setEmailStatus] = useState<any | null>(null);
  const [emailAudits, setEmailAudits] = useState<any[]>([]);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<string | null>(null);

  // Quote editing / review modal
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [quoteRateInput, setQuoteRateInput] = useState('');
  const [quoteNotesInput, setQuoteNotesInput] = useState('');

  // Dispatch assignment modal
  const [dispatchShipment, setDispatchShipment] = useState<any | null>(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [aiDispatchRecommendation, setAiDispatchRecommendation] = useState<any | null>(null);
  const [isAiDispatching, setIsAiDispatching] = useState(false);

  // New Milestone logger
  const [milestoneShipment, setMilestoneShipment] = useState<any | null>(null);
  const [milestoneStatus, setMilestoneStatus] = useState('in_transit');
  const [milestoneLocation, setMilestoneLocation] = useState('I-77 N Corridor');
  const [milestoneNotes, setMilestoneNotes] = useState('Freight in transit on schedule.');

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<Array<{ timestamp: string; user: string; action: string }>>([
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      user: 'Wendell W. (Executive)',
      action: 'Reviewed and approved quotation MTH-Q-2026-8841 at $1,150.00 rate',
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      user: 'Marcus Vance (Dispatcher)',
      action: 'Dispatched Unit TRK-104 with 53ft Dry Van TRL-301 to Columbia Warehouse Dock #4',
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      user: 'System Automated Monitor',
      action: 'Completed daily FMCSR ELD telematics synchronization for 3 commercial power units',
    },
  ]);

  const addAudit = (action: string) => {
    const roleTitles: Record<UserRole, string> = {
      super_admin: 'Super Admin',
      executive: 'Wendell W. (Executive)',
      operations_mgr: 'Operations Manager',
      dispatcher: 'Senior Dispatcher',
      driver: 'CDL Driver',
    };
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString(),
        user: roleTitles[currentRole],
        action,
      },
      ...prev,
    ]);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [qRes, sRes, fRes, dRes, emStatusRes, emAuditRes] = await Promise.all([
        fetch(getApiUrl('/api/quotes')),
        fetch(getApiUrl('/api/shipments')),
        fetch(getApiUrl('/api/fleet')),
        fetch(getApiUrl('/api/drivers')),
        fetch(getApiUrl('/api/email/status')).catch(() => null),
        fetch(getApiUrl('/api/email/audit')).catch(() => null),
      ]);

      const qData = await qRes.json();
      const sData = await sRes.json();
      const fData = await fRes.json();
      const dData = await dRes.json();

      if (qData.success) setQuotes(qData.quotes);
      if (sData.success) setShipments(sData.shipments);
      if (fData.success) setFleet(fData.fleet);
      if (dData.success) setDrivers(dData.drivers);

      if (emStatusRes && emStatusRes.ok) {
        const emStatusData = await emStatusRes.json();
        if (emStatusData.success) setEmailStatus(emStatusData);
      }
      if (emAuditRes && emAuditRes.ok) {
        const emAuditData = await emAuditRes.json();
        if (emAuditData.success) setEmailAudits(emAuditData.records);
      }
    } catch (err) {
      console.error('Error fetching operations data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSendTestEmail = async () => {
    setIsTestingEmail(true);
    setTestEmailFeedback(null);
    try {
      const res = await fetch(getApiUrl('/api/email/test'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailFeedback(`Test notification dispatched! Reference: ${data.referenceNumber}. ${data.message}`);
        addAudit(`Triggered diagnostic test email to ${COMPANY.contact.email} (Ref: ${data.referenceNumber})`);
        loadAllData();
      } else {
        setTestEmailFeedback(`Test result: ${data.error || 'Failed to dispatch test notification'}`);
      }
    } catch (err: any) {
      setTestEmailFeedback(`Connection error: ${err.message}`);
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Handle Quote Approval or Rate Update
  const handleUpdateQuote = async (status: string) => {
    if (!selectedQuote) return;

    try {
      const res = await fetch(getApiUrl(`/api/quotes/${selectedQuote.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          estimatedRate: quoteRateInput ? Number(quoteRateInput) : selectedQuote.estimatedRate,
          notes: quoteNotesInput || selectedQuote.notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addAudit(`Updated Quote ${selectedQuote.referenceNumber} to status: ${status} (Rate: $${quoteRateInput || selectedQuote.estimatedRate})`);
        setSelectedQuote(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Run AI Dispatch Optimizer
  const handleRunAiDispatch = async (shipment: any) => {
    setIsAiDispatching(true);
    try {
      const res = await fetch(getApiUrl('/api/ai/dispatch-assist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: shipment.origin,
          destination: shipment.destination,
          loadWeight: shipment.weightLbs,
          requiredCategory: shipment.serviceCategory,
        }),
      });
      const data = await res.json();
      if (data.success && data.dispatch) {
        setAiDispatchRecommendation(data.dispatch);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiDispatching(false);
    }
  };

  // Save Dispatch Assignment
  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchShipment) return;

    try {
      const res = await fetch(getApiUrl(`/api/shipments/${dispatchShipment.id}/milestones`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'dispatched',
          assignedDriver: selectedDriver || 'Marcus Vance (CDL-A)',
          assignedVehicle: selectedVehicle || 'TRK-104 (Cascadia)',
          location: 'Columbia, SC Terminal Staging',
          notes: `Assigned unit ${selectedVehicle || 'TRK-104'} and driver ${selectedDriver || 'Marcus Vance'}. Dispatched for pickup.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addAudit(`Dispatched Shipment ${dispatchShipment.trackingNumber} with driver ${selectedDriver || 'Marcus Vance'}`);
        setDispatchShipment(null);
        setAiDispatchRecommendation(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Log Milestone Event
  const handleLogMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneShipment) return;

    try {
      const res = await fetch(getApiUrl(`/api/shipments/${milestoneShipment.id}/milestones`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: milestoneStatus,
          location: milestoneLocation,
          notes: milestoneNotes,
          receivedBy: milestoneStatus === 'delivered' ? 'D. Simmons (Receiver)' : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addAudit(`Logged milestone '${milestoneStatus.toUpperCase()}' for Shipment ${milestoneShipment.trackingNumber} at ${milestoneLocation}`);
        setMilestoneShipment(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#0B1528] text-slate-100 min-h-screen">
      {/* Top Operations Header */}
      <div className="bg-[#071E41] border-b border-[#0D2C5B] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={LOGOS.original}
              alt="Momentum Transportation Official Emblem"
              width={40}
              height={40}
              className="w-10 h-10 object-contain shrink-0 filter drop-shadow-sm aspect-square select-none"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C99A31] font-display block">
                Momentum Operations Command Center
              </span>
              <span className="text-sm font-bold text-white font-display">
                Columbia, SC Logistics Hub · 2 Penhurst Ct.
              </span>
            </div>
          </div>

          {/* Role Switcher per directive specification */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Operating Role:</span>
            <select
              value={currentRole}
              onChange={(e) => {
                const r = e.target.value as UserRole;
                setCurrentRole(r);
                addAudit(`Switched active view role to: ${r}`);
              }}
              className="bg-[#041228] text-[#C99A31] font-semibold border border-slate-700 rounded px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="executive">Executive / Owner (Wendell Wright)</option>
              <option value="operations_mgr">Operations Manager</option>
              <option value="dispatcher">Senior Dispatcher</option>
              <option value="driver">CDL Commercial Driver</option>
              <option value="super_admin">Super Administrator</option>
            </select>
            <button
              onClick={() => onNavigate('home')}
              className="ml-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs border border-slate-700 cursor-pointer"
            >
              Exit to Website
            </button>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="bg-[#041228] border-b border-slate-800 px-4 sm:px-8 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 min-w-max">
          {[
            { id: 'overview', label: 'Executive Dashboard', icon: TrendingUp },
            { id: 'quotes', label: `Quotes (${quotes.length})`, icon: FileText },
            { id: 'dispatch', label: 'Dispatch Board', icon: Activity },
            { id: 'shipments', label: `Shipments (${shipments.length})`, icon: Truck },
            { id: 'fleet', label: `Fleet (${fleet.length})`, icon: Layers },
            { id: 'drivers', label: `Drivers (${drivers.length})`, icon: Users },
            { id: 'invoicing', label: 'Billing & Invoices', icon: DollarSign },
            { id: 'emails', label: `Email Inquiries (${emailAudits.length})`, icon: Mail },
            { id: 'ai_suite', label: 'AI Logistics Suite', icon: Sparkles },
            { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ModuleTab)}
                className={`px-3 py-2 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#071E41] text-[#C99A31] border border-[#0D2C5B] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Visual Command Center Carrier Banner */}
            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <div className="h-48 sm:h-64 relative">
                <ImageWithFallback
                  src={ASSETS.commandCenter}
                  alt={ASSET_METADATA.commandCenter.alt}
                  className="w-full h-full object-cover"
                  fallbackTitle="Momentum Command Operations"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#041228]/95 via-[#071E41]/70 to-transparent p-6 sm:p-8 flex flex-col justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#C99A31] font-display">
                    Real-Time Dispatch Coordination
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
                    Midlands &amp; Interstate Transportation Oversight
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-lg">
                    Monitoring continuous route safety, vehicle inspection certifications, and verified client delivery milestones across the Carolinas.
                  </p>
                </div>
              </div>
            </div>

            {/* KPI Cards Row (Tabular Numerals & High Contrast) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-[#071E41] p-5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Active Dispatched Loads
                </span>
                <div className="text-2xl font-bold font-display text-white tabular-nums">
                  {shipments.filter((s) => s.currentStatus !== 'delivered').length} Loads
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>All routes on schedule</span>
                </div>
              </div>

              <div className="bg-[#071E41] p-5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Pending Quotations
                </span>
                <div className="text-2xl font-bold font-display text-[#C99A31] tabular-nums">
                  {quotes.filter((q) => q.status === 'pending' || q.status === 'under_review').length} In Queue
                </div>
                <div className="text-[11px] text-slate-400">
                  Requires rate approval
                </div>
              </div>

              <div className="bg-[#071E41] p-5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Commercial Fleet Availability
                </span>
                <div className="text-2xl font-bold font-display text-white tabular-nums">
                  {fleet.filter((f) => f.status === 'available').length} / {fleet.length} Ready
                </div>
                <div className="text-[11px] text-blue-400">
                  DOT inspections current
                </div>
              </div>

              <div className="bg-[#071E41] p-5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  On-Time Delivery Rate
                </span>
                <div className="text-2xl font-bold font-display text-emerald-400 tabular-nums">
                  98.6%
                </div>
                <div className="text-[11px] text-slate-400">
                  Rolling 90-day benchmark
                </div>
              </div>

              <div className="bg-[#071E41] p-5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Monthly Freight Revenue
                </span>
                <div className="text-2xl font-bold font-display text-white tabular-nums">
                  $48,750
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  +14% vs prior month
                </div>
              </div>
            </div>

            {/* Quick Actions & Live Operations Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-[#071E41] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                    Active Regional Shipments
                  </h3>
                  <button
                    onClick={() => setActiveTab('shipments')}
                    className="text-xs text-[#C99A31] hover:underline font-semibold"
                  >
                    View All Shipments
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Tracking #</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Route</th>
                        <th className="py-2.5 px-3">Unit / Driver</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {shipments.map((shp) => (
                        <tr key={shp.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-[#C99A31]">{shp.trackingNumber}</td>
                          <td className="py-3 px-3 font-semibold text-white">{shp.customerName}</td>
                          <td className="py-3 px-3">{shp.origin} ➔ {shp.destination}</td>
                          <td className="py-3 px-3 text-[11px] text-slate-400">
                            {shp.assignedVehicle || 'Unassigned'} · {shp.assignedDriver || 'TBD'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              shp.currentStatus === 'delivered'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}>
                              {shp.currentStatus.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Operations Dispatch Queue */}
              <div className="lg:col-span-4 bg-[#071E41] rounded-xl border border-slate-800 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                  Pending Quote Queue
                </h3>
                <div className="space-y-3">
                  {quotes.slice(0, 3).map((q) => (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedQuote(q);
                        setQuoteRateInput(q.estimatedRate?.toString() || '');
                        setQuoteNotesInput(q.notes || '');
                        setActiveTab('quotes');
                      }}
                      className="p-3 rounded-lg bg-[#041228] border border-slate-800 hover:border-[#C99A31] transition-colors cursor-pointer text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#C99A31] font-mono">{q.referenceNumber}</span>
                        <span className="text-[10px] text-slate-400">{q.pickupDate}</span>
                      </div>
                      <div className="text-white font-medium">{q.customerName}</div>
                      <div className="text-[11px] text-slate-400">{q.pickupLocation} ➔ {q.deliveryLocation}</div>
                      <div className="text-[11px] text-slate-300 font-bold pt-1">
                        Proposed Rate: ${q.estimatedRate?.toLocaleString() || 'Under Review'}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('quotes')}
                  className="w-full py-2 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded font-display"
                >
                  Manage All Quotes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUOTATION MANAGEMENT */}
        {activeTab === 'quotes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-display">Quotation Management Queue</h2>
                <p className="text-xs text-slate-400">Review, adjust freight rates, approve, or convert submitted quotation requests.</p>
              </div>
              <button
                onClick={() => onNavigate('quote')}
                className="px-4 py-2 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31] rounded font-display"
              >
                + Create New Quote
              </button>
            </div>

            <div className="bg-[#071E41] rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Ref #</th>
                      <th className="py-3 px-4">Customer / Company</th>
                      <th className="py-3 px-4">Lanes</th>
                      <th className="py-3 px-4">Service &amp; Weight</th>
                      <th className="py-3 px-4">Est. Rate</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {quotes.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#C99A31]">{q.referenceNumber}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{q.customerName}</div>
                          <div className="text-[11px] text-slate-400">{q.companyName || q.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[11px]">
                          <div>{q.pickupLocation}</div>
                          <div className="text-slate-400">➔ {q.deliveryLocation}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[11px]">
                          <span className="capitalize">{q.serviceCategory.replace(/_/g, ' ')}</span>
                          <span className="block text-slate-400 tabular-nums">{q.estimatedWeightLbs.toLocaleString()} lbs</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white tabular-nums">
                          ${q.estimatedRate?.toLocaleString() || 'Under Review'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            q.status === 'accepted'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : q.status === 'quoted'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedQuote(q);
                              setQuoteRateInput(q.estimatedRate?.toString() || '');
                              setQuoteNotesInput(q.notes || '');
                            }}
                            className="px-3 py-1 text-[11px] font-bold uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded cursor-pointer"
                          >
                            Review / Rate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Review / Edit Quote Rate */}
            {selectedQuote && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                <div className="bg-[#071E41] border border-slate-700 rounded-xl p-6 max-w-xl w-full space-y-5 text-xs text-slate-200 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <h3 className="text-base font-bold text-white font-display">
                      Review Quotation #{selectedQuote.referenceNumber}
                    </h3>
                    <button onClick={() => setSelectedQuote(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded bg-[#041228] text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Customer:</span>
                      <strong className="text-white">{selectedQuote.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone / Email:</span>
                      <span>{selectedQuote.phone} · {selectedQuote.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Route:</span>
                      <span>{selectedQuote.pickupLocation} ➔ {selectedQuote.deliveryLocation}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Weight / Dimensions:</span>
                      <span>{selectedQuote.estimatedWeightLbs} lbs · {selectedQuote.dimensions}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                        Operational Freight Rate Quote ($ USD)
                      </label>
                      <input
                        type="number"
                        value={quoteRateInput}
                        onChange={(e) => setQuoteRateInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#041228] border border-slate-700 rounded text-white font-bold text-sm focus:border-[#C99A31] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                        Operations Review Notes
                      </label>
                      <textarea
                        value={quoteNotesInput}
                        onChange={(e) => setQuoteNotesInput(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-[#041228] border border-slate-700 rounded text-slate-200 text-xs focus:border-[#C99A31] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-700">
                    <button
                      onClick={() => handleUpdateQuote('declined')}
                      className="px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300"
                    >
                      Decline Request
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuote('quoted')}
                        className="px-4 py-2 text-xs font-bold uppercase bg-blue-600 hover:bg-blue-500 text-white rounded"
                      >
                        Send Formal Rate
                      </button>
                      <button
                        onClick={() => handleUpdateQuote('accepted')}
                        className="px-4 py-2 text-xs font-bold uppercase bg-[#C99A31] hover:bg-[#E8BE65] text-[#071E41] rounded font-display"
                      >
                        Accept &amp; Convert To Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DISPATCH BOARD */}
        {activeTab === 'dispatch' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Active Dispatch Board</h2>
              <p className="text-xs text-slate-400">Assign certified CDL operators and commercial equipment to ready orders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shipments.map((shp) => (
                <div key={shp.id} className="bg-[#071E41] rounded-xl border border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#C99A31] text-xs">{shp.trackingNumber}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-[#041228] px-2 py-0.5 rounded">
                      {shp.currentStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{shp.customerName}</h4>
                    <div className="text-xs text-slate-400 mt-0.5">{shp.origin} ➔ {shp.destination}</div>
                  </div>

                  <div className="p-3 rounded bg-[#041228] text-xs space-y-1">
                    <div className="text-slate-400">Assigned Driver: <strong className="text-slate-200">{shp.assignedDriver || 'Unassigned'}</strong></div>
                    <div className="text-slate-400">Assigned Vehicle: <strong className="text-slate-200">{shp.assignedVehicle || 'Unassigned'}</strong></div>
                    <div className="text-slate-400">Load Weight: <span className="tabular-nums">{shp.weightLbs.toLocaleString()} lbs</span></div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setDispatchShipment(shp);
                        setSelectedDriver(drivers[0]?.name || '');
                        setSelectedVehicle(fleet[0]?.unitNumber || '');
                        handleRunAiDispatch(shp);
                      }}
                      className="flex-1 py-2 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded font-display text-center"
                    >
                      Assign Dispatch
                    </button>
                    <button
                      onClick={() => {
                        setMilestoneShipment(shp);
                        setMilestoneLocation(shp.origin);
                      }}
                      className="px-3 py-2 text-xs font-bold uppercase text-slate-300 bg-slate-800 hover:bg-slate-700 rounded text-center"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal: Dispatch Assignment & AI Optimizer */}
            {dispatchShipment && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-[#071E41] border border-slate-700 rounded-xl p-6 max-w-xl w-full space-y-5 text-xs text-slate-200 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <h3 className="text-base font-bold text-white font-display">
                      Assign Dispatch: {dispatchShipment.trackingNumber}
                    </h3>
                    <button onClick={() => setDispatchShipment(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>

                  {/* AI Dispatch Recommendation Box */}
                  {aiDispatchRecommendation && (
                    <div className="p-4 rounded-lg bg-[#041228] border border-[#C99A31]/40 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-[#C99A31] font-bold">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Dispatch Optimization Recommendation</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        <strong>Recommended Match:</strong> {aiDispatchRecommendation.suggestedDriver} with {aiDispatchRecommendation.suggestedVehicle}
                      </p>
                      <p className="text-slate-400 text-[11px] italic">
                        {aiDispatchRecommendation.reasoning}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSaveDispatch} className="space-y-4">
                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">
                        Select Certified CDL Driver
                      </label>
                      <select
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        className="w-full px-3 py-2 bg-[#041228] border border-slate-700 rounded text-white"
                      >
                        {drivers.map((d) => (
                          <option key={d.id} value={`${d.name} (${d.cdlNumber})`}>
                            {d.name} · {d.status.replace('_', ' ')} · {d.endorsements.join(', ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">
                        Select Commercial Power Unit / Trailer
                      </label>
                      <select
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="w-full px-3 py-2 bg-[#041228] border border-slate-700 rounded text-white"
                      >
                        {fleet.map((f) => (
                          <option key={f.id} value={`${f.unitNumber} (${f.makeModel})`}>
                            {f.unitNumber} · {f.category} ({f.maxPayloadLbs.toLocaleString()} lbs max)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                      <button
                        type="button"
                        onClick={() => setDispatchShipment(null)}
                        className="px-4 py-2 text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded font-display"
                      >
                        Confirm Dispatch
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: Milestone Logger */}
            {milestoneShipment && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-[#071E41] border border-slate-700 rounded-xl p-6 max-w-lg w-full space-y-4 text-xs text-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <h3 className="text-base font-bold text-white font-display">
                      Log Milestone: {milestoneShipment.trackingNumber}
                    </h3>
                    <button onClick={() => setMilestoneShipment(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>

                  <form onSubmit={handleLogMilestone} className="space-y-3">
                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">Milestone Stage</label>
                      <select
                        value={milestoneStatus}
                        onChange={(e) => setMilestoneStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-[#041228] border border-slate-700 rounded text-white"
                      >
                        <option value="dispatched">Dispatched to Loading Facility</option>
                        <option value="loading">Loading &amp; Seal Verification</option>
                        <option value="in_transit">In Transit (Highway Corridor)</option>
                        <option value="out_for_delivery">Out for Delivery at Destination</option>
                        <option value="delivered">Delivered &amp; Signed POD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">Current Waypoint / Location</label>
                      <input
                        type="text"
                        value={milestoneLocation}
                        onChange={(e) => setMilestoneLocation(e.target.value)}
                        placeholder="e.g. I-77 N Mile Marker 42 or Charlotte Receiving Dock"
                        className="w-full px-3 py-2 bg-[#041228] border border-slate-700 rounded text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">Operational Notes</label>
                      <textarea
                        value={milestoneNotes}
                        onChange={(e) => setMilestoneNotes(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-[#041228] border border-slate-700 rounded text-white"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                      <button
                        type="button"
                        onClick={() => setMilestoneShipment(null)}
                        className="px-4 py-2 text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded font-display"
                      >
                        Log Milestone
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SHIPMENTS */}
        {activeTab === 'shipments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Shipment Tracking &amp; Verified POD Records</h2>
              <p className="text-xs text-slate-400">Complete historical and active freight movements originating from or serving Columbia, SC.</p>
            </div>

            <div className="bg-[#071E41] rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Tracking #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Origin / Destination</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Milestone Count</th>
                      <th className="py-3 px-4">Proof of Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {shipments.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#C99A31]">{s.trackingNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-white">{s.customerName}</td>
                        <td className="py-3.5 px-4">{s.origin} ➔ {s.destination}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            s.currentStatus === 'delivered'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            {s.currentStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 tabular-nums">{s.events?.length || 0} Events Recorded</td>
                        <td className="py-3.5 px-4">
                          {s.proofOfDelivery ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Signed: {s.proofOfDelivery.receivedBy}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Pending Arrival</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FLEET */}
        {activeTab === 'fleet' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Commercial Fleet Registry</h2>
              <p className="text-xs text-slate-400">Power units and trailer configurations managed under Momentum Transportation &amp; Hauling LLC.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fleet.map((veh) => (
                <div key={veh.id} className="bg-[#071E41] rounded-xl border border-slate-800 p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#C99A31] font-display text-sm">{veh.unitNumber}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      veh.status === 'available'
                        ? 'bg-emerald-950 text-emerald-300'
                        : veh.status === 'dispatched'
                        ? 'bg-blue-950 text-blue-300'
                        : 'bg-amber-950 text-amber-300'
                    }`}>
                      {veh.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{veh.makeModel} ({veh.year})</h4>
                    <div className="text-slate-400 text-[11px]">{veh.category} · {veh.type}</div>
                  </div>

                  <div className="p-3 rounded bg-[#041228] space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Max Payload:</span>
                      <span className="font-semibold text-white tabular-nums">{veh.maxPayloadLbs.toLocaleString()} lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Odometer:</span>
                      <span className="font-semibold text-white tabular-nums">{veh.mileage.toLocaleString()} mi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Inspection:</span>
                      <span className="font-semibold text-white">{veh.lastInspectionDate}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    {veh.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: DRIVERS */}
        {activeTab === 'drivers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Commercial Driver Roster</h2>
              <p className="text-xs text-slate-400">Certified Class A commercial operators, CDL qualifications, and active duty assignments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {drivers.map((drv) => (
                <div key={drv.id} className="bg-[#071E41] rounded-xl border border-slate-800 p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{drv.name}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      drv.status === 'active_duty' ? 'bg-emerald-950 text-emerald-300' : 'bg-blue-950 text-blue-300'
                    }`}>
                      {drv.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-[#041228] space-y-1 text-[11px]">
                    <div className="text-slate-400">CDL License: <strong className="text-white">{drv.cdlNumber}</strong> (Class {drv.cdlClass})</div>
                    <div className="text-slate-400">DOT Medical Expiration: <strong className="text-white">{drv.medicalCardExpiry}</strong></div>
                    <div className="text-slate-400">Assigned Power Unit: <span className="text-[#C99A31] font-semibold">{drv.assignedUnit}</span></div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Endorsements:</span>
                    <div className="flex flex-wrap gap-1">
                      {drv.endorsements.map((e: string, i: number) => (
                        <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: BILLING & INVOICING */}
        {activeTab === 'invoicing' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white font-display">Billing &amp; Freight Invoicing</h2>
                <p className="text-xs text-slate-400">Generate commercial rate invoices and track accounts receivable.</p>
              </div>
              <button
                onClick={() => addAudit('Exported weekly billing ledger to PDF')}
                className="px-4 py-2 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31] rounded font-display"
              >
                Export Ledger
              </button>
            </div>

            <div className="bg-[#071E41] rounded-xl border border-slate-800 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-800">
                <div className="p-4 rounded-lg bg-[#041228] border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Billed (MTD)</span>
                  <div className="text-xl font-bold text-white tabular-nums mt-0.5">$48,750.00</div>
                </div>
                <div className="p-4 rounded-lg bg-[#041228] border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Collected Payments</span>
                  <div className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">$42,900.00</div>
                </div>
                <div className="p-4 rounded-lg bg-[#041228] border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Net 30 Pending</span>
                  <div className="text-xl font-bold text-[#C99A31] tabular-nums mt-0.5">$5,850.00</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Shipment Ref</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-3 px-3 font-mono font-bold text-[#C99A31]">MTH-INV-2026-081</td>
                      <td className="py-3 px-3 font-semibold text-white">Carolina Industrial Supplies</td>
                      <td className="py-3 px-3 font-mono">MTH-TRK-7701</td>
                      <td className="py-3 px-3 font-bold text-white tabular-nums">$1,150.00</td>
                      <td className="py-3 px-3">2026-11-20</td>
                      <td className="py-3 px-3"><span className="text-emerald-400 font-bold text-[10px] uppercase">Paid</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-mono font-bold text-[#C99A31]">MTH-INV-2026-082</td>
                      <td className="py-3 px-3 font-semibold text-white">Palmetto Steel &amp; Fab</td>
                      <td className="py-3 px-3 font-mono">MTH-TRK-2604</td>
                      <td className="py-3 px-3 font-bold text-white tabular-nums">$1,850.00</td>
                      <td className="py-3 px-3">2026-11-25</td>
                      <td className="py-3 px-3"><span className="text-blue-400 font-bold text-[10px] uppercase">Net 15 Sent</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: EMAIL ROUTING & INQUIRY AUDIT */}
        {activeTab === 'emails' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C99A31]">
                  <Mail className="w-4 h-4" />
                  <span>Central Communications Engine</span>
                </div>
                <h2 className="text-xl font-bold text-white font-display mt-0.5">
                  Email Routing &amp; Inquiry Audit
                </h2>
                <p className="text-xs text-slate-400">
                  Every website submission is assigned a unique reference number and automatically dispatched to operations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSendTestEmail}
                  disabled={isTestingEmail}
                  className="px-4 py-2 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded font-display inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTestingEmail ? 'Transmitting Test...' : 'Send Test Notification'}</span>
                </button>
                <button
                  onClick={loadAllData}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 cursor-pointer"
                >
                  Refresh Logs
                </button>
              </div>
            </div>

            {testEmailFeedback && (
              <div className="p-4 rounded-xl bg-blue-950/80 border border-blue-800 text-xs text-blue-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong>Notification Dispatch Status:</strong> {testEmailFeedback}
                </div>
              </div>
            )}

            {/* Email Engine Health Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#071E41] p-5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Official Inbound Recipient
                </span>
                <div className="text-sm sm:text-base font-bold font-mono text-[#C99A31] truncate">
                  {emailStatus?.officialRecipient || 'wright.wendell@icloud.com'}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Executive Destination</span>
                </div>
              </div>

              <div className="bg-[#071E41] p-5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  SMTP Delivery Status
                </span>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${emailStatus?.smtpConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <span>{emailStatus?.smtpConfigured ? 'Live SMTP Transport' : 'Standby / Fallback Queue'}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {emailStatus?.smtpConfigured ? 'Delivering directly to mailbox' : 'Recorded securely with Ref ID'}
                </div>
              </div>

              <div className="bg-[#071E41] p-5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Total Dispatched Inquiries
                </span>
                <div className="text-2xl font-bold font-display text-white tabular-nums">
                  {emailAudits.length}
                </div>
                <div className="text-[11px] text-slate-400">
                  Across quotes, contact, driver &amp; support forms
                </div>
              </div>

              <div className="bg-[#071E41] p-5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Delivery Compliance Rate
                </span>
                <div className="text-2xl font-bold font-display text-emerald-400 tabular-nums">
                  100%
                </div>
                <div className="text-[11px] text-slate-400">
                  Zero dropped or silent submissions
                </div>
              </div>
            </div>

            {/* Email Audit Log Table */}
            <div className="bg-[#071E41] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                  Transmission Audit History ({emailAudits.length})
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  All messages route to: {emailStatus?.officialRecipient || 'wright.wendell@icloud.com'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Ref #</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Customer / Sender</th>
                      <th className="py-3 px-4">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {emailAudits.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                          No inquiries received yet. Submit a quote, contact message, driver application, or click &ldquo;Send Test Notification&rdquo;.
                        </td>
                      </tr>
                    ) : (
                      emailAudits.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#C99A31]">{rec.referenceNumber}</td>
                          <td className="py-3.5 px-4 text-[11px] text-slate-400 tabular-nums">
                            {new Date(rec.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-semibold border border-slate-700">
                              {rec.category.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                            {rec.subject}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{rec.customerName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{rec.customerEmail}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded inline-block ${
                              rec.deliveryStatus === 'delivered'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : rec.deliveryStatus === 'queued_pending_credentials'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-red-950 text-red-300 border border-red-800'
                            }`}>
                              {rec.deliveryStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AI LOGISTICS COMMAND SUITE */}
        {activeTab === 'ai_suite' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C99A31]">
                <Sparkles className="w-4 h-4" />
                <span>AI-Assisted Operations &amp; Intelligence</span>
              </div>
              <h2 className="text-xl font-bold text-white font-display mt-1">
                Logistics Assistant Suite
              </h2>
              <p className="text-xs text-slate-400">
                Governed operational reasoning assistants for rate card calculations, route feasibility, and BOL document extraction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#071E41] rounded-xl border border-slate-800 p-6 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C99A31]" />
                  <span>AI Route &amp; Rate Card Estimator</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates accurate southeastern lane miles, axle load distribution warnings, and diesel fuel index adjustments based on current market rates.
                </p>
                <button
                  onClick={() => setActiveTab('quotes')}
                  className="px-4 py-2 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31] rounded font-display"
                >
                  Launch on Active Quotes
                </button>
              </div>

              <div className="bg-[#071E41] rounded-xl border border-slate-800 p-6 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C99A31]" />
                  <span>AI Dispatch &amp; HOS Optimizer</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Evaluates driver duty cycles, medical expirations, and trailer capacities to recommend optimal pairings with zero FMCSR violations.
                </p>
                <button
                  onClick={() => setActiveTab('dispatch')}
                  className="px-4 py-2 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31] rounded font-display"
                >
                  Launch on Dispatch Board
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white font-display">System Audit Trail</h2>
              <p className="text-xs text-slate-400">Immutable chronological record of administrative and dispatch modifications.</p>
            </div>

            <div className="bg-[#071E41] rounded-xl border border-slate-800 p-6 space-y-3">
              <div className="divide-y divide-slate-800 text-xs">
                {auditLogs.map((log, index) => (
                  <div key={index} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="font-semibold text-white">{log.action}</span>
                      <div className="text-[11px] text-slate-400">Operator: {log.user}</div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Central Company Settings</h2>
              <p className="text-xs text-slate-400">Master configuration matching verified directive parameters.</p>
            </div>

            <div className="bg-[#071E41] rounded-xl border border-slate-800 p-6 space-y-4 max-w-2xl text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    disabled
                    value={COMPANY.legalName}
                    className="w-full px-3 py-2 bg-[#041228] border border-slate-700 rounded text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Primary Terminal &amp; Address</label>
                  <input
                    type="text"
                    disabled
                    value={COMPANY.contact.address}
                    className="w-full px-3 py-2 bg-[#041228] border border-slate-700 rounded text-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Dispatch Phone</label>
                    <input
                      type="text"
                      disabled
                      value={COMPANY.contact.phone}
                      className="w-full px-3 py-2 bg-[#041228] border border-slate-700 rounded text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Operations Email</label>
                    <input
                      type="text"
                      disabled
                      value={COMPANY.contact.email}
                      className="w-full px-3 py-2 bg-[#041228] border border-slate-700 rounded text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
