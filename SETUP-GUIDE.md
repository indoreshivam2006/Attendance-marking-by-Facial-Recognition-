# 📦 Complete Setup Guide for Face Attendance System

## For Your Teammate - Complete Setup Instructions

### Step 1: Install Prerequisites

#### Install Docker Desktop
1. **Download**: Go to [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. **Install**: Run the installer and restart your computer
3. **Start**: Launch Docker Desktop and wait for it to be ready
4. **Verify**: Open PowerShell/Terminal and run:
   ```bash
   docker --version
   docker-compose --version
   ```

#### Install Git (if not already installed)
- **Windows**: Download from [git-scm.com](https://git-scm.com/)
- **Mac**: Run `xcode-select --install` in Terminal
- **Linux**: `sudo apt-get install git`

### Step 2: Get the Project

```bash
# Clone the repository
git clone https://github.com/indoreshivam2006/Attendance-marking-by-Facial-Recognition-.git

# Navigate to project folder
cd Attendance-marking-by-Facial-Recognition-
```

### Step 3: Start the Application

#### Option A: One-Command Start (Recommended)

**Windows (PowerShell):**
```powershell
.\start-docker.ps1
```

**Linux/Mac:**
```bash
chmod +x start-docker.sh
./start-docker.sh
```

#### Option B: Manual Start
```bash
docker-compose up --build
```

### Step 4: Access the Application

After about 2-3 minutes (first time takes longer), you can access:

- **Main Application**: http://localhost:3000
- **API Documentation**: http://localhost:5000
- **Database**: localhost:3306 (if needed)

### Step 5: Initial Setup

1. **Visit the App**: Go to http://localhost:3000
2. **Register Students**: Click "Students" → "Register" to add students
3. **Upload Photos**: Add student photos for facial recognition
4. **Create Sessions**: Set up class sessions
5. **Mark Attendance**: Use the attendance feature with webcam

## What's Running?

The Docker setup starts 3 services:

1. **🗄️ MySQL Database** (Port 3306)
   - Stores student data, attendance records
   - Automatically initializes with required tables

2. **🤖 Python Backend** (Port 5000)
   - Flask API with OpenCV and face_recognition
   - Handles all AI/ML processing

3. **🌐 Next.js Frontend** (Port 3000)
   - Modern React web interface
   - Real-time attendance tracking

## Troubleshooting

### 🚨 Common Issues

**"Port already in use"**
```bash
# Find what's using the port
netstat -ano | findstr :3000

# Or change ports in docker-compose.yml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

**Services won't start**
```bash
# Reset everything
docker-compose down -v
docker-compose up --build --force-recreate
```

**Slow first startup**
- First run downloads and builds everything (~5-10 minutes)
- Subsequent starts are much faster (~30 seconds)

**Permission issues (Linux/Mac)**
```bash
sudo chown -R $USER:$USER .
```

### 📋 Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart specific service
docker-compose restart nextjs

# Reset database (lose all data)
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
```

## Project Structure

```
face-attendance-system/
├── app/                 # Next.js pages
├── backend/            # Python Flask API
├── components/         # React components
├── lib/               # Utilities
├── student_images/    # Training photos
├── docker-compose.yml # Main Docker config
├── start-docker.ps1   # Windows startup script
├── start-docker.sh    # Linux/Mac startup script
└── README-Docker.md   # This guide
```

## Development Mode

Want to modify the code? You can run services individually:

```bash
# Start database only
docker-compose up mysql

# Run backend locally (Python)
cd backend
pip install -r requirements.txt
python simple_server.py

# Run frontend locally (Node.js)
npm install
npm run dev
```

## Production Notes

For production deployment:
- Change default passwords in `docker-compose.yml`
- Use environment variables for secrets
- Set up SSL certificates
- Configure proper backup for MySQL data
- Use a reverse proxy (nginx)

## Need Help?

1. **Check logs**: `docker-compose logs -f`
2. **Reset everything**: `docker-compose down -v && docker-compose up --build`
3. **Verify Docker**: Make sure Docker Desktop is running
4. **Check ports**: Ensure 3000, 5000, 3306 are available

---

**🎉 Once everything is running, your teammate can access the full face attendance system at http://localhost:3000!**