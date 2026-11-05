import { q, track } from '../env';

/**
 * Web3Forms submission with fetch and inline states. Without JS the form posts normally
 * and Web3Forms redirects back to #sent, which CSS reveals with :target.
 */
export function initContact() {
  const form = q<HTMLFormElement>('[data-contact-form]');
  const status = q('[data-status]', form);
  const submit = q<HTMLButtonElement>('[data-submit]', form);

  const setStatus = (text: string, kind: '' | 'is-success' | 'is-error' = '') => {
    status.textContent = text;
    status.className = `form__status ${kind}`.trim();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    delete data.redirect; // only for the no-JS post
    if (data.botcheck) return; // honeypot ticked: silently drop

    submit.disabled = true;
    setStatus('Sending…');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!res.ok || !json.success) throw new Error(json.message || `HTTP ${res.status}`);
      form.reset();
      setStatus("Thanks, your message was sent. I'll be in touch soon.", 'is-success');
      track('generate_lead', { method: 'contact_form' });
    } catch {
      setStatus('That did not send. Please try again, or book a time instead.', 'is-error');
    } finally {
      submit.disabled = false;
    }
  });
}
