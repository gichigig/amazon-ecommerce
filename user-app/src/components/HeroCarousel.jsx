import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=600&fit=crop',
    title: 'Shop Deals',
    subtitle: 'Up to 50% off on electronics'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=600&fit=crop',
    title: 'Fashion Week',
    subtitle: 'New arrivals in clothing'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=600&fit=crop',
    title: 'Home & Kitchen',
    subtitle: 'Everything for your home'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=600&fit=crop',
    title: 'New Season Styles',
    subtitle: 'Discover the latest trends'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&h=600&fit=crop',
    title: 'Tech Essentials',
    subtitle: 'Gadgets for modern living'
  }
]

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <div className="hero-carousel">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="hero-slide-image"
          />
          <div className="hero-slide-overlay" />
          <div className="hero-slide-content">
            <h2 className="hero-slide-title">{slide.title}</h2>
            <p className="hero-slide-subtitle">{slide.subtitle}</p>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="hero-nav-btn hero-nav-prev"
        aria-label="Previous slide"
      >
        <ChevronLeft size={48} />
      </button>
      <button
        onClick={goToNext}
        className="hero-nav-btn hero-nav-next"
        aria-label="Next slide"
      >
        <ChevronRight size={48} />
      </button>

      {/* Dots Indicator */}
      <div className="hero-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
