# Enterprise HR & Employee Operations Ecosystem

Welcome to the comprehensive HR & Employee Operations ecosystem. This repository brings together multiple applications into a unified AI-powered workflow, enabling seamless employee interactions, advanced HR management, and a robust Retrieval-Augmented Generation (RAG) backend for querying company policies.

## Repository Structure

This workspace is composed of three primary subsystems:

### 1. HR AI Service Desk (`/hr`)
An autonomous, deep frosted spatial UI web ecosystem designed for modern HR operations and triage.
- **Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS.
- **Key Features**: 
  - **HR Dashboard**: Key metrics, glowing velocity charts, and real-time AI operations telemetry.
  - **Service Requests**: Comprehensive tracking and management.
  - **Autonomous AI Triage**: Real-time classification stream, model reasoning, and an interactive Classifier Sandbox Simulator.
  - **HR Copilot**: Conversational AI assistant grounded in enterprise policies.
- **Documentation**: [Backend Integration Blueprint & API Specification](hr/BACKEND_INTEGRATION.md)
- **Quick Start**:
  ```bash
  cd hr/frontend
  npm install
  npm run dev
  ```
  Open `http://localhost:5173/` to view the application.

### 2. Employee Portal (`/employee_frontend-main`)
The frontend application facing the employees. It provides a modern interface for employees to submit service requests, interact with HR, and access information.
- **Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS.
- **Quick Start**:
  ```bash
  cd employee_frontend-main
  npm install
  npm run dev
  ```
  Open `http://localhost:3000/` to view the application.

### 3. Policy Knowledge Base RAG Assistant (`/rag_application-main`)
A production-grade, modular RAG application providing a FastAPI backend and a Streamlit chat interface. It enables employees and the HR Copilot to intelligently query company policies based on provided PDF documents.
- **Tech Stack**: Python (FastAPI, Streamlit), LangChain, Azure OpenAI, ChromaDB, PyPDF.
- **Key Features**:
  - **Automated PDF Ingestion**: Dynamically extracts text from PDFs in `knowledge_base/`.
  - **Persistent Vector Store**: Local indexing with ChromaDB.
  - **RESTful FastAPI Service**: Standard API to be consumed by the frontends.
- **Documentation**: [RAG Assistant Documentation](rag_application-main/README.md)
- **Quick Start**:
  Follow detailed instructions in the subsystem's README to configure environment variables.
  - Backend: `uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000`
  - Frontend: `streamlit run frontend/app.py`
  - Windows Quick Launcher: Run `run.bat` within the folder.

## Integration Vision

The overarching vision of this repository is an integrated flow where:
1. Employees use the **Employee Portal** to ask policy questions or submit HR requests.
2. The requests and queries are processed via the **Policy Knowledge Base RAG Assistant** for accurate, policy-grounded answers.
3. Complex issues or requests are escalated to the **HR AI Service Desk**, where HR professionals use the Copilot and triage dashboards to efficiently resolve them.
