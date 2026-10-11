import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import About from './pages/About'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Projects from './pages/Projects'
import Search from './pages/Search'
import TagDetail from './pages/TagDetail'
import Tags from './pages/Tags'
import Writing from './pages/Writing'

// The article view pulls in the markdown renderer and highlight.js, so it loads on demand.
const Post = lazy(() => import('./pages/Post'))
const Schematics = lazy(() => import('./pages/Schematics'))
const SchematicDetail = lazy(() => import('./pages/SchematicDetail'))
const SchematicEditor = lazy(() => import('./pages/SchematicEditor'))

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="writing" element={<Writing />} />
          <Route path="posts/:slug" element={<Post />} />
          <Route path="tags" element={<Tags />} />
          <Route path="tags/:tag" element={<TagDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="schematics" element={<Schematics />} />
          <Route path="schematics/new" element={<SchematicEditor />} />
          <Route path="schematics/draft/:draftId" element={<SchematicEditor />} />
          <Route path="schematics/:slug" element={<SchematicDetail />} />
          <Route path="about" element={<About />} />
          <Route path="search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
