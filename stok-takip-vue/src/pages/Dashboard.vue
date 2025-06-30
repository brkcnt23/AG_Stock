<!-- pages/Dashboard.vue - FİYAT VE DÖVİZ TAKİPLİ DASHBOARD -->
<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>📊 Stok Takip Dashboard</h1>
      <div class="date-info">
        <span>{{ getCurrentDate() }}</span>
        <div class="exchange-rates">
          <span class="rate">💵 USD: {{ exchangeRates.USD }}₺</span>
          <span class="rate">💶 EUR: {{ exchangeRates.EUR }}₺</span>
        </div>
      </div>
    </div>

    <!-- Financial Summary Cards -->
    <div class="financial-summary">
      <div class="summary-card primary">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <h3>{{ formatCurrency(totalStockValue) }}</h3>
          <p>Toplam Stok Değeri</p>
          <small>Güncel kurlarla hesaplanmış</small>
        </div>
      </div>
      
      <div class="summary-card success">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <h3>{{ formatCurrency(monthlyPurchases) }}</h3>
          <p>Bu Ay Alımlar</p>
          <small>{{ monthlyPurchaseCount }} adet malzeme</small>
        </div>
      </div>
      
      <div class="summary-card warning">
        <div class="card-icon">⚠️</div>
        <div class="card-content">
          <h3>{{ formatCurrency(criticalStockValue) }}</h3>
          <p>Kritik Stok Değeri</p>
          <small>{{ criticalStockCount }} kalem</small>
        </div>
      </div>
      
      <div class="summary-card info">
        <div class="card-icon">🔄</div>
        <div class="card-content">
          <h3>{{ formatCurrency(averageMonthlySpending) }}</h3>
          <p>Ortalama Aylık Harcama</p>
          <small>Son 6 ay ortalaması</small>
        </div>
      </div>
    </div>

    <!-- Currency Breakdown -->
    <div class="currency-breakdown">
      <div class="section-header">
        <h2>💱 Para Birimi Dağılımı</h2>
      </div>
      <div class="currency-cards">
        <div class="currency-card tl">
          <div class="currency-info">
            <span class="currency-symbol">₺</span>
            <div class="currency-details">
              <h4>{{ formatCurrency(currencyBreakdown.TL) }}</h4>
              <p>Türk Lirası</p>
              <small>%{{ getCurrencyPercentage('TL') }}</small>
            </div>
          </div>
          <div class="currency-bar">
            <div class="progress" :style="{ width: getCurrencyPercentage('TL') + '%' }"></div>
          </div>
        </div>
        
        <div class="currency-card usd">
          <div class="currency-info">
            <span class="currency-symbol">$</span>
            <div class="currency-details">
              <h4>{{ formatCurrency(currencyBreakdown.USD * exchangeRates.USD) }}</h4>
              <p>Amerikan Doları</p>
              <small>${{ formatNumber(currencyBreakdown.USD) }} • %{{ getCurrencyPercentage('USD') }}</small>
            </div>
          </div>
          <div class="currency-bar">
            <div class="progress" :style="{ width: getCurrencyPercentage('USD') + '%' }"></div>
          </div>
        </div>
        
        <div class="currency-card eur">
          <div class="currency-info">
            <span class="currency-symbol">€</span>
            <div class="currency-details">
              <h4>{{ formatCurrency(currencyBreakdown.EUR * exchangeRates.EUR) }}</h4>
              <p>Euro</p>
              <small>€{{ formatNumber(currencyBreakdown.EUR) }} • %{{ getCurrencyPercentage('EUR') }}</small>
            </div>
          </div>
          <div class="currency-bar">
            <div class="progress" :style="{ width: getCurrencyPercentage('EUR') + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Categories -->
    <div class="stock-categories">
      <div class="section-header">
        <h2>📦 Stok Kategorileri</h2>
      </div>
      <div class="category-grid">
        <div v-for="category in stockCategories" :key="category.type" 
             class="category-card" 
             :class="category.type"
             @click="navigateToCategory(category.type)">
          <div class="category-header">
            <span class="category-icon">{{ category.icon }}</span>
            <h3>{{ category.name }}</h3>
          </div>
          <div class="category-stats">
            <div class="stat-item">
              <span class="stat-value">{{ category.itemCount }}</span>
              <span class="stat-label">Kalem</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ formatCurrency(category.totalValue) }}</span>
              <span class="stat-label">Değer</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ category.lowStockCount }}</span>
              <span class="stat-label">Düşük Stok</span>
            </div>
          </div>
          <div class="category-footer">
            <span class="avg-price">Ort. Fiyat: {{ formatCurrency(category.averagePrice) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Suppliers -->
    <div class="top-suppliers">
      <div class="section-header">
        <h2>🏭 En Büyük Tedarikçiler</h2>
      </div>
      <div class="suppliers-list">
        <div v-for="(supplier, index) in topSuppliers" :key="supplier.name" 
             class="supplier-card">
          <div class="supplier-rank">{{ index + 1 }}</div>
          <div class="supplier-info">
            <h4>{{ supplier.name }}</h4>
            <p>{{ supplier.itemCount }} kalem malzeme</p>
          </div>
          <div class="supplier-stats">
            <div class="total-value">{{ formatCurrency(supplier.totalValue) }}</div>
            <div class="percentage">%{{ getSupplierPercentage(supplier.totalValue) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Price Changes -->
    <div class="price-changes">
      <div class="section-header">
        <h2>📈 Son Fiyat Değişiklikleri</h2>
      </div>
      <div class="price-history">
        <div v-for="change in recentPriceChanges" :key="change.id" 
             class="price-change-item">
          <div class="change-material">
            <span class="material-icon">{{ getMaterialIcon(change.materialType) }}</span>
            <div class="material-details">
              <h5>{{ change.materialName }}</h5>
              <small>{{ change.supplier }}</small>
            </div>
          </div>
          <div class="price-change">
            <div class="old-price">{{ formatPrice(change.oldPrice, change.currency) }}</div>
            <div class="arrow" :class="change.trend">{{ change.trend === 'up' ? '↗️' : '↘️' }}</div>
            <div class="new-price">{{ formatPrice(change.newPrice, change.currency) }}</div>
          </div>
          <div class="change-date">{{ formatDate(change.date) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data - gerçek uygulamada API'den gelecek
const exchangeRates = ref({
  USD: 32.45,
  EUR: 35.20
})

const totalStockValue = ref(2450000)
const monthlyPurchases = ref(185000)
const monthlyPurchaseCount = ref(23)
const criticalStockValue = ref(89000)
const criticalStockCount = ref(12)
const averageMonthlySpending = ref(220000)

const currencyBreakdown = ref({
  TL: 1850000,
  USD: 12500,
  EUR: 4200
})

const stockCategories = ref([
  {
    type: 'sarf',
    name: 'Sarf Malzemeler',
    icon: '📦',
    itemCount: 156,
    totalValue: 125000,
    lowStockCount: 8,
    averagePrice: 125
  },
  {
    type: 'celik',
    name: 'Çelik Malzemeler',
    icon: '🔧',
    itemCount: 89,
    totalValue: 890000,
    lowStockCount: 3,
    averagePrice: 2500
  },
  {
    type: 'membran',
    name: 'Membran',
    icon: '📄',
    itemCount: 34,
    totalValue: 450000,
    lowStockCount: 2,
    averagePrice: 8500
  },
  {
    type: 'halat',
    name: 'Halat',
    icon: '🔗',
    itemCount: 67,
    totalValue: 320000,
    lowStockCount: 4,
    averagePrice: 1800
  },
  {
    type: 'fitil',
    name: 'Fitil',
    icon: '🧵',
    itemCount: 45,
    totalValue: 180000,
    lowStockCount: 1,
    averagePrice: 950
  }
])

const topSuppliers = ref([
  { name: 'ABC Çelik San. Tic. Ltd.', itemCount: 45, totalValue: 680000 },
  { name: 'DEF Endüstri A.Ş.', itemCount: 32, totalValue: 520000 },
  { name: 'GHI Malzeme Paz.', itemCount: 28, totalValue: 340000 },
  { name: 'JKL Metal San.', itemCount: 19, totalValue: 290000 },
  { name: 'MNO Teknik Ltd.', itemCount: 15, totalValue: 180000 }
])

const recentPriceChanges = ref([
  {
    id: 1,
    materialType: 'celik',
    materialName: 'S235 Çelik Boru Ø100',
    supplier: 'ABC Çelik San.',
    oldPrice: 2800,
    newPrice: 3200,
    currency: 'TL',
    trend: 'up',
    date: '2024-12-20'
  },
  {
    id: 2,
    materialType: 'membran',
    materialName: 'PTFE Membran 1500x3000',
    supplier: 'DEF Endüstri',
    oldPrice: 285,
    newPrice: 265,
    currency: 'USD',
    trend: 'down',
    date: '2024-12-19'
  }
])

// Computed
const totalValueAllCurrencies = computed(() => {
  return currencyBreakdown.value.TL + 
         (currencyBreakdown.value.USD * exchangeRates.value.USD) + 
         (currencyBreakdown.value.EUR * exchangeRates.value.EUR)
})

// Methods
const getCurrentDate = () => {
  return new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('tr-TR') + ' ₺'
}

const formatNumber = (amount: number) => {
  return amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })
}

const formatPrice = (amount: number, currency: string) => {
  const symbols = { TL: '₺', USD: '$', EUR: '€' }
  return `${amount.toLocaleString('tr-TR')} ${symbols[currency as keyof typeof symbols]}`
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

const getCurrencyPercentage = (currency: string) => {
  let value = 0
  if (currency === 'TL') value = currencyBreakdown.value.TL
  if (currency === 'USD') value = currencyBreakdown.value.USD * exchangeRates.value.USD
  if (currency === 'EUR') value = currencyBreakdown.value.EUR * exchangeRates.value.EUR
  
  return Math.round((value / totalValueAllCurrencies.value) * 100)
}

const getSupplierPercentage = (supplierValue: number) => {
  return Math.round((supplierValue / totalStockValue.value) * 100)
}

const getMaterialIcon = (type: string) => {
  const icons = {
    sarf: '📦',
    celik: '🔧',
    membran: '📄',
    halat: '🔗',
    fitil: '🧵'
  }
  return icons[type as keyof typeof icons] || '📋'
}

const navigateToCategory = (categoryType: string) => {
  router.push(`/${categoryType}`)
}

onMounted(() => {
  // Gerçek uygulamada buradan exchange rates API çağrısı yapılacak
  // fetchExchangeRates()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2.2rem;
}

.date-info {
  text-align: right;
}

.exchange-rates {
  display: flex;
  gap: 15px;
  margin-top: 8px;
}

.rate {
  background: rgba(255,255,255,0.2);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
}

.financial-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-card.primary { border-left: 4px solid #3b82f6; }
.summary-card.success { border-left: 4px solid #10b981; }
.summary-card.warning { border-left: 4px solid #f59e0b; }
.summary-card.info { border-left: 4px solid #06b6d4; }

.card-icon {
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-card.primary .card-icon { background: #eff6ff; }
.summary-card.success .card-icon { background: #f0fdf4; }
.summary-card.warning .card-icon { background: #fffbeb; }
.summary-card.info .card-icon { background: #f0f9ff; }

.card-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 5px 0;
}

.card-content p {
  color: #374151;
  margin: 0 0 3px 0;
  font-weight: 500;
}

.card-content small {
  color: #6b7280;
  font-size: 12px;
}

/* Currency Breakdown */
.currency-breakdown {
  background: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  color: #1e293b;
  margin: 0;
  font-size: 1.4rem;
}

.currency-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.currency-card {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.currency-card.tl { border-left: 4px solid #dc2626; }
.currency-card.usd { border-left: 4px solid #16a34a; }
.currency-card.eur { border-left: 4px solid #2563eb; }

.currency-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.currency-symbol {
  font-size: 2rem;
  font-weight: bold;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.currency-card.tl .currency-symbol { background: #fef2f2; color: #dc2626; }
.currency-card.usd .currency-symbol { background: #f0fdf4; color: #16a34a; }
.currency-card.eur .currency-symbol { background: #eff6ff; color: #2563eb; }

.currency-details h4 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.currency-details p {
  color: #6b7280;
  margin: 2px 0;
}

.currency-details small {
  color: #9ca3af;
  font-size: 11px;
}

.currency-bar {
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.currency-bar .progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.currency-card.tl .progress { background: #dc2626; }
.currency-card.usd .progress { background: #16a34a; }
.currency-card.eur .progress { background: #2563eb; }

/* Stock Categories */
.stock-categories {
  background: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.category-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.category-card.sarf { border-left: 4px solid #f59e0b; }
.category-card.celik { border-left: 4px solid #6b7280; }
.category-card.membran { border-left: 4px solid #06b6d4; }
.category-card.halat { border-left: 4px solid #8b5cf6; }
.category-card.fitil { border-left: 4px solid #10b981; }

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.category-icon {
  font-size: 1.8rem;
}

.category-header h3 {
  color: #1e293b;
  margin: 0;
  font-size: 1.1rem;
}

.category-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-footer {
  padding-top: 15px;
  border-top: 1px solid #f3f4f6;
  text-align: center;
}

.avg-price {
  color: #6b7280;
  font-size: 13px;
}

/* Top Suppliers */
.top-suppliers {
  background: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.suppliers-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.supplier-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: background 0.2s;
}

.supplier-card:hover {
  background: #f8fafc;
}

.supplier-rank {
  width: 30px;
  height: 30px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.supplier-info {
  flex: 1;
}

.supplier-info h4 {
  margin: 0 0 4px 0;
  color: #1e293b;
  font-size: 1rem;
}

.supplier-info p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.supplier-stats {
  text-align: right;
}

.total-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 2px;
}

.percentage {
  font-size: 12px;
  color: #6b7280;
}

/* Price Changes */
.price-changes {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.price-history {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.price-change-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.change-material {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.material-icon {
  font-size: 1.5rem;
}

.material-details h5 {
  margin: 0 0 2px 0;
  color: #1e293b;
  font-size: 14px;
}

.material-details small {
  color: #6b7280;
  font-size: 12px;
}

.price-change {
  display: flex;
  align-items: center;
  gap: 8px;
}

.old-price {
  color: #6b7280;
  text-decoration: line-through;
  font-size: 13px;
}

.new-price {
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
}

.arrow.up {
  color: #dc2626;
}

.arrow.down {
  color: #16a34a;
}

.change-date {
  color: #9ca3af;
  font-size: 12px;
  min-width: 80px;
  text-align: right;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }
  
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .exchange-rates {
    justify-content: center;
  }
  
  .financial-summary,
  .currency-cards,
  .category-grid {
    grid-template-columns: 1fr;
  }
  
  .supplier-card,
  .price-change-item {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .price-change {
    justify-content: center;
  }
  
  .change-date {
    text-align: center;
  }
}
</style>