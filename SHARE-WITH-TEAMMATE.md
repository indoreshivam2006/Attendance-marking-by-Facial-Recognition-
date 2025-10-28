# 🚀 Ready-to-Share Setup Guide

## For Your Teammate: Getting Started

### Step 1: Install Docker Desktop

1. **Download**: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. **Install**: Run installer, restart computer when prompted
3. **Start Docker**: 
   - Launch "Docker Desktop" from Start menu
   - Wait for "Engine running" status (green icon in system tray)
   - This may take 2-3 minutes on first launch

### Step 2: Get the Project

```bash
# Clone the repository
git clone https://github.com/indoreshivam2006/Attendance-marking-by-Facial-Recognition-.git
cd Attendance-marking-by-Facial-Recognition-
```

### Step 3: Start the Application

**Easy Method (Recommended):**
```powershell
.\simple-start.ps1
```

**Manual Method:**
```bash
docker-compose up --build
```

### Step 4: Access the App

After 5-10 minutes (first time), visit:
- **Main App**: http://localhost:3000
- **API**: http://localhost:5000

## 🔧 If Something Goes Wrong

### Docker Desktop Not Starting?
1. Restart Docker Desktop
2. Check Windows features: "Hyper-V" and "WSL 2" should be enabled
3. Restart computer if needed

### "Port already in use" error?
Someone else is using the ports. Change them in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
  - "5001:5000"  # Change 5000 to 5001
```

### Services won't start?
```bash
# Reset everything
docker-compose down -v
docker-compose up --build
```

### Still having issues?
1. Make sure Docker Desktop shows "Engine running" (green)
2. Try: `docker --version` in terminal (should work)
3. Check if any antivirus is blocking Docker

## 🎯 What You Get

✅ **Complete Face Recognition System**
- Student registration with photo upload
- Real-time attendance marking via webcam
- Attendance reports and analytics
- Class session management

✅ **Tech Stack**
- Frontend: Next.js + TypeScript + Tailwind
- Backend: Python + Flask + OpenCV
- Database: MySQL
- AI: face_recognition library

## 📁 Project Structure
```
├── app/           # Next.js frontend pages
├── backend/       # Python API + AI processing  
├── components/    # React UI components
├── student_images/# Training photos for face recognition
└── docker-compose.yml # Container orchestration
```

## 🚀 Ready to Use!

Once running:
1. Visit http://localhost:3000
2. Go to "Students" → "Register" to add students
3. Upload student photos
4. Create class sessions
5. Start marking attendance with webcam!

---
**Need help?** The system includes detailed logs and error messages to guide you through any issues.