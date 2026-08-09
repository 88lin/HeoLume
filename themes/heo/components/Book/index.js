/**
 * THESIS: A reading archive should open into the author's notes, not eject visitors into a store.
 * OWN-WORLD: A crisp daylight field, flat category-color folios, handwritten marginalia, and Heo-sized rounded objects.
 * STORY: Visitors scan a useful catalog, open any book into preserved notes, follow related ideas, then continue in WeChat Read.
 * FIRST VIEWPORT: A compact archive title sits beside regularly stacked recommendations; the shelf and idea index begin within the next scroll.
 * FORM: Color-coded Marginalia Archive, staged as a regular side-spine recommendation deck that opens into a focused reading folio; seed 45d498a9.
 */
import Image from 'next/image'
import { useRouter } from 'next/router'
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUpRight,
  IconBook2,
  IconBooks,
  IconCheck,
  IconChevronDown,
  IconCopy,
  IconDice5,
  IconExternalLink,
  IconHeart,
  IconHeartFilled,
  IconLayoutGrid,
  IconList,
  IconNetwork,
  IconQuote,
  IconX
} from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import catalog from './bookCatalog.json'
import styles from './styles.module.css'

const FAVORITES_KEY = 'notionnext-book-favorites-v1'

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'psychology', label: '心理学' },
  { key: 'growth', label: '个人成长' },
  { key: 'literature', label: '文学' },
  { key: 'business', label: '商业' },
  { key: 'design', label: '设计' },
  { key: 'feminism', label: '女性' }
]

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map(category => [category.key, category.label])
)

const TOPIC_TONES = ['blue', 'teal', 'green', 'gold', 'violet', 'rose']

const BOOKS = catalog.books
const FEATURED_BOOK_IDS = [
  'courage-to-be-disliked',
  'intimate-relationships',
  'flow',
  'asking-the-right-questions',
  'almanack-of-naval',
  'design-of-design',
  'thinking-in-systems',
  'room-of-ones-own'
]
const FEATURED_TONES = [
  'azure',
  'berry',
  'saffron',
  'teal',
  'forest',
  'violet',
  'terracotta',
  'indigo'
]
const FEATURED_BOOKS = FEATURED_BOOK_IDS.map(id =>
  BOOKS.find(book => book.id === id)
).filter(Boolean)

const splitHighlights = value => {
  const text = String(value || '').trim()
  const matches = [...text.matchAll(/（\d+）([\s\S]*?)(?=（\d+）|$)/g)].map(
    match => match[1].trim().replace(/[；;]$/, '')
  )

  if (matches.length) return matches
  return text
    .split(/[；;]/)
    .map(item => item.trim())
    .filter(Boolean)
}

const BookShelf = ({ bookStats }) => {
  const router = useRouter()
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('curated')
  const [view, setView] = useState('grid')
  const [section, setSection] = useState('shelf')
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [favoritesReady, setFavoritesReady] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [knowledge, setKnowledge] = useState(null)
  const [knowledgeStatus, setKnowledgeStatus] = useState('idle')
  const [knowledgeError, setKnowledgeError] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [copiedInsight, setCopiedInsight] = useState('')
  const [pageReady, setPageReady] = useState(false)
  const pageRef = useRef(null)
  const catalogRef = useRef(null)
  const featuredTouchStartRef = useRef(null)
  const featuredSwipeAtRef = useRef(0)
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const detailGridRef = useRef(null)
  const detailContentRef = useRef(null)
  const previousFocusRef = useRef(null)
  const knowledgeCacheRef = useRef(null)
  const knowledgeCacheUrlRef = useRef('')
  const knowledgeRequestRef = useRef(null)
  const knowledgeRequestUrlRef = useRef('')
  const copyTimerRef = useRef(null)

  const totalInsights = useMemo(
    () => BOOKS.reduce((total, book) => total + book.insightCount, 0),
    []
  )
  const totalChapters = knowledge
    ? knowledge.books.reduce((total, book) => total + book.chapters.length, 0)
    : bookStats?.chapterCount

  const categoryCounts = useMemo(() => {
    return BOOKS.reduce(
      (counts, book) => ({
        ...counts,
        [book.category]: (counts[book.category] || 0) + 1
      }),
      { all: BOOKS.length }
    )
  }, [])

  const knowledgeVersion = bookStats?.knowledgeVersion
  const knowledgeUrl = `${router.basePath || ''}/data/book-knowledge.json${
    knowledgeVersion ? `?v=${knowledgeVersion}` : ''
  }`

  useEffect(() => {
    let frame
    let fallbackTimer

    const revealWhenStyled = () => {
      const page = pageRef.current
      const pageToken = page
        ? window.getComputedStyle(page).getPropertyValue('--page').trim()
        : ''

      if (pageToken) {
        window.clearTimeout(fallbackTimer)
        setPageReady(true)
        return
      }

      frame = window.requestAnimationFrame(revealWhenStyled)
    }

    frame = window.requestAnimationFrame(revealWhenStyled)
    fallbackTimer = window.setTimeout(() => setPageReady(true), 4000)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(fallbackTimer)
    }
  }, [])

  const loadKnowledge = useCallback(
    async (force = false) => {
      if (!force) {
        if (
          knowledgeCacheUrlRef.current === knowledgeUrl &&
          knowledgeCacheRef.current
        ) {
          return knowledgeCacheRef.current
        }
        if (knowledgeCacheUrlRef.current === knowledgeUrl && knowledge) {
          return knowledge
        }
        if (
          knowledgeRequestUrlRef.current === knowledgeUrl &&
          knowledgeRequestRef.current
        ) {
          return knowledgeRequestRef.current
        }
      }

      setKnowledgeStatus('loading')
      setKnowledgeError('')

      let request
      request = fetch(knowledgeUrl, { cache: 'force-cache' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          return response.json()
        })
        .then(payload => {
          if (
            !Array.isArray(payload?.books) ||
            !Array.isArray(payload?.edges)
          ) {
            throw new Error('Invalid knowledge payload')
          }

          if (
            knowledgeRequestRef.current !== request ||
            knowledgeRequestUrlRef.current !== knowledgeUrl
          ) {
            return payload
          }

          knowledgeCacheRef.current = payload
          knowledgeCacheUrlRef.current = knowledgeUrl
          setKnowledge(payload)
          setKnowledgeStatus('ready')
          return payload
        })
        .catch(error => {
          console.error('[书单] 完整读书笔记加载失败。', error)
          if (
            knowledgeRequestRef.current === request &&
            knowledgeRequestUrlRef.current === knowledgeUrl
          ) {
            setKnowledgeStatus('error')
            setKnowledgeError('读书笔记加载失败，请检查网络后重试。')
          }
          throw error
        })
        .finally(() => {
          if (
            knowledgeRequestRef.current === request &&
            knowledgeRequestUrlRef.current === knowledgeUrl
          ) {
            knowledgeRequestRef.current = null
            knowledgeRequestUrlRef.current = ''
          }
        })

      knowledgeRequestRef.current = request
      knowledgeRequestUrlRef.current = knowledgeUrl
      return request
    },
    [knowledge, knowledgeUrl]
  )

  useEffect(() => {
    try {
      const storedFavorites = JSON.parse(
        window.localStorage.getItem(FAVORITES_KEY) || '[]'
      )
      if (Array.isArray(storedFavorites)) {
        setFavorites(
          storedFavorites.filter(id => BOOKS.some(book => book.id === id))
        )
      }
    } catch (error) {
      console.warn('[书单] 本地收藏读取失败。', error)
    } finally {
      setFavoritesReady(true)
    }
  }, [])

  useEffect(() => {
    if (!favoritesReady) return
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.warn('[书单] 本地收藏保存失败。', error)
    }
  }, [favorites, favoritesReady])

  const visibleBooks = useMemo(() => {
    const favoriteSet = new Set(favorites)

    const filteredBooks = BOOKS.filter(book => {
      const matchesCategory = category === 'all' || book.category === category
      const matchesFavorite = !favoritesOnly || favoriteSet.has(book.id)
      return matchesCategory && matchesFavorite
    })

    return [...filteredBooks].sort((first, second) => {
      if (sortBy === 'title') {
        return first.title.localeCompare(second.title, 'zh-CN')
      }
      if (sortBy === 'insights') {
        return second.insightCount - first.insightCount
      }
      return BOOKS.indexOf(first) - BOOKS.indexOf(second)
    })
  }, [category, favorites, favoritesOnly, sortBy])

  const detailNavigationBooks =
    selectedBook && visibleBooks.some(book => book.id === selectedBook.id)
      ? visibleBooks
      : BOOKS

  const flattenedInsights = useMemo(() => {
    if (!knowledge) return []
    return knowledge.books.flatMap(book =>
      book.chapters.flatMap(chapter =>
        chapter.insights.map(insight => ({
          ...insight,
          bookId: book.id,
          chapterName: chapter.chapterName
        }))
      )
    )
  }, [knowledge])

  const insightById = useMemo(
    () => new Map(flattenedInsights.map(insight => [insight.id, insight])),
    [flattenedInsights]
  )

  const topicStats = useMemo(() => {
    if (!knowledge) return []
    const counts = new Map()

    flattenedInsights.forEach(insight => {
      ;(insight.keywords || []).forEach(keyword => {
        counts.set(keyword, (counts.get(keyword) || 0) + 1)
      })
    })

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort(
        (first, second) =>
          second.count - first.count ||
          first.name.localeCompare(second.name, 'zh-CN')
      )
  }, [flattenedInsights, knowledge])

  // 主题目录使用稳定的六色循环，选中主题同时驱动右侧阅读路径的强调色。
  const selectedTopicIndex = topicStats.findIndex(
    topic => topic.name === selectedTopic
  )
  const selectedTopicTone =
    TOPIC_TONES[Math.max(selectedTopicIndex, 0) % TOPIC_TONES.length]

  useEffect(() => {
    if (!topicStats.length) return
    if (!topicStats.some(topic => topic.name === selectedTopic)) {
      setSelectedTopic(topicStats[0].name)
    }
  }, [selectedTopic, topicStats])

  const topicInsights = useMemo(() => {
    if (!selectedTopic) return []
    return flattenedInsights.filter(insight =>
      (insight.keywords || []).includes(selectedTopic)
    )
  }, [flattenedInsights, selectedTopic])

  const topicRelations = useMemo(() => {
    if (!knowledge || !selectedTopic) return []
    const topicInsightIds = new Set(topicInsights.map(insight => insight.id))
    return knowledge.edges.filter(
      edge =>
        edge.keyword === selectedTopic ||
        topicInsightIds.has(edge.source) ||
        topicInsightIds.has(edge.target)
    )
  }, [knowledge, selectedTopic, topicInsights])

  const selectedBookDetail = useMemo(
    () => knowledge?.books.find(book => book.id === selectedBook?.id),
    [knowledge, selectedBook]
  )

  const closeDetail = useCallback(() => setSelectedBook(null), [])
  const isDetailOpen = Boolean(selectedBook)

  useEffect(() => {
    if (!isDetailOpen) return

    previousFocusRef.current = document.activeElement
    const { body, documentElement } = document
    const previousBodyOverflow = body.style.overflow
    const previousDocumentOverflow = documentElement.style.overflow

    body.style.overflow = 'hidden'
    documentElement.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(
      () => closeButtonRef.current?.focus(),
      0
    )

    const handleDialogKeydown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDetail()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleDialogKeydown)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', handleDialogKeydown)
      body.style.overflow = previousBodyOverflow
      documentElement.style.overflow = previousDocumentOverflow
      previousFocusRef.current?.focus?.()
    }
  }, [closeDetail, isDetailOpen])

  useEffect(() => {
    return () => window.clearTimeout(copyTimerRef.current)
  }, [])

  useEffect(() => {
    detailGridRef.current?.scrollTo({ top: 0 })
    detailContentRef.current?.scrollTo({ top: 0 })
  }, [selectedBook?.id])

  const openBook = useCallback(
    book => {
      setSelectedBook(book)
      loadKnowledge().catch(() => {})
    },
    [loadKnowledge]
  )

  const showShelf = useCallback(() => {
    setSection('shelf')
    window.requestAnimationFrame(() => {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const showIdeas = useCallback(() => {
    setSection('ideas')
    loadKnowledge().catch(() => {})
    window.requestAnimationFrame(() => {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [loadKnowledge])

  const openRandomBook = useCallback(() => {
    const pool = visibleBooks.length ? visibleBooks : BOOKS
    openBook(pool[Math.floor(Math.random() * pool.length)])
  }, [openBook, visibleBooks])

  // 推荐区所有入口共用循环索引，保证按钮和触摸手势的状态一致。
  const showFeaturedBook = useCallback(direction => {
    setFeaturedIndex(current => {
      return (
        (current + direction + FEATURED_BOOKS.length) % FEATURED_BOOKS.length
      )
    })
  }, [])

  // 记录触摸起点，只有足够明显的纵向位移才触发翻卡。
  const handleFeaturedTouchStart = useCallback(event => {
    featuredTouchStartRef.current = event.touches[0]?.clientY ?? null
  }, [])

  const handleFeaturedTouchEnd = useCallback(
    event => {
      const startY = featuredTouchStartRef.current
      const endY = event.changedTouches[0]?.clientY
      featuredTouchStartRef.current = null
      if (startY === null || endY === undefined) return

      const distance = endY - startY
      if (Math.abs(distance) < 44) return

      // 手机端纵向划过叠卡时切换推荐；下滑看下一本，上滑返回上一本。
      featuredSwipeAtRef.current = Date.now()
      showFeaturedBook(distance > 0 ? 1 : -1)
    },
    [showFeaturedBook]
  )

  const handleFeaturedOpen = useCallback(
    book => {
      // 触摸滑动结束后浏览器可能补发 click，这里避免误打开详情。
      if (Date.now() - featuredSwipeAtRef.current < 500) return
      openBook(book)
    },
    [openBook]
  )

  const toggleFavorite = useCallback(bookId => {
    setFavorites(current =>
      current.includes(bookId)
        ? current.filter(id => id !== bookId)
        : [...current, bookId]
    )
  }, [])

  const resetFilters = useCallback(() => {
    setCategory('all')
    setFavoritesOnly(false)
    setSortBy('curated')
  }, [])

  const openAdjacentBook = useCallback(
    direction => {
      if (!selectedBook || !detailNavigationBooks.length) return
      const currentIndex = detailNavigationBooks.findIndex(
        book => book.id === selectedBook.id
      )
      if (currentIndex < 0) return

      const nextIndex =
        (currentIndex + direction + detailNavigationBooks.length) %
        detailNavigationBooks.length
      setSelectedBook(detailNavigationBooks[nextIndex])
    },
    [detailNavigationBooks, selectedBook]
  )

  const copyInsight = useCallback(async insight => {
    const copy = [insight.point, insight.explanation, insight.example]
      .filter(Boolean)
      .join('\n\n')

    try {
      await navigator.clipboard.writeText(copy)
      setCopiedInsight(insight.id)
      window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => setCopiedInsight(''), 1800)
    } catch (error) {
      console.warn('[书单] 观点复制失败。', error)
    }
  }, [])

  const bookForInsight = insight =>
    BOOKS.find(book => book.id === insight?.bookId)

  const renderKnowledgeError = () => (
    <div className={styles.loadState} role='alert'>
      <p>{knowledgeError}</p>
      <button
        type='button'
        onClick={() => {
          loadKnowledge(true).catch(() => {})
        }}
      >
        重新加载
      </button>
    </div>
  )

  return (
    <>
      {!pageReady && (
        <div
          role='status'
          aria-live='polite'
          style={{
            width: '100%',
            minHeight: 520,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'inherit',
            background: 'transparent'
          }}
        >
          <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
            正在整理书架…
          </span>
        </div>
      )}
      <article
        className={styles.bookPage}
        ref={pageRef}
        aria-busy={!pageReady}
        aria-hidden={!pageReady}
        style={
          pageReady
            ? undefined
            : {
                height: 0,
                minHeight: 0,
                overflow: 'hidden',
                visibility: 'hidden'
              }
        }
      >
        <section className={styles.hero} aria-labelledby='book-page-title'>
          <div className={styles.heroCopy}>
            <div className={styles.heroLabel}>
              <IconBooks aria-hidden='true' size={19} stroke={2} />
              <span>个人阅读档案</span>
            </div>
            <h1 id='book-page-title'>
              我的书架
              <span>不是收藏夹，是读完以后留下来的判断。</span>
            </h1>
            <p className={styles.heroIntro}>
              {BOOKS.length} 本书被拆成 {totalChapters ?? '若干'} 个章节与{' '}
              {totalInsights}
              条观点。先读我的笔记，再决定要不要去微信读书打开它。
            </p>
            <div className={styles.heroActions}>
              <button
                type='button'
                className={styles.primaryAction}
                onClick={showShelf}
              >
                浏览书架
                <IconArrowDown aria-hidden='true' size={18} stroke={2.2} />
              </button>
              <button
                type='button'
                className={styles.secondaryAction}
                onClick={showIdeas}
              >
                <IconNetwork aria-hidden='true' size={19} stroke={2} />
                进入观点索引
              </button>
            </div>
            <dl className={styles.heroStats}>
              <div>
                <dt>书目</dt>
                <dd>{BOOKS.length}</dd>
              </div>
              <div>
                <dt>章节</dt>
                <dd>{totalChapters ?? '—'}</dd>
              </div>
              <div>
                <dt>观点</dt>
                <dd>{totalInsights}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.heroFeatureArea}>
            <div className={styles.featuredHeading}>
              <div>
                <span>本周推荐</span>
                <strong aria-live='polite'>
                  {String(featuredIndex + 1).padStart(2, '0')} /{' '}
                  {String(FEATURED_BOOKS.length).padStart(2, '0')}
                </strong>
              </div>
              <div className={styles.featuredArrows}>
                <button
                  type='button'
                  onClick={() => showFeaturedBook(-1)}
                  title='上一本推荐'
                  aria-label='上一本推荐'
                >
                  <IconArrowLeft aria-hidden='true' size={18} stroke={2} />
                </button>
                <button
                  type='button'
                  onClick={() => showFeaturedBook(1)}
                  title='下一本推荐'
                  aria-label='下一本推荐'
                >
                  <IconArrowRight aria-hidden='true' size={18} stroke={2} />
                </button>
              </div>
            </div>

            <div
              className={styles.featuredStack}
              onTouchStart={handleFeaturedTouchStart}
              onTouchEnd={handleFeaturedTouchEnd}
              onTouchCancel={() => {
                featuredTouchStartRef.current = null
              }}
            >
              {FEATURED_BOOKS.map((book, index) => {
                const depth =
                  (index - featuredIndex + FEATURED_BOOKS.length) %
                  FEATURED_BOOKS.length
                const isActive = depth === 0
                const isVisible = depth < 4

                return (
                  <button
                    type='button'
                    className={styles.heroFeature}
                    data-active={isActive ? 'true' : 'false'}
                    data-visible={isVisible ? 'true' : 'false'}
                    data-depth={depth}
                    data-category={book.category}
                    data-tone={FEATURED_TONES[index]}
                    onClick={() => {
                      if (isActive) handleFeaturedOpen(book)
                    }}
                    aria-hidden={!isActive}
                    tabIndex={isActive ? 0 : -1}
                    aria-label={`查看《${book.title}》的读书笔记`}
                    key={book.id}
                  >
                    <span className={styles.heroCover}>
                      <Image
                        src={book.cover}
                        alt={`《${book.title}》封面`}
                        width={328}
                        height={456}
                        priority={index === 0}
                        sizes='(max-width: 720px) 112px, 164px'
                      />
                    </span>
                    <span className={styles.heroFeatureCopy}>
                      <span className={styles.heroFeatureMeta}>
                        <IconQuote aria-hidden='true' size={21} stroke={2} />
                        先读一个观点
                      </span>
                      <strong>{book.featuredInsight}</strong>
                      <span className={styles.heroFeatureBook}>
                        《{book.title}》 · {book.insightCount} 条笔记
                        <IconArrowRight
                          aria-hidden='true'
                          size={18}
                          stroke={2}
                        />
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section
          className={styles.librarySection}
          id='book-catalog'
          ref={catalogRef}
          aria-labelledby='catalog-title'
        >
          <header className={styles.sectionHeader}>
            <div>
              <p>阅读档案</p>
              <h2 id='catalog-title'>翻一本，读到里面去</h2>
            </div>
            <p>卡片打开完整笔记；外链按钮才会前往微信读书。</p>
          </header>

          <div
            className={styles.sectionTabs}
            role='tablist'
            aria-label='书单视图'
          >
            <button
              type='button'
              role='tab'
              aria-selected={section === 'shelf'}
              className={section === 'shelf' ? styles.sectionTabActive : ''}
              onClick={() => setSection('shelf')}
            >
              <IconBooks aria-hidden='true' size={19} stroke={2} />
              书架
              <span>{BOOKS.length}</span>
            </button>
            <button
              type='button'
              role='tab'
              aria-selected={section === 'ideas'}
              className={section === 'ideas' ? styles.sectionTabActive : ''}
              onClick={showIdeas}
            >
              <IconNetwork aria-hidden='true' size={19} stroke={2} />
              观点索引
              <span>{totalInsights}</span>
            </button>
          </div>

          {section === 'shelf' ? (
            <div role='tabpanel'>
              <div className={styles.controlBar}>
                <div className={styles.filterRow}>
                  <div
                    className={styles.categoryRail}
                    role='group'
                    aria-label='按分类筛选'
                  >
                    {CATEGORIES.map(item => {
                      const isActive = category === item.key
                      return (
                        <button
                          key={item.key}
                          type='button'
                          data-category={item.key}
                          className={isActive ? styles.categoryActive : ''}
                          aria-pressed={isActive}
                          onClick={() => setCategory(item.key)}
                        >
                          <span>{item.label}</span>
                          <span className={styles.categoryCount}>
                            {categoryCounts[item.key] || 0}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className={styles.toolbarActions}>
                    <button
                      type='button'
                      className={`${styles.favoriteFilter} ${favoritesOnly ? styles.favoriteFilterActive : ''}`}
                      aria-pressed={favoritesOnly}
                      onClick={() => setFavoritesOnly(current => !current)}
                    >
                      {favoritesOnly ? (
                        <IconHeartFilled aria-hidden='true' size={18} />
                      ) : (
                        <IconHeart aria-hidden='true' size={18} stroke={2} />
                      )}
                      <span>收藏</span>
                      <span className={styles.favoriteCount}>
                        {favorites.length}
                      </span>
                    </button>

                    <label className={styles.sortControl}>
                      <span className='sr-only'>书单排序方式</span>
                      <select
                        value={sortBy}
                        onChange={event => setSortBy(event.target.value)}
                      >
                        <option value='curated'>推荐顺序</option>
                        <option value='title'>按书名</option>
                        <option value='insights'>观点最多</option>
                      </select>
                      <IconChevronDown
                        aria-hidden='true'
                        size={17}
                        stroke={2}
                      />
                    </label>

                    <div
                      className={styles.viewSwitch}
                      role='group'
                      aria-label='切换书单视图'
                    >
                      <button
                        type='button'
                        className={view === 'grid' ? styles.viewActive : ''}
                        aria-pressed={view === 'grid'}
                        onClick={() => setView('grid')}
                        title='网格视图'
                        aria-label='网格视图'
                      >
                        <IconLayoutGrid
                          aria-hidden='true'
                          size={19}
                          stroke={2}
                        />
                      </button>
                      <button
                        type='button'
                        className={view === 'list' ? styles.viewActive : ''}
                        aria-pressed={view === 'list'}
                        onClick={() => setView('list')}
                        title='列表视图'
                        aria-label='列表视图'
                      >
                        <IconList aria-hidden='true' size={20} stroke={2} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {visibleBooks.length ? (
                <div
                  id='book-grid'
                  className={`${styles.bookGrid} ${view === 'list' ? styles.listView : ''}`}
                >
                  {visibleBooks.map(book => {
                    const isFavorite = favorites.includes(book.id)
                    return (
                      <article
                        className={styles.bookCard}
                        data-category={book.category}
                        key={book.id}
                      >
                        <button
                          type='button'
                          className={styles.cardOpen}
                          onClick={() => openBook(book)}
                          aria-label={`查看《${book.title}》的读书笔记`}
                        >
                          <span
                            className={styles.coverFrame}
                            data-category={book.category}
                          >
                            <Image
                              src={book.cover}
                              alt={`《${book.title}》封面`}
                              width={248}
                              height={360}
                              sizes={
                                view === 'list'
                                  ? '(max-width: 640px) 88px, 106px'
                                  : '(max-width: 640px) 88px, (max-width: 1100px) 112px, 124px'
                              }
                            />
                          </span>

                          <span className={styles.cardBody}>
                            <span className={styles.cardMeta}>
                              <span className={styles.categoryBadge}>
                                {CATEGORY_LABELS[book.category]}
                              </span>
                              <span>{book.insightCount} 条观点</span>
                            </span>
                            <strong className={styles.cardTitle}>
                              {book.title}
                            </strong>
                            <span className={styles.author}>{book.author}</span>
                            <span className={styles.verdict}>
                              {book.verdict}
                            </span>
                            <span
                              className={styles.tagList}
                              aria-label='主题标签'
                            >
                              {book.tags.slice(0, 3).map(tag => (
                                <span key={tag}>{tag}</span>
                              ))}
                            </span>
                          </span>
                        </button>

                        <div className={styles.cardActions}>
                          <button
                            type='button'
                            className={styles.noteHint}
                            onClick={() => openBook(book)}
                            aria-label={`打开《${book.title}》的完整读书笔记`}
                          >
                            <IconBook2
                              aria-hidden='true'
                              size={17}
                              stroke={2}
                            />
                            <span className={styles.noteHintLabel}>
                              <strong>打开完整读书笔记</strong>
                              <small>{book.insightCount} 条观点</small>
                            </span>
                            <IconArrowRight
                              className={styles.noteHintArrow}
                              aria-hidden='true'
                              size={17}
                              stroke={2}
                            />
                          </button>
                          <div>
                            <a
                              href={book.wereadUrl || book.wereadSearchUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              title='在微信读书打开'
                              aria-label={`在微信读书打开《${book.title}》`}
                            >
                              <IconExternalLink
                                aria-hidden='true'
                                size={18}
                                stroke={2}
                              />
                            </a>
                            <button
                              type='button'
                              className={
                                isFavorite ? styles.favoriteButtonActive : ''
                              }
                              aria-pressed={isFavorite}
                              aria-label={
                                isFavorite
                                  ? `取消收藏《${book.title}》`
                                  : `收藏《${book.title}》`
                              }
                              title={isFavorite ? '取消收藏' : '收藏'}
                              onClick={() => toggleFavorite(book.id)}
                            >
                              {isFavorite ? (
                                <IconHeartFilled aria-hidden='true' size={18} />
                              ) : (
                                <IconHeart
                                  aria-hidden='true'
                                  size={18}
                                  stroke={2}
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className={styles.emptyState} role='status'>
                  <IconBooks aria-hidden='true' size={34} stroke={1.7} />
                  <h3>这层书架暂时是空的</h3>
                  <p>切换分类，或关闭仅看收藏。</p>
                  <button type='button' onClick={resetFilters}>
                    查看全部书目
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.ideasSection} role='tabpanel'>
              {knowledgeStatus === 'loading' && !knowledge ? (
                <div className={styles.loadState} role='status'>
                  <span className={styles.loader} aria-hidden='true' />
                  <p>正在整理 {totalInsights} 条观点之间的关系…</p>
                </div>
              ) : knowledgeStatus === 'error' && !knowledge ? (
                renderKnowledgeError()
              ) : (
                <div
                  className={styles.ideaWorkspace}
                  data-tone={selectedTopicTone}
                >
                  <aside className={styles.topicPane} aria-label='观点主题'>
                    <div className={styles.topicPaneHeader}>
                      <span className={styles.topicPaneIcon} aria-hidden='true'>
                        <IconNetwork size={20} stroke={2} />
                      </span>
                      <div>
                        <span>观点索引</span>
                        <p>跨书阅读路径</p>
                      </div>
                      <strong>{topicStats.length}</strong>
                    </div>
                    <div data-lenis-prevent className={styles.topicCloud}>
                      {topicStats.map((topic, index) => (
                        <button
                          type='button'
                          key={topic.name}
                          data-tone={TOPIC_TONES[index % TOPIC_TONES.length]}
                          className={
                            selectedTopic === topic.name
                              ? styles.topicActive
                              : ''
                          }
                          aria-pressed={selectedTopic === topic.name}
                          onClick={() => setSelectedTopic(topic.name)}
                        >
                          <span
                            className={styles.topicMarker}
                            aria-hidden='true'
                          />
                          <span className={styles.topicName}>{topic.name}</span>
                          <span className={styles.topicCount}>
                            {topic.count || '↗'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </aside>

                  <div className={styles.ideaContent}>
                    <header className={styles.ideaHeader}>
                      <p>跨书阅读路径</p>
                      <h3>{selectedTopic}</h3>
                      <span>
                        {topicInsights.length} 条观点 · {topicRelations.length}{' '}
                        组跨书回应
                      </span>
                    </header>

                    {topicInsights.length > 0 && (
                      <div className={styles.ideaList}>
                        {topicInsights.map((insight, index) => {
                          const sourceBook = bookForInsight(insight)
                          return (
                            <article
                              className={styles.ideaItem}
                              key={insight.id}
                            >
                              <span className={styles.ideaIndex}>
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <div>
                                <h4>{insight.point}</h4>
                                <p>{insight.explanation}</p>
                                {sourceBook && (
                                  <button
                                    type='button'
                                    onClick={() => openBook(sourceBook)}
                                  >
                                    《{sourceBook.title}》 ·{' '}
                                    {insight.chapterName}
                                    <IconArrowRight
                                      aria-hidden='true'
                                      size={16}
                                      stroke={2}
                                    />
                                  </button>
                                )}
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    )}

                    {topicRelations.length > 0 && (
                      <section
                        className={styles.relationSection}
                        aria-labelledby='relation-title'
                      >
                        <div className={styles.relationHeader}>
                          <h4 id='relation-title'>这些书在彼此回应</h4>
                          <span>{topicRelations.length} 条关系</span>
                        </div>
                        <div className={styles.relationList}>
                          {topicRelations.map((relation, index) => {
                            const sourceInsight = insightById.get(
                              relation.source
                            )
                            const targetInsight = insightById.get(
                              relation.target
                            )
                            const sourceBook = bookForInsight(sourceInsight)
                            const targetBook = bookForInsight(targetInsight)
                            if (!sourceBook || !targetBook) return null
                            return (
                              <div
                                key={`${relation.source}-${relation.target}-${index}`}
                              >
                                <button
                                  type='button'
                                  onClick={() => openBook(sourceBook)}
                                >
                                  《{sourceBook.title}》
                                </button>
                                <span>{relation.relation}</span>
                                <button
                                  type='button'
                                  onClick={() => openBook(targetBook)}
                                >
                                  《{targetBook.title}》
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <footer className={styles.catalogFooter}>
            <span className={styles.catalogFooterLabel}>随手翻一页</span>
            <div>
              <IconDice5 aria-hidden='true' size={24} stroke={1.8} />
              <p>
                <strong>不知道先读哪本？</strong>
                <span>让一次随机选择替你打破犹豫。</span>
              </p>
            </div>
            <button type='button' onClick={openRandomBook}>
              随便翻一本
              <IconArrowRight aria-hidden='true' size={19} stroke={2} />
            </button>
          </footer>
        </section>

        {selectedBook && typeof document !== 'undefined'
          ? createPortal(
              <div
                className={styles.detailOverlay}
                data-lenis-prevent
                onMouseDown={event => {
                  if (event.target === event.currentTarget) closeDetail()
                }}
              >
                <section
                  className={styles.detailSheet}
                  role='dialog'
                  aria-modal='true'
                  aria-labelledby='book-detail-title'
                  ref={dialogRef}
                >
                  <header className={styles.detailToolbar}>
                    <div>
                      <button
                        type='button'
                        onClick={() => openAdjacentBook(-1)}
                        title='上一本'
                        aria-label='查看上一本书'
                      >
                        <IconArrowLeft
                          aria-hidden='true'
                          size={20}
                          stroke={2}
                        />
                      </button>
                      <span>
                        {detailNavigationBooks.findIndex(
                          book => book.id === selectedBook.id
                        ) + 1}{' '}
                        / {detailNavigationBooks.length}
                      </span>
                      <button
                        type='button'
                        onClick={() => openAdjacentBook(1)}
                        title='下一本'
                        aria-label='查看下一本书'
                      >
                        <IconArrowRight
                          aria-hidden='true'
                          size={20}
                          stroke={2}
                        />
                      </button>
                    </div>
                    <span className={styles.detailToolbarTitle}>读书笔记</span>
                    <button
                      type='button'
                      className={styles.closeDetail}
                      onClick={closeDetail}
                      ref={closeButtonRef}
                      title='关闭'
                      aria-label='关闭读书笔记'
                    >
                      <IconX aria-hidden='true' size={22} stroke={2} />
                    </button>
                  </header>

                  <div
                    className={styles.detailGrid}
                    data-category={selectedBook.category}
                    ref={detailGridRef}
                  >
                    <aside
                      className={styles.detailAside}
                      data-category={selectedBook.category}
                    >
                      <div className={styles.detailCover}>
                        <Image
                          src={selectedBook.cover}
                          alt={`《${selectedBook.title}》封面`}
                          width={420}
                          height={610}
                          priority
                          sizes='(max-width: 760px) 112px, 210px'
                        />
                      </div>
                      <div className={styles.detailBookMeta}>
                        <span className={styles.detailCategory}>
                          {CATEGORY_LABELS[selectedBook.category]}
                        </span>
                        <span className={styles.detailAuthor}>
                          {selectedBook.author}
                        </span>
                      </div>
                      <h2 id='book-detail-title'>{selectedBook.title}</h2>
                      <p className={styles.detailVerdict}>
                        {selectedBook.verdict}
                      </p>
                      <div className={styles.detailTags}>
                        {selectedBook.tags.map(tag => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                      <blockquote className={styles.detailAsideQuote}>
                        <span className={styles.detailAsideQuoteLabel}>
                          书中一页
                        </span>
                        <p>{selectedBook.featuredInsight}</p>
                      </blockquote>
                      <a
                        className={styles.wereadButton}
                        href={
                          selectedBook.wereadUrl || selectedBook.wereadSearchUrl
                        }
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        在微信读书打开
                        <IconArrowUpRight
                          aria-hidden='true'
                          size={18}
                          stroke={2}
                        />
                      </a>
                    </aside>

                    <div
                      className={styles.detailContent}
                      ref={detailContentRef}
                    >
                      <header className={styles.detailLead}>
                        <p>从这本书里留下来的东西</p>
                        <h3>
                          {selectedBook.insightCount} 条观点，读完比收藏更重要。
                        </h3>
                      </header>

                      {knowledgeStatus === 'loading' && !selectedBookDetail ? (
                        <div className={styles.loadState} role='status'>
                          <span className={styles.loader} aria-hidden='true' />
                          <p>正在展开完整读书笔记…</p>
                        </div>
                      ) : knowledgeStatus === 'error' && !selectedBookDetail ? (
                        renderKnowledgeError()
                      ) : selectedBookDetail ? (
                        <>
                          <section
                            className={styles.highlightSection}
                            aria-labelledby='highlight-title'
                          >
                            <div className={styles.highlightTitle}>
                              <IconQuote
                                aria-hidden='true'
                                size={23}
                                stroke={2}
                              />
                              <h4 id='highlight-title'>全书高光</h4>
                            </div>
                            <ol>
                              {splitHighlights(
                                selectedBookDetail.highlights
                              ).map((highlight, index) => (
                                <li key={highlight}>
                                  <span>
                                    高光 {String(index + 1).padStart(2, '0')}
                                  </span>
                                  <p>{highlight}</p>
                                </li>
                              ))}
                            </ol>
                          </section>

                          <div className={styles.chapterList}>
                            {selectedBookDetail.chapters.map(
                              (chapter, chapterIndex) => (
                                <section
                                  className={styles.chapter}
                                  key={chapter.chapterName}
                                >
                                  <header>
                                    <span>
                                      {String(chapterIndex + 1).padStart(
                                        2,
                                        '0'
                                      )}
                                    </span>
                                    <div>
                                      <small>章节</small>
                                      <h4>{chapter.chapterName}</h4>
                                    </div>
                                  </header>
                                  <div>
                                    {chapter.insights.map(
                                      (insight, insightIndex) => (
                                        <article
                                          className={styles.insight}
                                          key={insight.id}
                                        >
                                          <div
                                            className={styles.insightHeading}
                                          >
                                            <span>
                                              观点{' '}
                                              {String(
                                                insightIndex + 1
                                              ).padStart(2, '0')}
                                            </span>
                                            <h5>{insight.point}</h5>
                                            <button
                                              type='button'
                                              onClick={() => {
                                                copyInsight(insight).catch(
                                                  () => {}
                                                )
                                              }}
                                              title='复制这条观点'
                                              aria-label='复制这条观点'
                                            >
                                              {copiedInsight === insight.id ? (
                                                <IconCheck
                                                  aria-hidden='true'
                                                  size={18}
                                                  stroke={2.2}
                                                />
                                              ) : (
                                                <IconCopy
                                                  aria-hidden='true'
                                                  size={18}
                                                  stroke={2}
                                                />
                                              )}
                                            </button>
                                          </div>
                                          <p
                                            className={
                                              styles.insightExplanation
                                            }
                                          >
                                            {insight.explanation}
                                          </p>
                                          {insight.example && (
                                            <div
                                              className={styles.insightExample}
                                            >
                                              <span>生活里的样子</span>
                                              <p>{insight.example}</p>
                                            </div>
                                          )}
                                          <div
                                            className={styles.insightKeywords}
                                          >
                                            {(insight.keywords || []).map(
                                              keyword => (
                                                <span key={keyword}>
                                                  {keyword}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </article>
                                      )
                                    )}
                                  </div>
                                </section>
                              )
                            )}
                          </div>

                          <div className={styles.detailEnd}>
                            <span className={styles.detailEndLabel}>
                              读完笔记之后
                            </span>
                            <p>读到这里，再决定要不要把整本书带走。</p>
                            <a
                              href={
                                selectedBook.wereadUrl ||
                                selectedBook.wereadSearchUrl
                              }
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              去微信读书继续阅读
                              <IconArrowUpRight
                                aria-hidden='true'
                                size={18}
                                stroke={2}
                              />
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className={styles.loadState} role='alert'>
                          <p>完整读书笔记与当前书目版本不一致，请重新加载。</p>
                          <button
                            type='button'
                            onClick={() => {
                              loadKnowledge(true).catch(() => {})
                            }}
                          >
                            重新加载完整笔记
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>,
              document.body
            )
          : null}
      </article>
    </>
  )
}

export default BookShelf
