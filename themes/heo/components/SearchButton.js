import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { createPortal } from 'react-dom'

const AlgoliaSearchModal = dynamic(() => import('@/components/AlgoliaSearchModal'), { ssr: false })

/**
 * 搜索按钮
 * @returns
 */
export default function SearchButton(props) {
  const { locale } = useGlobal()
  const router = useRouter()
  const searchModal = useRef(null)
  const hasAlgoliaConfig = Boolean(
    siteConfig('ALGOLIA_APP_ID') &&
    siteConfig('ALGOLIA_SEARCH_ONLY_APP_KEY') &&
    siteConfig('ALGOLIA_INDEX')
  )

  function handleSearch() {
    if (hasAlgoliaConfig && searchModal.current?.openSearch) {
      searchModal.current.openSearch()
    } else {
      router.push('/search')
    }
  }

  return <>
        <button type='button' onClick={handleSearch} title={locale.NAV.SEARCH} aria-label={locale.NAV.SEARCH} className='cursor-pointer hover:bg-[rgba(139,92,246,0.12)] dark:hover:bg-[rgba(139,92,246,0.2)] rounded-full w-10 h-10 flex justify-center items-center duration-200 transition-all'>
            <i aria-hidden='true' className="fa-solid fa-magnifying-glass" />
        </button>
        {hasAlgoliaConfig && typeof document !== 'undefined'
          ? createPortal(<AlgoliaSearchModal {...props} cRef={searchModal}/>, document.body)
          : null
        }
    </>
}
