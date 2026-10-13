import { useGlobal } from '@/lib/global'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import Catalog from './Catalog'

/** 移动端与平板的悬浮目录；桌面目录在 xl 断点后接替。 */
export default function FloatTocButton({ post, lock }) {
  const [tocVisible, changeTocVisible] = useState(false)
  const buttonRef = useRef(null)
  const { locale } = useGlobal()
  const hasToc = Boolean(post && !lock && post.toc?.length)
  const closeToc = () => changeTocVisible(false)

  useEffect(() => {
    changeTocVisible(false)
  }, [post?.id, hasToc])

  useEffect(() => {
    if (!tocVisible) return
    // Read the actual Tailwind visibility so the custom xl breakpoint stays
    // authoritative when the window switches to the desktop sidebar.
    const closeWhenTriggerHidden = () => {
      if (
        buttonRef.current &&
        window.getComputedStyle(buttonRef.current).display === 'none'
      ) {
        changeTocVisible(false)
      }
    }
    window.addEventListener('resize', closeWhenTriggerHidden)
    return () => window.removeEventListener('resize', closeWhenTriggerHidden)
  }, [tocVisible])

  if (!hasToc) return null

  return (
    <>
      <button
        ref={buttonRef}
        type='button'
        id='toc-button'
        aria-label={locale.COMMON.TABLE_OF_CONTENTS}
        aria-expanded={tocVisible}
        aria-haspopup='dialog'
        aria-controls='heo-floating-toc'
        onClick={() => changeTocVisible(value => !value)}
        className='fixed xl:hidden right-4 bottom-24 z-40 w-11 h-11 select-none hover:scale-110 transform duration-200 text-black dark:text-gray-200 rounded-full bg-white drop-shadow-lg flex justify-center items-center dark:bg-hexo-black-gray py-2 px-2'
      >
        <i aria-hidden='true' className='fa-list-ol fas' />
      </button>

      <Transition.Root show={tocVisible} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={closeToc}>
          <Transition.Child
            as={Fragment}
            enter='transition-opacity duration-200 motion-reduce:transition-none'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='transition-opacity duration-200 motion-reduce:transition-none'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div
              id='right-drawer-background'
              aria-hidden='true'
              className='fixed inset-0 bg-white/20 backdrop-blur-[2px] backdrop-saturate-125 dark:bg-black/25'
            />
          </Transition.Child>
          <div className='fixed inset-0 flex items-center justify-center px-4'>
            <Transition.Child
              as={Fragment}
              enter='transition duration-200 motion-reduce:transition-none'
              enterFrom='opacity-0 translate-y-4 scale-95'
              enterTo='opacity-100 translate-y-0 scale-100'
              leave='transition duration-200 motion-reduce:transition-none'
              leaveFrom='opacity-100 translate-y-0 scale-100'
              leaveTo='opacity-0 translate-y-4 scale-95'
            >
              <Dialog.Panel
                id='heo-floating-toc'
                data-lenis-prevent
                className='relative shadow-card w-full max-w-sm rounded-[1.75rem] py-3 bg-white dark:bg-gray-900 border border-black/5 dark:border-white/10'
              >
                <Dialog.Title className='sr-only'>
                  {locale.COMMON.TABLE_OF_CONTENTS}
                </Dialog.Title>
                <button
                  type='button'
                  aria-label='关闭目录'
                  onClick={closeToc}
                  className='absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-600 dark:text-gray-300'
                >
                  <i aria-hidden='true' className='fa-solid fa-xmark' />
                </button>
                <div className='dark:text-gray-400 text-gray-600'>
                  <Catalog toc={post.toc} onItemClick={closeToc} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
