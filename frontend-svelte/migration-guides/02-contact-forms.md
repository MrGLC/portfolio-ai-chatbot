# Migration Guide: Contact Page & Forms

**React Source:** `frontend/src/pages/ContactPage.tsx`

## What You'll Learn
- Two-way binding with `bind:`
- Form handling
- Select/textarea elements
- Event modifiers

---

## Form State Management

### React Version
```tsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  company: '',
  service: '',
  budget: '',
  timeline: '',
  message: ''
});

const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

// In JSX
<Input
  name="name"
  value={formData.name}
  onChange={handleInputChange}
/>
```

### Svelte Version
```svelte
<script>
  let formData = {
    name: '',
    email: '',
    company: '',
    service: '',
    budget: '',
    timeline: '',
    message: ''
  };

  // That's it! No handler needed for basic binding
</script>

<!-- Two-way binding - much simpler -->
<input bind:value={formData.name} />
```

**Key Difference:** Svelte's `bind:value` eliminates the need for `onChange` handlers entirely.

---

## Complete Contact Form

### React Version (Abbreviated)
```tsx
const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({...});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl isRequired>
        <FormLabel>{t('contact.form.name')}</FormLabel>
        <Input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder={t('contact.form.namePlaceholder')}
        />
      </FormControl>

      <Select
        name="service"
        value={formData.service}
        onChange={handleInputChange}
      >
        <option value="">{t('contact.form.selectService')}</option>
        {services.map(service => (
          <option key={service} value={service}>
            {t(`contact.services.${service}`)}
          </option>
        ))}
      </Select>

      <Textarea
        name="message"
        value={formData.message}
        onChange={handleInputChange}
      />

      <Button type="submit">{t('contact.form.send')}</Button>
    </form>
  );
};
```

### Svelte Version
```svelte
<!-- src/routes/contact/+page.svelte -->
<script>
  import { t } from '$lib/i18n';

  let formData = {
    name: '',
    email: '',
    company: '',
    service: '',
    budget: '',
    timeline: '',
    message: ''
  };

  let isSubmitting = false;
  let submitSuccess = false;

  const services = [
    'nlpSolutions',
    'computerVision',
    'predictiveAnalytics',
    'customAI',
    'dataStrategy',
    'aiIntegration',
    'modelOptimization',
    'aiTraining',
    'other'
  ];

  const budgetRanges = [
    'under10k',
    '10kTo25k',
    '25kTo50k',
    '50kTo100k',
    'over100k'
  ];

  const timelines = [
    'immediate',
    '1to3months',
    '3to6months',
    '6plusMonths',
    'flexible'
  ];

  async function handleSubmit() {
    isSubmitting = true;

    try {
      // TODO: Connect to backend
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        submitSuccess = true;
        // Reset form
        formData = {
          name: '',
          email: '',
          company: '',
          service: '',
          budget: '',
          timeline: '',
          message: ''
        };
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<main>
  <section class="hero">
    <h1>{$t('contact.title')}</h1>
    <p>{$t('contact.subtitle')}</p>
  </section>

  <section class="form-section">
    {#if submitSuccess}
      <div class="success-message">
        <h2>{$t('contact.successTitle')}</h2>
        <p>{$t('contact.successMessage')}</p>
      </div>
    {:else}
      <form on:submit|preventDefault={handleSubmit}>
        <!-- Name field -->
        <div class="form-group">
          <label for="name">{$t('contact.form.name')} *</label>
          <input
            id="name"
            type="text"
            bind:value={formData.name}
            placeholder={$t('contact.form.namePlaceholder')}
            required
          />
        </div>

        <!-- Email field -->
        <div class="form-group">
          <label for="email">{$t('contact.form.email')} *</label>
          <input
            id="email"
            type="email"
            bind:value={formData.email}
            placeholder={$t('contact.form.emailPlaceholder')}
            required
          />
        </div>

        <!-- Company field (optional) -->
        <div class="form-group">
          <label for="company">{$t('contact.form.company')}</label>
          <input
            id="company"
            type="text"
            bind:value={formData.company}
            placeholder={$t('contact.form.companyPlaceholder')}
          />
        </div>

        <!-- Service select -->
        <div class="form-group">
          <label for="service">{$t('contact.form.service')} *</label>
          <select id="service" bind:value={formData.service} required>
            <option value="">{$t('contact.form.selectService')}</option>
            {#each services as service}
              <option value={service}>
                {$t(`contact.services.${service}`)}
              </option>
            {/each}
          </select>
        </div>

        <!-- Budget select -->
        <div class="form-group">
          <label for="budget">{$t('contact.form.budget')}</label>
          <select id="budget" bind:value={formData.budget}>
            <option value="">{$t('contact.form.selectBudget')}</option>
            {#each budgetRanges as range}
              <option value={range}>
                {$t(`contact.budget.${range}`)}
              </option>
            {/each}
          </select>
        </div>

        <!-- Timeline select -->
        <div class="form-group">
          <label for="timeline">{$t('contact.form.timeline')}</label>
          <select id="timeline" bind:value={formData.timeline}>
            <option value="">{$t('contact.form.selectTimeline')}</option>
            {#each timelines as timeline}
              <option value={timeline}>
                {$t(`contact.timeline.${timeline}`)}
              </option>
            {/each}
          </select>
        </div>

        <!-- Message textarea -->
        <div class="form-group full-width">
          <label for="message">{$t('contact.form.message')} *</label>
          <textarea
            id="message"
            bind:value={formData.message}
            placeholder={$t('contact.form.messagePlaceholder')}
            rows="5"
            required
          />
        </div>

        <!-- Submit button -->
        <button type="submit" class="submit-btn" disabled={isSubmitting}>
          {#if isSubmitting}
            {$t('contact.form.sending')}
          {:else}
            {$t('contact.form.send')}
          {/if}
        </button>
      </form>
    {/if}
  </section>
</main>

<style>
  .hero {
    text-align: center;
    padding: 4rem 1rem;
    background: linear-gradient(135deg, rgba(139, 0, 0, 0.3), transparent);
  }

  .hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .form-section {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  label {
    font-weight: 500;
    color: var(--color-text);
  }

  input,
  select,
  textarea {
    padding: 0.75rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text);
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.2);
  }

  input::placeholder,
  textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  select {
    cursor: pointer;
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }

  .submit-btn {
    grid-column: 1 / -1;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, var(--color-accent), #8B0000);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(196, 30, 58, 0.4);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .success-message {
    text-align: center;
    padding: 3rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
  }

  @media (max-width: 640px) {
    form {
      grid-template-columns: 1fr;
    }
  }
</style>
```

---

## Key Svelte Form Patterns

### Event Modifiers
```svelte
<!-- Prevent default -->
<form on:submit|preventDefault={handleSubmit}>

<!-- Stop propagation -->
<button on:click|stopPropagation={handle}>

<!-- Once (removes after first trigger) -->
<button on:click|once={handle}>

<!-- Passive (for scroll handlers) -->
<div on:scroll|passive={handle}>

<!-- Combine modifiers -->
<form on:submit|preventDefault|stopPropagation={handle}>
```

### Group Bindings (Checkboxes/Radios)
```svelte
<script>
  let selectedServices = []; // Array for checkboxes
  let contactMethod = ''; // String for radios
</script>

<!-- Checkbox group -->
{#each services as service}
  <label>
    <input
      type="checkbox"
      value={service}
      bind:group={selectedServices}
    />
    {service}
  </label>
{/each}

<!-- Radio group -->
{#each ['email', 'phone', 'video'] as method}
  <label>
    <input
      type="radio"
      value={method}
      bind:group={contactMethod}
    />
    {method}
  </label>
{/each}
```

### Form Validation
```svelte
<script>
  let email = '';
  let errors = {};

  // Reactive validation
  $: {
    errors = {};
    if (email && !email.includes('@')) {
      errors.email = 'Invalid email address';
    }
  }

  // Or use a library like felte, superforms
</script>

<input bind:value={email} class:error={errors.email} />
{#if errors.email}
  <span class="error-message">{errors.email}</span>
{/if}
```

---

## Exercise

1. Create the contact page with the full form
2. Add client-side validation
3. Implement loading and success states
4. Add transitions for the success message

Bonus: Create a reusable `FormField.svelte` component for consistent styling.
