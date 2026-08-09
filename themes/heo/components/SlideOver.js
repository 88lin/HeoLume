import DarkModeButton from '@/components/DarkModeButton'
import { useGlobal } from '@/lib/global'
import { Dialog, Transition } from '@headlessui/react'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import {
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { MenuListSide } from './MenuListSide'
import TagGroups from './TagGroups'

/**
 * 侧边抽屉
 * 移动端的菜单在这里
 */
export default function SlideOver(props) {
  const { cRef, tagOptions } = props
  const [open, setOpen] = useState(false)
  const { locale } = useGlobal()
  const router = useRouter()
  /**
   * 函数组件暴露方法useImperativeHandle
   **/
  useImperativeHandle(cRef, () => ({
    toggleSlideOvers: toggleSlideOvers
  }))

  /**
   * 开关侧拉抽屉
   */
  const toggleSlideOvers = () => {
    setOpen(!open)
  }

  /**
   * 自动关闭抽屉
   */
  useEffect(() => {
    setOpen(false)
  }, [router])

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as='div' className='relative z-20' onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter='ease-in-out duration-500'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in-out duration-500'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
          <div className='fixed inset-0 glassmorphism bg-black/30 dark:bg-black/60 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-hidden'>
          <div className='absolute inset-0 overflow-hidden'>
            <div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10'>
              <Transition.Child
                as={Fragment}
                enter='transform transition ease-in-out duration-500 sm:duration-700'
                enterFrom='translate-x-full'
                enterTo='translate-x-0'
                leave='transform transition ease-in-out duration-500 sm:duration-700'
                leaveFrom='translate-x-0'
                leaveTo='translate-x-full'>
                <Dialog.Panel className='pointer-events-auto relative w-96 max-w-md'>
                  {/* 内容 */}
                  <div data-lenis-prevent className='flex h-full flex-col overflow-y-scroll bg-[#f0ebe3] dark:bg-[#1a1a2e] py-2 shadow-2xl rounded-l-[2rem]'>
                    {/* 关闭按钮 - 右上角 */}
                    <Transition.Child
                      as={Fragment}
                      enter='ease-in-out duration-500'
                      enterFrom='opacity-0'
                      enterTo='opacity-100'
                      leave='ease-in-out duration-500'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'>
                      <div className='mb-2 flex justify-end px-5 sm:px-6'>
                        <button
                          type='button'
                          className='w-10 h-10 rounded-2xl bg-[#f5f0e8] dark:bg-[#252540] border-none flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all duration-200 shadow-[4px_4px_10px_rgba(0,0,0,0.08),-4px_-4px_10px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-1px_-1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] dark:hover:bg-[#2d2d4a] dark:hover:text-gray-200 outline-none'
                          onClick={() => setOpen(false)}>
                          <span className='sr-only'>Close panel</span>
                          <i className='fa-solid fa-xmark text-base'></i>
                        </button>
                      </div>
                    </Transition.Child>

                    <div className='relative flex-1 flex-col space-y-3 px-5 sm:px-6 dark:text-gray-200'>
                      <section className='flex flex-col'>
                        {/* 切换深色模式 */}
                        <DarkModeBlockButton />
                      </section>

                      <section className='space-y-3 flex flex-col'>
                        <div className='text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>{locale.COMMON.BLOG}</div>
                        {/* 导航按钮 */}
                        <div className='gap-3 grid grid-cols-2'>
                          <Button title={'主页'} url={'/'} icon='fa-solid fa-house' />
                          <Button title={'关于'} url={'/about'} icon='fa-solid fa-user' />
                        </div>
                        {/* 用户自定义菜单 */}
                        <MenuListSide {...props} />
                      </section>

                      <section className='space-y-3 flex flex-col'>
                        <div className='text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>{locale.COMMON.TAGS}</div>
                        <div className='bg-[#f5f0e8] dark:bg-[#1f1f38] p-4 rounded-[1.45rem] border-none shadow-[4px_4px_10px_rgba(0,0,0,0.06),-4px_-4px_10px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-1px_-1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]'>
                          <TagGroups tags={tagOptions} />
                        </div>
                      </section>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

/**
 * 深色模式切换按钮
 */
function DarkModeBlockButton() {
  const darkModeRef = useRef()
  const { isDarkMode, locale } = useGlobal()

  function handleChangeDarkMode() {
    darkModeRef?.current?.handleChangeDarkMode()
  }
  return (
    <button
      onClick={handleChangeDarkMode}
      className={
        'group duration-200 flex justify-between items-center px-4 py-3 bg-[#ffe0b2] dark:bg-[#ff953e] border-none dark:border dark:border-gray-600 rounded-[1.45rem] transition-all shadow-[4px_4px_10px_rgba(0,0,0,0.08),-4px_-4px_10px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-1px_-1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:hover:bg-blue-500 dark:hover:border-blue-500 dark:hover:text-white'
      }>
      <DarkModeButton cRef={darkModeRef} className='dark:group-hover:text-white' />{' '}
      <span className='font-medium'>{isDarkMode ? locale.MENU.LIGHT_MODE : locale.MENU.DARK_MODE}</span>
    </button>
  )
}

/**
 * 导航按钮
 */
function Button({ title, url, icon }) {
  return (
    <SmartLink
      href={url}
      className={
        'duration-200 flex cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-[#d6e6f2] dark:bg-[#1e2545] border-none rounded-[1.45rem] transition-all shadow-[4px_4px_10px_rgba(0,0,0,0.08),-4px_-4px_10px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-1px_-1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:text-gray-200 dark:hover:bg-[#252d55] dark:hover:text-white'
      }>
      {icon && <i className={`${icon} text-base`}></i>}
      <span className='text-sm font-medium'>{title}</span>
    </SmartLink>
  )
}
