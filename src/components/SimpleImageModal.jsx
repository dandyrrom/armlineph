// src/components/SimpleImageModal.jsx
import { useEffect } from 'react';

function SimpleImageModal({ isOpen, images, currentIndex, onClose, onNext, onPrev }) {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrev();
          break;
        case 'ArrowRight':
          onNext();
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white text-3xl hover:text-gray-300 transition-colors"
        aria-label="Close modal"
      >
        ×
      </button>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white text-3xl hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous image"
          >
            ‹
          </button>
          
          <button
            onClick={onNext}
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white text-3xl hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next image"
          >
            ›
          </button>
        </>
      )}

      {/* Image Container */}
      <div className="relative max-w-4xl max-h-full mx-4">
        <img
          src={currentImage}
          alt={`Evidence image ${currentIndex + 1}`}
          className="max-w-full max-h-screen object-contain rounded-lg"
        />
        
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
    </div>
  );
}

export default SimpleImageModal;