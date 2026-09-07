# 🌐 คู่มือการนำระบบของครูซอสขึ้นใช้งานบน Vercel (vercel.app)

ระบบนี้รองรับการ Deploy บน **Vercel** โดยตรง 100% พร้อมไฟล์ตั้งค่า `vercel.json` และรองรับสถาปัตยกรรมแบบ Real-time ทั้ง 2 รูปแบบยอดนิยม:

---

## 📌 รูปแบบที่ 1: Deploy บน Vercel + Firebase Realtime Database (แนะนำ - ง่ายสุด ฟรี 100% ไม่ต้องเปิดเซิร์ฟเวอร์แยก)

รูปแบบนี้เหมาะสำหรับการใช้งานบน `*.vercel.app` โดยตรง โดยระบบจะใช้ **Firebase Realtime Database (ฟรีตลอดชีพของ Google)** เป็น Real-time Engine แทน ทำให้ทุกอุปกรณ์ (มือถือครู, นักเรียน, จอโปรเจคเตอร์) อัปเดตข้อมูลตรงกันในเสี้ยววินาที

### ขั้นตอนการทำ (ใช้เวลา 2 นาที):
1. เข้าไปที่ [Firebase Console](https://console.firebase.google.com/) -> กด **Create a project** (ตั้งชื่อ เช่น `kru-sauce-score`)
2. ในเมนูด้านซ้าย เลือก **Build** -> **Realtime Database** -> กด **Create Database**
3. เลือกตำแหน่งเซิร์ฟเวอร์ (เช่น `Singapore - asia-southeast1`) -> ในแท็บ Rules ตั้งค่าการอ่าน/เขียนเป็น `true` สำหรับชั้นเรียน:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
4. ไปที่ **Project Settings (รูปฟันเฟือง)** -> เมนู **General** เลื่อนลงมาล่างสุดที่ **Your apps** -> กดไอคอนเว็บ `</>` -> ก๊อบปี้โค้ดการตั้งค่า `firebaseConfig`:
   ```json
   {
     "apiKey": "AIzaSy...",
     "authDomain": "kru-sauce.firebaseapp.com",
     "databaseURL": "https://kru-sauce-default-rtdb.asia-southeast1.firebasedatabase.app",
     "projectId": "kru-sauce",
     "storageBucket": "kru-sauce.appspot.com",
     "messagingSenderId": "...",
     "appId": "..."
   }
   ```
5. **บน Vercel**:
   - นำโปรเจกต์นี้ขึ้น GitHub และกด Import เข้าสู่ Vercel
   - ในหน้า **Environment Variables** บน Vercel เพิ่มตัวแปร:
     - **Name**: `VITE_FIREBASE_CONFIG`
     - **Value**: *(วาง JSON Firebase Config ที่ก๊อบปี้มา)*
   - กด **Deploy** -> ได้ลิงก์ `https://your-project.vercel.app` ใช้งานได้ทันที!

---

## 📌 รูปแบบที่ 2: Deploy Frontend บน Vercel + Backend บน Render (Socket.io WebSockets ฟรี)

หากต้องการใช้งานผ่าน Socket.io Node.js Backend:

1. **Deploy Backend**:
   - นำโค้ดโปรเจกต์นี้ขึ้น GitHub
   - ไปที่ [Render.com](https://render.com/) -> กด **New Web Service** -> เลือก Repository นี้
   - ตั้งค่า:
     - **Build Command**: `npm install`
     - **Start Command**: `node server/index.js`
   - เมื่อ Deploy เสร็จ จะได้ URL หลังบ้าน เช่น `https://kru-sauce-api.onrender.com`

2. **Deploy Frontend บน Vercel**:
   - ไปที่ [Vercel.com](https://vercel.com/) -> Import Repository นี้
   - เพิ่ม Environment Variable:
     - **Name**: `VITE_SOCKET_URL`
     - **Value**: `https://kru-sauce-api.onrender.com`
   - กด **Deploy** -> ได้ลิงก์ `https://your-project.vercel.app`

---

## 📌 วิธี Deploy ขึ้น Vercel แบบ 1-Click ผ่าน Vercel CLI (จากเครื่องคอมพิวเตอร์)

หากติดตั้ง Vercel CLI ไว้ในเครื่อง สามารถพิมพ์คำสั่ง:
```bash
npx vercel
```
หรือสำหรับ Production:
```bash
npx vercel --prod
```

---

## ⚙️ การตั้งค่า Server URL ผ่านหน้าเว็บโดยตรง
หากได้ Deploy ขึ้น Vercel แล้ว แต่ไม่ได้ใส่ Environment Variable ไว้ล่วงหน้า:
- บนหน้าเว็บจะมี **ไอคอนลูกโลก (🌐)** ที่มุมขวาบนของ Navbar
- คุณครูสามารถคลิกแล้วกรอก `WebSocket URL` หรือ `Firebase Config JSON` แล้วกดบันทึก ระบบจะจำค่าและเชื่อมต่อแบบ Real-time ให้ทันทีครับ!
