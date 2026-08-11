/**
 * 图片相关配置
 *
 * eg: images.unsplash.com(notion图床的所有图片都会替换),如果你在 notion 里已经添加了一个随机图片 url，恰巧那个服务跑路或者挂掉，想一键切换所有配图可以将该 url 配置在这里
 * 默认下会将你上传到 notion的主页封面图和头像也给替换，建议将主页封面图和头像放在其他图床，在 notion 里配置 link 即可。
 */
const HEO_LAZY_LOAD_PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" class="loader" aria-hidden="true">
  <style>
    .loader__eye1,
    .loader__eye2,
    .loader__mouth1,
    .loader__mouth2 {
      animation: eye1 3s ease-in-out infinite;
    }
    .loader__eye1,
    .loader__eye2 { transform-origin: 64px 64px; }
    .loader__eye2 { animation-name: eye2; }
    .loader__mouth1 { animation-name: mouth1; }
    .loader__mouth2 { animation-name: mouth2; visibility: hidden; }
    .loader__label {
      animation: loadingLabel 2.8s ease-in-out infinite;
    }
    .loader__dot {
      animation: loadingDot 1.4s ease-in-out infinite;
      opacity: 0.3;
      transform-box: fill-box;
      transform-origin: center;
    }
    .loader__dot2 { animation-delay: 0.16s; }
    .loader__dot3 { animation-delay: 0.32s; }
    @keyframes eye1 {
      from { transform: rotate(-260deg) translate(0, -56px); }
      50%, 60% {
        animation-timing-function: cubic-bezier(0.17, 0, 0.58, 1);
        transform: rotate(-40deg) translate(0, -56px) scale(1);
      }
      to { transform: rotate(225deg) translate(0, -56px) scale(0.35); }
    }
    @keyframes eye2 {
      from { transform: rotate(-260deg) translate(0, -56px); }
      50% { transform: rotate(40deg) translate(0, -56px) rotate(-40deg) scale(1); }
      52.5% { transform: rotate(40deg) translate(0, -56px) rotate(-40deg) scale(1, 0); }
      55%, 70% {
        animation-timing-function: cubic-bezier(0, 0, 0.28, 1);
        transform: rotate(40deg) translate(0, -56px) rotate(-40deg) scale(1);
      }
      to { transform: rotate(150deg) translate(0, -56px) scale(0.4); }
    }
    @keyframes mouth1 {
      from {
        animation-timing-function: ease-in;
        stroke-dasharray: 0 351.86;
        stroke-dashoffset: 0;
      }
      25% {
        animation-timing-function: ease-out;
        stroke-dasharray: 175.93 351.86;
        stroke-dashoffset: 0;
      }
      50% {
        animation-timing-function: steps(1, start);
        stroke-dasharray: 175.93 351.86;
        stroke-dashoffset: -175.93;
        visibility: visible;
      }
      75%, to { visibility: hidden; }
    }
    @keyframes mouth2 {
      from {
        animation-timing-function: steps(1, end);
        visibility: hidden;
      }
      50% {
        animation-timing-function: ease-in-out;
        visibility: visible;
        stroke-dashoffset: 0;
      }
      to { stroke-dashoffset: -351.86; }
    }
    @keyframes loadingLabel {
      0%, 100% { opacity: 0.76; }
      50% { opacity: 1; }
    }
    @keyframes loadingDot {
      0%, 100% { opacity: 0.3; transform: scale(0.72); }
      45% { opacity: 1; transform: scale(1.18); }
    }
    @media (prefers-reduced-motion: reduce) {
      .loader__eye1,
      .loader__eye2,
      .loader__mouth1,
      .loader__mouth2,
      .loader__label,
      .loader__dot { animation: none; }
      .loader__label { opacity: 1; }
      .loader__dot { opacity: 0.82; transform: none; }
    }
  </style>
  <g transform="translate(253 113) scale(1.05)">
  <defs>
    <clipPath id="loader-eyes">
      <circle transform="rotate(-40,64,64) translate(0,-56)" r="8" cy="64" cx="64" class="loader__eye1" />
      <circle transform="rotate(40,64,64) translate(0,-56)" r="8" cy="64" cx="64" class="loader__eye2" />
    </clipPath>
    <linearGradient y2="1" x2="0" y1="0" x1="0" id="loader-grad">
      <stop stop-color="#000" offset="0%" />
      <stop stop-color="#fff" offset="100%" />
    </linearGradient>
    <linearGradient id="loader-label-grad" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="hsl(193,90%,50%)" offset="0%" />
      <stop stop-color="hsl(223,90%,50%)" offset="100%" />
    </linearGradient>
    <mask id="loader-mask">
      <rect fill="url(#loader-grad)" height="128" width="128" y="0" x="0" />
    </mask>
  </defs>
  <g stroke-dasharray="175.93 351.86" stroke-width="12" stroke-linecap="round">
    <g>
      <rect clip-path="url(#loader-eyes)" height="64" width="128" fill="hsl(193,90%,50%)" />
      <g stroke="hsl(193,90%,50%)" fill="none">
        <circle transform="rotate(180,64,64)" r="56" cy="64" cx="64" class="loader__mouth1" />
        <circle transform="rotate(0,64,64)" r="56" cy="64" cx="64" class="loader__mouth2" />
      </g>
    </g>
    <g mask="url(#loader-mask)">
      <rect clip-path="url(#loader-eyes)" height="64" width="128" fill="hsl(223,90%,50%)" />
      <g stroke="hsl(223,90%,50%)" fill="none">
        <circle transform="rotate(180,64,64)" r="56" cy="64" cx="64" class="loader__mouth1" />
        <circle transform="rotate(0,64,64)" r="56" cy="64" cx="64" class="loader__mouth2" />
      </g>
    </g>
  </g>
  </g>
  <text class="loader__label" x="301" y="280" fill="url(#loader-label-grad)" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="2.8">LOADING</text>
  <circle class="loader__dot loader__dot1" cx="373" cy="276" r="2.7" fill="hsl(204,90%,52%)" />
  <circle class="loader__dot loader__dot2" cx="383" cy="276" r="2.7" fill="hsl(214,90%,52%)" />
  <circle class="loader__dot loader__dot3" cx="393" cy="276" r="2.7" fill="hsl(223,90%,50%)" />
</svg>`

const encodeSvgBase64 = value => {
  const nodeBuffer = globalThis.Buffer
  if (nodeBuffer) {
    return nodeBuffer.from(value, 'utf8').toString('base64')
  }

  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return globalThis.btoa(binary)
}

const HEO_LAZY_LOAD_PLACEHOLDER =
  `data:image/svg+xml;base64,${encodeSvgBase64(HEO_LAZY_LOAD_PLACEHOLDER_SVG)}`

module.exports = {
  NOTION_HOST: process.env.NEXT_PUBLIC_NOTION_HOST || 'https://www.notion.so', // Notion域名，您可以选择用自己的域名进行反向代理，如果不懂得什么是反向代理，请勿修改此项
  IMAGE_COMPRESS_WIDTH: process.env.NEXT_PUBLIC_IMAGE_COMPRESS_WIDTH || 1080, // 图片压缩宽度默认值，作用于博客封面和文章内容 越小加载图片越快
  IMAGE_ZOOM_IN_WIDTH: process.env.NEXT_PUBLIC_IMAGE_ZOOM_IN_WIDTH || 1920, // 文章图片点击放大后的画质宽度，不代表在网页中的实际展示宽度
  IMAGE_COMPRESS_QUALITY: process.env.NEXT_PUBLIC_IMAGE_COMPRESS_QUALITY || 80, // 图片压缩质量 0-100，数值越小文件越小但质量越低
  RANDOM_IMAGE_URL: process.env.NEXT_PUBLIC_RANDOM_IMAGE_URL || '', // 随机图片API,如果未配置下面的关键字，主页封面，头像，文章封面图都会被替换为随机图片
  RANDOM_IMAGE_REPLACE_TEXT:
    process.env.NEXT_PUBLIC_RANDOM_IMAGE_NOT_REPLACE_TEXT ||
    'images.unsplash.com', // 触发替换图片的 url 关键字(多个支持用英文逗号分开)，只有图片地址中包含此关键字才会替换为上方随机图片url

  // 网站图片
  IMG_LAZY_LOAD_PLACEHOLDER:
    process.env.NEXT_PUBLIC_IMG_LAZY_LOAD_PLACEHOLDER ||
    HEO_LAZY_LOAD_PLACEHOLDER, // 懒加载占位图片地址，支持base64或url
  IMG_URL_TYPE: process.env.NEXT_PUBLIC_IMG_TYPE || 'Notion', // 此配置已失效，请勿使用；AMAZON方案不再支持，仅支持Notion方案。 ['Notion','AMAZON'] 站点图片前缀 默认 Notion:(https://notion.so/images/xx) ， AMAZON(https://s3.us-west-2.amazonaws.com/xxx)
  IMG_SHADOW: process.env.NEXT_PUBLIC_IMG_SHADOW || true, // 文章图片是否自动添加阴影
  IMG_COMPRESS_WIDTH: process.env.NEXT_PUBLIC_IMG_COMPRESS_WIDTH || 800 // Notion图片压缩宽度
}
