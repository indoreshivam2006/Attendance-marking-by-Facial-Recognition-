from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import mysql.connector
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
import shutil

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Database configuration
db_config = {
    'host': os.environ.get('MYSQL_HOST', 'localhost'),
    'user': os.environ.get('MYSQL_USER', 'attendance_user'),
    'password': os.environ.get('MYSQL_PASSWORD', 'attendance_pass'),
    'database': os.environ.get('MYSQL_DB', 'attendance_db')
}

# Face recognition settings
TOLERANCE = 0.5  # Lower tolerance for better accuracy
MODEL = 'hog'  # Can switch to 'cnn' for better accuracy
STUDENT_IMAGES_DIR = os.environ.get('STUDENT_IMAGES_DIR', './student_images')

# Global variables for face recognition
known_face_encodings = []
known_face_names = []
known_face_ids = []
current_session_id = None
session_tracking = {}

def get_db_connection():
    """Create database connection with error handling"""
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        raise

def load_student_encodings():
    """Load all student face encodings from database"""
    global known_face_encodings, known_face_names, known_face_ids
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT s.id, s.name, s.student_id, si.encoding_data
    FROM students s
    JOIN student_images si ON s.id = si.student_id
    WHERE si.encoding_data IS NOT NULL
    """
    
    cursor.execute(query)
    results = cursor.fetchall()
    
    known_face_encodings = []
    known_face_names = []
    known_face_ids = []
    
    for student_id, name, student_code, encoding_data in results:
        if encoding_data:
            # Fix deprecated np.fromstring() - use np.frombuffer() with proper encoding
            try:
                encoding = np.array([float(x) for x in encoding_data.split(',')])
                known_face_encodings.append(encoding)
                known_face_names.append(f"{name} ({student_code})")
                known_face_ids.append(student_id)
            except (ValueError, AttributeError) as e:
                print(f"Error loading encoding for student {name}: {e}")
                continue
    
    cursor.close()
    conn.close()
    
    print(f"Loaded {len(known_face_encodings)} face encodings")

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM students ORDER BY created_at DESC")
    students = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(students)

@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete a student and all associated data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Delete in order to respect foreign key constraints
        # Delete attendance records
        cursor.execute("DELETE FROM attendance_records WHERE student_id = %s", (student_id,))
        
        # Delete movement logs
        cursor.execute("DELETE FROM movement_logs WHERE student_id = %s", (student_id,))
        
        # Delete student images
        cursor.execute("DELETE FROM student_images WHERE student_id = %s", (student_id,))
        
        # Delete the student
        cursor.execute("DELETE FROM students WHERE id = %s", (student_id,))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Student not found'}), 404
        
        conn.commit()
        
        # Remove student image directory
        student_dir = os.path.join(STUDENT_IMAGES_DIR, str(student_id))
        if os.path.exists(student_dir):
            shutil.rmtree(student_dir)
        
        # Reload encodings to remove deleted student
        load_student_encodings()
        
        return jsonify({'message': 'Student deleted successfully'})
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/students', methods=['POST'])
def create_student():
    """Create a new student"""
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    INSERT INTO students (student_id, name, email, department, semester, batch)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    values = (
        data['student_id'],
        data['name'],
        data['email'],
        data.get('department'),
        data.get('semester'),
        data.get('batch')
    )
    
    try:
        cursor.execute(query, values)
        conn.commit()
        student_id = cursor.lastrowid
        
        # Create directory for student images
        student_dir = os.path.join(STUDENT_IMAGES_DIR, str(student_id))
        os.makedirs(student_dir, exist_ok=True)
        
        return jsonify({'id': student_id, 'message': 'Student created successfully'}), 201
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/students/<int:student_id>/upload-images', methods=['POST'])
def upload_student_images(student_id):
    """Upload and process multiple images for a student"""
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400
    
    images = request.files.getlist('images')
    student_dir = os.path.join(STUDENT_IMAGES_DIR, str(student_id))
    os.makedirs(student_dir, exist_ok=True)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    processed_count = 0
    
    for image in images:
        if image.filename == '':
            continue
        
        # Save image
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{image.filename}"
        filepath = os.path.join(student_dir, filename)
        image.save(filepath)
        
        # Process image for face encoding
        img = face_recognition.load_image_file(filepath)
        face_encodings = face_recognition.face_encodings(img, model=MODEL)
        
        if face_encodings:
            # Save encoding to database
            encoding_str = ','.join(map(str, face_encodings[0]))
            
            query = """
            INSERT INTO student_images (student_id, image_path, encoding_data)
            VALUES (%s, %s, %s)
            """
            
            cursor.execute(query, (student_id, filepath, encoding_str))
            processed_count += 1
    
    conn.commit()
    cursor.close()
    conn.close()
    
    # Reload encodings
    load_student_encodings()
    
    return jsonify({
        'message': f'Processed {processed_count} images successfully',
        'processed': processed_count
    })

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    """Get all class sessions"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM class_sessions ORDER BY start_time DESC")
    sessions = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(sessions)

@app.route('/api/sessions', methods=['POST'])
def create_session():
    """Create a new class session"""
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Calculate duration
    start_time = datetime.strptime(data['start_time'], '%Y-%m-%d %H:%M:%S')
    end_time = datetime.strptime(data['end_time'], '%Y-%m-%d %H:%M:%S')
    duration = int((end_time - start_time).total_seconds() / 60)
    
    query = """
    INSERT INTO class_sessions (subject, instructor, classroom, start_time, end_time, duration_minutes)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    values = (
        data['subject'],
        data.get('instructor'),
        data.get('classroom'),
        start_time,
        end_time,
        duration
    )
    
    cursor.execute(query, values)
    conn.commit()
    session_id = cursor.lastrowid
    
    cursor.close()
    conn.close()
    
    return jsonify({'id': session_id, 'message': 'Session created successfully'}), 201

@app.route('/api/sessions/active', methods=['GET'])
def get_active_session():
    """Get current active session"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT * FROM class_sessions
    WHERE NOW() BETWEEN start_time AND end_time
    ORDER BY start_time DESC
    LIMIT 1
    """
    
    cursor.execute(query)
    session = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if session:
        global current_session_id
        current_session_id = session['id']
        return jsonify(session)
    else:
        return jsonify({'message': 'No active session'}), 404

@socketio.on('process_frame')
def process_video_frame(data):
    """Process video frame for face recognition"""
    global current_session_id, session_tracking
    
    try:
        if not current_session_id:
            emit('recognition_result', {'error': 'No active session'})
            return
        
        if not known_face_encodings:
            emit('recognition_result', {'error': 'No student faces registered'})
            return
            
        # Validate data format
        if 'frame' not in data:
            emit('recognition_result', {'error': 'No frame data provided'})
            return
        
        # Decode base64 image
        try:
            image_data = base64.b64decode(data['frame'].split(',')[1])
            image = Image.open(BytesIO(image_data))
            frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        except Exception as e:
            emit('recognition_result', {'error': f'Invalid image data: {str(e)}'})
            return
        
        # Resize frame for faster processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        # Find faces in frame
        face_locations = face_recognition.face_locations(rgb_small_frame, model=MODEL)
        
        if not face_locations:
            emit('recognition_result', {
                'recognized': [],
                'total_faces': 0,
                'message': 'No faces detected'
            })
            return
            
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        
        recognized_students = []
        
        for face_encoding in face_encodings:
            # Compare with known faces
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=TOLERANCE)
            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            
            if len(matches) > 0 and True in matches:
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
                    try:
                        track_attendance(student_id, current_session_id)
                    except Exception as e:
                        print(f"Error tracking attendance for student {student_id}: {e}")
        
        emit('recognition_result', {
            'recognized': recognized_students,
            'total_faces': len(face_locations)
        })
        
    except Exception as e:
        print(f"Error in process_video_frame: {e}")
        emit('recognition_result', {'error': f'Processing error: {str(e)}'})

def track_attendance(student_id, session_id):
    """Track student attendance and movements"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    current_time = datetime.now()
    
    # Check if student already has an attendance record for this session
    cursor.execute("""
        SELECT id, entry_time, exit_time FROM attendance_records
        WHERE student_id = %s AND session_id = %s
    """, (student_id, session_id))
    
    record = cursor.fetchone()
    
    if not record:
        # First entry - create attendance record
        cursor.execute("""
            INSERT INTO attendance_records (student_id, session_id, entry_time, status)
            VALUES (%s, %s, %s, 'present')
        """, (student_id, session_id, current_time))
        
        # Log movement
        cursor.execute("""
            INSERT INTO movement_logs (student_id, session_id, movement_type, timestamp)
            VALUES (%s, %s, 'entry', %s)
        """, (student_id, session_id, current_time))
    else:
        # Update last seen time (implement exit detection logic)
        if student_id not in session_tracking:
            session_tracking[student_id] = {'last_seen': current_time}
        else:
            session_tracking[student_id]['last_seen'] = current_time
    
    conn.commit()
    cursor.close()
    conn.close()

def check_exits():
    """Background thread to check for student exits"""
    global session_tracking, current_session_id
    
    while True:
        time.sleep(30)  # Check every 30 seconds
        
        if not current_session_id:
            continue
        
        current_time = datetime.now()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for student_id, data in list(session_tracking.items()):
            time_diff = (current_time - data['last_seen']).total_seconds()
            
            if time_diff > 60:  # Not seen for 60 seconds, mark as exit
                cursor.execute("""
                    INSERT INTO movement_logs (student_id, session_id, movement_type, timestamp)
                    VALUES (%s, %s, 'exit', %s)
                """, (student_id, current_session_id, data['last_seen']))
                
                del session_tracking[student_id]
        
        conn.commit()
        cursor.close()
        conn.close()

@app.route('/api/attendance/session/<int:session_id>', methods=['GET'])
def get_session_attendance(session_id):
    """Get attendance for a specific session"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT ar.*, s.name, s.student_id as student_code
    FROM attendance_records ar
    JOIN students s ON ar.student_id = s.id
    WHERE ar.session_id = %s
    """
    
    cursor.execute(query, (session_id,))
    attendance = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(attendance)

@app.route('/api/attendance/calculate-percentages', methods=['POST'])
def calculate_attendance_percentages():
    """Calculate and update attendance percentages for a session"""
    data = request.json
    session_id = data['session_id']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get session details
    cursor.execute("""
        SELECT duration_minutes FROM class_sessions WHERE id = %s
    """, (session_id,))
    
    session = cursor.fetchone()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    total_duration = session[0]
    max_absence_allowed = total_duration * 0.1  # 10% rule
    
    # Get all attendance records for this session
    cursor.execute("""
        SELECT ar.id, ar.student_id, ar.entry_time,
               (SELECT COUNT(*) FROM movement_logs 
                WHERE student_id = ar.student_id 
                AND session_id = ar.session_id 
                AND movement_type = 'exit') as exit_count,
               (SELECT SUM(TIMESTAMPDIFF(MINUTE, 
                   ml1.timestamp,
                   IFNULL((SELECT MIN(ml2.timestamp) 
                          FROM movement_logs ml2 
                          WHERE ml2.student_id = ml1.student_id 
                          AND ml2.session_id = ml1.session_id 
                          AND ml2.movement_type = 'entry' 
                          AND ml2.timestamp > ml1.timestamp), NOW())))
                FROM movement_logs ml1
                WHERE ml1.student_id = ar.student_id 
                AND ml1.session_id = ar.session_id 
                AND ml1.movement_type = 'exit') as total_absence_minutes
        FROM attendance_records ar
        WHERE ar.session_id = %s
    """, (session_id,))
    
    records = cursor.fetchall()
    
    for record in records:
        record_id, student_id, entry_time, exit_count, absence_minutes = record
        
        if absence_minutes is None:
            absence_minutes = 0
        
        time_present = total_duration - absence_minutes
        percentage = (time_present / total_duration) * 100
        
        # Determine status based on 10% rule
        if absence_minutes > max_absence_allowed:
            status = 'partial'
        elif percentage >= 90:
            status = 'present'
        else:
            status = 'late'
        
        # Update attendance record
        cursor.execute("""
            UPDATE attendance_records
            SET total_time_present = %s,
                percentage_present = %s,
                status = %s
            WHERE id = %s
        """, (time_present, percentage, status, record_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({'message': 'Attendance percentages calculated successfully'})

@app.route('/api/reports/monthly/<int:student_id>', methods=['GET'])
def get_monthly_report(student_id):
    """Get monthly attendance report for a student"""
    month = request.args.get('month', datetime.now().month)
    year = request.args.get('year', datetime.now().year)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT COUNT(DISTINCT cs.id) as total_classes,
           COUNT(DISTINCT CASE WHEN ar.status IN ('present', 'late') THEN cs.id END) as attended,
           (COUNT(DISTINCT CASE WHEN ar.status IN ('present', 'late') THEN cs.id END) * 100.0 / 
            COUNT(DISTINCT cs.id)) as percentage
    FROM class_sessions cs
    LEFT JOIN attendance_records ar ON cs.id = ar.session_id AND ar.student_id = %s
    WHERE MONTH(cs.start_time) = %s AND YEAR(cs.start_time) = %s
    """
    
    cursor.execute(query, (student_id, month, year))
    report = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return jsonify(report)

@app.route('/api/reports/low-attendance', methods=['GET'])
def get_low_attendance_students():
    """Get students with low attendance"""
    threshold = request.args.get('threshold', 75)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT s.*, 
           COALESCE(stats.total_classes, 0) as total_classes,
           COALESCE(stats.attended, 0) as attended,
           COALESCE(stats.attendance_percentage, 0) as attendance_percentage
    FROM students s
    LEFT JOIN (
        SELECT 
            ar.student_id,
            COUNT(DISTINCT ar.session_id) as total_classes,
            COUNT(DISTINCT CASE WHEN ar.status IN ('present', 'late') THEN ar.session_id END) as attended,
            CASE 
                WHEN COUNT(DISTINCT ar.session_id) = 0 THEN 0
                ELSE (COUNT(DISTINCT CASE WHEN ar.status IN ('present', 'late') THEN ar.session_id END) * 100.0 / 
                      COUNT(DISTINCT ar.session_id))
            END as attendance_percentage
        FROM attendance_records ar
        GROUP BY ar.student_id
    ) stats ON s.id = stats.student_id
    WHERE (stats.attendance_percentage IS NOT NULL AND stats.attendance_percentage < %s AND stats.total_classes > 0)
    ORDER BY COALESCE(stats.attendance_percentage, 0) ASC
    """
    
    cursor.execute(query, (threshold,))
    students = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(students)

@app.route('/api/reports/attendance-stats', methods=['GET'])
def get_attendance_stats():
    """Get attendance statistics for all students"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT s.*, 
           COALESCE(stats.total_classes, 0) as total_classes,
           COALESCE(stats.attended, 0) as attended,
           COALESCE(stats.attendance_percentage, 0) as attendance_percentage,
           CASE 
               WHEN stats.total_classes IS NULL OR stats.total_classes = 0 THEN 'No Attendance Records'
               WHEN stats.attendance_percentage >= 75 THEN 'Good'
               WHEN stats.attendance_percentage >= 60 THEN 'Warning'
               ELSE 'Critical'
           END as attendance_status
    FROM students s
    LEFT JOIN (
        SELECT 
            ar.student_id,
            COUNT(DISTINCT ar.session_id) as total_classes,
            COUNT(DISTINCT CASE WHEN ar.status IN ('present', 'late') THEN ar.session_id END) as attended,
            CASE 
                WHEN COUNT(DISTINCT ar.session_id) = 0 THEN 0
                ELSE (COUNT(DISTINCT CASE WHEN ar.status IN ('present', 'late') THEN ar.session_id END) * 100.0 / 
                      COUNT(DISTINCT ar.session_id))
            END as attendance_percentage
        FROM attendance_records ar
        GROUP BY ar.student_id
    ) stats ON s.id = stats.student_id
    ORDER BY s.name ASC
    """
    
    cursor.execute(query)
    students = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(students)

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get department statistics
        cursor.execute("""
            SELECT department, 
                   COUNT(*) as total_students,
                   COUNT(DISTINCT CASE WHEN ar.status IN ('present', 'late') THEN s.id END) as active_students
            FROM students s
            LEFT JOIN attendance_records ar ON s.id = ar.student_id
            WHERE s.department IS NOT NULL AND s.department != ''
            GROUP BY department
        """)
        dept_results = cursor.fetchall()
        
        departments = []
        for dept in dept_results:
            # Calculate average attendance for department
            cursor.execute("""
                SELECT AVG(CASE WHEN ar.percentage_present IS NOT NULL 
                              THEN ar.percentage_present ELSE 0 END) as avg_attendance
                FROM students s
                LEFT JOIN attendance_records ar ON s.id = ar.student_id
                WHERE s.department = %s
            """, (dept['department'],))
            
            avg_result = cursor.fetchone()
            avg_attendance = float(avg_result['avg_attendance']) if avg_result['avg_attendance'] else 0.0
            
            departments.append({
                'name': dept['department'],
                'total_students': dept['total_students'],
                'active_students': dept['active_students'] or 0,
                'average_attendance': round(avg_attendance, 1)
            })
        
        # Overall statistics
        cursor.execute("SELECT COUNT(DISTINCT department) as total_departments FROM students WHERE department IS NOT NULL AND department != ''")
        total_departments = cursor.fetchone()['total_departments']
        
        cursor.execute("SELECT COUNT(*) as total_students FROM students")
        total_students = cursor.fetchone()['total_students']
        
        cursor.execute("SELECT COUNT(*) as total_sessions FROM class_sessions")
        total_sessions = cursor.fetchone()['total_sessions']
        
        cursor.execute("""
            SELECT COUNT(*) as active_sessions 
            FROM class_sessions 
            WHERE NOW() BETWEEN start_time AND end_time
        """)
        active_sessions = cursor.fetchone()['active_sessions']
        
        # Recent activity (today's data)
        today = datetime.now().date()
        cursor.execute("SELECT COUNT(*) as new_today FROM students WHERE DATE(created_at) = %s", (today,))
        new_registrations_today = cursor.fetchone()['new_today']
        
        cursor.execute("""
            SELECT COUNT(*) as completed_today 
            FROM class_sessions 
            WHERE DATE(end_time) = %s AND end_time <= NOW()
        """, (today,))
        sessions_completed_today = cursor.fetchone()['completed_today']
        
        cursor.execute("""
            SELECT AVG(percentage_present) as avg_daily_attendance 
            FROM attendance_records ar
            JOIN class_sessions cs ON ar.session_id = cs.id
            WHERE DATE(cs.start_time) = %s
        """, (today,))
        avg_daily_result = cursor.fetchone()
        avg_daily_attendance = float(avg_daily_result['avg_daily_attendance']) if avg_daily_result['avg_daily_attendance'] else 0.0
        
        return jsonify({
            'total_departments': total_departments,
            'total_students': total_students,
            'total_sessions': total_sessions,
            'active_sessions': active_sessions,
            'departments': departments,
            'recent_activity': {
                'new_registrations_today': new_registrations_today,
                'sessions_completed_today': sessions_completed_today,
                'average_daily_attendance': round(avg_daily_attendance, 1)
            }
        })
        
    except mysql.connector.Error as err:
        return jsonify({'error': f'Database error: {str(err)}'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/clear/sessions', methods=['DELETE'])
def clear_sessions():
    """Clear all sessions"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM class_sessions")
        conn.commit()
        return jsonify({'message': 'Sessions cleared successfully'})
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/clear/all-session-data', methods=['DELETE'])
def clear_all_session_data():
    """Clear all session and attendance data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Delete in order to respect foreign key constraints
        cursor.execute("DELETE FROM movement_logs")
        cursor.execute("DELETE FROM attendance_records")
        cursor.execute("DELETE FROM class_sessions")
        conn.commit()
        return jsonify({'message': 'All session data cleared successfully'})
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/clear/reports', methods=['DELETE'])  
def clear_reports():
    """Clear all attendance reports"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM movement_logs")
        cursor.execute("DELETE FROM attendance_records")
        conn.commit()
        return jsonify({'message': 'Reports cleared successfully'})
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        conn = get_db_connection()
        conn.close()
        return jsonify({'status': 'ok', 'message': 'Server and database are running'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Database connection failed: {str(e)}'}), 500

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('status', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('start_session')
def handle_start_session(data):
    """Handle session start event"""
    global current_session_id
    session_id = data.get('session_id')
    if session_id:
        current_session_id = session_id
        emit('session_started', {'session_id': session_id})
        print(f"Session {session_id} started")

@socketio.on('stop_session')
def handle_stop_session():
    """Handle session stop event"""
    global current_session_id, session_tracking
    if current_session_id:
        emit('session_stopped', {'session_id': current_session_id})
        print(f"Session {current_session_id} stopped")
        current_session_id = None
        session_tracking.clear()

# Create student images directory if it doesn't exist
os.makedirs(STUDENT_IMAGES_DIR, exist_ok=True)

# Start background thread for exit detection
exit_thread = threading.Thread(target=check_exits, daemon=True)
exit_thread.start()

# Load initial encodings (with error handling)
try:
    load_student_encodings()
except Exception as e:
    print(f"Warning: Could not load initial face encodings: {e}")

if __name__ == '__main__':
    print("Starting Face Attendance System Backend...")
    print(f"Student images directory: {STUDENT_IMAGES_DIR}")
    print(f"Database config: {db_config}")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)