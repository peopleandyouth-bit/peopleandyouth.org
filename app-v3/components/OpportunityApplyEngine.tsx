'use client';

import React, { useState } from 'react';

export interface OpportunityProps {
  opportunityId: string;
  opportunityType: string; // Fellowship, Career, Journal, Ambassador, etc.
  department: string;
  title: string;
  location?: string;
}

export function ApplyButton({ opportunityId, opportunityType, department, title, location = 'Global / Remote' }: OpportunityProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl hover:bg-amber-300 transition-all shadow-md tracking-wider"
      >
        Apply for Opportunity â†’
      </button>

      {isOpen && (
        <ApplyWizardModal
          opportunityId={opportunityId}
          opportunityType={opportunityType}
          department={department}
          title={title}
          location={location}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export function OpportunityApplySection({ opportunityId, opportunityType, department, title, location = 'Global / Remote' }: OpportunityProps) {
  return (
    <div className="bg-gradient-to-r from-[#0a1024] via-[#0f1733] to-[#141f45] border border-amber-400/30 p-8 sm:p-10 rounded-3xl space-y-4 my-8 shadow-2xl">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <span className="px-3 py-1 bg-amber-400 text-black font-extrabold uppercase text-[9px] rounded-md tracking-widest">
          JOIN THIS OPPORTUNITY &middot; {opportunityType}
        </span>
        <span className="text-gray-400 font-mono text-[10px]">DEPARTMENT: {department}</span>
      </div>

      <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">
        Ready to Contribute to {title}?
      </h3>

      <p className="text-gray-300 text-xs font-serif leading-relaxed max-w-2xl">
        Whether you are applying as a researcher, consultant, district coordinator, editor, software engineer, youth ambassador, or volunteer, your journey into the institution begins here.
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <ApplyButton
          opportunityId={opportunityId}
          opportunityType={opportunityType}
          department={department}
          title={title}
          location={location}
        />
        <button
          onClick={() => alert(`Saved ${title} to your Candidate Dashboard bookmarks.`)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-amber-400 text-white font-bold text-xs uppercase rounded-xl transition-all"
        >
          Save for Later ðŸ”–
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Opportunity link copied to clipboard!');
          }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-amber-400 text-white font-bold text-xs uppercase rounded-xl transition-all"
        >
          Share ðŸ”—
        </button>
      </div>
    </div>
  );
}

export function ApplyWizardModal({ opportunityId, opportunityType, department, title, location, onClose }: OpportunityProps & { onClose: () => void }) {
  const [stage, setStage] = useState(1);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  // FORM DATA STATES
  // Stage I: Identity
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [nationality, setNationality] = useState('Indian');
  const [country, setCountry] = useState('India');
  const [district, setDistrict] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [languages, setLanguages] = useState('English, Hindi');

  // Stage II: Academic & Skills
  const [qualification, setQualification] = useState("Bachelor's Degree");
  const [institution, setInstitution] = useState('');
  const [gradYear, setGradYear] = useState('2025');
  const [experienceYears, setExperienceYears] = useState('2');
  const [resumeUrl, setResumeUrl] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState('');

  // Stage III: Opportunity Alignment
  const [preferredRoleType, setPreferredRoleType] = useState('Full-Time');
  const [availabilityDate, setAvailabilityDate] = useState('Immediate');
  const [compensationExpectation, setCompensationExpectation] = useState('');

  // Stage IV: Assessment
  const [whyPyEssay, setWhyPyEssay] = useState('');
  const [leadershipEssay, setLeadershipEssay] = useState('');
  const [sopSample, setSopSample] = useState('');

  // Stage V: Verification
  const [ref1, setRef1] = useState('');
  const [ref2, setRef2] = useState('');
  const [verificationConsent, setVerificationConsent] = useState(false);

  // Stage VI: Review & Signature
  const [digitalSignature, setDigitalSignature] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleNextStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (stage < 6) {
      setStage(stage + 1);
    } else {
      // Final Submit Execution
      const candId = `PY-CAND-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const appId = `PY-APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        candidateId: candId,
        applicationId: appId,
        opportunityTitle: title,
        opportunityType,
        department,
        fullName,
        email,
        district,
        submittedAt: new Date().toISOString()
      };

      localStorage.setItem('py_candidate_session', JSON.stringify(payload));
      // Trigger Institutional Email Communication Engine
      const isFellowship = opportunityType.toLowerCase().includes('fellowship') || opportunityType.toLowerCase().includes('internship');
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: isFellowship ? 'fellowship' : 'career',
          email,
          firstName: fullName.split(' ')[0],
          applicationId: appId,
          roleName: title,
          department,
          programmeName: title
        })
      }).catch(err => console.error('Email API trigger background error:', err));
      setSubmittedData(payload);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 font-mono text-xs">
      <div className="bg-[#0a1024] border border-amber-400/40 p-6 sm:p-8 rounded-3xl max-w-3xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* MODAL HEADER */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <span className="text-amber-400 font-bold uppercase text-[9px]">GLOBAL OPPORTUNITY GATEWAY</span>
            <h2 className="text-lg font-extrabold text-white mt-0.5">{title}</h2>
            <p className="text-gray-400 text-[10px]">{department} &middot; {opportunityType} &middot; {location}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg font-bold">âœ•</button>
        </div>

        {/* STAGE PROGRESS BAR */}
        {!submittedData && (
          <div className="space-y-2 border-b border-white/10 pb-4">
            <div className="flex justify-between text-[10px] font-bold uppercase text-amber-400">
              <span>Stage {stage} of 6: {
                stage === 1 ? 'Identity & Eligibility' :
                stage === 2 ? 'Education & Experience' :
                stage === 3 ? 'Opportunity Alignment' :
                stage === 4 ? 'Purpose & Values Assessment' :
                stage === 5 ? 'References & Verification' :
                'Review, Consent & Submission'
              }</span>
              <span>{Math.round((stage / 6) * 100)}% Completed</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-300"
                style={{ width: `${(stage / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* COMPLETED SUCCESS SUBMISSION CARD */}
        {submittedData ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 flex items-center justify-center text-2xl mx-auto">
              âœ“
            </div>
            <h3 className="text-2xl font-bold text-white uppercase font-serif">Application Submitted</h3>
            <p className="text-gray-300 text-xs max-w-md mx-auto leading-relaxed">
              Your profile for <strong>{submittedData.opportunityTitle}</strong> has entered the 6-stage candidate screening pipeline.
            </p>

            <div className="bg-[#070b19] border border-amber-400/30 p-6 rounded-2xl max-w-md mx-auto space-y-2 text-left font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Candidate ID:</span>
                <span className="text-amber-400 font-bold">{submittedData.candidateId}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Application ID:</span>
                <span className="text-amber-400 font-bold">{submittedData.applicationId}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Status:</span>
                <span className="text-emerald-400 font-bold">Automated Screening</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <a
                href="/candidate-dashboard"
                className="px-6 py-3 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs"
              >
                Access Candidate Dashboard â†’
              </a>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 text-white font-bold uppercase rounded-xl hover:bg-white/20 transition-all text-xs"
              >
                Close Gateway
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleNextStage} className="space-y-4">
            {/* STAGE I: IDENTITY & ELIGIBILITY */}
            {stage === 1 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase">Stage I â€” Candidate Identity & Eligibility</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Full Legal Name *</label>
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Swaraj Shandilya" className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Date of Birth *</label>
                    <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Email Address *</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@domain.com" className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Mobile / WhatsApp *</label>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">State & District *</label>
                    <input type="text" required value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Delhi, New Delhi" className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">LinkedIn Profile URL *</label>
                    <input type="url" required value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* STAGE II: EDUCATION & EXPERIENCE */}
            {stage === 2 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase">Stage II â€” Education, Skills & Professional Background</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Highest Qualification *</label>
                    <select value={qualification} onChange={(e) => setQualification(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none">
                      <option value="Undergraduate Student">Undergraduate Student</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's / MBA / LLM">Master's / MBA / LLM</option>
                      <option value="Ph.D. / Post-Doctoral">Ph.D. / Post-Doctoral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Institution Name *</label>
                    <input type="text" required value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g., IIFT New Delhi / DU" className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Total Work Experience (Years) *</label>
                    <input type="number" required value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Resume / CV Document URL (PDF) *</label>
                    <input type="url" required value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://drive.google.com/..." className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* STAGE III: OPPORTUNITY ALIGNMENT */}
            {stage === 3 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase">Stage III â€” Role Preferences & Institutional Alignment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Employment Type Preference</label>
                    <select value={preferredRoleType} onChange={(e) => setPreferredRoleType(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none">
                      <option value="Full-Time">Full-Time</option>
                      <option value="Fellowship">Fellowship</option>
                      <option value="Part-Time / Remote">Part-Time / Remote</option>
                      <option value="Volunteer / Leadership">Volunteer / Leadership</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Availability / Expected Joining</label>
                    <input type="text" value={availabilityDate} onChange={(e) => setAvailabilityDate(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* STAGE IV: ASSESSMENT */}
            {stage === 4 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase">Stage IV â€” Purpose, Values & Motivation</h4>
                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">Why People & Youth? What societal challenge do you wish to address? *</label>
                  <textarea rows={3} required value={whyPyEssay} onChange={(e) => setWhyPyEssay(e.target.value)} placeholder="Write a concise response..." className="w-full bg-[#070b19] border border-white/20 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none text-xs" />
                </div>
                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">Statement of Purpose / Writing Sample Link</label>
                  <input type="url" value={sopSample} onChange={(e) => setSopSample(e.target.value)} placeholder="https://..." className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                </div>
              </div>
            )}

            {/* STAGE V: VERIFICATION */}
            {stage === 5 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase">Stage V â€” Professional Verification & References</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Reference 1 (Academic / Employer) *</label>
                    <input type="text" required value={ref1} onChange={(e) => setRef1(e.target.value)} placeholder="Name, Role, Email" className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Reference 2 (Peer / Mentor) *</label>
                    <input type="text" required value={ref2} onChange={(e) => setRef2(e.target.value)} placeholder="Name, Role, Email" className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input type="checkbox" required checked={verificationConsent} onChange={(e) => setVerificationConsent(e.target.checked)} className="rounded text-amber-400 focus:ring-0" />
                  <span className="text-[10px] text-gray-300">I grant consent to People & Youth for background verification.</span>
                </label>
              </div>
            )}

            {/* STAGE VI: SUBMISSION */}
            {stage === 6 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase">Stage VI â€” Review, Digital Signature & Submission</h4>
                <div className="bg-[#070b19] p-4 rounded-xl border border-white/10 space-y-2 text-[10px]">
                  <div className="flex justify-between"><span className="text-gray-400">Applicant:</span><span className="text-white font-bold">{fullName} ({email})</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Applying For:</span><span className="text-amber-300 font-bold">{title}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Department:</span><span className="text-white font-bold">{department}</span></div>
                </div>

                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">Digital Signature (Type Full Legal Name) *</label>
                  <input type="text" required value={digitalSignature} onChange={(e) => setDigitalSignature(e.target.value)} placeholder="e.g., Swaraj Shandilya" className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-amber-300 font-bold focus:border-amber-400 focus:outline-none" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" required checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} className="rounded text-amber-400 focus:ring-0" />
                  <span className="text-[10px] text-gray-300">I declare that all provided details are accurate and abide by the Research & Editorial Charter.</span>
                </label>
              </div>
            )}

            {/* STAGE NAVIGATION BUTTONS */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              {stage > 1 ? (
                <button type="button" onClick={() => setStage(stage - 1)} className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold uppercase hover:bg-white/20">
                  â† Previous Stage
                </button>
              ) : <div />}

              <button type="submit" className="px-6 py-2.5 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs">
                {stage === 6 ? 'ðŸš€ Submit Application' : 'Proceed to Next Stage â†’'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}