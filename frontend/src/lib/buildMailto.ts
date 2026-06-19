export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
}

const RECIPIENT = 'ingbmluisgomez@gmail.com';

// Build a mailto: URL that pre-fills the visitor's mail client with their
// enquiry. Optional fields are only included when non-empty.
export function buildMailto(data: ContactFormData): string {
  const subject = `Portfolio enquiry — ${data.name}`;
  const lines: string[] = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.company ? `Company: ${data.company}` : '',
    data.service ? `Service: ${data.service}` : '',
    data.budget ? `Budget: ${data.budget}` : '',
    data.timeline ? `Timeline: ${data.timeline}` : '',
    '',
    data.message,
  ].filter((line, i) => line !== '' || i === 6); // keep the single blank separator
  const body = lines.join('\n');
  return `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
