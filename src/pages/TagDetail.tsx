import { useParams } from 'react-router-dom'
import { tagCounts } from '../lib/posts'
import Writing from './Writing'

export default function TagDetail() {
  const { tag = '' } = useParams()
  const decoded = decodeURIComponent(tag).toLowerCase()
  const known = tagCounts.find((t) => t.tag.toLowerCase() === decoded)?.tag ?? decoded
  return <Writing key={decoded} fixedTag={known} />
}
