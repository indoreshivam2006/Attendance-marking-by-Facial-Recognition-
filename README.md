# Face Recognition Attendance System

A comprehensive real-time attendance marking system using facial recognition technology built with Next.js, Python, MySQL, and Docker.

## Features

- **Real-time Facial Recognition**: Uses OpenCV and face_recognition library with HOG and CNN models
- **Student Registration**: Register students and upload multiple images for accurate recognition
- **Live Attendance Marking**: Mark attendance in real-time using webcam feed
- **Entry/Exit Tracking**: Track when students enter and leave the classroom
- **10% Rule Implementation**: Automatically marks attendance as partial if student is absent for more than 10% of class time
- **Comprehensive Reports**: View monthly and semester attendance reports
- **Low Attendance Alerts**: Automatic identification of students with low attendance
- **Session Management**: Create and manage class sessions with specific timings
- **Analytics Dashboard**: Visual representation of attendance data with charts

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: Python Flask with OpenCV and face_recognition
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose
- **Real-time Communication**: Socket.IO

## Quick Start with Docker

1. Clone the repository and navigate to the project directory

2. Start the application using Docker Compose:
```bash
docker-compose up --build
```

3. Access the application at `http://localhost:3000`

## Usage Guide

### 1. Register Students
- Navigate to **Students > Register Student**
- Fill in student details
- Upload multiple clear photos (5-10 recommended)

### 2. Create Class Sessions
- Go to **Sessions** page
- Click **Create Session** and enter details
- Active sessions are highlighted automatically

### 3. Mark Attendance
- Navigate to **Mark Attendance** page
- Ensure a session is active
- Click **Start Marking** to begin facial recognition
- Students are automatically recognized and marked present

### 4. View Reports
- Go to **Reports** page
- Filter by attendance threshold
- View low attendance alerts and analytics

## API Endpoints

- `GET /api/students` - Get all students
- `POST /api/students` - Register new student
- `POST /api/students/{id}/upload-images` - Upload student images
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create new session
- `GET /api/attendance/session/{id}` - Get attendance for a session
- `GET /api/reports/low-attendance` - Get students with low attendance

## Key Features Explained

### Face Recognition Process
- Uses HOG (Histogram of Oriented Gradients) for face detection
- Can switch to CNN for better accuracy
- Confidence threshold set at 0.5 for accurate matching

### 10% Rule Implementation
- Tracks total class duration
- Monitors student absence periods
- Automatically calculates attendance percentage

## Support

For issues or questions, please create an issue in the repository.
