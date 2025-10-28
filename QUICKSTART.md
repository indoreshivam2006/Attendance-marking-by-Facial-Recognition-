# 🚀 Quick Start Guide for Teammates

## One-Command Setup

### Windows (PowerShell)
```powershell
.\start-docker.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x start-docker.sh
./start-docker.sh
```

### Manual Setup
```bash
# Clone the repository
git clone https://github.com/indoreshivam2006/Attendance-marking-by-Facial-Recognition-.git
cd Attendance-marking-by-Facial-Recognition-

# Start all services
docker-compose up --build
```

## What Gets Started
- ✅ MySQL Database (port 3306)
- ✅ Python Backend with AI/ML (port 5000)
- ✅ Next.js Frontend (port 3000)

## Access URLs
- **Main App**: http://localhost:3000
- **API**: http://localhost:5000
- **Database**: localhost:3306

## First Time Setup
1. Visit http://localhost:3000
2. Go to "Register Student" to add students
3. Upload student photos for facial recognition
4. Start marking attendance!

## Troubleshooting

### Port Already in Use?
Edit `docker-compose.yml` and change the external ports:
```yaml
ports:
  - "3001:3000"  # Instead of "3000:3000"
```

### Services Not Starting?
```bash
docker-compose down
docker-compose up --build --force-recreate
```

### Need Fresh Database?
```bash
docker-compose down -v  # Removes all data
docker-compose up --build
```

## Development Mode
Want to modify code with live reload?

```bash
# Backend development
cd backend
pip install -r requirements.txt
python simple_server.py

# Frontend development  
npm install
npm run dev
```

## Project Structure
```
├── app/           # Next.js pages and components
├── backend/       # Python Flask API with face recognition
├── components/    # React components
├── lib/           # Utilities
├── student_images/ # Face recognition training data
├── docker-compose.yml
└── README-Docker.md  # Detailed documentation
```

Need help? Check `README-Docker.md` for detailed documentation!