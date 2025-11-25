// server.js

// ถ้า Node.js เป็นเวอร์ชัน < 18 ให้ใช้ require('node-fetch') แทน
// const fetch = require('node-fetch'); // สำหรับ Node.js เก่า
import express from 'express';
// ใน Node.js เวอร์ชันใหม่ (>= 18) สามารถใช้ fetch() ได้เลย

const app = express();
// Heroku จะกำหนด PORT ให้เราเอง เราจึงต้องใช้ process.env.PORT
const PORT = process.env.PORT || 3000; 

// Middleware เพื่อให้ Express รู้จัก JSON
app.use(express.json());

// ข้อมูล Tracking ID ที่ให้มาเพื่อใช้ทดสอบ
const trackingData = [
    "486848684383", 
    "123456789012",
    "999999999999" 
]; 

/**
 * 🔗 Endpoint สำหรับดึงข้อมูล Tracking API
 * URL ที่จะเรียก: /api/tracking/:trackingId
 * ตัวอย่าง: /api/tracking/486848684383
 */
app.get('/api/tracking/:trackingId', async (req, res) => {
    const trackingId = req.params.trackingId;
    
    // 1. ตรวจสอบว่า Tracking ID อยู่ในชุดข้อมูลที่เราเตรียมไว้หรือไม่
    if (!trackingData.includes(trackingId)) {
        return res.status(404).json({ 
            error: true, 
            message: `Tracking ID ${trackingId} not found in our dataset.` 
        });
    }

    // 2. ดึงข้อมูลจาก API ภายนอก
    const externalApiUrl = `https://www.inzaithai.com/api/tracking/${trackingId}`;
    console.log(`Fetching data from: ${externalApiUrl}`);

    try {
        const response = await fetch(externalApiUrl);

        if (!response.ok) {
            // กรณี API ภายนอกตอบกลับมาเป็น error status (เช่น 404, 500)
            throw new Error(`External API responded with status: ${response.status}`);
        }

        const data = await response.json();

        // 3. ส่งข้อมูล JSON ที่ได้กลับไปให้ผู้ใช้
        /*res.json({
            trackingId: trackingId,
            sourceApi: externalApiUrl,
            status: "Success",
            data: data
        });*/
        res.json(data);


    } catch (error) {
        console.error("Error fetching external data:", error.message);
        res.status(500).json({ 
            error: true, 
            message: "Failed to fetch data from external tracking service.",
            details: error.message
        });
    }
});

// Root route 
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the Tracking API Service!",
        usage: "Use /api/tracking/:trackingId"
    });
});

// เริ่ม Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});