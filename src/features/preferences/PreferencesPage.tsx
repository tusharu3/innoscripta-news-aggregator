import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { useNewsSources } from '@/app/providers/SourcesProvider'
import { Button } from '@/components/Button/Button'
import { ChipToggle } from '@/components/ChipToggle/ChipToggle'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { APP_NAME } from '@/config/constants'
import { CATEGORIES } from '@/domain/article'
import { CATEGORY_LABELS } from '@/domain/labels'
import { usePreferences } from '@/features/preferences/preferencesStore'
import { bem } from '@/lib/bem'
import styles from './PreferencesPage.module.scss'

const b = bem(styles, 'preferences-page')

/** A titled card; `aria-labelledby` makes each one a named region for screen-reader navigation. */
function PreferenceSection({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className={b('section')}>
      <div>
        <h2 id={headingId} className={b('section-title')}>
          {title}
        </h2>
        <p className={b('hint')}>{hint}</p>
      </div>
      <div>{children}</div>
    </section>
  )
}

/** /preferences: choose sources and topics and manage followed authors. Saved automatically. Lazy-loaded route. */
export function PreferencesPage() {
  const sources = useNewsSources()
  const preferences = usePreferences()
  const [authorDraft, setAuthorDraft] = useState('')

  const addAuthor = (event: FormEvent) => {
    event.preventDefault()
    preferences.followAuthor(authorDraft)
    setAuthorDraft('')
  }

  return (
    <>
      <title>{`Preferences · ${APP_NAME}`}</title>
      <PageHeader
        eyebrow="Preferences"
        title="Make the feed"
        highlight="your own"
        description="Changes save automatically on this device."
      />

      <div className={b('stack')}>
        <PreferenceSection title="Sources" hint="Where your feed pulls stories from.">
          <div className={b('chips')}>
            {sources.map((source) => (
              <ChipToggle
                key={source.id}
                pressed={preferences.sources.includes(source.id)}
                onToggle={() => preferences.toggleSource(source.id)}
              >
                {source.label}
              </ChipToggle>
            ))}
          </div>
        </PreferenceSection>

        <PreferenceSection title="Topics" hint="Leave all unselected to see every topic.">
          <div className={b('chips')}>
            {CATEGORIES.map((category) => (
              <ChipToggle
                key={category}
                pressed={preferences.categories.includes(category)}
                onToggle={() => preferences.toggleCategory(category)}
              >
                {CATEGORY_LABELS[category]}
              </ChipToggle>
            ))}
          </div>
        </PreferenceSection>

        <PreferenceSection
          title="Authors"
          hint="Stories by these authors are shown first. Tip: use “+ Follow” on any article."
        >
          <form onSubmit={addAuthor} className={b('author-form')}>
            <label htmlFor="author" className="sr-only">
              Author name
            </label>
            <input
              id="author"
              value={authorDraft}
              onChange={(event) => setAuthorDraft(event.target.value)}
              placeholder="e.g. Jane Doe"
              className={b('author-input')}
              autoComplete="off"
            />
            <Button type="submit">Add</Button>
          </form>
          {preferences.authors.length > 0 && (
            <ul className={b('authors')} aria-label="Followed authors">
              {preferences.authors.map((name) => (
                <li key={name} className={b('author-tag')}>
                  {name}
                  <button
                    type="button"
                    onClick={() => preferences.toggleAuthor(name)}
                    aria-label={`Unfollow ${name}`}
                    className={b('remove')}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PreferenceSection>

        <Button variant="ghost" size="sm" onClick={preferences.reset} className={b('reset')}>
          Reset to defaults
        </Button>
      </div>
    </>
  )
}
