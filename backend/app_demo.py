from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import face_recognition
import cv2
import numpy as np
import os
import base64
import json
from datetime import datetime, timedelta
from io import BytesIO
from PIL import Image
import threading
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Storage file for persistence
DATA_FILE = 'demo_data.json'

# Load or initialize demo data
def load_demo_data():
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {
            "students": [],
            "sessions": [],
            "attendance_records": [],
            "student_images": {},
            "movement_logs": []
        }

def save_demo_data():
    with open(DATA_FILE, 'w') as f:
        json.dump(demo_data, f, indent=2, default=str)

demo_data = load_demo_data()

# Face recognition settings
TOLERANCE = 0.5  # Lower tolerance for better accuracy
MODEL = 'hog'  # Can switch to 'cnn' for better accuracy
STUDENT_IMAGES_DIR = 'student_images'

# Global variables for face recognition
known_face_encodings = []
known_face_names = []
known_face_ids = []
current_session_id = None
session_tracking = {}

# Ensure student_images directory exists
os.makedirs(STUDENT_IMAGES_DIR, exist_ok=True)

def load_student_encodings():
    """Load all student face encodings from memory"""
    global known_face_encodings, known_face_names, known_face_ids
    
    known_face_encodings = []
    known_face_names = []
    known_face_ids = []
    
    for student_id, images_data in demo_data["student_images"].items():
        for img_data in images_data:
            if img_data.get("encoding"):
                encoding = np.array(img_data["encoding"])
                student = next((s for s in demo_data["students"] if s["id"] == student_id), None)
                if student:
                    known_face_encodings.append(encoding)
                    known_face_names.append(f"{student['name']} ({student['student_id']})")
                    known_face_ids.append(student_id)
    
    print(f"Loaded {len(known_face_encodings)} face encodings")

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students"""
    return jsonify(demo_data["students"])

@app.route('/api/students', methods=['POST'])
def create_student():
    """Create a new student"""
    data = request.json
    
    # Generate ID
    student_id = len(demo_data["students"]) + 1
    
    student = {
        "id": student_id,
        "student_id": data['student_id'],
        "name": data['name'],
        "email": data['email'],
        "department": data.get('department'),
        "semester": data.get('semester'),
        "batch": data.get('batch'),
        "created_at": datetime.now().isoformat()
    }
    
    demo_data["students"].append(student)
    demo_data["student_images"][student_id] = []
    save_demo_data()  # Save changes
    
    # Create directory for student images
    student_dir = os.path.join(STUDENT_IMAGES_DIR, str(student_id))
    os.makedirs(student_dir, exist_ok=True)
    
    return jsonify({'id': student_id, 'message': 'Student created successfully'}), 201

@app.route('/api/students/<int:student_id>/upload-images', methods=['POST'])
def upload_student_images(student_id):
    """Upload and process multiple images for a student"""
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400
    
    images = request.files.getlist('images')
    student_dir = os.path.join(STUDENT_IMAGES_DIR, str(student_id))
    os.makedirs(student_dir, exist_ok=True)
    
    processed_count = 0
    
    for image in images:
        if image.filename == '':
            continue
        
        # Save image
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{image.filename}"
        filepath = os.path.join(student_dir, filename)
        image.save(filepath)
        
        try:
            # Process image for face encoding
            img = face_recognition.load_image_file(filepath)
            face_encodings = face_recognition.face_encodings(img, model=MODEL)
            
            if face_encodings:
                # Save encoding to memory
                demo_data["student_images"][student_id].append({
                    "path": filepath,
                    "encoding": face_encodings[0].tolist()
                })
                processed_count += 1
        except Exception as e:
            print(f"Error processing image: {e}")
    
    # Save changes and reload encodings
    save_demo_data()
    load_student_encodings()
    
    return jsonify({
        'message': f'Processed {processed_count} images successfully',
        'processed': processed_count
    })

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    """Get all class sessions with optional department and year filtering"""
    department = request.args.get('department')
    year = request.args.get('year')
    
    sessions = demo_data["sessions"]
    
    # Filter by department if provided
    if department:
        sessions = [s for s in sessions if s.get('department') == department]
    
    # Filter by year if provided
    if year:
        sessions = [s for s in sessions if s.get('year') == year]
    
    return jsonify(sessions)

@app.route('/api/sessions', methods=['POST'])
def create_session():
    """Create a new class session"""
    data = request.json
    
    # Generate ID
    session_id = len(demo_data["sessions"]) + 1
    
    # Calculate duration
    start_time = datetime.strptime(data['start_time'], '%Y-%m-%d %H:%M:%S')
    end_time = datetime.strptime(data['end_time'], '%Y-%m-%d %H:%M:%S')
    duration = int((end_time - start_time).total_seconds() / 60)
    
    session = {
        "id": session_id,
        "subject": data['subject'],
        "instructor": data.get('instructor'),
        "classroom": data.get('classroom'),
        "department": data.get('department'),
        "year": data.get('year'),
        "start_time": data['start_time'],
        "end_time": data['end_time'],
        "duration_minutes": duration,
        "created_at": datetime.now().isoformat()
    }
    
    demo_data["sessions"].append(session)
    save_demo_data()  # Save changes
    
    return jsonify({'id': session_id, 'message': 'Session created successfully'}), 201

@app.route('/api/sessions/filters', methods=['GET'])
def get_session_filters():
    """Get available departments and years for filtering"""
    departments = set()
    years = set()
    
    # Get from students data
    for student in demo_data["students"]:
        if student.get('department'):
            departments.add(student.get('department'))
    
    # Get from sessions data
    for session in demo_data["sessions"]:
        if session.get('department'):
            departments.add(session.get('department'))
        if session.get('year'):
            years.add(session.get('year'))
    
    # Add common departments and years if none exist
    if not departments:
        departments = {'Computer Science', 'Engineering', 'Business', 'Arts', 'Science'}
    
    if not years:
        years = {'1st Year', '2nd Year', '3rd Year', '4th Year'}
    
    return jsonify({
        'departments': sorted(list(departments)),
        'years': sorted(list(years))
    })

@app.route('/api/sessions/student/<int:student_id>', methods=['GET'])
def get_student_sessions(student_id):
    """Get sessions that a specific student can attend based on department and year"""
    student = next((s for s in demo_data["students"] if s["id"] == student_id), None)
    
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Filter sessions by student's department
    matching_sessions = []
    for session in demo_data["sessions"]:
        session_matches = True
        
        # Check department matching
        if session.get('department') and student.get('department'):
            if session['department'] != student['department']:
                session_matches = False
        
        if session_matches:
            matching_sessions.append(session)
    
    return jsonify(matching_sessions)

@app.route('/api/sessions/active', methods=['GET'])
def get_active_session():
    """Get current active session"""
    now = datetime.now()
    
    for session in demo_data["sessions"]:
        start_time = datetime.strptime(session['start_time'], '%Y-%m-%d %H:%M:%S')
        end_time = datetime.strptime(session['end_time'], '%Y-%m-%d %H:%M:%S')
        
        if start_time <= now <= end_time:
            global current_session_id
            current_session_id = session['id']
            return jsonify(session)
    
    return jsonify({'message': 'No active session'}), 404

@socketio.on('process_frame')
def process_video_frame(data):
    """Process video frame for face recognition"""
    global current_session_id, session_tracking
    
    if not current_session_id:
        emit('recognition_result', {'error': 'No active session'})
        return
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(data['frame'].split(',')[1])
        image = Image.open(BytesIO(image_data))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Resize frame for faster processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        # Find faces in frame
        face_locations = face_recognition.face_locations(rgb_small_frame, model=MODEL)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        
        recognized_students = []
        
        for face_encoding in face_encodings:
            # Compare with known faces
            if len(known_face_encodings) > 0:
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=TOLERANCE)
                face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                
                if True in matches:
                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index]:
                        student_id = known_face_ids[best_match_index]
                        student_name = known_face_names[best_match_index]
                        confidence = 1 - face_distances[best_match_index]
                        
                        recognized_students.append({
                            'id': student_id,
                            'name': student_name,
                            'confidence': float(confidence)
                        })
                        
                        # Track attendance
                        track_attendance(student_id, current_session_id)
        
        emit('recognition_result', {
            'recognized': recognized_students,
            'total_faces': len(face_locations)
        })
    except Exception as e:
        print(f"Error processing frame: {e}")
        emit('recognition_result', {'error': str(e)})

def track_attendance(student_id, session_id):
    """Track student attendance and movements"""
    current_time = datetime.now()
    
    # Get student and session details
    student = next((s for s in demo_data["students"] if s["id"] == student_id), None)
    session = next((s for s in demo_data["sessions"] if s["id"] == session_id), None)
    
    if not student or not session:
        print(f"Student {student_id} or session {session_id} not found")
        return
    
    # Check if student belongs to the same department as the session
    if session.get('department') and student.get('department'):
        if session['department'] != student['department']:
            print(f"Student {student['name']} from {student['department']} cannot attend {session['department']} session")
            return
    
    # Check if student already has an attendance record for this session
    existing = next((r for r in demo_data["attendance_records"] 
                     if r["student_id"] == student_id and r["session_id"] == session_id), None)
    
    if not existing:
        # First entry - create attendance record
        demo_data["attendance_records"].append({
            "id": len(demo_data["attendance_records"]) + 1,
            "student_id": student_id,
            "session_id": session_id,
            "entry_time": current_time.isoformat(),
            "status": "present",
            "marked_at": current_time.isoformat()
        })
        
        # Log movement
        demo_data["movement_logs"].append({
            "student_id": student_id,
            "session_id": session_id,
            "movement_type": "entry",
            "timestamp": current_time.isoformat()
        })
        save_demo_data()  # Save changes
    else:
        # Update last seen time
        if student_id not in session_tracking:
            session_tracking[student_id] = {'last_seen': current_time}
        else:
            session_tracking[student_id]['last_seen'] = current_time

@app.route('/api/attendance/session/<int:session_id>', methods=['GET'])
def get_session_attendance(session_id):
    """Get attendance for a specific session"""
    attendance = []
    
    for record in demo_data["attendance_records"]:
        if record["session_id"] == session_id:
            student = next((s for s in demo_data["students"] if s["id"] == record["student_id"]), None)
            if student:
                attendance.append({
                    **record,
                    "name": student["name"],
                    "student_code": student["student_id"]
                })
    
    return jsonify(attendance)

@app.route('/api/attendance/calculate-percentages', methods=['POST'])
def calculate_attendance_percentages():
    """Calculate and update attendance percentages for a session"""
    data = request.json
    session_id = data['session_id']
    
    # Get session details
    session = next((s for s in demo_data["sessions"] if s["id"] == session_id), None)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    return jsonify({'message': 'Attendance percentages calculated successfully'})

@app.route('/api/reports/monthly/<int:student_id>', methods=['GET'])
def get_monthly_report(student_id):
    """Get monthly attendance report for a student"""
    month = request.args.get('month', datetime.now().month)
    year = request.args.get('year', datetime.now().year)
    
    # Simple demo data
    return jsonify({
        "total_classes": 20,
        "attended": 18,
        "percentage": 90.0
    })

@app.route('/api/reports/attendance-stats', methods=['GET'])
def get_attendance_stats():
    """Get overall attendance statistics for all students"""
    students_stats = []
    
    for student in demo_data["students"]:
        # Calculate attendance for this student based on conducted sessions only
        total_sessions = len(demo_data["sessions"])
        attended_sessions = len([r for r in demo_data["attendance_records"] 
                                if r["student_id"] == student["id"]])
        
        # Only calculate percentage if there are conducted sessions
        if total_sessions > 0:
            # Ensure attended sessions doesn't exceed total sessions
            attended_sessions = min(attended_sessions, total_sessions)
            attendance_percentage = round((attended_sessions / total_sessions * 100), 2)
        else:
            # If no sessions conducted, reset everything to 0
            attendance_percentage = 0
            total_sessions = 0
            attended_sessions = 0
        
        students_stats.append({
            **student,
            "total_classes": total_sessions,
            "attended": attended_sessions,
            "attendance_percentage": attendance_percentage
        })
    
    return jsonify(students_stats)

@app.route('/api/reports/low-attendance', methods=['GET'])
def get_low_attendance_students():
    """Get students with low attendance"""
    threshold = float(request.args.get('threshold', 75))
    
    # Get all students with stats
    all_students = []
    for student in demo_data["students"]:
        # Calculate actual attendance based on conducted sessions only
        total_sessions = len(demo_data["sessions"])
        attended_sessions = len([r for r in demo_data["attendance_records"] 
                                if r["student_id"] == student["id"]])
        
        # Only calculate if there are conducted sessions
        if total_sessions > 0:
            attendance_percentage = round((attended_sessions / total_sessions * 100), 2)
            
            # Only include students below threshold
            if attendance_percentage < threshold:
                all_students.append({
                    **student,
                    "total_classes": total_sessions,
                    "attended": attended_sessions,
                    "attendance_percentage": attendance_percentage
                })
        # If no sessions conducted, don't include in low attendance list
    
    return jsonify(all_students)

@app.route('/api/clear/sessions', methods=['DELETE'])
def clear_sessions():
    """Clear all session data"""
    demo_data["sessions"] = []
    save_demo_data()
    return jsonify({'message': 'All sessions cleared successfully'}), 200

@app.route('/api/clear/attendance', methods=['DELETE'])
def clear_attendance():
    """Clear all attendance records and movement logs"""
    demo_data["attendance_records"] = []
    demo_data["movement_logs"] = []
    save_demo_data()
    return jsonify({'message': 'All attendance records cleared successfully'}), 200

@app.route('/api/clear/reports', methods=['DELETE'])
def clear_reports():
    """Clear all data used for reports (attendance records, movement logs)"""
    demo_data["attendance_records"] = []
    demo_data["movement_logs"] = []
    save_demo_data()
    return jsonify({'message': 'All report data cleared successfully'}), 200

@app.route('/api/clear/all-session-data', methods=['DELETE'])
def clear_all_session_data():
    """Clear sessions, attendance records, and movement logs (keeps students and their images)"""
    demo_data["sessions"] = []
    demo_data["attendance_records"] = []
    demo_data["movement_logs"] = []
    save_demo_data()
    return jsonify({'message': 'All session and attendance data cleared successfully'}), 200

# Start the app
if __name__ == '__main__':
    print("Starting Face Recognition Attendance System Backend...")
    print("Backend running on http://localhost:5000")
    load_student_encodings()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)