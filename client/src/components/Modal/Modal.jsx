import React, { useEffect } from 'react'
import styles from './Modal.module.css'

function Modal({ isOpen, onClose, title, children, footer }) {
  // Обработка нажатия Escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    
    // Блокируем прокрутку body, когда модалка открыта
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Если модалка не открыта — не рендерим
  if (!isOpen) return null

  // Клик на overlay закрывает модалку
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* Заголовок */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title || 'Модальное окно'}</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        {/* Контент */}
        <div className={styles.content}>
          {children}
        </div>

        {/* Футер (опционально) */}
        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal