import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { logout, getUser } from '../../services/authService'
import styles from './Layout.module.css'

function Layout() {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.layout}>
      {/* Боковая навигация */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>💰 Salary Tracker</h2>
        </div>

        <nav className={styles.nav}>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>📊</span>
            <span>Обзор</span>
          </NavLink>

          <NavLink 
            to="/history" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>📝</span>
            <span>История</span>
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>📈</span>
            <span>Аналитика</span>
          </NavLink>
        </nav>

        {/* Информация о пользователе и кнопка выхода */}
        <div className={styles.userSection}>
          {user && (
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name || user.email}</div>
            </div>
          )}
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <span className={styles.icon}>🚪</span>
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout