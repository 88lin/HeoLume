import { siteConfig } from '@/lib/config'
import Head from 'next/head'
import { useCallback, useEffect, useRef, useState } from 'react'

const getTargetImageWidth = (width, maxWidth) => {
  const parsedWidth = Number(width)
  const parsedMaxWidth = Number(maxWidth)

  if (Number.isFinite(parsedWidth) && parsedWidth > 0) {
    return Number.isFinite(parsedMaxWidth) && parsedMaxWidth > 0
      ? Math.min(parsedWidth, parsedMaxWidth)
      : parsedWidth
  }

  return maxWidth
}

const normalizeImageSrc = src => {
  if (!src) return ''
  if (typeof window === 'undefined') return String(src)

  try {
    return new URL(src, window.location.href).href
  } catch {
    return String(src)
  }
}

/**
 * 图片懒加载
 * @param {*} param0
 * @returns
 */
export default function LazyImage({
  priority,
  id,
  src,
  alt,
  fallbackSrc,
  placeholderSrc,
  className,
  width,
  height,
  title,
  onLoad,
  onClick,
  style,
  loading
}) {
  const maxWidth = siteConfig('IMAGE_COMPRESS_WIDTH')
  const targetImageWidth = getTargetImageWidth(width, maxWidth)
  const defaultPlaceholderSrc = siteConfig('IMG_LAZY_LOAD_PLACEHOLDER')
  const imageRef = useRef(null)
  const [currentSrc, setCurrentSrc] = useState(
    priority && src
      ? adjustImgSize(src, targetImageWidth)
      : placeholderSrc || defaultPlaceholderSrc
  )
  const [imageLoaded, setImageLoaded] = useState(Boolean(priority && src))
  const loadNotifiedRef = useRef(false)
  const errorStageRef = useRef(0)
  const sourceRef = useRef('')

  const handleImageLoaded = useCallback(loadedSrc => {
    setImageLoaded(true)
    imageRef.current?.classList.remove('lazy-image-placeholder')

    // 预加载对象和原生 img 可能分别触发 load，业务回调只通知一次。
    const normalizedLoadedSrc = normalizeImageSrc(loadedSrc)
    if (
      normalizedLoadedSrc &&
      !loadNotifiedRef.current &&
      typeof onLoad === 'function'
    ) {
      loadNotifiedRef.current = true
      onLoad()
    }
  }, [onLoad])

  const handleElementLoaded = useCallback(
    event => {
      const element = event?.currentTarget
      handleImageLoaded(element?.currentSrc || element?.src)
    },
    [handleImageLoaded]
  )

  const handleImageError = useCallback(() => {
    if (imageRef.current) {
      // 优先回退 fallbackSrc，再尝试 placeholderSrc，最后 defaultPlaceholderSrc。
      const fallbackSources = [fallbackSrc, placeholderSrc, defaultPlaceholderSrc]
        .filter(Boolean)
        .filter(
          (source, index, sources) =>
            sources.findIndex(
              candidate =>
                normalizeImageSrc(candidate) === normalizeImageSrc(source)
            ) === index
        )
      const currentSrc = normalizeImageSrc(
        imageRef.current.currentSrc || imageRef.current.src
      )
      let stage = errorStageRef.current
      while (
        stage < fallbackSources.length &&
        normalizeImageSrc(fallbackSources[stage]) === currentSrc
      ) {
        stage += 1
      }
      const nextSrc = fallbackSources[stage]
      errorStageRef.current = stage + 1
      if (nextSrc && normalizeImageSrc(nextSrc) !== currentSrc) {
        imageRef.current.src = nextSrc
      }
      setImageLoaded(true)
      imageRef.current.classList.remove('lazy-image-placeholder')
    }
  }, [defaultPlaceholderSrc, fallbackSrc, placeholderSrc])

  useEffect(() => {
    if (!src) return

    const adjustedImageSrc =
      adjustImgSize(src, targetImageWidth) || defaultPlaceholderSrc
    const imageElement = imageRef.current
    let disposed = false
    if (sourceRef.current !== adjustedImageSrc) {
      sourceRef.current = adjustedImageSrc
      errorStageRef.current = 0
      loadNotifiedRef.current = false
    }

    // priority图片已经由原生img直接请求，避免再次创建Image对象。
    if (priority) {
      setCurrentSrc(adjustedImageSrc)
      setImageLoaded(true)
      if (imageElement?.complete && imageElement.naturalWidth > 0) {
        handleImageLoaded(imageElement.currentSrc || imageElement.src)
      } else if (imageElement?.complete && imageElement.naturalWidth === 0) {
        // hydration前已经失败的请求不会再次触发原生error事件，需要主动进入回退链。
        handleImageError()
      }
      return () => {
        disposed = true
      }
    }

    // 检查浏览器是否支持IntersectionObserver
    if (!window.IntersectionObserver) {
      // 降级处理：直接加载图片
      const img = new Image()
      img.src = adjustedImageSrc
      img.onload = () => {
        if (disposed) return
        errorStageRef.current = 0
        setCurrentSrc(adjustedImageSrc)
        handleImageLoaded(img.currentSrc || img.src)
      }
      img.onerror = () => {
        if (!disposed) handleImageError()
      }
      return () => {
        disposed = true
      }
    }

    const observer = new IntersectionObserver(
      entries => {
        if (disposed) return
        entries.forEach(entry => {
          if (entry.isIntersecting && !disposed) {
            // 预加载图片
            const img = new Image()
            // 设置图片解码优先级
            if ('decoding' in img) {
              img.decoding = 'async'
            }
            img.src = adjustedImageSrc
            img.onload = () => {
              if (disposed) return
              errorStageRef.current = 0
              setCurrentSrc(adjustedImageSrc)
              handleImageLoaded(img.currentSrc || img.src)
            }
            img.onerror = () => {
              if (!disposed) handleImageError()
            }

            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: siteConfig('LAZY_LOAD_THRESHOLD', '200px'),
        threshold: 0.1
      }
    )

    if (imageElement) {
      observer.observe(imageElement)
    }

    return () => {
      disposed = true
      if (imageElement) {
        observer.unobserve(imageElement)
      }
    }
  }, [
    src,
    targetImageWidth,
    priority,
    defaultPlaceholderSrc,
    fallbackSrc,
    handleImageError,
    handleImageLoaded,
    placeholderSrc
  ])

  // 动态添加width、height和className属性，仅在它们为有效值时添加
  const imgProps = {
    ref: imageRef,
    src: currentSrc,
    'data-src': src, // 存储原始图片地址
    alt: alt || title || 'Image in ' + (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || 'homepage' : 'article'),
    onLoad: priority ? handleElementLoaded : undefined,
    onError: handleImageError,
    className: `${className || ''}${imageLoaded ? '' : ' lazy-image-placeholder'}`,
    style: {
      aspectRatio: width && height ? `${width} / ${height}` : undefined,
      containIntrinsicSize: width || height ? undefined : '300px 200px',
      ...style
    },
    onClick,
    // 性能优化属性
    loading: priority ? 'eager' : loading || 'lazy',
    decoding: 'async',
    // 现代图片格式支持
    ...(siteConfig('WEBP_SUPPORT') && { 'data-webp': true }),
    ...(siteConfig('AVIF_SUPPORT') && { 'data-avif': true }),
    // 为图片添加适当的尺寸属性，帮助浏览器提前计算布局
    ...(width && height && {
      'data-width': width,
      'data-height': height
    })
  }

  if (id) imgProps.id = id
  if (title) imgProps.title = title
  if (width) imgProps.width = width
  if (height) imgProps.height = height
  if (priority) imgProps.fetchpriority = 'high'

  if (!src) {
    return null
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={imgProps.alt} {...imgProps} />
      {priority && (
        <Head>
          <link
            rel='preload'
            as='image'
            href={adjustImgSize(src, targetImageWidth)}
            fetchpriority='high'
          />
        </Head>
      )}
    </>
  )
}

/**
 * 根据窗口尺寸决定压缩图片宽度
 * @param {*} src
 * @param {*} maxWidth
 * @returns
 */
const adjustImgSize = (src, maxWidth) => {
  if (!src) {
    return null
  }
  const screenWidth =
    (typeof window !== 'undefined' && window?.screen?.width) || maxWidth
  const parsedMaxWidth = Number(maxWidth)
  const targetWidth =
    Number.isFinite(parsedMaxWidth) && parsedMaxWidth > 0
      ? Math.min(screenWidth, parsedMaxWidth)
      : screenWidth

  // 屏幕尺寸大于默认图片尺寸，没必要再压缩
  if (!targetWidth) {
    return src
  }

  // 正则表达式，用于匹配 URL 中的 width 参数
  const widthRegex = /width=\d+/
  // 正则表达式，用于匹配 URL 中的 w 参数
  const wRegex = /w=\d+/

  // 使用正则表达式替换 width/w 参数
  return src
    .replace(widthRegex, `width=${targetWidth}`)
    .replace(wRegex, `w=${targetWidth}`)
}
