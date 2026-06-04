# CodeEdit 🚀

> A cloud-native real-time collaborative code editor enabling multiple developers to edit code simultaneously using CRDT-based synchronization.

Built with **Monaco Editor**, **Yjs**, **WebSockets**, **Docker**, and deployed on **AWS ECS Fargate**.

---
<img width="1363" height="625" alt="image" src="https://github.com/user-attachments/assets/8c185506-3c95-4d95-8556-68a78298c53d" />
<img width="1345" height="642" alt="image" src="https://github.com/user-attachments/assets/edaab6e0-fcad-49c5-b141-a661925dfbb1" />


## 🌐 Live Demo

**Application URL**

http://rt-code-alb-1405588419.ap-northeast-1.elb.amazonaws.com/

**GitHub Repository**

https://github.com/yash-flix/CodeEdit

---

## 📖 Overview

CodeEdit is a production-ready collaborative coding platform that allows multiple users to edit the same document in real time without conflicts.

The project leverages **Conflict-free Replicated Data Types (CRDTs)** through Yjs to ensure consistent synchronization across clients while maintaining low-latency collaboration.

The entire application is containerized using Docker and deployed on AWS ECS Fargate behind an Application Load Balancer for scalability and reliability.

---

## ✨ Key Features

### Real-Time Collaboration

* ⚡ Live collaborative editing
* 👥 Multi-user room support
* 🔄 Conflict-free synchronization using Yjs CRDTs
* 🎯 Real-time cursor & presence awareness
* 🧠 Monaco Editor integration

### Networking

* 🌐 WebSocket-based communication
* 📡 Bidirectional real-time synchronization
* 🚀 Low-latency collaborative experience

### Cloud Infrastructure

* 🐳 Dockerized application
* ☁️ AWS ECS Fargate deployment
* ⚖️ Application Load Balancer integration
* ❤️ Health-check-based service recovery
* 📊 CloudWatch logging
* 🔄 Rolling deployments

---

## 🏗️ Architecture

```text
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Application Load    │
│ Balancer (ALB)      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Target Group      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   ECS Service       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Fargate Task        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Docker Container    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Express + WS Server │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐

│ Yjs CRDT Engine     │
└─────────────────────┘
```
## Architecture
<img width="500" height="850" alt="architecture" src="https://github.com/user-attachments/assets/0df74c18-9962-4f86-88e3-80de455f9008" />

##System Design
<img width="622" height="1176" alt="SystremDesign" src="https://github.com/user-attachments/assets/b5676102-7b32-4c2f-a505-7a19e740078f" />

---

## 🛠️ Tech Stack

### Frontend

* React
* Monaco Editor
* Tailwind CSS
* Yjs Client

### Backend

* Node.js
* Express.js
* WebSocket Server
* Y-WebSocket

### Collaboration Engine

* Yjs
* CRDTs
* Awareness Protocol

### DevOps & Cloud

* Docker
* Amazon ECS
* AWS Fargate
* Application Load Balancer
* CloudWatch
* ECR

---

## 📂 Project Structure

```bash
CodeEdit/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── server.js
│   ├── websocket/
│   ├── routes/
│   └── package.json
│
├── Dockerfile
├── .dockerignore
├── README.md
└── docker-compose.yml
```

---

## 🚀 Local Development

### Clone Repository

```bash
git clone https://github.com/yash-flix/CodeEdit.git

cd CodeEdit
```

### Install Dependencies

Frontend

```bash
cd frontend
npm install
```

Backend

```bash
cd backend
npm install
```

### Start Development Servers

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t codeedit .
```

### Run Container

```bash
docker run -p 1234:1234 codeedit
```

### Verify

```bash
http://localhost:1234
```

---

## ☁️ AWS Deployment Pipeline

### Deployment Workflow

```text
Source Code
     │
     ▼
Docker Build
     │
     ▼
Amazon ECR
     │
     ▼
ECS Task Definition
     │
     ▼
ECS Service
     │
     ▼
Fargate Tasks
     │
     ▼
Application Load Balancer
     │
     ▼
Users
```

### AWS Services Used

* Amazon ECS
* AWS Fargate
* Amazon ECR
* Application Load Balancer
* Target Groups
* Security Groups
* CloudWatch Logs

---

## 📊 Project Highlights

### Engineering Metrics

* ⚡ Real-time synchronization latency under 100ms (typical)
* 👥 Concurrent collaborative editing support
* 🔄 Automatic conflict resolution using CRDTs
* 🐳 Fully containerized architecture
* ☁️ Production deployment on AWS ECS Fargate
* ⚖️ Load-balanced infrastructure
* ❤️ Automated health monitoring
* 📈 Horizontally scalable architecture

---

## 🎯 What This Project Demonstrates

### Software Engineering

* Real-Time Systems
* Collaborative Applications
* Distributed State Management
* Conflict Resolution Algorithms

### Backend Engineering

* WebSockets
* Event-Driven Architecture
* Stateful Synchronization
* API Development

### Cloud & DevOps

* Docker Containerization
* AWS ECS
* AWS Fargate
* Load Balancing
* Cloud Networking
* Health Checks
* Production Deployment
* Cloud Monitoring

### Computer Science Concepts

* CRDTs (Conflict-free Replicated Data Types)
* Distributed Systems
* Network Communication
* Synchronization Protocols
* Scalability Patterns

---

## 🔮 Future Enhancements

* [ ] Persistent document storage
* [ ] Multiple files per room
* [ ] Collaborative tabs
* [ ] Language-specific syntax support
* [ ] Code execution sandbox
* [ ] Integrated chat system
* [ ] AI coding copilot
* [ ] Authentication & authorization
* [ ] Version history
* [ ] Team workspaces

---

## 👨‍💻 Author

### Yash Rane

Artificial Intelligence & Data Science Engineer

* GitHub: https://github.com/yash-flix
* LinkedIn: [www.linkedin.com/in/yash-rane13](http://www.linkedin.com/in/yash-rane13)

---

## ⭐ If you found this project useful

Give it a star on GitHub and feel free to contribute!
