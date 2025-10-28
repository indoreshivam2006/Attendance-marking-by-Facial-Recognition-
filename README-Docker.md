# Face Attendance System - Docker Setup Guide

This project uses Docker Compose to orchestrate multiple services for the face attendance system.

## Prerequisites

### 1. Install Docker Desktop

**Windows:**
1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Run the installer and follow the setup wizard
3. Restart your computer when prompted
4. Open Docker Desktop and wait for it to start
5. Verify installation: Open PowerShell and run `docker --version`

**Mac:**
1. Download Docker Desktop for Mac from the same link
2. Drag Docker.app to Applications folder
3. Launch Docker Desktop from Applications
4. Verify installation: Open Terminal and run `docker --version`

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER
# Log out and log back in
```

### 2. Install Git
- **Windows**: Download from [git-scm.com](https://git-scm.com/)
- **Mac**: Install Xcode Command Line Tools: `xcode-select --install`
- **Linux**: `sudo apt-get install git` (Ubuntu/Debian)

## Architecture

The system consists of 3 main services:
1. **MySQL Database** - Stores attendance records and student data
2. **Python Backend** - Handles facial recognition using OpenCV and face_recognition
3. **Next.js Frontend** - Web interface for managing students and viewing attendance

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/indoreshivam2006/Attendance-marking-by-Facial-Recognition-.git
cd Attendance-marking-by-Facial-Recognition-
```

### 2. Build and Start Services
```bash
docker-compose up --build
```

This will:
- Build the Docker images for frontend and backend
- Start MySQL database with initial schema
- Start the Python backend on port 5000
- Start the Next.js frontend on port 3000

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MySQL**: localhost:3306 (if you need direct database access)

## Service Details

### MySQL Database
- **Port**: 3306
- **Database**: `attendance_db`
- **Username**: `attendance_user`
- **Password**: `attendance_pass`
- **Root Password**: `rootpassword`

### Python Backend
- **Port**: 5000
- **Technology**: Flask + OpenCV + face_recognition
- **Features**: Facial recognition, attendance marking

### Next.js Frontend
- **Port**: 3000
- **Technology**: Next.js 15 + TypeScript + Tailwind CSS
- **Features**: Student management, attendance reports, live attendance

## Development Mode

For development with hot reload:

```bash
# Start only database first
docker-compose up mysql

# Run backend locally (optional)
cd backend
pip install -r requirements.txt
python simple_server.py

# Run frontend locally (optional)
npm install
npm run dev
```

## Useful Commands

### Start Services
```bash
docker-compose up                 # Start all services
docker-compose up -d             # Start in background (detached)
docker-compose up --build        # Rebuild images and start
```

### Stop Services
```bash
docker-compose down              # Stop all services
docker-compose down -v           # Stop and remove volumes (reset database)
```

### View Logs
```bash
docker-compose logs              # All services
docker-compose logs nextjs       # Frontend only
docker-compose logs python-backend  # Backend only
docker-compose logs mysql        # Database only
```

### Restart Individual Services
```bash
docker-compose restart nextjs
docker-compose restart python-backend
docker-compose restart mysql
```

## Troubleshooting

### Port Conflicts
If ports 3000, 5000, or 3306 are already in use, modify the ports in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change external port
```

### Database Issues
Reset the database:
```bash
docker-compose down -v
docker-compose up mysql
```

### Image/Build Issues
Rebuild from scratch:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Permission Issues (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
```

## Student Images

The system expects student images in the `student_images/` directory structure:
```
student_images/
├── 1/
│   ├── image1.jpg
│   └── image2.jpg
├── 2/
│   ├── image1.jpg
│   └── image2.jpg
```

Each student should have their own folder (numbered) with their face images.

## Environment Variables

Key environment variables (already configured in docker-compose.yml):

### Backend
- `MYSQL_HOST`: mysql
- `MYSQL_USER`: attendance_user
- `MYSQL_PASSWORD`: attendance_pass
- `MYSQL_DB`: attendance_db
- `STUDENT_IMAGES_DIR`: /app/student_images

### Frontend
- `NEXT_PUBLIC_API_URL`: http://localhost:5000
- `DATABASE_URL`: mysql://attendance_user:attendance_pass@mysql:3306/attendance_db

## Production Deployment

For production, consider:
1. Use environment-specific docker-compose files
2. Set secure passwords
3. Use proper SSL certificates
4. Configure reverse proxy (nginx)
5. Set up proper backup strategy for MySQL data

## Support

If you encounter any issues:
1. Check the logs: `docker-compose logs`
2. Ensure Docker Desktop is running
3. Check if all ports are available
4. Try rebuilding: `docker-compose up --build`