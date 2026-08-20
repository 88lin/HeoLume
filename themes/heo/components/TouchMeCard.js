import FlipCard from '@/components/FlipCard'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'

/**
 * 卡片装饰背景：纯内联 SVG，无需外部图片
 * 只有点阵纹理与线稿，不做任何提亮，避免破坏纯色底
 * @param {*} uid 区分正反两面的 defs id，避免同页面 id 重复
 * @param {*} variant front 画对话气泡；back 画同心圆，为右侧箭头按钮做视觉衬底
 */
const CardBackdrop = ({ uid, variant = 'front' }) => (
  <svg
    className='tmc-backdrop absolute inset-0 h-full w-full text-white dark:text-indigo-200'
    viewBox='0 0 288 120'
    preserveAspectRatio='xMidYMid slice'
    aria-hidden='true'
    focusable='false'>
    <defs>
      <pattern
        id={`tmc-dots-${uid}`}
        width='12'
        height='12'
        patternUnits='userSpaceOnUse'>
        <circle
          cx='1.5'
          cy='1.5'
          r='1.1'
          fill='currentColor'
          fillOpacity='0.14'
        />
      </pattern>
    </defs>

    {/* 缓慢漂移的点阵纹理（矩形放大一格，避免移动时露边） */}
    <rect
      className='tmc-dots'
      x='-16'
      y='-16'
      width='320'
      height='152'
      fill={`url(#tmc-dots-${uid})`}
    />

    {variant === 'back' ? (
      /* 同心圆：与右侧箭头按钮同心，让箭头看起来像一个「入口」 */
      <g fill='none' stroke='currentColor' strokeWidth='2'>
        <circle
          className='tmc-ripple'
          cx='250'
          cy='60'
          r='27'
          strokeOpacity='0.24'
        />
        <circle
          className='tmc-ripple tmc-ripple-2'
          cx='250'
          cy='60'
          r='40'
          strokeOpacity='0.15'
        />
        <circle
          className='tmc-ripple tmc-ripple-3'
          cx='250'
          cy='60'
          r='55'
          strokeOpacity='0.09'
        />
      </g>
    ) : (
      <>
        {/* 对话气泡线稿：四周间隙统一 ≈12px（左距 QQ 标签，右距卡片边缘，上下距卡片边缘） */}
        <g
          className='tmc-float'
          fill='none'
          stroke='currentColor'
          strokeOpacity='0.2'
          strokeWidth='2'
          strokeLinejoin='round'>
          <path d='M211 12h54a11 11 0 0 1 11 11v22a11 11 0 0 1-11 11h-27l-13 11V56h-14a11 11 0 0 1-11-11V23a11 11 0 0 1 11-11z' />
          <path d='M230 73h38a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8h-22l-10 8v-8h-6a8 8 0 0 1-8-8V81a8 8 0 0 1 8-8z' />
        </g>

        {/* 气泡内「正在输入」 */}
        <g className='tmc-float' fill='currentColor'>
          <circle className='tmc-typing' cx='225' cy='34' r='2.8' />
          <circle className='tmc-typing tmc-typing-2' cx='238' cy='34' r='2.8' />
          <circle className='tmc-typing tmc-typing-3' cx='251' cy='34' r='2.8' />
        </g>
      </>
    )}
  </svg>
)

/**
 * 交流频道 / QQ 群聊卡片
 * @returns
 */
export default function TouchMeCard() {
  const socialCard = siteConfig('HEO_SOCIAL_CARD', null, CONFIG)
  if (!(socialCard === true || socialCard === 'true')) {
    return <></>
  }

  return (
    <div className='tmc-wrapper relative h-[120px] flex flex-col text-white'>
      {/* 卡片外发光 */}
      <div
        aria-hidden='true'
        className='tmc-glow pointer-events-none absolute -inset-1 rounded-[2rem] bg-sky-400/30 blur-lg dark:bg-indigo-500/25'
      />

      <FlipCard
        className='tmc-face cursor-pointer overflow-hidden rounded-3xl border border-white/25 p-5 dark:border-indigo-300/15'
        frontContent={
          <div className='h-full'>
            <CardBackdrop uid='f' />

            <div className='relative z-10 flex h-full items-center gap-3.5'>
              <div className='tmc-badge relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 ring-1 ring-inset ring-white/30 dark:bg-indigo-400/15 dark:ring-indigo-200/25'>
                <i className='fab fa-qq relative text-2xl leading-none drop-shadow' />
              </div>

              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <h2 className='truncate text-[22px] font-black leading-tight tracking-wide drop-shadow-sm'>
                    {siteConfig('HEO_SOCIAL_CARD_TITLE_1', null, CONFIG)}
                  </h2>
                  <span className='shrink-0 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wider ring-1 ring-white/25 dark:bg-white/10 dark:text-indigo-100'>
                    QQ
                  </span>
                </div>
                <p className='mt-2 truncate text-[11px] font-medium tracking-wide text-white/90 dark:text-indigo-100/80'>
                  {siteConfig('HEO_SOCIAL_CARD_TITLE_2', null, CONFIG)}
                </p>
              </div>
            </div>
          </div>
        }
        backContent={
          <div className='h-full'>
            <CardBackdrop uid='b' variant='back' />

            <SmartLink
              href={siteConfig('HEO_SOCIAL_CARD_URL', null, CONFIG)}
              className='relative z-10 flex h-full items-center justify-between gap-2'>
              <div className='min-w-0'>
                <div className='tmc-in text-[10px] font-bold uppercase tracking-[0.22em] text-white/70 dark:text-indigo-100/65'>
                  Join Group
                </div>
                <div className='tmc-in tmc-in-2 mt-1.5 truncate text-lg font-black leading-tight drop-shadow-sm'>
                  {siteConfig('HEO_SOCIAL_CARD_TITLE_3', null, CONFIG)}
                </div>
              </div>
              <span className='tmc-in tmc-in-3 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 ring-1 ring-white/30 dark:bg-white/10 dark:ring-indigo-200/25'>
                <i className='fas fa-arrow-right tmc-nudge text-sm' />
              </span>
            </SmartLink>
          </div>
        }
      />

      <style jsx global>{`
        /* ---------- 卡片底色：纯色，无渐变 ---------- */
        .tmc-wrapper .tmc-face {
          background-color: #0e88ea;
          box-shadow: 0 10px 26px -12px rgba(11, 110, 230, 0.55);
        }
        .dark .tmc-wrapper .tmc-face {
          background-color: #1a2350;
          box-shadow: 0 12px 30px -14px rgba(0, 0, 0, 0.7);
        }

        /* ---------- 外发光：悬停增强 ---------- */
        .tmc-wrapper .tmc-glow {
          opacity: 0.5;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .tmc-wrapper:hover .tmc-glow {
          opacity: 0.9;
          transform: scale(1.03);
        }

        /* ---------- 图标徽章 ---------- */
        .tmc-wrapper .tmc-badge {
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.26);
        }

        /* ---------- SVG 装饰动效 ---------- */
        .tmc-backdrop .tmc-dots {
          animation: tmc-drift 24s linear infinite;
        }
        .tmc-backdrop .tmc-float {
          animation: tmc-float 7s ease-in-out infinite;
        }
        .tmc-backdrop .tmc-typing {
          animation: tmc-typing 1.5s ease-in-out infinite;
        }
        .tmc-backdrop .tmc-typing-2 {
          animation-delay: 0.2s;
        }
        .tmc-backdrop .tmc-typing-3 {
          animation-delay: 0.4s;
        }
        .tmc-backdrop .tmc-ripple {
          transform-box: fill-box;
          transform-origin: center;
          animation: tmc-ripple 3.4s ease-in-out infinite;
        }
        .tmc-backdrop .tmc-ripple-2 {
          animation-delay: 0.35s;
        }
        .tmc-backdrop .tmc-ripple-3 {
          animation-delay: 0.7s;
        }
        @keyframes tmc-drift {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(12px, 12px);
          }
        }
        @keyframes tmc-float {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-3px, -4px);
          }
        }
        @keyframes tmc-typing {
          0%,
          100% {
            opacity: 0.18;
          }
          50% {
            opacity: 0.55;
          }
        }
        @keyframes tmc-ripple {
          0%,
          100% {
            transform: scale(0.94);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }

        /* ---------- 翻到背面时的入场动效 ---------- */
        .tmc-wrapper .tmc-in {
          opacity: 1;
        }
        .tmc-wrapper .flip-card:hover .tmc-in {
          animation: tmc-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .tmc-wrapper .flip-card:hover .tmc-in-2 {
          animation-delay: 0.09s;
        }
        .tmc-wrapper .flip-card:hover .tmc-in-3 {
          animation-delay: 0.16s;
        }
        .tmc-wrapper .tmc-nudge {
          animation: tmc-nudge 1.6s ease-in-out infinite;
        }
        @keyframes tmc-in {
          from {
            opacity: 0;
            transform: translateY(9px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @keyframes tmc-nudge {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(3px);
          }
        }

        /* ---------- 无障碍：降低动效偏好 ---------- */
        @media (prefers-reduced-motion: reduce) {
          .tmc-wrapper .tmc-nudge,
          .tmc-wrapper .flip-card:hover .tmc-in,
          .tmc-backdrop .tmc-dots,
          .tmc-backdrop .tmc-float,
          .tmc-backdrop .tmc-typing,
          .tmc-backdrop .tmc-ripple {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
