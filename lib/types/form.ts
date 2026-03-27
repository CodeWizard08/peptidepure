export type FormType = 'baseline' | 'treatment-log' | 'ae-sae-report' | 'outcomes' | 'contact' | 'soap_capture';

export type FormSubmission = {
  id: string;
  form_type: FormType;
  data: Record<string, unknown>;
  submitted_by: string | null; // auth user id, null for anonymous contact
  provider_email: string | null;
  created_at: string;
};
