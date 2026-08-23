/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return (
    <style jsx global>{`
      :root {
        --ai-bg: #f0f4ff;
        --ai-title: #2563eb;
        --ai-title-text: #fff;
        --ai-card-bg: #ffffff;
        --ai-card-border: #dbeafe;
        --heo-surface-strong: #ffffff;
        --heo-surface-dark: #0f172a;
        --heo-text: #1e293b;
        --podcast-accent: #2563eb;
        --podcast-bg: #f0f7ff;
        --podcast-border: #bfdbfe;
        --podcast-progress-bg: rgba(37, 99, 235, 0.06);
        --podcast-btn-bg: #f8fafc;
        --podcast-btn-text: #2563eb;
        --podcast-btn-border: rgba(0, 0, 0, 0.1);
      }
        
      .dark {
        --ai-bg: #21232a;
        --ai-title: #f2b94b;
        --ai-title-text: #1b1c20;
        --ai-card-bg: #1d1e22;
        --ai-card-border: #3d3d3f;
        --podcast-accent: #818cf8;
        --podcast-bg: #2a2b33;
        --podcast-border: #4a4b52;
        --podcast-progress-bg: rgba(129, 140, 248, 0.1);
        --podcast-btn-bg: #3f3f46;
        --podcast-btn-text: #818cf8;
        --podcast-btn-border: rgba(255, 255, 255, 0.08);
      }

      html.dark {
        --heo-text: rgba(255, 255, 255, 0.88);
      }

      * {
        box-sizing: border-box;
      }

      body {
        background-color: #f7f9fe;
      }

      /* 鼠标样式 */
      body {
        cursor: url('https://cdn.jsdmirror.com/gh/88lin/picx-images-hosting@master/shubiao/Normal.svg'), default;
      }
      a, img, button, [role='button'] {
        cursor: url('https://cdn.jsdmirror.com/gh/88lin/picx-images-hosting@master/shubiao/Link.svg'), pointer;
      }

      /* 滚动条样式 */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background-color: rgba(73, 177, 245, 0.2);
        border-radius: 2em;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
      }
      ::-webkit-scrollbar-thumb {
        background-color: rgb(59 130 246);
        background-image: -webkit-linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.4) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, 0.4) 50%,
          rgba(255, 255, 255, 0.4) 75%,
          transparent 75%
        );
        border-radius: 2em;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        cursor: pointer;
      }
      ::-webkit-scrollbar-corner {
        background-color: transparent;
      }
      .recent-top-post-group::-webkit-scrollbar,
      .scroll-hidden::-webkit-scrollbar {
        display: none;
      }

      /* 顶部加载进度条 */
      .pace {
        pointer-events: none;
        user-select: none;
        z-index: 2000;
        position: fixed;
        top: 10px;
        left: 0;
        right: 0;
        height: 7px;
        border-radius: 8px;
        width: 5rem;
        margin: auto;
        background: rgba(241, 244, 250, 0.88);
        border: 1px solid rgba(210, 220, 240, 0.85);
        overflow: hidden;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.8) inset,
          0 6px 18px rgba(15, 23, 42, 0.08);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }
      .pace-inactive .pace-progress {
        opacity: 0;
        transition: 0.25s ease-in;
      }
      .pace .pace-progress {
        box-sizing: border-box;
        transform: translate3d(0, 0, 0);
        max-width: 200px;
        position: absolute;
        top: 0;
        right: 100%;
        height: 100%;
        width: 100%;
        background: linear-gradient(
          90deg,
          #ff7a59,
          #ff4d8d,
          #3b82f6,
          #22c55e
        );
        background-size: 220% 100%;
        animation: paceGradient 1.6s ease infinite;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35) inset;
      }
      @keyframes paceGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .pace.pace-inactive {
        opacity: 0;
        transition: 0.3s;
        top: -8px;
      }

      /* 液态玻璃按钮特效 */
      #theme-heo div.bg-indigo-400 {
        position: relative;
        border: none;
        background: linear-gradient(90deg, #03a9f4, #f441a5, #c26dd0, #03a9f4);
        background-size: 400%;
        border-radius: 35px;
        z-index: 1;
        overflow: hidden;
        transition:
          transform 0.3s cubic-bezier(0.2, 0, 0.1, 1),
          box-shadow 0.3s cubic-bezier(0.2, 0, 0.1, 1),
          background-position 0.1s linear;
        will-change: transform, background-position;
        isolation: isolate;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        box-shadow:
          0 8px 32px rgba(31, 38, 135, 0.2),
          inset 0 4px 12px rgba(255, 255, 255, 0.6);
      }
      #theme-heo div.bg-indigo-400:hover {
        animation: heoGradientFlow 8s linear infinite;
        transform: translateY(-3px);
        box-shadow:
          0 12px 40px rgba(31, 38, 135, 0.35),
          inset 0 4px 15px rgba(255, 255, 255, 0.8);
      }
      #theme-heo div.bg-indigo-400::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.5) 0%,
          rgba(255, 255, 255, 0.2) 50%,
          rgba(255, 255, 255, 0.5) 100%
        );
        border-radius: 35px;
        opacity: 0.6;
        transition: opacity 0.4s ease;
        filter: blur(12px);
        pointer-events: none;
      }
      #theme-heo div.bg-indigo-400:active {
        animation: heoGradientFlow 6s linear infinite;
        transform: translateY(1px) scale(0.98);
        transition:
          transform 100ms cubic-bezier(0.3, 0, 0.5, 1),
          box-shadow 100ms cubic-bezier(0.3, 0, 0.5, 1);
        box-shadow:
          0 2px 15px rgba(31, 38, 135, 0.25),
          inset 0 0 25px rgba(255, 255, 255, 0.9);
      }
      #theme-heo div.bg-indigo-400:active::before {
        opacity: 0.9;
        filter: blur(20px);
        transition: opacity 100ms ease-out;
      }
      @keyframes heoGradientFlow {
        0% { background-position: 0% 50%; }
        100% { background-position: 300% 50%; }
      }

      /* 搜索框特效 */
      #theme-heo input.text-black {
        border: 2px solid transparent;
        padding-left: 0.8em;
        outline: none;
        overflow: hidden;
        background-color: #f3f3f3;
        border-radius: 10px;
        transition:
          border-color 0.3s ease-in-out,
          box-shadow 0.3s ease-in-out,
          background-color 0.3s ease-in-out;
      }
      #theme-heo input.text-black:hover,
      #theme-heo input.text-black:focus {
        border-color: #4a9dec;
        box-shadow: 0 0 0 6px rgba(74, 157, 236, 0.2);
      }

      /* SVG 樱花图标旋转控制 */
      @keyframes heoRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      #theme-heo .rotate-icon {
        animation: heoRotate 8s linear infinite;
        transform-origin: center;
      }

      /* 移动端优化 */
      @media (hover: none) {
        #theme-heo div.bg-indigo-400 {
          animation: heoGradientFlow 12s linear infinite;
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
        }
        #theme-heo div.bg-indigo-400:active {
          transform: scale(0.97);
        }
      }

      /* 公告栏中的字体固定白色 */
      #theme-heo #announcement-content .notion {
        color: white;
      }

      #more {
        white-space: nowrap;
      }

      #theme-heo #banner-cover {
        color: #ffffff;
        background:
          radial-gradient(circle at 18% 18%, rgba(125, 211, 252, 0.38), transparent 32%),
          radial-gradient(circle at 86% 12%, rgba(103, 232, 249, 0.2), transparent 36%),
          linear-gradient(135deg, rgba(28, 88, 255, 0.92), rgba(0, 143, 186, 0.86));
        -webkit-backdrop-filter: saturate(160%) blur(15px);
        backdrop-filter: saturate(160%) blur(15px);
      }

      html.dark #theme-heo #banner-cover {
        background:
          radial-gradient(circle at 16% 18%, rgba(96, 165, 250, 0.34), transparent 34%),
          radial-gradient(circle at 88% 16%, rgba(45, 212, 191, 0.18), transparent 38%),
          linear-gradient(135deg, rgba(28, 55, 155, 0.92), rgba(6, 95, 130, 0.88));
      }

      #theme-heo #banner-cover-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }

      #theme-heo .banner-cover-leading-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 72px;
        color: rgba(255, 255, 255, 0.96);
        font-size: 64px;
        line-height: 1;
      }

      #theme-heo #banner-cover-title {
        display: flex;
        align-items: center;
        color: #ffffff;
        font-size: clamp(42px, 4vw, 56px);
        font-weight: 800;
        line-height: 1.12;
        letter-spacing: 0;
        text-shadow: 0 10px 28px rgba(0, 38, 92, 0.22);
      }

      #theme-heo .banner-cover-inline-icon {
        width: 64px;
        height: 64px;
        flex-shrink: 0;
        margin-left: 12px;
        color: rgba(255, 255, 255, 0.94);
      }

      #theme-heo #card-body.today-card {
        background: #ffffff;
        border: 1px solid #e3e8f7;
        border-radius: 12px;
        box-shadow: none;
      }

      #theme-heo #card-body.today-card:hover #today-card-cover {
        transform: scale(1.02);
      }

      #theme-heo #today-card-cover.today-card-cover {
        z-index: 0;
        pointer-events: none;
        background:
          linear-gradient(
            90deg,
            rgba(224, 245, 240, 0.85) 0%,
            rgba(226, 245, 242, 0.85) 5%,
            rgba(228, 245, 244, 0.85) 10%,
            rgba(230, 245, 246, 0.85) 15%,
            rgba(232, 245, 248, 0.85) 20%,
            rgba(234, 245, 250, 0.85) 25%,
            rgba(236, 245, 252, 0.85) 30%,
            rgba(238, 245, 254, 0.85) 35%,
            rgba(240, 245, 255, 0.85) 40%,
            rgba(242, 245, 255, 0.85) 45%,
            rgba(244, 245, 255, 0.85) 50%,
            rgba(246, 245, 255, 0.85) 55%,
            rgba(248, 245, 255, 0.85) 60%,
            rgba(250, 245, 255, 0.85) 65%,
            rgba(252, 245, 255, 0.85) 70%,
            rgba(254, 245, 255, 0.85) 75%,
            rgba(255, 245, 255, 0.85) 80%,
            rgba(255, 245, 253, 0.85) 85%,
            rgba(255, 245, 251, 0.85) 90%,
            rgba(255, 245, 249, 0.85) 95%,
            rgba(255, 245, 247, 0.85) 100%
          );
        transition: transform 0.3s ease-in-out;
        -webkit-mask-image: none;
        mask-image: none;
      }

      #theme-heo #today-card-cover-image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      #theme-heo #today-card-info {
        color: rgba(0, 0, 0, 0.8);
      }

      #theme-heo #today-card-tips {
        color: rgba(0, 0, 0, 0.6);
        opacity: 0.8;
        font-size: 12px;
        font-weight: 400;
      }

      #theme-heo #today-card-title {
        color: rgba(3, 145, 150, 0.82);
        font-size: 28px;
        font-weight: 700;
        line-height: 36px;
      }

      #theme-heo #today-card-more-button {
        width: 125px;
        height: 40px;
        color: #d7537e;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid #e3e8f7;
        border-radius: 20px;
        box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.05);
        font-weight: 400;
        transition: all 0.3s;
        -webkit-backdrop-filter: saturate(180%) blur(20px);
        backdrop-filter: saturate(180%) blur(20px);
      }

      #theme-heo #today-card-more-button svg {
        flex-shrink: 0;
        margin-right: 8px;
        font-size: 22px;
      }

      #theme-heo #today-card-more-button:hover {
        color: rgba(0, 0, 0, 0.9);
        background: rgba(0, 0, 0, 0.1);
      }

      #theme-heo .heo-nav-hover {
        transition:
          color 0.18s ease,
          background 0.18s ease,
          box-shadow 0.18s ease;
      }

      #theme-heo .heo-nav-hover:hover {
        color: #1e73be;
        background:
          linear-gradient(rgba(255, 255, 255, 0.96), rgba(235, 244, 255, 0.88)),
          radial-gradient(circle at 22% 20%, rgba(147, 197, 253, 0.35), transparent 58%);
        box-shadow:
          inset 0 0 0 1px rgba(147, 197, 253, 0.76),
          inset 0 1px 1px rgba(255, 255, 255, 0.7),
          0 8px 18px rgba(59, 130, 246, 0.12);
        text-decoration: none;
      }

      html.dark #theme-heo .heo-nav-hover:hover {
        color: #bfdbfe;
        background:
          linear-gradient(rgba(30, 41, 59, 0.92), rgba(30, 58, 138, 0.46)),
          radial-gradient(circle at 22% 20%, rgba(96, 165, 250, 0.28), transparent 58%);
        box-shadow:
          inset 0 0 0 1px rgba(96, 165, 250, 0.52),
          inset 0 1px 1px rgba(255, 255, 255, 0.08),
          0 8px 18px rgba(37, 99, 235, 0.22);
      }

      // AI打字机，闪烁光标
      .blinking-cursor {
        background-color: var(--ai-title);
        width: 10px;
        height: 16px;
        display: inline-block;
        vertical-align: middle;
        margin-left: 4px;
        animation: blinking-cursor 0.5s infinite;
        -webkit-animation: blinking-cursor 0.5s infinite;
      }

      @keyframes blinking-cursor {
        0% {
            opacity: 1;
        }
        
        40% {
            opacity: 1;
        }
        
        50% {
            opacity: 0;
        }
        
        90% {
            opacity: 0;
        }
        
        100% {
            opacity: 1;
        }
      }

      // 标签滚动动画
      .tags-group-wrapper {
        animation: rowup 60s linear infinite;
      }

      @keyframes rowup {
        0% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(-50%);
        }
      }

      /* Loading 动画样式 */
      #loading-box {
        position: fixed;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        height: 100dvh;
        z-index: 1001;
        opacity: 1;
        visibility: visible;
        transition:
          opacity .4s ease 1.6s,
          visibility 0s linear 2.0s;
      }

      #loading-box.loaded {
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
      }

      /* 退出动画：滑出效果 */
      #loading-box.loaded .loading-bg,
      #loading-box.loaded .loading-animation {
        border-radius: 3rem;
        transform: translateX(100%);
        transition: 1.3s ease;
      }

      #loading-box.loaded .loading-bg {
        transition-delay: 0.3s;
      }

      #loading-box .loading-bg,
      #loading-box .loading-animation {
        position: absolute;
        width: 100%;
        height: 100%;
        will-change: transform;
      }

      #loading-box .loading-bg {
        background: #4f65f0 url("/loadings.svg") repeat;
        background-size: 30%;
      }

      html.dark #loading-box .loading-bg {
        background: #eab308 url("/loadings.svg") repeat;
        background-size: 30%;
      }

      #loading-box .loading-animation {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        background: var(--heo-surface-strong);
      }

      html.dark #loading-box .loading-animation {
        background: var(--heo-surface-dark);
      }

      #loading-box .loading-animation .loading {
        width: 16rem;
        height: 16rem;
      }

      /* SVG 描边动画 */
      #loading-box .loading-animation .loading path {
        stroke: var(--heo-text);
        stroke-width: 0.5px;
        animation: dashArray 5s ease-in-out infinite, dashOffset 5s linear infinite;
      }

      #loading-box .loading-animation .loading path.color {
        stroke: #4f65f0;
      }

      html.dark #loading-box .loading-animation .loading path {
        stroke: var(--heo-text);
      }

      html.dark #loading-box .loading-animation .loading path.color {
        stroke: #eab308;
      }

      /* Loading 文字及故障效果 */
      #loading-box .loading-text {
        position: relative;
        margin-top: 1rem;
        font-size: 26px;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: 0.3rem;
        z-index: 1;
        animation: shift 1s ease-in-out infinite alternate;
        color: var(--heo-text);
      }

      #loading-box .loading-text:before,
      #loading-box .loading-text:after {
        display: block;
        content: attr(data-glitch);
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0.8;
      }

      #loading-box .loading-text:before {
        animation: glitch 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
        color: #ff5252;
        z-index: -1;
      }

      #loading-box .loading-text:after {
        animation: glitch 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both infinite;
        color: #2ecc71;
        z-index: -2;
      }

      html.dark #loading-box .loading-text {
        color: var(--heo-text);
      }

      html.dark #loading-box .loading-text:before {
        color: #f97316;
      }

      html.dark #loading-box .loading-text:after {
        color: #22c55e;
      }

      /* Keyframes */
      @keyframes dashArray {
        0% { stroke-dasharray: 0 1 359 0; }
        50% { stroke-dasharray: 0 359 1 0; }
        100% { stroke-dasharray: 359 1 0 0; }
      }

      @keyframes dashOffset {
        0% { stroke-dashoffset: 365; }
        100% { stroke-dashoffset: 5; }
      }

      @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-3px, 3px); }
        40% { transform: translate(-3px, -3px); }
        60% { transform: translate(3px, 3px); }
        80% { transform: translate(3px, -3px); }
        100% { transform: translate(0); }
      }

      @keyframes shift {
        0%, 40%, 44%, 58%, 61%, 65%, 69%, 73%, 100% { transform: skewX(0deg); }
        41% { transform: skewX(10deg); }
        42% { transform: skewX(-10deg); }
        59% { transform: skewX(40deg) skewY(10deg); }
        60% { transform: skewX(-40deg) skewY(-10deg); }
        63% { transform: skewX(10deg) skewY(-5deg); }
        70% { transform: skewX(-50deg) skewY(-20deg); }
        71% { transform: skewX(10deg) skewY(-10deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        #theme-heo div.bg-indigo-400,
        #loading-box,
        #loading-box * {
          animation: none !important;
          transition: none !important;
        }
        #loading-box.loaded .loading-bg,
        #loading-box.loaded .loading-animation {
          transform: none !important;
        }
      }

      @media (max-width: 768px) {
        #loading-box.loaded .loading-bg,
        #loading-box.loaded .loading-animation {
          transition-duration: 0.7s;
        }
      }

      /* AI文章摘要字体大小 */
      .font-bold.ml-2 {
        font-size: 18px;
      }

      /* 标签颜色 */
      .hover\:bg-indigo-600:hover {
        background-color: #ff6817;
      }
      .group:hover .md\:group-hover\:bg-indigo-600 {
        background-color: #ff6817;
      }
      .bg-indigo-600 {
        background-color: #ff6817;
      }
      .hover\:text-indigo-600:hover {
        color: #3a86ff;
      }

      /* 推荐文章字体颜色 */
      .group:hover .group-hover\:text-indigo-600 {
        color: #3a86ff;
      }

      /* 首页字体颜色 */
      .group:hover .group-hover\:text-indigo-700 {
        color: #3a86ff;
      }
      .hover\:text-indigo-700:hover {
        color: #3a86ff;
      }

      /* 目录字体颜色 */
      .text-indigo-600 {
        color: #3a86ff;
      }

      /* 复选框颜色 */
      .hover\:border-indigo-600:hover {
        border-color: rgba(58, 134, 255, 0.6);
        box-shadow:
          0 0 0 1px rgba(58, 134, 255, 0.6),
          0 8px 24px rgba(58, 134, 255, 0.1);
        transition: border-color 0.25s cubic-bezier(.2,.8,.2,1),
                    box-shadow 0.25s cubic-bezier(.2,.8,.2,1);
      }
      .hover\:border-blue-600:hover {
        border-color: rgba(160, 210, 255, 0.65);
        box-shadow:
          inset 0 0 0 999px rgba(160, 210, 255, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.20),
          0 0 0 6px rgba(140, 200, 255, 0.22),
          0 12px 30px rgba(0, 0, 0, 0.12);
        transition:
          border-color 0.22s cubic-bezier(.2,.8,.2,1),
          box-shadow 0.22s cubic-bezier(.2,.8,.2,1);
      }
      .dark .hover\:border-indigo-600:hover {
        border-color: rgba(120, 170, 255, 0.75);
        box-shadow:
          0 0 0 1px rgba(120, 170, 255, 0.45),
          0 10px 26px rgba(0, 0, 0, 0.45);
      }
      .dark .hover\:border-blue-600:hover {
        border-color: rgba(170, 215, 255, 0.70);
        box-shadow:
          inset 0 0 0 999px rgba(170, 215, 255, 0.035),
          inset 0 1px 0 rgba(255, 255, 255, 0.10),
          0 0 0 6px rgba(140, 200, 255, 0.20),
          0 16px 40px rgba(0, 0, 0, 0.55);
      }

      .notion a:not(.notion-page-link):not(.notion-collection-card):not(.notion-hash-link):not(.notion-bookmark):not(.blog-link) {
          position: relative;
          color: rgba(33, 150, 243, 1);
          text-decoration: none;
          border-radius: 5px 5px 0 0;
          background-image:
              linear-gradient(90.68deg, #b439df 0.26%, #e5337e 102.37%),
              linear-gradient(rgba(33, 150, 243, 0.2), rgba(33, 150, 243, 0.2));
          background-repeat: no-repeat;
          background-origin: border-box, padding-box;
          background-position: 50% 100%, 0 100%;
          background-size: 0 2px, 100% 0;
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
          transition: background-size 0.3s ease;
      }

      .notion a:not(.notion-page-link):not(.notion-collection-card):not(.notion-hash-link):not(.notion-bookmark):not(.blog-link):hover,
      .notion a:not(.notion-page-link):not(.notion-collection-card):not(.notion-hash-link):not(.notion-bookmark):not(.blog-link):focus {
          color: rgba(33, 150, 243, 1);
          border-radius: 6px 6px 0 0;
          background-size: 100% 2px, 100% 1.5em;
      }

      .notion a.notion-link:not(.notion-page-link):not(.notion-collection-card):not(.notion-hash-link):not(.notion-bookmark):not(.blog-link) {
          border-bottom-color: transparent !important;
          background-image:
              linear-gradient(90.68deg, #b439df 0.26%, #e5337e 102.37%),
              linear-gradient(to top, currentColor 1px, transparent 1px),
              linear-gradient(rgba(33, 150, 243, 0.2), rgba(33, 150, 243, 0.2));
          background-position: 50% 100%, 50% 100%, 0 100%;
          background-origin: border-box, border-box, padding-box;
          background-size: 0 2px, 100% 2px, 100% 0;
      }

      .notion a.notion-link:not(.notion-page-link):not(.notion-collection-card):not(.notion-hash-link):not(.notion-bookmark):not(.blog-link):hover,
      .notion a.notion-link:not(.notion-page-link):not(.notion-collection-card):not(.notion-hash-link):not(.notion-bookmark):not(.blog-link):focus {
          background-size: 100% 2px, 100% 2px, 100% 1.5em;
      }

      .notion-table-of-contents-item:hover {
        background-color: #ebf4ff !important;
      }

      .dark .notion-table-of-contents-item:hover {
        background-color: #9a34122e !important;
      }

      /* ========== 播客陪读播放器 ========== */

      /* 文章头部胶囊 — 精确匹配参考站 */
      .podcast-header-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 0 10px;
        height: 32px;
        border-radius: 99px;
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.15s ease;
        white-space: nowrap;
        user-select: none;
        font-size: 15px;
      }
      .podcast-header-badge:hover {
        background: rgba(255, 255, 255, 0.28);
        transform: scale(1.05);
      }
      .podcast-header-badge:active {
        transform: scale(0.95);
      }
      .podcast-header-badge i.fa-podcast {
        font-size: 16px;
        color: #fff;
      }
      .podcast-header-badge-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        color: #fff;
        font-size: 10px;
        flex-shrink: 0;
      }

      /* 均衡器条 — 匹配参考站 */
      .podcast-eq {
        display: flex;
        align-items: center;
        gap: 3px;
        height: 14px;
      }
      .podcast-eq-bar {
        display: block;
        width: 3px;
        border-radius: 99px;
        background: rgba(255, 255, 255, 0.35);
        transition: height 0.15s ease;
      }
      .podcast-eq-bar:nth-child(1)  { height: 5px; }
      .podcast-eq-bar:nth-child(2)  { height: 8px; }
      .podcast-eq-bar:nth-child(3)  { height: 11px; }
      .podcast-eq-bar:nth-child(4)  { height: 7px; }
      .podcast-eq-bar:nth-child(5)  { height: 12px; }
      .podcast-eq-bar:nth-child(6)  { height: 9px; }
      .podcast-eq-bar:nth-child(7)  { height: 14px; }
      .podcast-eq-bar:nth-child(8)  { height: 10px; }
      .podcast-eq-bar:nth-child(9)  { height: 13px; }
      .podcast-eq-bar:nth-child(10) { height: 8px; }
      .podcast-eq-bar:nth-child(11) { height: 11px; }
      .podcast-eq-bar:nth-child(12) { height: 7px; }
      .podcast-eq-bar:nth-child(13) { height: 5px; }
      .podcast-eq-bar.is-playing {
        animation: podcastEqBounce 0.5s ease-in-out infinite alternate;
      }
      .podcast-eq-bar.is-playing:nth-child(1)  { animation-delay: 0s;    animation-duration: 0.45s; }
      .podcast-eq-bar.is-playing:nth-child(2)  { animation-delay: 0.06s; animation-duration: 0.55s; }
      .podcast-eq-bar.is-playing:nth-child(3)  { animation-delay: 0.12s; animation-duration: 0.4s;  }
      .podcast-eq-bar.is-playing:nth-child(4)  { animation-delay: 0.03s; animation-duration: 0.6s;  }
      .podcast-eq-bar.is-playing:nth-child(5)  { animation-delay: 0.09s; animation-duration: 0.5s;  }
      .podcast-eq-bar.is-playing:nth-child(6)  { animation-delay: 0.15s; animation-duration: 0.42s; }
      .podcast-eq-bar.is-playing:nth-child(7)  { animation-delay: 0.04s; animation-duration: 0.58s; }
      .podcast-eq-bar.is-playing:nth-child(8)  { animation-delay: 0.11s; animation-duration: 0.47s; }
      .podcast-eq-bar.is-playing:nth-child(9)  { animation-delay: 0.02s; animation-duration: 0.52s; }
      .podcast-eq-bar.is-playing:nth-child(10) { animation-delay: 0.08s; animation-duration: 0.44s; }
      .podcast-eq-bar.is-playing:nth-child(11) { animation-delay: 0.14s; animation-duration: 0.56s; }
      .podcast-eq-bar.is-playing:nth-child(12) { animation-delay: 0.05s; animation-duration: 0.48s; }
      .podcast-eq-bar.is-playing:nth-child(13) { animation-delay: 0.1s;  animation-duration: 0.53s; }
      @keyframes podcastEqBounce {
        0%   { height: 3px; }
        100% { height: 14px; }
      }

      /* 移动端隐藏头部胶囊 */
      @media (max-width: 768px) {
        .podcast-header-badge {
          display: none !important;
        }
      }

      /* 文章摘要下方播放器 */
      .podcast-player {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        margin: 8px 0 0;
        border-radius: 18px;
        background: var(--podcast-bg);
        border: 0.8px solid var(--podcast-border);
        overflow: hidden;
        transition: border-color 0.2s ease;
      }
      .podcast-player:hover {
        border-color: var(--podcast-border);
      }
      .podcast-player-progress {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background: var(--podcast-progress-bg);
        pointer-events: none;
        transition: width 0.3s linear;
      }
      .podcast-player-label {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 1 auto;
        min-width: 0;
        color: var(--podcast-accent);
        font-size: 14px;
        font-weight: 500;
        z-index: 1;
        white-space: nowrap;
      }
      .podcast-player-label i {
        color: var(--podcast-accent);
        font-size: 15px;
        flex-shrink: 0;
      }
      .podcast-player-label span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .podcast-player-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 0 0 auto;
        margin-left: auto;
        z-index: 1;
      }
      .podcast-player-speed {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 16px;
        height: 30px;
        min-width: 52px;
        border-radius: 15px;
        background: var(--podcast-btn-bg);
        color: var(--podcast-btn-text);
        font-size: 12px;
        font-weight: 600;
        border: 1.5px solid var(--podcast-btn-border);
        cursor: pointer;
        transition: opacity 0.15s ease, transform 0.1s ease;
        line-height: 1;
        flex-shrink: 0;
        letter-spacing: 0;
      }
      .podcast-player-speed:hover {
        opacity: 0.85;
        transform: scale(1.05);
      }
      .podcast-player-play {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 0 14px;
        height: 30px;
        border-radius: 15px;
        background: var(--podcast-accent);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: opacity 0.15s ease, transform 0.1s ease;
        line-height: 1;
        flex-shrink: 0;
      }
      .podcast-player-play:hover {
        opacity: 0.88;
        transform: scale(1.04);
      }
      .podcast-player-play i {
        font-size: 11px;
      }
      .podcast-player-loader {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: podcastSpin 0.6s linear infinite;
      }
      @keyframes podcastSpin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 640px) {
        .podcast-player {
          padding: 10px 14px;
          gap: 8px;
        }
        .podcast-player-label {
          font-size: 13px;
        }
      }
    `}</style>
  )
}

export { Style }
