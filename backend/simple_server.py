from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import os
from datetime import datetime, timedelta

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

@app.route('/api/students', methods=['GET'])
def get_students():
    return jsonify(demo_data['students'])

@app.route('/api/students', methods=['POST'])
def create_student():
    student_data = request.json
    # Find the highest existing ID and add 1 to ensure uniqueness
    existing_ids = [student.get('id', 0) for student in demo_data['students']]
    student_id = max(existing_ids, default=0) + 1
    student = {
        'id': student_id,
        'student_id': student_data.get('student_id'),
        'name': student_data.get('name'),
        'email': student_data.get('email'),
        'department': student_data.get('department'),
        'semester': student_data.get('semester'),
        'batch': student_data.get('batch'),
        'created_at': datetime.now().isoformat()
    }
    demo_data['students'].append(student)
    save_demo_data()
    return jsonify(student), 201

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    return jsonify(demo_data['sessions'])

@app.route('/api/sessions', methods=['POST'])
def create_session():
    session_data = request.json
    session_id = len(demo_data['sessions']) + 1
    
    # Calculate duration
    try:
        start_time = datetime.strptime(session_data.get('start_time'), '%Y-%m-%d %H:%M:%S')
        end_time = datetime.strptime(session_data.get('end_time'), '%Y-%m-%d %H:%M:%S')
        duration = int((end_time - start_time).total_seconds() / 60)
    except:
        duration = 60  # Default 1 hour
    
    session = {
        'id': session_id,
        'title': session_data.get('title'),
        'subject': session_data.get('subject'),
        'instructor': session_data.get('instructor'),
        'classroom': session_data.get('classroom'),
        'department': session_data.get('department'),
        'year': session_data.get('year'),
        'batch': session_data.get('batch'),
        'className': session_data.get('className'),
        'start_time': session_data.get('start_time'),
        'end_time': session_data.get('end_time'),
        'duration_minutes': duration,
        'status': 'scheduled',
        'created_at': datetime.now().isoformat()
    }
    demo_data['sessions'].append(session)
    save_demo_data()
    return jsonify(session), 201

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    return jsonify(demo_data['attendance_records'])

@app.route('/api/sessions/filters', methods=['GET'])
def get_session_filters():
    # Mock filter data
    filters = {
        'departments': ['Computer Science', 'Computer Application'],
        'classes': {
            'Computer Science': ['CN', 'CC', 'OS', 'SSS'],
            'Computer Application': []
        },
        'years': ['2023', '2024', '2025']
    }
    return jsonify(filters)

@app.route('/api/sessions/<int:session_id>/start', methods=['POST'])
def start_session(session_id):
    """Start a session by changing its status to active"""
    for session in demo_data['sessions']:
        if session['id'] == session_id:
            session['status'] = 'active'
            save_demo_data()
            return jsonify({'message': 'Session started successfully', 'session': session})
    return jsonify({'error': 'Session not found'}), 404

@app.route('/api/sessions/<int:session_id>/stop', methods=['POST'])
def stop_session(session_id):
    """Stop a session by changing its status to completed"""
    for session in demo_data['sessions']:
        if session['id'] == session_id:
            session['status'] = 'completed'
            save_demo_data()
            return jsonify({'message': 'Session stopped successfully', 'session': session})
    return jsonify({'error': 'Session not found'}), 404

@app.route('/api/sessions/active', methods=['GET'])
def get_active_sessions():
    # Return all active sessions (multiple can be active simultaneously)
    active_sessions = [s for s in demo_data['sessions'] if s.get('status') == 'active']
    return jsonify(active_sessions)

@app.route('/api/sessions/active/<string:department>', methods=['GET'])
def get_active_sessions_by_department(department):
    # Return active sessions for specific department
    active_sessions = [s for s in demo_data['sessions'] 
                      if s.get('status') == 'active' and s.get('department') == department]
    return jsonify(active_sessions)

@app.route('/api/sessions/cleanup', methods=['DELETE'])
def cleanup_sessions():
    # Remove sessions that don't belong to current department structure
    valid_classes = ['CN', 'CC', 'OS', 'SSS']  # Only Computer Science classes
    
    # Keep only sessions that match valid classes or are currently active and needed
    original_count = len(demo_data['sessions'])
    demo_data['sessions'] = [s for s in demo_data['sessions'] 
                            if (s.get('className') in valid_classes or 
                                s.get('subject') in valid_classes or
                                (s.get('department') == 'Computer Science' and s.get('status') == 'active'))]
    
    removed_count = original_count - len(demo_data['sessions'])
    save_demo_data()
    
    return jsonify({'message': f'Cleaned up {removed_count} old sessions'})

@app.route('/api/reports/low-attendance', methods=['GET'])
def get_low_attendance():
    threshold = int(request.args.get('threshold', 75))
    
    # Calculate real attendance data from actual sessions and attendance records
    low_attendance_students = []
    
    # Get all completed sessions (classes that have been conducted)
    completed_sessions = [s for s in demo_data['sessions'] if s.get('status') == 'completed']
    
    if not completed_sessions:
        # No classes completed yet, so no attendance data
        return jsonify([])
    
    # Calculate attendance for each student
    for student in demo_data['students']:
        student_id = student['id']
        student_dept = student.get('department', '').strip()
        
        # Get sessions for this student's department
        dept_sessions = [s for s in completed_sessions if s.get('department', '').strip() == student_dept]
        total_classes = len(dept_sessions)
        
        if total_classes == 0:
            continue  # No classes in this department yet
        
        # Count attendance for this student
        attended_sessions = []
        for session in dept_sessions:
            attendance_record = next((ar for ar in demo_data['attendance_records'] 
                                   if ar['student_id'] == student_id and ar['session_id'] == session['id']), None)
            if attendance_record and attendance_record.get('status') == 'present':
                attended_sessions.append(session)
        
        attended_count = len(attended_sessions)
        attendance_percentage = round((attended_count / total_classes) * 100, 2) if total_classes > 0 else 0
        
        if attendance_percentage < threshold:
            student_stat = {
                'id': student['id'],
                'name': student['name'],
                'student_id': student['student_id'],
                'email': student['email'],
                'department': student['department'],
                'semester': student['semester'],
                'total_classes': total_classes,
                'attended': attended_count,
                'attendance_percentage': attendance_percentage
            }
            low_attendance_students.append(student_stat)
    
    return jsonify(low_attendance_students)

@app.route('/api/reports/attendance-stats', methods=['GET'])
def get_attendance_stats():
    # Calculate real attendance statistics from actual data
    students_stats = []
    
    # Get all completed sessions (classes that have been conducted)
    completed_sessions = [s for s in demo_data['sessions'] if s.get('status') == 'completed']
    
    # Calculate attendance for each student
    for student in demo_data['students']:
        student_id = student['id']
        student_dept = student.get('department', '').strip()
        
        # Get sessions for this student's department
        dept_sessions = [s for s in completed_sessions if s.get('department', '').strip() == student_dept]
        total_classes = len(dept_sessions)
        
        # Count attendance for this student
        attended_sessions = []
        if total_classes > 0:
            for session in dept_sessions:
                attendance_record = next((ar for ar in demo_data['attendance_records'] 
                                       if ar['student_id'] == student_id and ar['session_id'] == session['id']), None)
                if attendance_record and attendance_record.get('status') == 'present':
                    attended_sessions.append(session)
        
        attended_count = len(attended_sessions)
        attendance_percentage = round((attended_count / total_classes) * 100, 2) if total_classes > 0 else 0
        
        student_stat = {
            'id': student['id'],
            'name': student['name'],
            'student_id': student['student_id'],
            'email': student['email'],
            'department': student['department'],
            'semester': student['semester'],
            'total_classes': total_classes,
            'attended': attended_count,
            'attendance_percentage': attendance_percentage
        }
        students_stats.append(student_stat)
    
    return jsonify(students_stats)

@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    demo_data['students'] = [s for s in demo_data['students'] if s['id'] != student_id]
    save_demo_data()
    return jsonify({'message': 'Student deleted successfully'})

@app.route('/api/students/<int:student_id>/upload-images', methods=['POST'])
def upload_student_images(student_id):
    # Mock image upload response
    return jsonify({'message': 'Images uploaded successfully', 'count': 1})

@app.route('/api/clear/sessions', methods=['DELETE'])
def clear_sessions():
    demo_data['sessions'] = []
    save_demo_data()
    return jsonify({'message': 'Sessions cleared successfully'})

@app.route('/api/clear/all-session-data', methods=['DELETE'])
def clear_all_session_data():
    demo_data['sessions'] = []
    demo_data['attendance_records'] = []
    save_demo_data()
    return jsonify({'message': 'All session data cleared successfully'})

@app.route('/api/clear/reports', methods=['DELETE'])
def clear_reports():
    demo_data['attendance_records'] = []
    save_demo_data()
    return jsonify({'message': 'Reports cleared successfully'})

@app.route('/api/reports/departments', methods=['GET'])
def get_department_reports():
    """Get department-wise attendance summary"""
    # Get all completed sessions
    completed_sessions = [s for s in demo_data['sessions'] if s.get('status') == 'completed']
    
    if not completed_sessions:
        return jsonify([])
    
    # Group by department
    departments = {}
    
    # First, get all departments from students
    for student in demo_data['students']:
        dept = student.get('department', '').strip()
        if dept and dept not in departments:
            departments[dept] = {
                'department': dept,
                'total_students': 0,
                'total_classes_conducted': 0,
                'students': []
            }
    
    # Calculate stats for each department
    for dept_name, dept_data in departments.items():
        # Get sessions for this department
        dept_sessions = [s for s in completed_sessions if s.get('department', '').strip() == dept_name]
        dept_data['total_classes_conducted'] = len(dept_sessions)
        
        # Get students in this department
        dept_students = [s for s in demo_data['students'] if s.get('department', '').strip() == dept_name]
        dept_data['total_students'] = len(dept_students)
        
        # Calculate attendance for each student in this department
        for student in dept_students:
            student_id = student['id']
            
            # Count attendance for this student in dept sessions
            attended_count = 0
            for session in dept_sessions:
                attendance_record = next((ar for ar in demo_data['attendance_records'] 
                                       if ar['student_id'] == student_id and ar['session_id'] == session['id']), None)
                if attendance_record and attendance_record.get('status') == 'present':
                    attended_count += 1
            
            attendance_percentage = round((attended_count / len(dept_sessions)) * 100, 2) if len(dept_sessions) > 0 else 0
            
            student_data = {
                'id': student['id'],
                'name': student['name'],
                'student_id': student['student_id'],
                'email': student['email'],
                'total_classes': len(dept_sessions),
                'attended': attended_count,
                'attendance_percentage': attendance_percentage
            }
            dept_data['students'].append(student_data)
        
        # Calculate department average
        if dept_data['students']:
            dept_data['average_attendance'] = round(
                sum(s['attendance_percentage'] for s in dept_data['students']) / len(dept_data['students']), 2
            )
        else:
            dept_data['average_attendance'] = 0
    
    return jsonify(list(departments.values()))

@app.route('/api/reports/subjects', methods=['GET'])
def get_subject_reports():
    """Get subject-wise attendance summary (CN, CC, OS, SSS)"""
    # Get all completed sessions
    completed_sessions = [s for s in demo_data['sessions'] if s.get('status') == 'completed']
    
    if not completed_sessions:
        return jsonify([])
    
    # Group by subject
    subjects = {}
    
    for session in completed_sessions:
        subject = session.get('subject', '').strip()
        dept = session.get('department', '').strip()
        
        if not subject:
            continue
            
        if subject not in subjects:
            subjects[subject] = {
                'subject': subject,
                'department': dept,
                'total_classes_conducted': 0,
                'students_attendance': []
            }
        
        subjects[subject]['total_classes_conducted'] += 1
    
    # Calculate student attendance for each subject
    for subject_name, subject_data in subjects.items():
        # Get all sessions for this subject
        subject_sessions = [s for s in completed_sessions if s.get('subject', '').strip() == subject_name]
        
        # Get students from the department of this subject
        dept_students = [s for s in demo_data['students'] if s.get('department', '').strip() == subject_data['department']]
        
        for student in dept_students:
            student_id = student['id']
            
            # Count attendance for this student in this subject
            attended_count = 0
            for session in subject_sessions:
                attendance_record = next((ar for ar in demo_data['attendance_records'] 
                                       if ar['student_id'] == student_id and ar['session_id'] == session['id']), None)
                if attendance_record and attendance_record.get('status') == 'present':
                    attended_count += 1
            
            total_classes = len(subject_sessions)
            attendance_percentage = round((attended_count / total_classes) * 100, 2) if total_classes > 0 else 0
            
            student_data = {
                'id': student['id'],
                'name': student['name'],
                'student_id': student['student_id'],
                'email': student['email'],
                'total_classes': total_classes,
                'attended': attended_count,
                'attendance_percentage': attendance_percentage
            }
            subject_data['students_attendance'].append(student_data)
        
        # Calculate subject average
        if subject_data['students_attendance']:
            subject_data['average_attendance'] = round(
                sum(s['attendance_percentage'] for s in subject_data['students_attendance']) / len(subject_data['students_attendance']), 2
            )
        else:
            subject_data['average_attendance'] = 0
    
    return jsonify(list(subjects.values()))

@app.route('/api/attendance/mark', methods=['POST'])
def mark_attendance():
    """Mark attendance for a student in an active session"""
    data = request.json
    student_id = data.get('student_id')
    session_id = data.get('session_id')
    
    # Check if session exists and is active
    active_session = None
    for session in demo_data['sessions']:
        if session['id'] == session_id and session['status'] == 'active':
            active_session = session
            break
    
    if not active_session:
        return jsonify({'error': 'No active session found'}), 404
    
    # Check if student exists
    student = None
    for s in demo_data['students']:
        if s['id'] == student_id:
            student = s
            break
    
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Check if attendance already marked
    for record in demo_data['attendance_records']:
        if record['student_id'] == student_id and record['session_id'] == session_id:
            return jsonify({'message': 'Attendance already marked', 'status': record['status']})
    
    # Create attendance record
    attendance_record = {
        'id': len(demo_data['attendance_records']) + 1,
        'student_id': student_id,
        'session_id': session_id,
        'student_name': student['name'],
        'student_code': student['student_id'],
        'entry_time': datetime.now().isoformat(),
        'status': 'present',
        'marked_at': datetime.now().isoformat()
    }
    
    demo_data['attendance_records'].append(attendance_record)
    save_demo_data()
    
    return jsonify({'message': 'Attendance marked successfully', 'record': attendance_record})

@app.route('/api/attendance/session/<int:session_id>', methods=['GET'])
def get_session_attendance(session_id):
    """Get attendance records for a specific session"""
    session_attendance = [
        record for record in demo_data['attendance_records'] 
        if record['session_id'] == session_id
    ]
    return jsonify(session_attendance)

@app.route('/api/attendance/calculate-percentages', methods=['POST'])
def calculate_attendance_percentages():
    # Mock attendance calculation
    return jsonify({'message': 'Attendance percentages calculated'})

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    # Get department statistics for admin dashboard
    departments = {}
    
    # Count students by department
    for student in demo_data['students']:
        dept = student.get('department', 'Unknown').strip()
        if dept not in departments:
            departments[dept] = {
                'name': dept,
                'total_students': 0,
                'active_students': 0,
                'average_attendance': 0
            }
        departments[dept]['total_students'] += 1
        
        # For demo, assume some students are active (have attended at least one class)
        # In real implementation, this would check actual attendance records
        if student['id'] <= 2:  # Mock: first 2 students are "active"
            departments[dept]['active_students'] += 1
    
    # Calculate mock attendance averages for departments
    for dept_name, dept_info in departments.items():
        if dept_info['total_students'] > 0:
            # Mock calculation - in reality this would come from attendance records
            dept_info['average_attendance'] = round(75 + (hash(dept_name) % 20), 1)
    
    # Overall statistics
    total_departments = len(departments)
    total_students = len(demo_data['students'])
    total_sessions = len(demo_data['sessions'])
    active_sessions = len([s for s in demo_data['sessions'] if s.get('status') == 'active'])
    
    return jsonify({
        'total_departments': total_departments,
        'total_students': total_students,
        'total_sessions': total_sessions,
        'active_sessions': active_sessions,
        'departments': list(departments.values()),
        'recent_activity': {
            'new_registrations_today': 1,  # Mock data
            'sessions_completed_today': 0,
            'average_daily_attendance': 82.5
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'})

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('status', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('process_frame')
def handle_process_frame(data):
    """Enhanced face recognition simulation"""
    try:
        session_id = data.get('session_id')
        department = data.get('department')
        
        print(f"Processing frame for session {session_id}, department: {department}")
        
        if not session_id:
            emit('recognition_result', {'error': 'No session ID provided'})
            return
            
        # Check if session is active
        active_session = None
        for session in demo_data['sessions']:
            if session['id'] == session_id and session['status'] == 'active':
                active_session = session
                break
                
        if not active_session:
            emit('recognition_result', {'error': 'No active session found'})
            return
        
        # Simulate face recognition with some randomness for demo
        # In production, this would use actual face recognition libraries
        import random
        import time
        
        # Get students from the same department
        dept_students = [s for s in demo_data['students'] 
                        if s.get('department', '').strip().lower() == active_session.get('department', '').strip().lower()]
        
        print(f"Found {len(dept_students)} students in department '{active_session.get('department', '')}'")
        print(f"Available students: {[s.get('name') for s in dept_students]}")
        
        # Simulate detecting faces with more realistic recognition
        # 85% chance to detect 1 face, 15% chance to detect no faces
        detection_chance = random.random()
        num_faces = 1 if detection_chance > 0.15 else 0
        recognized_students = []
        
        print(f"Face detection simulation: {num_faces} faces detected (chance: {detection_chance:.2f})")
        
        if num_faces > 0 and dept_students:
            # For demo: Always recognize "Shivam Indore" as the primary user
            # In real implementation, this would be actual face recognition
            shivam_student = next((s for s in dept_students if 'Shivam' in s.get('name', '')), None)
            
            if shivam_student:
                selected_students = [shivam_student]
                print(f"Recognizing primary user: {shivam_student['name']}")
            else:
                # Fallback to first available student if Shivam not found
                selected_students = [dept_students[0]]
                print(f"Fallback recognition: {dept_students[0]['name']}")
            
            print(f"Selected students for recognition: {[s['name'] for s in selected_students]}")
            
            for student in selected_students:
                # High confidence for primary user (Shivam), slightly lower for others
                if 'Shivam' in student.get('name', ''):
                    confidence = random.uniform(0.88, 0.96)  # Very high confidence for main user
                else:
                    confidence = random.uniform(0.75, 0.85)  # Lower confidence for others
                
                # Check if attendance already marked
                already_marked = any(
                    record['student_id'] == student['id'] and record['session_id'] == session_id
                    for record in demo_data['attendance_records']
                )
                
                if not already_marked:
                    # Auto-mark attendance
                    attendance_record = {
                        'id': len(demo_data['attendance_records']) + 1,
                        'student_id': student['id'],
                        'session_id': session_id,
                        'student_name': student['name'],
                        'student_code': student['student_id'],
                        'entry_time': datetime.now().isoformat(),
                        'status': 'present',
                        'marked_at': datetime.now().isoformat(),
                        'recognition_confidence': confidence
                    }
                    demo_data['attendance_records'].append(attendance_record)
                    save_demo_data()
                
                recognized_students.append({
                    'id': student['id'],
                    'name': student['name'],
                    'student_code': student['student_id'],
                    'confidence': confidence,
                    'already_marked': already_marked
                })
        
        result_data = {
            'recognized': recognized_students,
            'total_faces': num_faces,
            'session_id': session_id,
            'department': department,
            'message': f'Processed {num_faces} faces, recognized {len(recognized_students)} students'
        }
        
        print(f"Emitting recognition result: {result_data}")
        emit('recognition_result', result_data)
        
    except Exception as e:
        emit('recognition_result', {'error': f'Processing error: {str(e)}'})

if __name__ == '__main__':
    print("Starting Simple Flask Server...")
    print("Server will run on http://localhost:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)