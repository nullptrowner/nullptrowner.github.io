import { Home, PenLine, FolderGit2, Tag, User, Mail, Rss, Workflow, type LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'

const GithubIcon = (p: LucideProps) => (
  <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={p.className}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
)

const TelegramIcon = (p: LucideProps) => (
  <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={p.className}>
    <path d="M21.94 4.36a1.2 1.2 0 0 0-1.22-.2L2.9 11.05c-.97.38-.95 1.3-.17 1.55l4.55 1.42 1.76 5.4c.22.6.78.76 1.25.4l2.54-2.07 4.5 3.3c.62.34 1.2.17 1.37-.62l3-14.4c.2-.9-.32-1.28-.76-1.67ZM9.6 13.9l9.1-5.7c.4-.26.8-.1.5.18l-7.4 6.7-.3 3.1-1.9-4.28Z" />
  </svg>
)

const map: Record<string, ComponentType<LucideProps>> = {
  home: Home,
  pen: PenLine,
  folder: FolderGit2,
  workflow: Workflow,
  tag: Tag,
  user: User,
  github: GithubIcon,
  telegram: TelegramIcon,
  mail: Mail,
  rss: Rss,
}

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const C = map[name] ?? Tag
  return <C size={size} className={className} strokeWidth={1.75} />
}
