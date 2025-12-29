# EduLink+ 🧠
Akıllı, kişiselleştirilmiş öğrenme asistanı (Web)

## ✨ Proje Özeti
EduLink+, öğrencilerin ders çalışma süreçlerini gerçek zamanlı odak analizi ile destekleyen, yapay zekâ destekli bulut tabanlı bir web uygulamasıdır. Amacımız, öğrencilerin sadece **ne çalıştığını değil**, **nasıl çalıştığını** da anlayarak öğrenme verimliliğini artırmaktır.

## 💡 Temel Özellikler

### 1) 👁️ Gerçek Zamanlı Odak Takibi
- Kamera izniyle MediaPipe / TensorFlow.js kullanılarak yüz ve göz hareketleri tarayıcı içinde analiz edilir.
- Dikkatin dağıldığı anlar tespit edilerek çalışma oturumuna anlık **Odak Skoru** atanır.
- Veriler mümkün olduğunca cihazda işlenerek gizlilik korunur.

### 2) 📊 Kişiselleştirme ve Analiz
- Çalışma ve odak verileri Supabase (PostgreSQL) üzerinde saklanır.
- Analizler doğrultusunda öğrencinin en verimli olduğu saatlere göre çalışma önerileri sunulur.

### 3) 🧩 Otomatik İçerik Entegrasyonu
- YouTube Data API ve Open Library API gibi servislerle konuya uygun video / kaynak önerileri sağlanır.

### 4) 🚀 Motivasyon ve Mentorluk
- Oyunlaştırma (puan, seviye, hedefler) ile motivasyon artırılır.
- AI destekli öğrenme mentoru performansa göre geri bildirim sunar.

---

## 🛠️ Tech Stack
- React + TypeScript + Vite
- Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- MediaPipe / TensorFlow.js

## ▶️ Kurulum ve Çalıştırma
```bash
npm install
npm run dev
