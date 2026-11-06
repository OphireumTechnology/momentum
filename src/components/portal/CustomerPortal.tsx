import React, { useState, useEffect } from 'react';
import { PageView } from '../common/Header';
import { COMPANY } from '../../config/company';
import { ASSETS, ASSET_METADATA } from '../../config/assets';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  Search,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  LogOut,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface CustomerPortalProps {
  onNavigate: (page: PageView) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [customerUser, setCustomerUser] = useState({
    name: 'Carolina Industrial Supplies',
    email: 'logistics@carolinaindustrial.com',
    accountNumber: 'MTH-ACC-8812',
  });

  const [trackingQuery, setTrackingQuery] = useState('');
  const [shipments, setShipments] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // AI Support Chatbot state inside portal
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Hello, this is Momentum Operations Support. How can I help you with your Columbia, SC freight scheduling, tracking, or rate inquiries?',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [shipRes, quoteRes] = await Promise.all([
        fetch('/api/shipments'),
        fetch('/api/quotes'),
      ]);
      const shipData = await shipRes.json();
      const quoteData = await quoteRes.json();

      if (shipData.success) {
        setShipments(shipData.shipments);
        if (shipData.shipments.length > 0) {
          setSelectedShipment(shipData.shipments[0]);
        }
      }
      if (quoteData.success) {
        setQuotes(quoteData.quotes);
      }
    } catch (err) {
      console.error('Failed to fetch portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingQuery.trim()) return;

    try {
      const res = await fetch(`/api/shipments/${encodeURIComponent(trackingQuery.trim())}`);
      const data = await res.json();
      if (data.success && data.shipment) {
        setSelectedShipment(data.shipment);
      } else {
        alert(`No shipment found matching tracking number "${trackingQuery}". Try MTH-TRK-7701 or MTH-TRK-2604.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setInputMsg('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsAiReplying(true);

    try {
      const res = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: data.answer || 'Thank you for your message. Our dispatch line is available at 803-718-5509.' },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'You can contact Wendell Wright directly at 803-718-5509.' },
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Portal Top Bar */}
      <div className="bg-[#071E41] text-white border-b border-[#0D2C5B] py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C99A31]/20 border border-[#C99A31] flex items-center justify-center text-[#C99A31]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#C99A31] font-display">
                Customer Freight Portal
              </div>
              <div className="text-sm font-semibold text-white">
                {customerUser.name} <span className="text-slate-400 text-xs">({customerUser.accountNumber})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => onNavigate('quote')}
              className="px-3.5 py-1.5 text-xs font-bold uppercase text-[#071E41] bg-[#C99A31] hover:bg-[#E8BE65] rounded font-display"
            >
              + New Quote Request
            </button>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 inline-flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#C99A31]" />
              <span>Logistics Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Quick Tracking Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <form onSubmit={handleSearchTracking} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Track by Shipment # (e.g. MTH-TRK-7701 or MTH-TRK-2604)"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#071E41] hover:bg-[#041228] rounded font-display cursor-pointer"
            >
              Track Freight
            </button>
          </form>
        </div>

        {/* 2-Column Split: Active Shipment Milestones & Account Quotes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Shipment Details & Milestone Timeline */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C99A31] font-display">
                  Live Shipment Detail
                </span>
                <h3 className="text-xl font-bold text-[#071E41] font-display">
                  {selectedShipment ? selectedShipment.trackingNumber : 'Select a Shipment'}
                </h3>
              </div>
              {selectedShipment && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded inline-block ${
                    selectedShipment.currentStatus === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-900'
                  }`}>
                    {selectedShipment.currentStatus.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            {selectedShipment ? (
              <div className="space-y-6 text-xs text-slate-700">
                {/* Route Header */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] block">Origin (Pickup)</span>
                    <span className="text-sm font-bold text-[#071E41]">{selectedShipment.origin}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] block">Destination</span>
                    <span className="text-sm font-bold text-[#071E41]">{selectedShipment.destination}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-slate-500 text-[10px] block">Assigned Unit &amp; Driver</span>
                    <span className="font-semibold text-slate-800">
                      {selectedShipment.assignedVehicle || 'Assigned at Dispatch'} · {selectedShipment.assignedDriver || 'CDL Operator'}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-slate-500 text-[10px] block">Cargo Weight</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {selectedShipment.weightLbs.toLocaleString()} lbs
                    </span>
                  </div>
                </div>

                {/* Verified Milestone Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-[#071E41] uppercase tracking-wider font-display mb-4">
                    Verified Operational Milestones
                  </h4>

                  <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {selectedShipment.events.map((event: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#071E41] border-2 border-white shadow-sm flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C99A31]" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{event.status}</span>
                            <span className="text-[10px] text-slate-400 tabular-nums">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                            {event.location}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                            {event.notes}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proof of Delivery Viewer if delivered */}
                {selectedShipment.proofOfDelivery && (
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Proof of Delivery (POD)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-emerald-950">
                      <div>
                        <span className="text-emerald-700 block text-[10px]">Received By:</span>
                        <strong>{selectedShipment.proofOfDelivery.receivedBy}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-700 block text-[10px]">Timestamp:</span>
                        <span className="tabular-nums">
                          {new Date(selectedShipment.proofOfDelivery.signatureTimestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-emerald-900 italic pt-1">
                      &ldquo;{selectedShipment.proofOfDelivery.notes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select a shipment to review milestone records.</p>
            )}
          </div>

          {/* Right Column: Active Shipments Roster & Quotes History */}
          <div className="lg:col-span-5 space-y-6">
            {/* Active Shipments List */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#071E41] font-display">
                Your Shipments ({shipments.length})
              </h3>
              <div className="space-y-2.5">
                {shipments.map((shp) => {
                  const isSelected = selectedShipment?.id === shp.id;
                  return (
                    <button
                      key={shp.id}
                      onClick={() => setSelectedShipment(shp)}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#071E41] bg-slate-50 ring-1 ring-[#071E41]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#071E41] font-mono">{shp.trackingNumber}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          shp.currentStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {shp.currentStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 font-medium mt-1">
                        {shp.origin} ➔ {shp.destination}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {shp.serviceCategory} · {shp.weightLbs.toLocaleString()} lbs
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quotation History */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#071E41] font-display">
                Recent Quotation Requests
              </h3>
              <div className="space-y-2.5">
                {quotes.map((q) => (
                  <div key={q.id} className="p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-[#071E41]">{q.referenceNumber}</span>
                      <span className="text-[10px] uppercase font-bold text-[#C99A31] bg-[#C99A31]/10 px-2 py-0.5 rounded">
                        {q.status}
                      </span>
                    </div>
                    <div className="text-slate-800 font-medium">
                      {q.pickupLocation} ➔ {q.deliveryLocation}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Rate: <strong className="text-slate-800">${q.estimatedRate?.toLocaleString() || 'Under Review'}</strong></span>
                      <span>Target: {q.pickupDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Customer Support Chat Dialog */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#071E41] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C99A31]" />
              <span className="text-xs font-bold uppercase tracking-wider font-display">
                Momentum Operations Assistant
              </span>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="p-4 h-72 overflow-y-auto space-y-3 text-xs bg-slate-50">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'ml-auto bg-[#071E41] text-white'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isAiReplying && (
              <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-slate-500 text-[11px] italic">
                Checking logistics operations data...
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask about rate, delivery status, or route..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#071E41] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isAiReplying}
              className="px-3 py-2 bg-[#071E41] text-[#C99A31] rounded text-xs font-bold uppercase cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
