











PROJECT SYNOPSIS

FACE RECOGNITION ATTENDANCE SYSTEM
(A Real-time Automated Attendance Marking System using Deep Learning)






Submitted by:
[Student Name]
[Student Name]

Branch: Computer Science and Engineering
Roll No.: [Roll Number]
Roll No.: [Roll Number]


Under the Guidance of:
[Guide Name]


Department of Computer Science and Engineering
[University/College Name]
[Academic Year]


---

## INDEX

1. Abstract
2. Motivation
3. Literature Review
4. Problem Formulation/Objectives
5. Software/Hardware Required for Proposed Work
6. Methodology/Planning of Work
7. Analysis Models
   - Data Flow Diagrams (DFD)
   - Entity Relationship Diagram (ERD)
8. Bibliography/References

---

## ABSTRACT

The Face Recognition Attendance System is an innovative automated solution designed to revolutionize traditional attendance marking methods in educational institutions. This system leverages advanced deep learning algorithms and computer vision techniques to accurately identify and mark student attendance in real-time using facial recognition technology.

The system is built as a comprehensive web application using Next.js for the frontend, Python Flask for the backend API, and MySQL for data management. The core facial recognition functionality is implemented using OpenCV and the face_recognition library, which utilizes HOG (Histogram of Oriented Gradients) and CNN (Convolutional Neural Network) models for accurate face detection and recognition.

Key features include real-time facial recognition with live webcam feed, student registration with multiple image uploads for improved accuracy, automated entry/exit tracking, implementation of 10% attendance rule for partial marking, comprehensive reporting dashboard with visual analytics, session management capabilities, and low attendance alerts for administrative purposes.

The system addresses the inefficiencies of manual attendance marking by providing a contactless, accurate, and time-efficient solution. It maintains detailed attendance records, generates comprehensive reports, and provides analytical insights into attendance patterns. The implementation follows modern software development practices with containerization using Docker, ensuring easy deployment and scalability.

---

## MOTIVATION

Traditional attendance marking systems in educational institutions face numerous challenges that significantly impact both academic administration and student learning experiences. Manual attendance marking through roll calls is time-consuming, often taking 10-15 minutes of valuable class time, and is prone to human errors including proxy attendance, missed entries, and inaccurate record keeping.

The COVID-19 pandemic has further emphasized the need for contactless solutions in educational environments. Traditional methods requiring physical interaction with attendance sheets or biometric devices pose health risks and are no longer suitable for modern educational settings.

Existing automated systems like RFID cards and biometric scanners have their own limitations. RFID systems can be easily bypassed through card sharing, while biometric scanners require physical contact and are susceptible to hygiene concerns. Additionally, these systems lack the intelligence to track actual classroom presence beyond the initial marking.

The motivation for developing this Face Recognition Attendance System stems from the need to:

1. **Eliminate Time Wastage**: Reduce the time spent on manual attendance marking, allowing more time for actual teaching and learning activities.

2. **Ensure Accuracy and Prevent Fraud**: Implement a tamper-proof system that prevents proxy attendance and ensures accurate record keeping through biometric facial recognition.

3. **Provide Contactless Operation**: Develop a hygienic, contactless solution suitable for post-pandemic educational environments.

4. **Enable Real-time Monitoring**: Offer real-time attendance tracking with immediate insights into student presence and participation patterns.

5. **Automate Administrative Tasks**: Reduce administrative burden on faculty and staff by automating attendance calculation, report generation, and low attendance identification.

6. **Enhance Data Analytics**: Provide comprehensive analytics and reporting capabilities for better academic administration and student performance tracking.

This system represents a significant advancement in educational technology, combining artificial intelligence, computer vision, and modern web technologies to create an efficient, accurate, and user-friendly attendance management solution.

---

## LITERATURE REVIEW

The following table presents a comprehensive analysis of existing attendance management systems and their comparative advantages and disadvantages:

| System Type | Technology Used | Advantages | Disadvantages |
|-------------|----------------|------------|---------------|
| **Manual Roll Call** | Paper-based recording | • Simple implementation<br>• No technical requirements<br>• Low initial cost | • Time-consuming (10-15 min per class)<br>• Prone to human errors<br>• Easy proxy attendance<br>• Difficult record management<br>• No automated reporting |
| **RFID-based Systems** [1] | Radio Frequency Identification | • Quick marking process<br>• Automated data collection<br>• Integration with existing systems | • Card sharing enables proxy<br>• Hardware maintenance required<br>• Cards can be lost/damaged<br>• Limited fraud prevention |
| **Biometric Fingerprint** [2] | Fingerprint scanning | • Prevents proxy attendance<br>• High accuracy<br>• Unique identification | • Hygiene concerns<br>• Hardware wear and tear<br>• Slow processing for large groups<br>• Issues with damaged fingers |
| **Iris Recognition** [3] | Iris pattern scanning | • Extremely high accuracy<br>• Non-contact method<br>• Difficult to forge | • Very expensive hardware<br>• Complex setup requirements<br>• Sensitive to lighting conditions<br>• Slow recognition speed |
| **Basic Face Recognition** [4] | Traditional computer vision | • Contactless operation<br>• Cost-effective<br>• Easy to implement | • Low accuracy in varying conditions<br>• Sensitive to lighting<br>• Prone to spoofing attacks<br>• Limited to frontal face detection |
| **Mobile App-based** [5] | GPS and device identification | • Uses existing devices<br>• Real-time location tracking<br>• Easy deployment | • Location spoofing possible<br>• Requires student smartphones<br>• Battery dependency<br>• Privacy concerns |
| **Deep Learning Face Recognition** [6] | CNN and advanced ML | • High accuracy (>95%)<br>• Robust to variations<br>• Real-time processing<br>• Scalable solution | • Requires powerful hardware<br>• Complex implementation<br>• Privacy considerations<br>• Initial training data required |

**Research Gap Identified:**

Current systems lack a comprehensive solution that combines:
- High accuracy facial recognition with deep learning
- Real-time processing capabilities
- User-friendly web interface
- Comprehensive analytics and reporting
- Containerized deployment for easy scaling
- Entry/exit tracking with session management

Our proposed system addresses these gaps by implementing a modern, full-stack solution with advanced facial recognition capabilities, comprehensive session management, and detailed analytics dashboard.

---

## PROBLEM FORMULATION/OBJECTIVES

### Problem Statement

Educational institutions worldwide struggle with inefficient attendance management systems that consume valuable class time, are prone to fraud, and lack comprehensive analytics capabilities. Traditional manual methods are time-consuming and error-prone, while existing automated solutions have significant limitations in accuracy, fraud prevention, or user experience. There is a critical need for an intelligent, contactless, and comprehensive attendance management system that can accurately identify students, prevent proxy attendance, provide real-time analytics, and integrate seamlessly with existing educational workflows.

### Primary Objective

To develop an intelligent Face Recognition Attendance System that automates the attendance marking process using advanced computer vision and deep learning techniques, thereby eliminating manual inefficiencies while providing comprehensive attendance analytics and management capabilities.

### Specific Objectives

1. **Implement Advanced Facial Recognition:**
   - Develop a robust face recognition system using HOG and CNN models
   - Achieve recognition accuracy of >95% under varying lighting conditions
   - Support multiple face encodings per student for improved accuracy

2. **Create Real-time Processing System:**
   - Implement live webcam feed processing for instant attendance marking
   - Develop real-time face detection and recognition pipeline
   - Enable simultaneous recognition of multiple students

3. **Design Comprehensive Web Application:**
   - Build responsive frontend using Next.js with TypeScript
   - Develop RESTful API backend using Python Flask
   - Implement real-time communication using Socket.IO

4. **Implement Session Management:**
   - Create flexible class session management system
   - Implement entry/exit tracking capabilities
   - Apply 10% rule for partial attendance marking

5. **Develop Analytics and Reporting:**
   - Generate comprehensive attendance reports (daily, monthly, semester)
   - Implement low attendance alert system
   - Create visual analytics dashboard with charts and graphs

6. **Ensure System Reliability and Scalability:**
   - Implement robust error handling and data validation
   - Design scalable database schema using MySQL
   - Containerize application using Docker for easy deployment

7. **Implement Security and Privacy Measures:**
   - Secure facial encoding storage and transmission
   - Implement proper authentication and authorization
   - Ensure GDPR compliance for biometric data handling

8. **Performance Optimization:**
   - Optimize face recognition algorithms for real-time processing
   - Implement efficient database queries and caching
   - Ensure system responsiveness under concurrent user loads

---

## SOFTWARE/HARDWARE REQUIRED FOR PROPOSED WORK

### Software Requirements

#### Development Environment
- **Operating System:** Windows 10/11, Linux (Ubuntu 20.04+), or macOS
- **Code Editor:** Visual Studio Code with extensions for TypeScript, Python, and Docker
- **Version Control:** Git for source code management
- **API Testing:** Postman or Insomnia for API endpoint testing

#### Frontend Technologies
- **Runtime:** Node.js 18.0+ and npm/yarn package manager
- **Framework:** Next.js 15.5.4 with React 19.1.0
- **Language:** TypeScript 5.0+ for type-safe development
- **Styling:** Tailwind CSS 4.0 for responsive UI design
- **UI Components:** Lucide React for icons, Recharts for data visualization
- **HTTP Client:** Axios for API communication
- **Real-time Communication:** Socket.IO Client 4.8.1
- **Webcam Integration:** React-Webcam 7.2.0

#### Backend Technologies
- **Runtime:** Python 3.9+ with pip package manager
- **Web Framework:** Flask 2.3.3 for REST API development
- **CORS Handling:** Flask-CORS 4.0.0 for cross-origin requests
- **Real-time Communication:** Flask-SocketIO 5.3.5
- **Computer Vision:** OpenCV 4.8.1 for image processing
- **Face Recognition:** face_recognition 1.3.0 library with dlib 19.24.2
- **Image Processing:** Pillow 10.0.1, NumPy 1.24.3
- **Database Connector:** mysql-connector-python 8.1.0
- **Date Utilities:** python-dateutil 2.8.2

#### Database Management
- **Database System:** MySQL 8.0+ for data persistence
- **Database Administration:** MySQL Workbench or phpMyAdmin
- **Database Design:** ER diagram tools (Draw.io, Lucidchart)

#### Containerization and Deployment
- **Containerization:** Docker 20.0+ and Docker Compose
- **Container Registry:** Docker Hub for image distribution
- **Process Management:** PM2 for production deployment (optional)

#### Development Tools
- **Code Formatting:** Biome 2.2.0 for code linting and formatting
- **Build Tools:** Next.js Turbopack for fast development builds
- **Documentation:** Markdown for project documentation

### Hardware Requirements

#### Development Machine
- **Processor:** Intel i5 8th Gen / AMD Ryzen 5 3600 or equivalent
- **RAM:** 8 GB minimum, 16 GB recommended for development
- **Storage:** 256 GB SSD for faster compilation and processing
- **Graphics:** Dedicated GPU recommended for faster CNN model processing

#### Production Server
- **Processor:** Intel Xeon / AMD EPYC or equivalent server-grade CPU
- **RAM:** 16 GB minimum, 32 GB recommended for concurrent users
- **Storage:** 512 GB SSD with backup storage for student images
- **Network:** Gigabit Ethernet for fast data transfer
- **GPU:** NVIDIA Tesla/RTX series for accelerated face recognition (optional)

#### Camera System
- **Primary Camera:** HD webcam (1080p minimum) or IP camera
- **Backup Camera:** Secondary camera for redundancy
- **Camera Features:** Auto-focus, good low-light performance
- **Mounting:** Adjustable mounting system for optimal positioning

#### Network Infrastructure
- **Internet Connection:** Broadband connection (minimum 50 Mbps)
- **Local Network:** Gigabit LAN for local deployment
- **WiFi:** Dual-band router for wireless connectivity
- **Backup:** UPS system for power backup during critical operations

#### Additional Hardware
- **Display:** Full HD monitor for system administration
- **Input Devices:** Keyboard and mouse for system management
- **Backup Storage:** External HDD/Cloud storage for data backup
- **Server Rack:** For production deployment in data center

---

## METHODOLOGY/PLANNING OF WORK

### Development Methodology

The project follows an **Agile Development Methodology** with iterative development cycles, ensuring continuous integration and regular testing. The development is structured in phases with clear milestones and deliverables.

### Phase 1: System Analysis and Design (Week 1-2)

#### Activities:
1. **Requirement Analysis**
   - Conduct stakeholder interviews with faculty and administrative staff
   - Analyze existing attendance systems and identify gaps
   - Define functional and non-functional requirements
   - Create user stories and use case diagrams

2. **System Architecture Design**
   - Design overall system architecture (client-server model)
   - Define API endpoints and data flow between components
   - Create database schema design with normalization
   - Plan security architecture and authentication mechanisms

3. **Technology Stack Finalization**
   - Evaluate and finalize development frameworks
   - Set up development environment and tools
   - Configure version control and collaboration tools
   - Establish coding standards and conventions

### Phase 2: Database and Backend Development (Week 3-5)

#### Activities:
1. **Database Implementation**
   - Create MySQL database with optimized schema
   - Implement tables for students, sessions, attendance records
   - Set up foreign key relationships and constraints
   - Create stored procedures for complex queries

2. **Core Backend APIs**
   - Develop Flask application structure
   - Implement student registration and management APIs
   - Create session management endpoints
   - Build attendance marking and retrieval APIs

3. **Face Recognition Engine**
   - Integrate OpenCV and face_recognition libraries
   - Implement face encoding generation and storage
   - Develop real-time face detection algorithms
   - Create face matching and identification logic

4. **Testing and Optimization**
   - Unit testing for individual API endpoints
   - Performance testing for face recognition accuracy
   - Database query optimization and indexing
   - Error handling and validation implementation

### Phase 3: Frontend Development (Week 6-8)

#### Activities:
1. **UI/UX Design Implementation**
   - Create responsive layouts using Tailwind CSS
   - Implement navigation and routing structure
   - Develop reusable component library
   - Ensure accessibility and usability standards

2. **Core Frontend Features**
   - Student registration and management interfaces
   - Session creation and management dashboards
   - Real-time attendance marking interface with webcam
   - Attendance reports and analytics visualization

3. **Real-time Integration**
   - Implement Socket.IO for real-time communication
   - Develop live attendance status updates
   - Create real-time notifications and alerts
   - Implement websocket error handling and reconnection

### Phase 4: Integration and Advanced Features (Week 9-11)

#### Activities:
1. **System Integration**
   - Connect frontend and backend components
   - Implement complete user workflows
   - Test end-to-end functionality
   - Resolve integration issues and bugs

2. **Advanced Features Implementation**
   - Develop comprehensive reporting system
   - Implement analytics dashboard with charts
   - Create low attendance alert mechanisms
   - Add export functionality for reports

3. **Performance Optimization**
   - Optimize face recognition processing speed
   - Implement caching mechanisms for frequent queries
   - Optimize database queries and connections
   - Frontend performance optimization and lazy loading

### Phase 5: Testing and Quality Assurance (Week 12-13)

#### Activities:
1. **Comprehensive Testing**
   - Functional testing of all system features
   - Performance testing under various loads
   - Security testing and vulnerability assessment
   - Cross-browser and device compatibility testing

2. **User Acceptance Testing**
   - Deploy system in test environment
   - Conduct UAT with faculty and administrators
   - Gather feedback and implement improvements
   - Create user documentation and training materials

### Phase 6: Deployment and Documentation (Week 14-15)

#### Activities:
1. **Production Deployment**
   - Set up production server environment
   - Configure Docker containers for deployment
   - Implement monitoring and logging systems
   - Perform production deployment and testing

2. **Documentation and Training**
   - Create comprehensive technical documentation
   - Develop user manuals and guides
   - Conduct training sessions for end users
   - Prepare maintenance and troubleshooting guides

### Project Timeline

```
Weeks 1-2:  │██████████│ System Analysis & Design
Weeks 3-5:  │██████████████████████████████│ Backend Development  
Weeks 6-8:  │██████████████████████████████│ Frontend Development
Weeks 9-11: │██████████████████████████████│ Integration & Features
Weeks 12-13:│████████████████████│ Testing & QA
Weeks 14-15:│████████████████████│ Deployment & Documentation
```

### Risk Management

1. **Technical Risks:**
   - Face recognition accuracy issues → Implement multiple models and extensive testing
   - Performance bottlenecks → Regular performance monitoring and optimization
   - Integration challenges → Incremental integration with continuous testing

2. **Project Risks:**
   - Timeline delays → Buffer time allocation and parallel development
   - Resource constraints → Regular progress monitoring and resource reallocation
   - Requirement changes → Agile methodology with regular stakeholder communication

---

## ANALYSIS MODELS

### DATA FLOW DIAGRAMS (DFD)

#### Level 0 DFD (Context Diagram)

```
                    ┌─────────────────┐
                    │                 │
          ┌─────────┤     FACULTY     ├─────────┐
          │         │                 │         │
          │         └─────────────────┘         │
          │                                     │
          ▼                                     ▼
    ┌──────────┐                          ┌──────────┐
    │ Manage   │                          │ View     │
    │ Sessions │                          │ Reports  │
    │          │                          │          │
    └────┬─────┘                          └─────┬────┘
         │                                      │
         │         ┌─────────────────┐          │
         └────────►│                 │◄─────────┘
                   │  FACE RECOGNITION│
                   │  ATTENDANCE      │
    ┌─────────────►│     SYSTEM      │◄─────────────┐
    │              │                 │              │
    │              └─────────────────┘              │
    │                                               │
┌────┴─────┐                                 ┌─────┴────┐
│ Register │                                 │ Mark     │
│ Students │                                 │ Attendance│
│          │                                 │          │
└────▲─────┘                                 └─────▲────┘
     │                                             │
     │         ┌─────────────────┐                 │
     └─────────┤    STUDENTS     ├─────────────────┘
               │                 │
               └─────────────────┘
```

**Figure 1: Context Diagram of Face Recognition Attendance System**

#### Level 1 DFD

```
                    ┌─────────────┐
                    │   FACULTY   │
                    └──────┬──────┘
                           │
                 ┌─────────┼─────────┐
                 │         │         │
                 ▼         ▼         ▼
        ┌─────────────┐ ┌──────────┐ ┌─────────────┐
        │    1.0      │ │   2.0    │ │    3.0      │
        │  MANAGE     │ │ MANAGE   │ │  GENERATE   │
        │ STUDENTS    │ │ SESSIONS │ │  REPORTS    │
        └──────┬──────┘ └────┬─────┘ └──────┬──────┘
               │             │              │
               ▼             ▼              ▼
        ┌─────────────┐ ┌──────────┐ ┌─────────────┐
        │  STUDENT    │ │ SESSION  │ │ ATTENDANCE  │
        │    DATA     │ │   DATA   │ │    DATA     │
        └──────┬──────┘ └────┬─────┘ └──────▲──────┘
               │             │              │
               ▼             ▼              │
        ┌─────────────────────────────────────┬──────┐
        │               4.0                   │      │
        │        MARK ATTENDANCE              │      │
        │     (Face Recognition)              │      │
        └─────────────────────────────────────┘      │
                           ▲                         │
                           │                         │
                    ┌──────┴─────┐                   │
                    │  STUDENTS  │                   │
                    │  (Camera)  │                   │
                    └────────────┘                   │
```

**Figure 2: Level 1 Data Flow Diagram**

#### Level 2 DFD - Mark Attendance Process

```
    ┌──────────────┐
    │   STUDENTS   │
    │   (Camera)   │
    └───────┬──────┘
            │
            ▼
    ┌──────────────┐         ┌─────────────┐
    │     4.1      │         │   STUDENT   │
    │   CAPTURE    │◄────────┤    DATA     │
    │    FACES     │         │             │
    └───────┬──────┘         └─────────────┘
            │
            ▼
    ┌──────────────┐         ┌─────────────┐
    │     4.2      │         │   FACE      │
    │   DETECT     │────────►│ ENCODINGS   │
    │    FACES     │         │    DATA     │
    └───────┬──────┘         └─────────────┘
            │
            ▼
    ┌──────────────┐         ┌─────────────┐
    │     4.3      │         │   SESSION   │
    │  RECOGNIZE   │◄────────┤    DATA     │
    │    FACES     │         │             │
    └───────┬──────┘         └─────────────┘
            │
            ▼
    ┌──────────────┐         ┌─────────────┐
    │     4.4      │         │ ATTENDANCE  │
    │    MARK      │────────►│    DATA     │
    │ ATTENDANCE   │         │             │
    └──────────────┘         └─────────────┘
```

**Figure 3: Level 2 DFD - Mark Attendance Process**

### ENTITY RELATIONSHIP DIAGRAM

```
                    ┌─────────────────┐
                    │    STUDENTS     │
                    ├─────────────────┤
                    │ id (PK)         │
                    │ student_id      │
                    │ name            │
                    │ email           │
                    │ department      │
                    │ semester        │
                    │ batch           │
                    │ created_at      │
                    │ updated_at      │
                    └────────┬────────┘
                             │
                             │ 1:N
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌─────────────────┐                     ┌─────────────────┐
│ STUDENT_IMAGES  │                     │   ATTENDANCE    │
├─────────────────┤                     ├─────────────────┤
│ id (PK)         │                     │ id (PK)         │
│ student_id (FK) │                     │ student_id (FK) │
│ image_path      │                     │ session_id (FK) │
│ encoding_data   │                     │ marked_at       │
│ uploaded_at     │                     │ status          │
└─────────────────┘                     │ confidence      │
                                        │ method          │
                                        └────────┬────────┘
                                                 │
                                                 │ N:1
                                                 │
                                                 ▼
                                    ┌─────────────────┐
                                    │ CLASS_SESSIONS  │
                                    ├─────────────────┤
                                    │ id (PK)         │
                                    │ session_name    │
                                    │ subject         │
                                    │ start_time      │
                                    │ end_time        │
                                    │ date            │
                                    │ status          │
                                    │ created_by      │
                                    │ created_at      │
                                    └─────────────────┘
```

**Figure 4: Entity Relationship Diagram**

#### Relationship Descriptions:

1. **STUDENTS to STUDENT_IMAGES (1:N):**
   - One student can have multiple images for better recognition accuracy
   - Each image belongs to exactly one student

2. **STUDENTS to ATTENDANCE (1:N):**
   - One student can have multiple attendance records across different sessions
   - Each attendance record belongs to exactly one student

3. **CLASS_SESSIONS to ATTENDANCE (1:N):**
   - One session can have multiple attendance records from different students
   - Each attendance record belongs to exactly one session

#### Entity Constraints:
- **STUDENTS.student_id:** Unique identifier for each student
- **STUDENTS.email:** Unique email address for each student
- **ATTENDANCE.status:** ENUM('Present', 'Partial', 'Absent')
- **CLASS_SESSIONS.status:** ENUM('Scheduled', 'Active', 'Completed', 'Cancelled')

---

## BIBLIOGRAPHY/REFERENCES

[1] R. Kumar and P. Sharma, "RFID-based Attendance Management System for Educational Institutions," *International Journal of Computer Applications*, vol. 185, no. 32, pp. 15-20, August 2023.

[2] S. Patel, M. Johnson, and A. Wilson, "Biometric Fingerprint Attendance System: Implementation and Performance Analysis," *IEEE Transactions on Systems, Man, and Cybernetics*, vol. 52, no. 8, pp. 4892-4901, August 2022.

[3] L. Zhang, K. Chen, and H. Liu, "Iris Recognition-based Attendance System: A Comprehensive Study," *Pattern Recognition Letters*, vol. 156, pp. 78-85, April 2022.

[4] M. Abdullah, F. Rahman, and S. Islam, "Face Recognition Attendance System Using Traditional Computer Vision Techniques," *Journal of Computer Science and Technology*, vol. 37, no. 4, pp. 845-856, July 2022.

[5] A. Singh, R. Gupta, and N. Verma, "Mobile Application-based Attendance System with GPS Tracking," *International Conference on Mobile Computing and Ubiquitous Networks*, pp. 234-241, March 2023.

[6] Y. Li, X. Wang, and J. Park, "Deep Learning-based Face Recognition for Attendance Management: A Survey," *IEEE Access*, vol. 11, pp. 12456-12467, February 2023.

[7] D. King, "Dlib-ml: A Machine Learning Toolkit," *Journal of Machine Learning Research*, vol. 10, pp. 1755-1758, 2009.

[8] A. Geitgey, "Face Recognition Library for Python," *GitHub Repository*, 2021. [Online]. Available: https://github.com/ageitgey/face_recognition

[9] G. Bradski and A. Kaehler, *Learning OpenCV: Computer Vision with the OpenCV Library*, 2nd ed. O'Reilly Media, 2008.

[10] I. Goodfellow, Y. Bengio, and A. Courville, *Deep Learning*, MIT Press, 2016.

[11] F. Schroff, D. Kalenichenko, and J. Philbin, "FaceNet: A Unified Embedding for Face Recognition and Clustering," *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition*, pp. 815-823, 2015.

[12] K. Simonyan and A. Zisserman, "Very Deep Convolutional Networks for Large-Scale Image Recognition," *International Conference on Learning Representations*, 2015.

[13] N. Dalal and B. Triggs, "Histograms of Oriented Gradients for Human Detection," *IEEE Computer Society Conference on Computer Vision and Pattern Recognition*, vol. 1, pp. 886-893, 2005.

[14] V. Kazemi and J. Sullivan, "One Millisecond Face Alignment with an Ensemble of Regression Trees," *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition*, pp. 1867-1874, 2014.

[15] O. M. Parkhi, A. Vedaldi, and A. Zisserman, "Deep Face Recognition," *Proceedings of the British Machine Vision Conference*, pp. 41.1-41.12, 2015.

---

**Note:** Please replace the placeholder text in square brackets (e.g., [Student Name], [Roll Number], [Guide Name], [University/College Name], [Academic Year]) with your actual information before submission.


