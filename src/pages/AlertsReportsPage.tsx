import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Printer,
  Download,
  Filter,
  FileText,
  ShieldAlert,
  Clock,
  User,
} from 'lucide-react';
import { HealthAlert, AlertSeverity, AlertStatus } from '../types/alert';

export const AlertsReportsPage: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, astronauts, mission } = useApp();
  const { currentUser } = useAuth();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [astronautFilter, setAstronautFilter] = useState<string>('all');

  const [selectedAlertForAck, setSelectedAlertForAck] = useState<HealthAlert | null>(null);
  const [ackNote, setAckNote] = useState('');

  // Report print modal / view
  const [showPrintReport, setShowPrintReport] = useState(false);

  const filteredAlerts = alerts.filter((a) => {
    const matchSev = severityFilter === 'all' || a.severity === severityFilter;
    const matchStat = statusFilter === 'all' || a.status === statusFilter;
    const matchAstro = astronautFilter === 'all' || a.astronautId === astronautFilter;
    return matchSev && matchStat && matchAstro;
  });

  const handleAcknowledge = () => {
    if (!selectedAlertForAck) return;
    acknowledgeAlert(selectedAlertForAck.id, ackNote.trim() || 'Reviewed per flight medical protocol');
    setSelectedAlertForAck(null);
    setAckNote('');
  };

  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Printable Report Overlay (when active) */}
      {showPrintReport ? (
        <div className="bg-white p-8 max-w-4xl mx-auto rounded-sm border border-edge shadow-tactile-lg space-y-6">
          <div className="flex items-center justify-between border-b border-edge pb-4 no-print">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">PRINTABLE MEDICAL TELEMETRY SUMMARY</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={() => window.print()} icon={<Printer className="w-3.5 h-3.5" />}>
                Print Document
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowPrintReport(false)}>
                Exit Print View
              </Button>
            </div>
          </div>

          {/* Official Aerospace Header */}
          <div className="border-b-2 border-slate-primary pb-4">
            <div className="flex items-baseline justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-ink">ZENITH CREW HEALTH REPORT</h1>
                <p className="text-xs font-mono text-ink-secondary mt-0.5">
                  MISSION: {mission.name} • MET: +{mission.currentMetDays}d • REPORT REF: REP-{Date.now().toString(36).toUpperCase()}
                </p>
              </div>
              <div className="text-right font-mono text-xs text-ink-secondary">
                <div>DATE: {new Date().toISOString().split('T')[0]}</div>
                <div>CLASSIFICATION: FLIGHT SURGEON MEDICAL EYES ONLY</div>
              </div>
            </div>
          </div>

          {/* Disclaimer on report */}
          <div className="p-3 bg-paper border border-edge text-xs text-ink-secondary">
            <strong>NOTICE:</strong> This document was compiled from telemetry streams, automated thresholds, and manual in-flight assays. It is an informational flight digest for the NASA Space Apps Challenge demonstration and is not a terrestrial clinical record.
          </div>

          {/* Crew Table Summary */}
          <div>
            <h3 className="font-semibold text-ink text-sm uppercase tracking-wider mb-2 font-mono">
              Crew Status & Readiness Matrix
            </h3>
            <table className="w-full text-left text-xs border border-edge border-collapse">
              <thead>
                <tr className="bg-paper-dark border-b border-edge font-mono text-ink-secondary uppercase text-[10px]">
                  <th className="p-2">Astronaut</th>
                  <th className="p-2">Role & Agency</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Resting HR</th>
                  <th className="p-2">SpO₂</th>
                  <th className="p-2">Sleep (Avg)</th>
                  <th className="p-2">Radiation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge font-mono">
                {astronauts.map((a) => (
                  <tr key={a.id}>
                    <td className="p-2 font-semibold text-ink">{a.name}</td>
                    <td className="p-2 text-ink-secondary">{a.role} ({a.agency})</td>
                    <td className="p-2">
                      <span className={a.status === 'attention' ? 'text-brick font-semibold' : 'text-slate-primary'}>
                        {a.status === 'attention' ? 'ATTENTION' : 'NOMINAL'}
                      </span>
                    </td>
                    <td className="p-2 text-ink">62 bpm</td>
                    <td className="p-2 text-ink">98%</td>
                    <td className="p-2 text-ink">7h 20m</td>
                    <td className="p-2 text-ink">{a.cumulativeRadiation_mSv} mSv</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Incident / Alert Log in Report */}
          <div>
            <h3 className="font-semibold text-ink text-sm uppercase tracking-wider mb-2 font-mono">
              Physiological Threshold Violations & Notes
            </h3>
            <div className="space-y-2">
              {alerts.map((al) => (
                <div key={al.id} className="p-2.5 border border-edge text-xs">
                  <div className="flex items-center justify-between font-mono font-semibold text-ink">
                    <span>[{al.severity.toUpperCase()}] {al.title}</span>
                    <span className="text-ink-secondary">{al.timestamp}</span>
                  </div>
                  <p className="text-ink-secondary mt-1">{al.description}</p>
                  {al.acknowledgedBy && (
                    <div className="text-[11px] font-mono text-slate-primary mt-1">
                      Acknowledged by: {al.acknowledgedBy} ({al.acknowledgedAt})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Signoff block */}
          <div className="pt-6 border-t border-edge flex items-center justify-between font-mono text-xs text-ink-secondary">
            <div>
              Flight Surgeon Signature: <span className="underline decoration-dotted ml-2">Dr. Kenjiro Sato, MD (JAXA)</span>
            </div>
            <div>Generated by ZENITH Core Engine v1.0</div>
          </div>
        </div>
      ) : (
        <>
          {/* Header and Report Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
                Alerts & Flight Medical Reports
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                Automated threshold alarms, stale sensor events, and printable crew readiness digests
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowPrintReport(true)}
              icon={<FileText className="w-3.5 h-3.5" />}
            >
              Generate Printable Health Report
            </Button>
          </div>

          {/* Operational Medical Disclaimer */}
          <div className="p-3 bg-paper-dark border border-edge rounded-sm flex items-start gap-2.5 text-xs text-ink-secondary">
            <ShieldAlert className="w-4 h-4 text-slate-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-ink">Operational Telemetry Boundary:</strong> Threshold alarms are generated from automated sensor packet streams, missed diaries, and stale antenna relays. They provide situational awareness for mission control and do not replace professional physician monitoring.
            </div>
          </div>

          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="paper-surface rounded-sm p-4 border border-edge">
              <div className="flex items-center justify-between text-xs font-mono text-ink-secondary">
                <span>ACTIVE UNACKNOWLEDGED</span>
                <span className="w-2 h-2 rounded-full bg-brick animate-ping" />
              </div>
              <div className="text-2xl font-semibold text-brick telemetry-val mt-1">
                {activeCount}
              </div>
              <div className="text-[11px] font-mono text-ink-muted mt-2">Requires surgeon acknowledgment</div>
            </div>

            <div className="paper-surface rounded-sm p-4 border border-edge">
              <div className="flex items-center justify-between text-xs font-mono text-ink-secondary">
                <span>ACKNOWLEDGED & MONITORED</span>
                <Clock className="w-3.5 h-3.5 text-slate-primary" />
              </div>
              <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
                {acknowledgedCount}
              </div>
              <div className="text-[11px] font-mono text-ink-muted mt-2">Clinical countermeasure logged</div>
            </div>

            <div className="paper-surface rounded-sm p-4 border border-edge">
              <div className="flex items-center justify-between text-xs font-mono text-ink-secondary">
                <span>RESOLVED / CLOSED</span>
                <CheckCircle className="w-3.5 h-3.5 text-slate-primary" />
              </div>
              <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
                {resolvedCount}
              </div>
              <div className="text-[11px] font-mono text-ink-muted mt-2">Telemetry baseline restored</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-paper border border-edge rounded-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-ink-secondary" />
              <span className="text-xs font-mono text-ink-secondary uppercase">Filters:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={astronautFilter}
                onChange={(e) => setAstronautFilter(e.target.value)}
                className="bg-paper-dark border border-edge rounded-sm px-2.5 py-1 text-ink font-mono focus-visible:outline-slate-primary"
              >
                <option value="all">All Astronauts</option>
                {astronauts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id})
                  </option>
                ))}
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-paper-dark border border-edge rounded-sm px-2.5 py-1 text-ink font-mono focus-visible:outline-slate-primary"
              >
                <option value="all">All Severities</option>
                <option value="alert">Alert (Brick)</option>
                <option value="caution">Caution</option>
                <option value="advisory">Advisory</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-paper-dark border border-edge rounded-sm px-2.5 py-1 text-ink font-mono focus-visible:outline-slate-primary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Alerts Feed */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const astronaut = astronauts.find((a) => a.id === alert.astronautId);
              const isAlert = alert.severity === 'alert';
              const isCaution = alert.severity === 'caution';

              return (
                <div
                  key={alert.id}
                  className={`paper-surface rounded-sm p-4 border transition-all ${
                    alert.status === 'active' && isCaution
                      ? 'border-brick-border bg-brick-surface/40'
                      : alert.status === 'active' && isAlert
                      ? 'border-brick bg-brick-surface'
                      : 'border-edge'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            alert.severity === 'alert'
                              ? 'attention'
                              : alert.severity === 'caution'
                              ? 'attention'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <h3 className="font-semibold text-ink text-sm sm:text-base">{alert.title}</h3>
                        <span className="text-xs font-mono text-ink-secondary">
                          [{alert.category.replace('_', ' ')}]
                        </span>
                      </div>

                      <p className="text-xs text-ink leading-relaxed max-w-2xl">{alert.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-ink-secondary pt-1">
                        <span>Target: <strong className="text-ink">{astronaut?.name || alert.astronautId}</strong></span>
                        <span>•</span>
                        <span>Trigger: <strong className="text-ink">{alert.triggerValue}</strong></span>
                        <span>•</span>
                        <span>Threshold: <strong className="text-ink">{alert.thresholdLimit}</strong></span>
                      </div>
                    </div>

                    {/* Actions and Status */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-ink-secondary">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                      </span>

                      {alert.status === 'active' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setSelectedAlertForAck(alert)}
                        >
                          Acknowledge
                        </Button>
                      )}

                      {alert.status === 'acknowledged' && (
                        <div className="text-right">
                          <span className="text-[11px] font-mono text-slate-primary block">
                            Acknowledged by {alert.acknowledgedBy}
                          </span>
                          <button
                            onClick={() => resolveAlert(alert.id, 'Countermeasure completed, parameters normal')}
                            className="text-xs font-mono text-ink-secondary hover:text-ink underline mt-1"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      )}

                      {alert.status === 'resolved' && (
                        <span className="text-xs font-mono text-slate-primary flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredAlerts.length === 0 && (
              <div className="p-8 text-center border border-dashed border-edge rounded-sm bg-paper text-xs font-mono text-ink-secondary">
                No alerts match the selected criteria.
              </div>
            )}
          </div>

          {/* Acknowledge Alert Modal */}
          <Modal
            isOpen={Boolean(selectedAlertForAck)}
            onClose={() => setSelectedAlertForAck(null)}
            title="Acknowledge Health Alert"
            subtitle={`Alert Ref: ${selectedAlertForAck?.id} • Officer: ${currentUser.name}`}
            footer={
              <>
                <Button variant="ghost" onClick={() => setSelectedAlertForAck(null)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAcknowledge}>
                  Confirm Acknowledgment
                </Button>
              </>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-paper border border-edge rounded-sm">
                <span className="font-semibold text-ink">{selectedAlertForAck?.title}</span>
                <p className="text-ink-secondary mt-1">{selectedAlertForAck?.description}</p>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1 font-mono">
                  Clinical Action / Countermeasure Note
                </label>
                <textarea
                  rows={3}
                  value={ackNote}
                  onChange={(e) => setAckNote(e.target.value)}
                  placeholder="e.g. Advised 45 min light sleep nap before evening shift; monitored subsequent vitals packet..."
                  className="w-full p-2.5 bg-paper border border-edge rounded-sm text-xs text-ink focus-visible:outline-slate-primary"
                />
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

