export type CertificateType = 'fellowship_grant' | 'internship_completion' | 'journal_publication' | 'district_rti_auditor';

export interface CivicCertificate {
  id: string;
  certificate_id: string;
  recipient_name: string;
  recipient_email: string;
  passport_id?: string;
  certificate_type: CertificateType;
  title: string;
  issuing_body: string;
  issuing_authority_name: string;
  issuing_authority_title: string;
  issued_at: string;
  digital_signature: string;
  qr_code_url: string;
  is_valid: boolean;
}
