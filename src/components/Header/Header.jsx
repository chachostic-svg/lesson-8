import React from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Логотип */}
        <NavLink to="/" className={styles.logo}>
          💰 Salary Tracker
        </NavLink>

        {/* Навигация */}
        <nav className={styles.nav}>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
            end
          >
            Главная
          </NavLink>
          <NavLink 
            to="/history" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            История
          </NavLink>
          <NavLink 
            to="/analytics" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            Аналитика
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header