<!-- components/Navbar.vue -->
<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <img src="/supply-chain.png" alt="Logo" class="nav-head-icon" />
          Stok Takip Sistemi
        </router-link>
      </div>
      
      <div class="nav-links">
        <router-link to="/" class="nav-link" active-class="active">
          <img src="/factory.png" class="nav-icon" />
          Ana Sayfa
        </router-link>
        <router-link to="/sarf" class="nav-link" active-class="active">
          <img src="/package.png" class="nav-icon" />
          Sarf Malzemeler
        </router-link>
        <router-link to="/membran" class="nav-link" active-class="active">
          <img src="/paper-roll.png" class="nav-icon" />
           Membran
        </router-link>
        <router-link to="/celik" class="nav-link" active-class="active">
          <img src="/ironrodbar.png" class="nav-icon" />
          Çelik
        </router-link>
        <router-link to="/halat" class="nav-link" active-class="active">
          <img src="/halat.png" class="nav-icon" />
          Halat
        </router-link>
        <router-link to="/fitil" class="nav-link" active-class="active">
          <img src="/fitil.png" class="nav-icon" />
          Fitil
        </router-link>
        <router-link to="/projects" class="nav-link" active-class="active">
          <img src="/projects.png" class="nav-icon" />
          Projeler
        </router-link>
      </div>
      
      <div class="nav-user">
        <div class="user-info">
          <span class="user-name">👤 Kullanıcı</span>
          <div class="user-dropdown">
            <button class="dropdown-btn">⚙️</button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
</script>

<style scoped>
.nav-head-icon {
  width: 50px !important;
  height: 50px !important;
  margin-right: 6px;
  vertical-align: middle;
}
.brand-link .nav-head-icon {
  width: 24px;
  height: 24px;
}

.nav-icon {
  width: 25px !important;
  height: 25px !important;
  margin-right: 6px;
  vertical-align: middle;
}
.brand-link .nav-icon {
  width: 24px;
  height: 24px;
}


.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.nav-brand .brand-link {
  color: white;
  text-decoration: none;
  font-size: 1.4rem;
  font-weight: 700;
  transition: opacity 0.2s;
}

.nav-brand .brand-link:hover {
  opacity: 0.8;
}

.nav-links {
  display: flex;
  gap: 5px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-user {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.dropdown-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 1024px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
  }
  
  .nav-links {
    margin: 10px 0;
    justify-content: center;
  }}
</style>