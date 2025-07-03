<!-- components/StatsGrid.vue -->
<template>
  <div class="stats-grid">
    <div class="stat-card primary">
      <div class="stat-icon">📦</div>
      <div class="stat-content">
        <h3>{{ statistics.totalItems }}</h3>
        <p>Toplam {{ itemType }} Çeşidi</p>
        <small>Aktif stok kalemleri</small>
      </div>
    </div>
    
    <div class="stat-card success">
      <div class="stat-icon">💸</div>
      <div class="stat-content">
        <h3>{{ formatCurrency(statistics.totalValue) }}</h3>
        <p>Toplam Stok Değeri</p>
        <small>Alış fiyatı bazında</small>
      </div>
    </div>
    
    <div class="stat-card warning">
      <div class="stat-icon">⚠️</div>
      <div class="stat-content">
        <h3>{{ statistics.lowStock }}</h3>
        <p>Düşük Stok Uyarısı</p>
        <small>Sipariş verilmeli</small>
      </div>
    </div>
    
    <div class="stat-card info">
      <div class="stat-icon">📅</div>
      <div class="stat-content">
        <h3>{{ statistics.recentlyAdded }}</h3>
        <p>Bu Ay Giren</p>
        <small>Yeni {{ itemType.toLowerCase() }}ler</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  statistics: {
    totalItems: number
    totalValue: number
    lowStock: number
    recentlyAdded: number
  }
  itemType?: string
}>(), {
  itemType: 'Malzeme'
})

const formatCurrency = (value: number): string => {
  return value.toLocaleString('tr-TR') + ' ₺'
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.primary { border-left: 4px solid #3b82f6; }
.stat-card.success { border-left: 4px solid #10b981; }
.stat-card.warning { border-left: 4px solid #f59e0b; }
.stat-card.info { border-left: 4px solid #06b6d4; }

.stat-icon {
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.primary .stat-icon { background: #eff6ff; }
.stat-card.success .stat-icon { background: #f0fdf4; }
.stat-card.warning .stat-icon { background: #fffbeb; }
.stat-card.info .stat-icon { background: #f0f9ff; }

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 5px 0;
}

.stat-content p {
  color: #374151;
  margin: 0 0 3px 0;
  font-weight: 500;
}

.stat-content small {
  color: #6b7280;
  font-size: 12px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
}

/* ===== STATS GRID (UNIVERSAL) ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.primary { border-left: 4px solid #3b82f6; }
.stat-card.success { border-left: 4px solid #10b981; }
.stat-card.warning { border-left: 4px solid #f59e0b; }
.stat-card.info { border-left: 4px solid #06b6d4; }

.stat-icon {
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.primary .stat-icon { background: #eff6ff; }
.stat-card.success .stat-icon { background: #f0fdf4; }
.stat-card.warning .stat-icon { background: #fffbeb; }
.stat-card.info .stat-icon { background: #f0f9ff; }

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 5px 0;
}

.stat-content p {
  color: #374151;
  margin: 0 0 3px 0;
  font-weight: 500;
}

.stat-content small {
  color: #6b7280;
  font-size: 12px;
}

</style>