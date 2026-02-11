# Reset Database Instructions

## To reset your database with the new seed data:

### Option 1: Using Browser (Easiest)
1. Make sure your dev server is running (`npm run dev`)
2. Open your browser and go to: http://localhost:3000/api/reset-data
3. Use POST method (you can use a browser extension like Postman, or use the method below)

### Option 2: Using PowerShell
```powershell
# Make sure dev server is running first: npm run dev
# Then in a new terminal:
Invoke-RestMethod -Uri "http://localhost:3000/api/reset-data" -Method POST
```

### Option 3: On Live Site (Vercel)
Once deployed, you can visit:
```
https://optix-shop.vercel.app/api/reset-data
```
Use a tool like Postman or curl to send a POST request.

## What will be reset:

✅ **1 Customer:** Nasir Qureshi
- Email: nasir.qureshi@example.com
- Phone: +92-300-1234567
- Location: Karachi, Pakistan

✅ **3 Prescriptions by Dr. Muddasar**
- RX00001 - Dated: Jan 10, 2026
- RX00002 - Dated: Jan 20, 2026
- RX00003 - Dated: Feb 5, 2026

✅ **5 Sales for Nasir Qureshi**
- INV00001 - Rs. 16,518.82 (Completed - with RX00001)
- INV00002 - Rs. 15,928.82 (Completed - with RX00002)
- INV00003 - Rs. 10,618.82 (Completed - Sunglasses)
- INV00004 - Rs. 17,108.82 (Completed - with RX00003)
- INV00005 - Rs. 5,900.00 (Partial Payment - Rs. 2,900 pending)

✅ **5 Products with Images**
1. Ray-Ban Aviator Classic (Frame)
2. Oakley Holbrook Square Frame
3. Essilor Crizal Blue Light Lenses
4. Ray-Ban Wayfarer Sunglasses
5. Acuvue Oasys Daily 30 Pack (Contact Lenses)

All products have stock and Unsplash images.
