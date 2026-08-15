'use client';

import { useState } from 'react';
import { OpportunityApplication, ApplicationStatus } from '@/types/opportunity';
import { updateApplicationStatusAction } from '@/app/actions/opportunity.actions';

interface ApplicationPipelineProps {
  opportunityId: string;
  initialApplications: OpportunityApplication[];
}

const STAGES: ApplicationStatus[] = [
  'submitted',
  'under_review',
  'shortlisted',
  'interviewed',
  'accepted',
  'rejected',
];

export function ApplicationPipeline({ opportunityId, initialApplications }: ApplicationPipelineProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(appId);
    const res = await updateApplicationStatusAction(appId, opportunityId, newStatus);
    if (res.success && res.data) {
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto border border-neutral-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200 uppercase tracking-wider text-neutral-500 font-mono">
            <tr>
              <th className="p-3">Applicant Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Date Applied</th>
              <th className="p-3">Resume</th>
              <th className="p-3">Pipeline Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-neutral-500 font-serif">
                  No candidate applications received for this opening yet.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-neutral-50">
                  <td className="p-3 font-semibold text-neutral-900">{app.full_name}</td>
                  <td className="p-3 text-neutral-600">{app.email}</td>
                  <td className="p-3 text-neutral-500">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-900 underline font-medium hover:text-neutral-600"
                    >
                      View CV
                    </a>
                  </td>
                  <td className="p-3">
                    <select
                      disabled={updatingId === app.id}
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className="border border-neutral-300 text-xs p-1 focus:outline-none focus:border-neutral-900 bg-white"
                    >
                      {STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
