import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/style.css';  // Mevcut CSS'in varsa

const app = createApp(App);
app.use(router);
app.use(store);
app.mount('#app');
