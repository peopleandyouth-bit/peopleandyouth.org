'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { submitApplicationAction } from '@/app/actions/opportunity.actions';

interface ApplicationFormProps {
  opportunityId: string;
  opportunityTitle: string;
}

export function ApplicationForm({ opportunityId, opportunityTitle }: ApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please attach your CV/Resume in PDF format.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('opportunity-resumes')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Resume upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('opportunity-resumes')
        .getPublicUrl(filePath);

      const res = await submitApplicationAction({
        opportunity_id: opportunityId,
        full_name: fullName,
        email,
        phone,
        linkedin_url: linkedin,
        portfolio_url: portfolio,
        resume_url: publicUrlData.publicUrl,
        cover_letter: coverLetter,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit application.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-neutral-50 border border-neutral-900 p-8 text-center">
        <h3 className="text-xl font-serif text-neutral-900 mb-2">Application Received</h3>
        <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
          Thank you for applying for <strong>{opportunityTitle}</strong>. Your candidacy is now under evaluation by our recruitment committee.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-neutral-200 p-6 md:p-8 bg-white space-y-6">
      <h3 className="text-xl font-serif text-neutral-900 border-b border-neutral-100 pb-4">
        Apply for Position
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-700 font-medium mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-neutral-900"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-700 font-medium mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-700 font-medium mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-neutral-900"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-700 font-medium mb-1">
            LinkedIn Profile URL
          </label>
          <input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-neutral-900"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-700 font-medium mb-1">
            Portfolio / Web Link
          </label>
          <input
            type="url"
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-neutral-700 font-medium mb-1">
          Resume / Curriculum Vitae (PDF) *
        </label>
        <input
          type="file"
          accept=".pdf"
          required
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border border-neutral-300 p-2 text-sm focus:outline-none focus:border-neutral-900 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-neutral-900 file:text-white file:text-xs file:uppercase tracking-wider"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-neutral-700 font-medium mb-1">
          Cover Statement / Personal Note
        </label>
        <textarea
          rows={5}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Detail your motivation and strategic fit for People & Youth..."
          className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-neutral-900"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-neutral-900 text-white font-semibold py-3 uppercase tracking-wider text-xs hover:bg-neutral-800 transition-colors disabled:bg-neutral-400"
      >
        {submitting ? 'Submitting Application...' : 'Submit Application'}
      </button>
    </form>
  );
}
