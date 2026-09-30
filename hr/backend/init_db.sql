-- PostgreSQL Database Reference DDL Schema for HR AI Ecosystem

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'HR_SPECIALIST',
    title VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100),
    job_title VARCHAR(150),
    hire_date DATE,
    tenure VARCHAR(50),
    avatar_url TEXT,
    user_id VARCHAR(36) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    employee_id VARCHAR(36) REFERENCES employees(id),
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(30) DEFAULT 'open',
    ai_confidence NUMERIC(3, 2),
    ai_classification VARCHAR(100),
    waiting_minutes INT DEFAULT 0,
    assigned_to VARCHAR(36) REFERENCES users(id),
    resolution_notes TEXT,
    tags VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS triage_items (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) REFERENCES requests(id),
    title VARCHAR(255) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    predicted_category VARCHAR(50) NOT NULL,
    confidence_score NUMERIC(3, 2) DEFAULT 0.95,
    urgency_score VARCHAR(20) DEFAULT 'MEDIUM',
    reasoning TEXT,
    suggested_action TEXT,
    status VARCHAR(30) DEFAULT 'AUTO_ROUTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deliverables (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) REFERENCES requests(id),
    employee_id VARCHAR(36) REFERENCES employees(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT,
    status VARCHAR(30) DEFAULT 'pending_approval',
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hr_actions (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    employee_id VARCHAR(36) REFERENCES employees(id),
    urgency VARCHAR(20) DEFAULT 'NORMAL',
    status VARCHAR(30) DEFAULT 'pending',
    effective_date VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id VARCHAR(36) REFERENCES users(id),
    actor_name VARCHAR(255),
    metadata_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
