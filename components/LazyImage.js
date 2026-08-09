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
  const adjustedImageSrc = src
    ? adjustImgSize(src, targetImageWidth) || defaultPlaceholderSrc
    : ''
  const initialSrc =
    priority && src
      ? adjustedImageSrc
      : placeholderSrc || defaultPlaceholderSrc
  const [currentSrc, setCurrentSrc] = useState(initialSrc)
  const [imageLoaded, setImageLoaded] = useState(Boolean(priority && src))
  const loadNotifiedRef = useRef(false)
  const failedSourcesRef = useRef(new Set())
  const activeSourceRef = useRef(initialSrc)
  const hasStartedLoadingRef = useRef(Boolean(priority))
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
      const loadedSrc = element?.currentSrc || element?.src
      if (
        !loadedSrc ||
        (!hasStartedLoadingRef.current && !priority) ||
        normalizeImageSrc(loadedSrc) !==
          normalizeImageSrc(activeSourceRef.current)
      ) {
        return
      }
      handleImageLoaded(loadedSrc)
    },
    [handleImageLoaded, priority]
  )

  const handleImageError = useCallback(failedSourceOrEvent => {
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
      const eventTarget = failedSourceOrEvent?.currentTarget
      const failedSrc = normalizeImageSrc(
        typeof failedSourceOrEvent === 'string'
          ? failedSourceOrEvent
          : eventTarget?.currentSrc ||
              eventTarget?.src ||
              imageRef.current.currentSrc ||
              imageRef.current.src
      )
      const failedSources = failedSourcesRef.current
      if (failedSrc) failedSources.add(failedSrc)

      // 压缩后的原图地址失败时，将未压缩原地址视为同一次请求，避免在回退链中重试。
      if (failedSrc === normalizeImageSrc(adjustedImageSrc)) {
        const originalSrc = normalizeImageSrc(src)
        if (originalSrc) failedSources.add(originalSrc)
      }

      const nextSrc = fallbackSources.find(
        source => !failedSources.has(normalizeImageSrc(source))
      )
      hasStartedLoadingRef.current = true
      if (nextSrc) {
        activeSourceRef.current = nextSrc
        imageRef.current.src = nextSrc
        setCurrentSrc(nextSrc)
      }
      setImageLoaded(true)
      imageRef.current.classList.remove('lazy-image-placeholder')
    }
  }, [adjustedImageSrc, defaultPlaceholderSrc, fallbackSrc, placeholderSrc, src])

  useEffect(() => {
    if (!src) return

    const imageElement = imageRef.current
    if (sourceRef.current !== adjustedImageSrc) {
      sourceRef.current = adjustedImageSrc
      failedSourcesRef.current.clear()
      loadNotifiedRef.current = false
      activeSourceRef.current = priority
        ? adjustedImageSrc
        : placeholderSrc || defaultPlaceholderSrc
      hasStartedLoadingRef.current = Boolean(priority)
    }

    // priority图片已经由原生img直接请求，避免再次创建Image对象。
    if (priority) {
      setCurrentSrc(adjustedImageSrc)
      setImageLoaded(true)
      if (imageElement?.complete && imageElement.naturalWidth > 0) {
        handleImageLoaded(imageElement.currentSrc || imageElement.src)
      } else if (imageElement?.complete && imageElement.naturalWidth === 0) {
        // hydration前已经失败的请求不会再次触发原生error事件，需要主动进入回退链。
        handleImageError(adjustedImageSrc)
      }
      return
    }

    let disposed = false

    // 检查浏览器是否支持IntersectionObserver
    if (!window.IntersectionObserver) {
      // 降级处理：直接加载图片
      const img = new Image()
      img.onload = () => {
        if (disposed) return
        failedSourcesRef.current.clear()
        hasStartedLoadingRef.current = true
        activeSourceRef.current = adjustedImageSrc
        setCurrentSrc(adjustedImageSrc)
        handleImageLoaded(img.currentSrc || img.src)
      }
      img.onerror = () => {
        if (!disposed) handleImageError(adjustedImageSrc)
      }
      img.src = adjustedImageSrc
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
            hasStartedLoadingRef.current = true
            activeSourceRef.current = adjustedImageSrc
            // 设置图片解码优先级
            if ('decoding' in img) {
              img.decoding = 'async'
            }
            img.onload = () => {
              if (disposed) return
              failedSourcesRef.current.clear()
              activeSourceRef.current = adjustedImageSrc
              setCurrentSrc(adjustedImageSrc)
              handleImageLoaded(img.currentSrc || img.src)
            }
            img.onerror = () => {
              if (!disposed) handleImageError(adjustedImageSrc)
            }
            img.src = adjustedImageSrc

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
    adjustedImageSrc,
    priority,
    defaultPlaceholderSrc,
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
    onLoad: handleElementLoaded,
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
