import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import LazyImage from '@/components/LazyImage'

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

describe('LazyImage Component', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image'
  }

  beforeEach(() => {
    mockIntersectionObserver.mockClear()
  })

  it('renders with required props', () => {
    render(<LazyImage {...defaultProps} />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', 'Test image')
  })

  it('applies custom className', () => {
    const customClass = 'custom-image-class'
    render(<LazyImage {...defaultProps} className={customClass} />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveClass(customClass)
  })

  it('sets width and height attributes', () => {
    render(
      <LazyImage 
        {...defaultProps} 
        width={300} 
        height={200} 
      />
    )
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('width', '300')
    expect(image).toHaveAttribute('height', '200')
  })

  it('handles priority loading', () => {
    render(<LazyImage {...defaultProps} priority />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('loading', 'eager')
  })

  it('falls back when a priority image failed before hydration', () => {
    const completeDescriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'complete'
    )
    const naturalWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'naturalWidth'
    )

    Object.defineProperty(HTMLImageElement.prototype, 'complete', {
      configurable: true,
      get: () => true
    })
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
      configurable: true,
      get: () => 0
    })

    try {
      render(
        <LazyImage
          {...defaultProps}
          priority
          fallbackSrc='/fallback.jpg'
        />
      )
      const image = screen.getByAltText('Test image')

      expect(image.src).toContain('/fallback.jpg')
    } finally {
      if (completeDescriptor) {
        Object.defineProperty(
          HTMLImageElement.prototype,
          'complete',
          completeDescriptor
        )
      }
      if (naturalWidthDescriptor) {
        Object.defineProperty(
          HTMLImageElement.prototype,
          'naturalWidth',
          naturalWidthDescriptor
        )
      }
    }
  })

  it('uses lazy loading by default', () => {
    render(<LazyImage {...defaultProps} />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('loading', 'lazy')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<LazyImage {...defaultProps} onClick={handleClick} />)
    
    const image = screen.getByAltText('Test image')
    image.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('sets up IntersectionObserver when not priority', () => {
    render(<LazyImage {...defaultProps} />)
    
    expect(mockIntersectionObserver).toHaveBeenCalled()
  })

  it('does not set up IntersectionObserver for priority images', () => {
    render(<LazyImage {...defaultProps} priority />)
    
    // Priority images should load immediately without IntersectionObserver
    expect(mockIntersectionObserver).not.toHaveBeenCalled()
  })

  it('handles load event', async () => {
    const handleLoad = jest.fn()
    render(<LazyImage {...defaultProps} priority onLoad={handleLoad} />)
    const image = screen.getByAltText('Test image')
    fireEvent.load(image)
    fireEvent.load(image)
    await waitFor(() => {
      expect(handleLoad).toHaveBeenCalledTimes(1)
    })
  })

  it('does not treat the placeholder load as the image load', () => {
    const handleLoad = jest.fn()
    render(<LazyImage {...defaultProps} onLoad={handleLoad} />)
    const image = screen.getByAltText('Test image')

    fireEvent.load(image)

    expect(handleLoad).not.toHaveBeenCalled()
  })

  it('notifies once when a priority image succeeds through a fallback', () => {
    const handleLoad = jest.fn()
    render(
      <LazyImage
        {...defaultProps}
        priority
        fallbackSrc='/fallback.jpg'
        onLoad={handleLoad}
      />
    )
    const image = screen.getByAltText('Test image')

    fireEvent.error(image)
    fireEvent.load(image)
    fireEvent.load(image)

    expect(handleLoad).toHaveBeenCalledTimes(1)
  })

  it('handles error gracefully', () => {
    render(<LazyImage {...defaultProps} />)
    
    const image = screen.getByAltText('Test image')
    
    // Simulate image error
    fireEvent.error(image)
    
    // Component should still be in the document
    expect(image).toBeInTheDocument()
  })

  it('advances through fallback sources without repeating a failed URL', () => {
    render(
      <LazyImage
        {...defaultProps}
        fallbackSrc='/fallback.jpg'
        placeholderSrc='/placeholder.jpg'
      />
    )
    const image = screen.getByAltText('Test image')

    fireEvent.error(image)
    expect(image.src).toContain('/fallback.jpg')
    fireEvent.error(image)
    expect(image.src).toContain('/placeholder.jpg')
    fireEvent.error(image)
    const finalSrc = image.src
    fireEvent.error(image)

    expect(image.src).toBe(finalSrc)
  })

  it('applies correct decoding attribute', () => {
    render(<LazyImage {...defaultProps} />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('decoding', 'async')
  })

  it('handles missing src gracefully', () => {
    const { container } = render(<LazyImage alt="Test image" />)

    expect(container.firstChild).toBeNull()
  })

  it('applies custom styles', () => {
    const customStyle = { border: '1px solid red' }
    render(<LazyImage {...defaultProps} style={customStyle} />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveStyle('border: 1px solid red')
  })
})
