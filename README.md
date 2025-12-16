<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
# EduLink
🧠 EduLink+ | Akıllı, Kişiselleştirilmiş Öğrenme Asistanı (Web)

✨ Proje Özeti

EduLink+, öğrencilerin ders çalışma süreçlerini gerçek zamanlı odak analizi ile dönüştüren, yapay zekâ destekli bulut tabanlı bir web uygulamasıdır. Amacımız, öğrencilerin sadece ne çalıştığını değil, nasıl çalıştığını anlayarak, öğrenme verimliliğini en üst düzeye çıkarmaktır.

💡 Temel Özellikler

1. 👁️ Yapay Zekâ Destekli Gerçek Zamanlı Odak Takibi

Kamera erişimi izniyle, MediaPipe ve TensorFlow.js algoritmaları kullanılarak yüz ve göz hareketleri tarayıcı içinde analiz edilir.

Öğrencinin dikkatinin dağıldığı anlar tespit edilerek, çalışma oturumuna anlık bir "Odak Skoru" atanır. Bu veriler cihazda işlenerek gizlilik korunur.

2. 📊 Veri Odaklı Kişiselleştirme ve Analiz
   
Tüm çalışma ve odak verileri Supabase PostgreSQL veritabanında saklanır.

Yapılan analizler doğrultusunda, öğrencinin en verimli olduğu saatlere uygun kişiselleştirilmiş çalışma planları önerilir.

3. 🧩 Otomatik İçerik Entegrasyonu

YouTube Data API ve Open Library API gibi dış servislerle entegrasyon sayesinde, çalışılan konuya dair güncel ders videoları, makaleler ve kaynaklar otomatik olarak kullanıcıya sunulur.

5. 🚀 Motivasyon ve Mentorluk

Odak sürelerine göre puan ve seviye atlama gibi oyunlaştırılmış (Gamification) öğelerle motivasyon artırılır.

Yapay zekâ destekli "Öğrenme Mentoru", performans analizlerine dayalı olarak destekleyici ve yol gösterici geri bildirimler sunar.
>>>>>>> b50045015aef7ee393bdd3cd8075d8fd85266776
