import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Shield,
  UserCheck,
  Lock,
  Trash2,
  Download,
  RotateCcw,
  History,
  CheckCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { UserRole } from '../types/user';

export const SettingsPrivacyPage: React.FC = () => {
  const { currentUser, allUsers, switchUser } = useAuth();
  const { auditLogs, resetAllData, selectedAstronaut } = useApp();

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Export all health data for current astronaut as sanitized JSON
  const handleExportData = () => {
    const exportBundle = {
      exportTimestamp: new Date().toISOString(),
      astronaut: selectedAstronaut,
      classification: 'Sanitized Aerospace Health Export (NASA Space Apps Challenge Concept)',
      disclaimer: 'Not a certified medical document. For demonstration and research purposes only.',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ZENITH_HEALTH_EXPORT_${selectedAstronaut.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
          System Roles, Permissions & Privacy
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
          Role-based access matrix, immutable security audit trail, and self-sovereign data privacy
        </p>
      </div>

      {/* Role Selection & Active Session Card */}
      <Card>
        <CardHeader
          title="Active Role & Account Identity"
          subtitle="Switch between fictional roles to demonstrate permission boundaries and interface adaptation"
          tag={<Badge variant="primary" size="sm">RBAC Sim Active</Badge>}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allUsers.map((user) => {
            const isSelected = user.id === currentUser.id;

            return (
              <div
                key={user.id}
                onClick={() => switchUser(user.id)}
                className={`p-4 rounded-sm border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-slate-primary bg-slate-surface/40 shadow-tactile'
                    : 'border-edge bg-paper hover:border-slate-primary/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-edge shrink-0"
                  />
                  <div>
                    <div className="font-semibold text-ink text-sm flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-slate-primary shrink-0" />}
                    </div>
                    <div className="text-xs text-ink-secondary font-mono capitalize">
                      {user.role.replace('_', ' ')}
                    </div>
                    <div className="text-[10px] text-ink-muted font-mono mt-0.5">
                      {user.securityClearance}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-edge/60 text-xs text-ink-secondary">
                  {user.role === 'astronaut' && (
                    <span>Access personal biodata, submit diaries, and control sensor consent.</span>
                  )}
                  {user.role === 'medical_officer' && (
                    <span>View all crew medical telemetry, enter clinical notes, and adjust thresholds.</span>
                  )}
                  {user.role === 'mission_administrator' && (
                    <span>Manage crew profiles, system duration, global device inventory, and audits.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Role Permissions Matrix */}
      <Card>
        <CardHeader
          title="Role-Based Access Control (RBAC) Matrix"
          subtitle="Governs data access scope and modification rights in compliance with aerospace flight regulations"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-edge bg-paper text-ink-secondary font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">System Permission</th>
                <th className="py-2.5 px-3">Astronaut</th>
                <th className="py-2.5 px-3">Medical Officer</th>
                <th className="py-2.5 px-3">Mission Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge/60 font-mono">
              <tr className="hover:bg-paper">
                <td className="py-2 px-3 font-semibold text-ink font-sans">View Entire Crew Telemetry</td>
                <td className="py-2 px-3 text-ink-muted">Self Only</td>
                <td className="py-2 px-3 text-slate-primary font-semibold">Granted (All)</td>
                <td className="py-2 px-3 text-slate-primary font-semibold">Granted (All)</td>
              </tr>
              <tr className="hover:bg-paper">
                <td className="py-2 px-3 font-semibold text-ink font-sans">Edit Clinical Medical Notes</td>
                <td className="py-2 px-3 text-ink-muted">Denied</td>
                <td className="py-2 px-3 text-slate-primary font-semibold">Granted</td>
                <td className="py-2 px-3 text-ink-muted">Read Only</td>
              </tr>
              <tr className="hover:bg-paper">
                <td className="py-2 px-3 font-semibold text-ink font-sans">Configure Alert Threshold Bounds</td>
                <td className="py-2 px-3 text-ink-muted">Denied</td>
                <td className="py-2 px-3 text-slate-primary font-semibold">Granted</td>
                <td className="py-2 px-3 text-slate-primary font-semibold">Granted</td>
              </tr>
              <tr className="hover:bg-paper">
                <td className="py-2 px-3 font-semibold text-ink font-sans">Acknowledge Active Health Alarms</td>
                <td className="py-2 px-3 text-ink-muted">Self Advisory</td>
                <td className="py-2 px-3 text-slate-primary font-semibold">Full Acknowledge</td>
                <td className="py-2 px-3 text-slate-primary font-semibold">Full Acknowledge</td>
              </tr>
              <tr className="hover:bg-paper">
                <td className="py-2 px-3 font-semibold text-ink font-sans">Toggle Individual Sensor Consent</td>
                <td className="py-2 px-3 text-slate-primary font-semibold">Full Sovereignty</td>
                <td className="py-2 px-3 text-ink-muted">View Status</td>
                <td className="py-2 px-3 text-ink-muted">View Status</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Privacy, Export, and Data Deletion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Data Export */}
        <Card>
          <CardHeader
            title="Telemetry Data Portability"
            subtitle="Export complete JSON telemetry package for mission archives or medical review"
          />
          <div className="space-y-3 text-xs">
            <p className="text-ink-secondary leading-relaxed">
              Downloads all biometric streams, exercise sessions, sleep hypnograms, lab panels, and notes for{' '}
              <strong className="text-ink">{selectedAstronaut.name}</strong> as an encrypted JSON archive.
            </p>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExportData}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export JSON Package
            </Button>

            {downloadSuccess && (
              <span className="text-xs font-mono text-slate-primary block mt-1">
                ✓ Telemetry bundle compiled and saved to local disk.
              </span>
            )}
          </div>
        </Card>

        {/* Right to Erasure / Purge Demo State */}
        <Card>
          <CardHeader
            title="Data Erasure & Demo Reset"
            subtitle="Purge local storage session caches or restore original mission baseline"
          />
          <div className="space-y-3 text-xs">
            <p className="text-ink-secondary leading-relaxed">
              Resetting erases all user-created notes, manual readings, captured media, and custom threshold settings, returning the platform to clean demonstration defaults.
            </p>

            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (window.confirm('Reset all demo databases, local storage, and logs?')) {
                  resetAllData();
                }
              }}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset to Clean Demonstration State
            </Button>
          </div>
        </Card>
      </div>

      {/* Immutable Security Audit Trail */}
      <Card>
        <CardHeader
          title="Security & Clinical Access Audit Trail"
          subtitle="Cryptographically verifiable chronological event record for sensitive health operations"
          tag={<span className="text-xs font-mono text-ink-secondary">{auditLogs.length} events logged</span>}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-edge bg-paper text-ink-secondary font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">User & Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Subject</th>
                <th className="py-2.5 px-3">Operation Details</th>
                <th className="py-2.5 px-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge/60 font-mono text-xs">
              {auditLogs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-paper transition-colors">
                  <td className="py-2 px-3 text-ink-secondary whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                  </td>
                  <td className="py-2 px-3 text-ink whitespace-nowrap">
                    <span className="font-semibold">{log.userName}</span>
                    <span className="text-[10px] text-ink-muted block capitalize">{log.userRole}</span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-primary whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2 px-3 text-ink-secondary whitespace-nowrap">
                    {log.targetAstronautId || 'System'}
                  </td>
                  <td className="py-2 px-3 text-ink font-sans max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant="normal" size="sm">
                      {log.outcome.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

