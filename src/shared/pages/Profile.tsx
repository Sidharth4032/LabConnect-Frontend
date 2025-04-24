// File: src/pages/Profile.tsx

import React, { useEffect, useState } from "react"
import ProfileComponents from "../components/Profile/ProfileComponents.tsx"
import { useAuth } from "../../context/AuthContext.tsx"
import { Profile } from "../../types/profile.ts"
import { useDarkMode } from "../hooks/useDarkMode.ts"
import { useTranslation } from "react-i18next"
import { Line } from "react-chartjs-2"
import Calendar from "react-calendar"
import BlogPostCard from "../components/Blog/BlogPostCard.tsx"
import TeamMemberCard from "../components/Team/TeamMemberCard.tsx"
import "../styles/ProfileExpanded.css"

export default function ProfilePage() {
  const { auth } = useAuth()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { t, i18n } = useTranslation()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [chartData, setChartData] = useState<any>(null)
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [securitySettings, setSecuritySettings] = useState<any>({})
  const [notificationsSettings, setNotificationsSettings] = useState<any>({})
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([])
  const [billingInfo, setBillingInfo] = useState<any>({})
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [trustedDevices, setTrustedDevices] = useState<any[]>([])
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [developerSettings, setDeveloperSettings] = useState<any>({})
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null)
  const [abTestData, setAbTestData] = useState<any>(null)
  const [errorBoundaryLogs, setErrorBoundaryLogs] = useState<any[]>([])
  const [bulkActionsData, setBulkActionsData] = useState<any[]>([])
  const [dataExportOptions, setDataExportOptions] = useState<any[]>([])
  const [dataImportOptions, setDataImportOptions] = useState<any[]>([])
  const [seoLanguages] = useState<string[]>(["en", "es", "fr"])
  const [cookieConsentAgreed, setCookieConsentAgreed] = useState(false)
  const [socialMediaLinks, setSocialMediaLinks] = useState<any[]>([])
  const [sponsorsPartners, setSponsorsPartners] = useState<any[]>([])
  const [pwaPromptState, setPwaPromptState] = useState<any>(null)
  const [onboardingStep, setOnboardingStep] = useState<number>(1)
  const [roadmapData, setRoadmapData] = useState<any[]>([])
  const [faqItems, setFaqItems] = useState<any[]>([])
  const [spotlightItems, setSpotlightItems] = useState<any[]>([])
  const [feedbackMessages, setFeedbackMessages] = useState<any[]>([])

  useEffect(() => {
    if (!auth.isAuthenticated) {
      window.location.href = "/login"
    }
  }, [auth])

  useEffect(() => {
    async function fetchAll() {
      const res = await fetch(`${process.env.REACT_APP_BACKEND}/profile`, {
        credentials: "include",
      })
      if (res.ok) {
        const data: Profile = await res.json()
        setProfile(data)
      } else {
        setProfile(null)
      }
      setChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        datasets: [{ label: "Logins", data: [2, 3, 1, 4, 2], fill: false }],
      })
      setBlogPosts(
        Array.from({ length: 3 }, (_, i) => ({
          id: i,
          title: `Post ${i + 1}`,
          excerpt: "Excerpt…",
        }))
      )
      setEvents(
        Array.from({ length: 4 }, (_, i) => ({
          id: i,
          date: new Date(),
          title: `Event ${i + 1}`,
        }))
      )
      setConnectedAccounts([{ id: 1, provider: "google" }])
      setSecuritySettings({ passwordLastChanged: "2025-04-01" })
      setNotificationsSettings({ email: true, sms: false })
      setBillingInfo({ plan: "Free", nextBillingDate: "2025-05-01" })
      setApiKeys([{ id: 1, key: "abcd-1234" }])
      setWebhooks([{ id: 1, url: "https://example.com/hook" }])
      setAuditLogs([
        { id: 1, action: "login", date: new Date() },
      ])
      setSessions([
        { id: 1, device: "Chrome on macOS", lastActive: new Date() },
      ])
      setTrustedDevices([{ id: 1, name: "My Laptop" }])
      setDeveloperSettings({ enableSandbox: false })
      setPerformanceMetrics({ cpu: 10, memory: 256 })
      setAbTestData({ variantA: 50, variantB: 50 })
      setErrorBoundaryLogs([{ id: 1, error: "TypeError" }])
      setBulkActionsData([{ id: 1, name: "Reset Passwords" }])
      setDataExportOptions(["CSV", "JSON"])
      setDataImportOptions(["CSV"])
      setSocialMediaLinks([
        { id: 1, platform: "Twitter", url: "https://twitter.com/me" },
      ])
      setSponsorsPartners([{ id: 1, name: "RPI" }])
      setRoadmapData([{ phase: "Alpha", complete: 20 }])
      setFaqItems([{ question: "Q1?", answer: "A1." }])
      setSpotlightItems([{ id: 1, name: "User Spotlight" }])
      setFeedbackMessages([{ id: 1, message: "Great work!" }])
    }
    fetchAll()
  }, [])

  const toggleEdit = () => setEditing(!editing)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAvatarFile(e.target.files[0])
    }
  }
  const saveProfile = () => setEditing(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {}
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (profile === null) return <p>{t("profile.loading")}</p>
  if (profile === undefined) return <p>{t("profile.notFound")}</p>

  return (
    <main className={`${isDarkMode ? "dark" : "light"} profile-page`}>
      <button onClick={toggleDarkMode}>
        {isDarkMode ? t("profile.lightMode") : t("profile.darkMode")}
      </button>
      <div>
        <label>
          {t("profile.language")}:
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            {seoLanguages.map((lng) => (
              <option key={lng} value={lng}>
                {lng}
              </option>
            ))}
          </select>
        </label>
      </div>

      {editing ? (
        <EditProfileForm
          profile={profile}
          onSave={saveProfile}
          onCancel={toggleEdit}
        />
      ) : (
        <>
          <ProfileComponents profile={profile} id={profile.id} staff={false} />
          <button onClick={toggleEdit}>{t("profile.edit")}</button>
        </>
      )}

      <ActivityChart data={chartData} />

      <BlogPostsSection posts={blogPosts} />

      <EventsCalendarSection events={events} />

      <AvatarUploader file={avatarFile} onChange={handleAvatarChange} />

      <SecuritySettingsSection
        settings={securitySettings}
        onChange={setSecuritySettings}
      />

      <NotificationsSettingsSection
        settings={notificationsSettings}
        onChange={setNotificationsSettings}
      />

      <ConnectedAccountsSection accounts={connectedAccounts} />

      <BillingInfoSection info={billingInfo} />

      <APIKeysSection keys={apiKeys} />

      <WebhooksSection webhooks={webhooks} />

      <AuditLogsSection logs={auditLogs} />

      <SessionManagementSection sessions={sessions} />

      <TrustedDevicesSection devices={trustedDevices} />

      <MultiFactorAuthSection
        enabled={mfaEnabled}
        onToggle={setMfaEnabled}
      />

      <DeveloperAPISection config={developerSettings} />

      <GraphQLExplorerSection />

      <TeamMemberListSection members={[]} />

      <PerformanceMetricsSection metrics={performanceMetrics} />

      <ABTestingSection data={abTestData} />

      <ErrorBoundarySection logs={errorBoundaryLogs} />

      <LoggingMonitoringSection logs={errorBoundaryLogs} />

      <BulkActionsSection actions={bulkActionsData} />

      <DataExportSection options={dataExportOptions} />

      <DataImportSection options={dataImportOptions} />

      <MultiLanguageSEOSection langs={seoLanguages} />

      <CookieConsentSection
        consent={cookieConsentAgreed}
        onChange={setCookieConsentAgreed}
      />

      <SearchEngineSitemapSection />

      <PrivacyPolicySection />

      <TermsOfUseSection />

      <SocialMediaLinksSection links={socialMediaLinks} />

      <SponsorsPartnersSection partners={sponsorsPartners} />

      <SiteMapSection />

      <ChatSupportSection />

      <ServiceWorkerSection />

      <PWAInstallPromptSection promptState={pwaPromptState} />

      <OnboardingTutorialSection step={onboardingStep} />

      <RoadmapTimelineSection data={roadmapData} />

      <FAQAccordionSection items={faqItems} />

      <SpotlightCarouselSection items={spotlightItems} />

      <FeedbackFormSection messages={feedbackMessages} />

      <FeedbackWidgetSection />
    </main>
  )
}

function EditProfileForm({
  profile,
  onSave,
  onCancel,
}: {
  profile: Profile
  onSave: () => void
  onCancel: () => void
}) {
  const [formState, setFormState] = useState(profile)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave() }}>
      <label>
        Name:
        <input name="name" value={(formState as any).name} onChange={handleChange} />
      </label>
      <label>
        Bio:
        <textarea name="bio" value={(formState as any).bio} onChange={handleChange} />
      </label>
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  )
}

function ActivityChart({ data }: { data: any }) {
  return (
    <section>
      <h2>Activity</h2>
      {data ? <Line data={data} /> : <p>Loading…</p>}
    </section>
  )
}

function BlogPostsSection({ posts }: { posts: any[] }) {
  return (
    <section>
      <h2>My Posts</h2>
      {posts.map((p) => (
        <BlogPostCard key={p.id} title={p.title} excerpt={p.excerpt} />
      ))}
    </section>
  )
}

function EventsCalendarSection({ events }: { events: any[] }) {
  return (
    <section>
      <h2>My Events</h2>
      <Calendar
        tileContent={({ date }) => {
          const ev = events.find(
            (e) => new Date(e.date).toDateString() === date.toDateString()
          )
          return ev ? <small>• {ev.title}</small> : null
        }}
      />
    </section>
  )
}

function AvatarUploader({
  file,
  onChange,
}: {
  file: File | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <section>
      <h2>Avatar</h2>
      {file && <img src={URL.createObjectURL(file)} alt="Preview" />}
      <input type="file" accept="image/*" onChange={onChange} />
      <button>Upload</button>
    </section>
  )
}

function SecuritySettingsSection({
  settings,
  onChange,
}: {
  settings: any
  onChange: (s: any) => void
}) {
  return (
    <section>
      <h2>Security</h2>
      <div>Password last changed: {settings.passwordLastChanged}</div>
      <button onClick={() => onChange({
        ...settings,
        passwordLastChanged: new Date().toISOString(),
      })}>
        Change Password
      </button>
    </section>
  )
}

function NotificationsSettingsSection({
  settings,
  onChange,
}: {
  settings: any
  onChange: (s: any) => void
}) {
  return (
    <section>
      <h2>Notifications</h2>
      <label>
        Email:
        <input
          type="checkbox"
          checked={settings.email}
          onChange={() =>
            onChange({ ...settings, email: !settings.email })
          }
        />
      </label>
      <label>
        SMS:
        <input
          type="checkbox"
          checked={settings.sms}
          onChange={() =>
            onChange({ ...settings, sms: !settings.sms })
          }
        />
      </label>
    </section>
  )
}

function ConnectedAccountsSection({ accounts }: { accounts: any[] }) {
  return (
    <section>
      <h2>Connected Accounts</h2>
      {accounts.map((a) => (
        <div key={a.id}>{a.provider}</div>
      ))}
    </section>
  )
}

function BillingInfoSection({ info }: { info: any }) {
  return (
    <section>
      <h2>Billing</h2>
      <div>Plan: {info.plan}</div>
      <div>Next: {info.nextBillingDate}</div>
    </section>
  )
}

function APIKeysSection({ keys }: { keys: any[] }) {
  return (
    <section>
      <h2>API Keys</h2>
      {keys.map((k) => (
        <div key={k.id}>{k.key}</div>
      ))}
    </section>
  )
}

function WebhooksSection({ webhooks }: { webhooks: any[] }) {
  return (
    <section>
      <h2>Webhooks</h2>
      {webhooks.map((w) => (
        <div key={w.id}>{w.url}</div>
      ))}
    </section>
  )
}

function AuditLogsSection({ logs }: { logs: any[] }) {
  return (
    <section>
      <h2>Audit Logs</h2>
      {logs.map((l) => (
        <div key={l.id}>
          {l.action} at {new Date(l.date).toLocaleString()}
        </div>
      ))}
    </section>
  )
}

function SessionManagementSection({ sessions }: { sessions: any[] }) {
  return (
    <section>
      <h2>Sessions</h2>
      {sessions.map((s) => (
        <div key={s.id}>
          {s.device} active {new Date(s.lastActive).toLocaleTimeString()}
        </div>
      ))}
    </section>
  )
}

function TrustedDevicesSection({ devices }: { devices: any[] }) {
  return (
    <section>
      <h2>Trusted Devices</h2>
      {devices.map((d) => (
        <div key={d.id}>{d.name}</div>
      ))}
    </section>
  )
}

function MultiFactorAuthSection({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: (e: boolean) => void
}) {
  return (
    <section>
      <h2>Multi-Factor Auth</h2>
      <button onClick={() => onToggle(!enabled)}>
        {enabled ? "Disable" : "Enable"}
      </button>
    </section>
  )
}

function DeveloperAPISection({ config }: { config: any }) {
  return (
    <section>
      <h2>Developer API</h2>
      <div>Sandbox: {String(config.enableSandbox)}</div>
    </section>
  )
}

function GraphQLExplorerSection() {
  return (
    <section>
      <h2>GraphQL Explorer</h2>
      <div>Embed here</div>
    </section>
  )
}

function TeamMemberListSection({ members }: { members: any[] }) {
  return (
    <section>
      <h2>Team Members</h2>
      {members.map((m) => (
        <TeamMemberCard key={m.id} name={m.name} role={m.role} />
      ))}
    </section>
  )
}

function PerformanceMetricsSection({ metrics }: { metrics: any }) {
  return (
    <section>
      <h2>Performance</h2>
      <div>CPU: {metrics.cpu}%</div>
      <div>Memory: {metrics.memory}MB</div>
    </section>
  )
}

function ABTestingSection({ data }: { data: any }) {
  return (
    <section>
      <h2>A/B Testing</h2>
      <div>Variant A: {data.variantA}%</div>
      <div>Variant B: {data.variantB}%</div>
    </section>
  )
}

function ErrorBoundarySection({ logs }: { logs: any[] }) {
  return (
    <section>
      <h2>Error Boundaries</h2>
      {logs.map((l) => (
        <div key={l.id}>{l.error}</div>
      ))}
    </section>
  )
}

function LoggingMonitoringSection({ logs }: { logs: any[] }) {
  return (
    <section>
      <h2>Logs & Monitoring</h2>
      {logs.map((l) => (
        <div key={l.id}>{l.error}</div>
      ))}
    </section>
  )
}

function BulkActionsSection({ actions }: { actions: any[] }) {
  return (
    <section>
      <h2>Bulk Actions</h2>
      {actions.map((a) => (
        <button key={a.id}>{a.name}</button>
      ))}
    </section>
  )
}

function DataExportSection({ options }: { options: any[] }) {
  return (
    <section>
      <h2>Data Export</h2>
      <select>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </section>
  )
}

function DataImportSection({ options }: { options: any[] }) {
  return (
    <section>
      <h2>Data Import</h2>
      <select>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </section>
  )
}

function MultiLanguageSEOSection({ langs }: { langs: string[] }) {
  return (
    <section>
      <h2>SEO Languages</h2>
      {langs.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </section>
  )
}

function CookieConsentSection({
  consent,
  onChange,
}: {
  consent: boolean
  onChange: (c: boolean) => void
}) {
  return (
    <section>
      <h2>Cookie Consent</h2>
      <button onClick={() => onChange(!consent)}>
        {consent ? "Revoke" : "Agree"}
      </button>
    </section>
  )
}

function SearchEngineSitemapSection() {
  return (
    <section>
      <h2>Sitemap</h2>
      <div>Generate here</div>
    </section>
  )
}

function PrivacyPolicySection() {
  return (
    <section>
      <h2>Privacy Policy</h2>
      <a href="/privacy">View</a>
    </section>
  )
}

function TermsOfUseSection() {
  return (
    <section>
      <h2>Terms of Use</h2>
      <a href="/terms">View</a>
    </section>
  )
}

function SocialMediaLinksSection({ links }: { links: any[] }) {
  return (
    <section>
      <h2>Social Media</h2>
      {links.map((l) => (
        <a key={l.id} href={l.url}>
          {l.platform}
        </a>
      ))}
    </section>
  )
}

function SponsorsPartnersSection({ partners }: { partners: any[] }) {
  return (
    <section>
      <h2>Sponsors</h2>
      {partners.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </section>
  )
}

function SiteMapSection() {
  return (
    <section>
      <h2>Site Map</h2>
      <div>Links</div>
    </section>
  )
}

function ChatSupportSection() {
  return (
    <section>
      <h2>Chat Support</h2>
      <div>Widget</div>
    </section>
  )
}

function ServiceWorkerSection() {
  return (
    <section>
      <h2>Service Worker</h2>
      <div>Registration</div>
    </section>
  )
}

function PWAInstallPromptSection({ promptState }: { promptState: any }) {
  return (
    <section>
      <h2>PWA Prompt</h2>
      <div>{String(promptState)}</div>
    </section>
  )
}

function OnboardingTutorialSection({ step }: { step: number }) {
  return (
    <section>
      <h2>Onboarding</h2>
      <div>Step {step}</div>
    </section>
  )
}

function RoadmapTimelineSection({ data }: { data: any[] }) {
  return (
    <section>
      <h2>Roadmap</h2>
      {data.map((d, i) => (
        <div key={i}>
          {d.phase}: {d.complete}%
        </div>
      ))}
    </section>
  )
}

function FAQAccordionSection({ items }: { items: any[] }) {
  return (
    <section>
      <h2>FAQ</h2>
      {items.map((i, idx) => (
        <div key={idx}>{i.question}</div>
      ))}
    </section>
  )
}

function SpotlightCarouselSection({ items }: { items: any[] }) {
  return (
    <section>
      <h2>Spotlight</h2>
      {items.map((i) => (
        <div key={i.id}>{i.name}</div>
      ))}
    </section>
  )
}

function FeedbackFormSection({ messages }: { messages: any[] }) {
  return (
    <section>
      <h2>Feedback</h2>
      {messages.map((m) => (
        <div key={m.id}>{m.message}</div>
      ))}
    </section>
  )
}

function FeedbackWidgetSection() {
  return (
    <section>
      <h2>Feedback Widget</h2>
      <div>Embed</div>
    </section>
  )
}
