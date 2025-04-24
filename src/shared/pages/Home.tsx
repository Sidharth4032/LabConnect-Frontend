// File: src/pages/Home.tsx

import React, { useRef, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import Confetti from "react-confetti"
import SEO from "../components/SEO.tsx"
import logo from "../../images/LabConnect_Logo2.webp"
import { useDarkMode } from "../hooks/useDarkMode"
import { useTranslation } from "react-i18next"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Line } from "react-chartjs-2"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import BlogPostCard from "../components/Blog/BlogPostCard.tsx"
import TeamMemberCard from "../components/Team/TeamMemberCard.tsx"
import useWindowSize from "../hooks/useWindowSize"
import "../styles/HomeExpanded.css"

const Home: React.FC = () => {
  const aboutSectionRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const [confetti, setConfetti] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { t, i18n } = useTranslation()
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [chartData, setChartData] = useState<any>(null)
  const windowSize = useWindowSize()

  useEffect(() => {
    setBlogPosts(Array.from({ length: 5 }, (_, i) => ({ id: i, title: `Post #${i+1}`, excerpt: "Lorem ipsum…" })))
    setEvents(Array.from({ length: 7 }, (_, i) => ({ id: i, date: new Date(), title: `Event ${i+1}` })))
    setTeamMembers(Array.from({ length: 4 }, (_, i) => ({ id: i, name: `Member ${i+1}`, role: "Researcher" })))
    setChartData({
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [{ label: "Users", data: [65, 59, 80, 81, 56], fill: false }]
    })
  }, [])

  const handleScrollToAbout = () => aboutSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  const handleScrollToTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" })

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value })
  }
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setContactSubmitted(true)
  }

  const handleLongPressStart = () => {
    const timer = setTimeout(() => setConfetti(true), 1200)
    setLongPressTimer(timer)
  }
  const handleLongPressEnd = () => {
    if (longPressTimer) clearTimeout(longPressTimer)
    setLongPressTimer(null)
  }

  const onDragEnd = (result: any) => {}

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {}
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <main className={`${isDarkMode ? "dark" : "light"}`} ref={topRef}>
      <SEO title={t("home.title")} description={t("home.description")} />
      {confetti && <Confetti recycle={false} numberOfPieces={400} />}

      <section onMouseDown={handleLongPressStart} onMouseUp={handleLongPressEnd} onMouseLeave={handleLongPressEnd}>
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <img src={logo} alt={t("home.logoAlt")} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {t("home.welcome", { app: "LabConnect" })}
        </motion.h1>
        <p>{t("home.subtitle")}</p>
        <div>
          <Link to="/jobs">{t("home.browse")}</Link>
          <Link to="/create">{t("home.postRole")}</Link>
        </div>
        <button onClick={handleScrollToAbout}>{t("home.learnMore")} ↓</button>
      </section>

      <section>
        <h2>{t("sections.inspiringWords")}</h2>
        <motion.blockquote initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
          “Research is formalized curiosity. It is poking and prying with a purpose.” — Zora Neale Hurston
        </motion.blockquote>
      </section>

      <section>
        {[
          { value: "120+", label: t("stats.opportunities") },
          { value: "30+", label: t("stats.departments") },
          { value: "1.5k+", label: t("stats.users") },
        ].map((stat, i) => (
          <div key={i}>
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>{t("sections.testimonials")}</h2>
        <div>
          {["Helped me land my first role!", "Super intuitive.", "Found my advisor here!"].map((q, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }}>
              <p>“{q}”</p>
              <small>— RPI Student</small>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        {["React", "TailwindCSS", "PostgreSQL", "Flask", "Vite", "TypeScript"].map((tech, i) => (
          <span key={i}>{tech}</span>
        ))}
      </section>

      <section>
        <h2>{t("sections.mailingList")}</h2>
        <form onSubmit={handleContactSubmit}>
          <input type="email" name="email" placeholder={t("forms.emailPlaceholder")} onChange={handleContactChange} />
          <button type="submit">{t("forms.subscribe")}</button>
        </form>
        {contactSubmitted && <p>{t("forms.thankYou")}</p>}
      </section>

      <BlogFeedSection posts={blogPosts} onDragEnd={onDragEnd} />

      <EventCalendarSection events={events} onDateClick={(date) => console.log(date)} />

      <TeamShowcaseSection members={teamMembers} />

      <SearchFilterPanel />

      <ChartPlaceholder data={chartData} />

      <DarkModeToggle isDark={isDarkMode} toggle={toggleDarkMode} />

      <I18nToggle currentLang={i18n.language} switchLang={(lng) => i18n.changeLanguage(lng)} />

      <DragAndDropUploader onDrop={(files) => console.log(files)} />

      <AccessibilityLandmarks />

      <button onClick={handleScrollToTop}>↑</button>

      <div style={{ height: 100 }} />
    </main>
)

export default Home

interface BlogFeedProps {
  posts: any[]
  onDragEnd: (result: any) => void
}
function BlogFeedSection({ posts, onDragEnd }: BlogFeedProps) {
  return (
    <section aria-labelledby="blog-feed-heading">
      <h2 id="blog-feed-heading">Blog Feed</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="blog-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {posts.map((post, i) => (
                <Draggable key={post.id} draggableId={String(post.id)} index={i}>
                  {(p) => (
                    <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                      <BlogPostCard title={post.title} excerpt={post.excerpt} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </section>
  )
}

interface EventCalendarProps {
  events: any[]
  onDateClick: (date: Date) => void
}
function EventCalendarSection({ events, onDateClick }: EventCalendarProps) {
  return (
    <section aria-labelledby="event-calendar-heading">
      <h2 id="event-calendar-heading">Upcoming Events</h2>
      <Calendar
        onClickDay={onDateClick}
        tileContent={({ date }) => {
          const ev = events.find((e) => new Date(e.date).toDateString() === date.toDateString())
          return ev ? <small>• {ev.title}</small> : null
        }}
      />
    </section>
  )
}

interface TeamShowcaseProps {
  members: any[]
}
function TeamShowcaseSection({ members }: TeamShowcaseProps) {
  return (
    <section aria-labelledby="team-showcase-heading">
      <h2 id="team-showcase-heading">Meet The Team</h2>
      <div>
        {members.map((m) => (
          <TeamMemberCard key={m.id} name={m.name} role={m.role} />
        ))}
      </div>
    </section>
  )
}

function SearchFilterPanel() {
  return (
    <aside aria-label="Search and Filters">
      <h2>Search & Filters</h2>
      <input type="search" placeholder="Search opportunities…" />
      <fieldset>
        <legend>Department</legend>
        <label><input type="checkbox" /> Biology</label>
        <label><input type="checkbox" /> Chemistry</label>
        <label><input type="checkbox" /> Physics</label>
      </fieldset>
      <fieldset>
        <legend>Type</legend>
        <label><input type="radio" name="type" /> Internship</label>
        <label><input type="radio" name="type" /> Full-Time</label>
      </fieldset>
    </aside>
  )
}

interface ChartPlaceholderProps {
  data: any
}
function ChartPlaceholder({ data }: ChartPlaceholderProps) {
  return (
    <section aria-labelledby="chart-heading">
      <h2 id="chart-heading">Usage Over Time</h2>
      {data ? (
        <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      ) : (
        <p>Loading chart…</p>
      )}
    </section>
  )
}

interface DarkModeToggleProps {
  isDark: boolean
  toggle: () => void
}
function DarkModeToggle({ isDark, toggle }: DarkModeToggleProps) {
  return <button onClick={toggle}>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</button>
}

interface I18nToggleProps {
  currentLang: string
  switchLang: (lng: string) => void
}
function I18nToggle({ currentLang, switchLang }: I18nToggleProps) {
  return (
    <div>
      <label>
        Language:
        <select value={currentLang} onChange={(e) => switchLang(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </label>
    </div>
  )
}

interface DragAndDropUploaderProps {
  onDrop: (files: FileList) => void
}
function DragAndDropUploader({ onDrop }: DragAndDropUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    onDrop(e.dataTransfer.files)
  }
  return (
    <section className={dragOver ? "drag-over" : ""}>
      <h2>Upload Files</h2>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <p>Drag & drop files here, or click to browse.</p>
        <input type="file" multiple hidden onChange={(e) => e.target.files && onDrop(e.target.files)} />
      </div>
    </section>
  )
}

function AccessibilityLandmarks() {
  return (
    <>
      <header role="banner" />
      <nav role="navigation" />
      <main role="main" />
      <aside role="complementary" />
      <footer role="contentinfo" />
    </>
  )
}
