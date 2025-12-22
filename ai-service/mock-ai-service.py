#!/usr/bin/env python3
"""
Mock AI Service for Smart CV Analyzer
Simple FastAPI service that returns mock analysis data
"""

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from datetime import datetime
import random

app = FastAPI(title="Mock AI Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "OK",
        "message": "Mock AI Service is running",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze-resume")
async def analyze_resume(
    file: UploadFile = File(...),
    jobRole: str = Form(...)
):
    """Mock resume analysis endpoint"""
    
    # Generate mock analysis data
    mock_analysis = {
        "overallScore": random.randint(65, 95),
        "scoreBreakdown": {
            "contactScore": random.randint(70, 100),
            "contentScore": random.randint(60, 90),
            "skillsScore": random.randint(65, 95),
            "structureScore": random.randint(70, 95),
            "atsCompatibility": random.randint(60, 85)
        },
        "parsedText": f"Mock extracted text from {file.filename}. This is a sample resume for {jobRole} position...",
        "sections": {
            "contactInfo": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+1-234-567-8900",
                "location": "New York, NY"
            },
            "skills": ["Python", "JavaScript", "React", "Node.js", "MongoDB", "AWS"],
            "education": "Bachelor's Degree in Computer Science",
            "experience": "3+ years of software development experience",
            "projects": "Multiple web applications and APIs",
            "certifications": "AWS Certified Developer"
        },
        "issues": [
            "Consider adding more quantifiable achievements",
            "Include specific technologies used in projects",
            "Add metrics to demonstrate impact"
        ],
        "suggestedKeywords": [
            "Full-stack development",
            "Agile methodology", 
            "RESTful APIs",
            "Database design",
            "Cloud computing"
        ],
        "enhancedBullets": [
            {
                "section": "Experience",
                "original": "Developed web applications",
                "improved": "Architected and developed 5+ responsive web applications using React and Node.js, serving 10,000+ daily active users"
            },
            {
                "section": "Projects", 
                "original": "Built a chat application",
                "improved": "Engineered a real-time chat application with WebSocket integration, reducing message latency by 40% and supporting 500+ concurrent users"
            }
        ],
        "suggestedRoles": [
            {"role": "Full Stack Developer"},
            {"role": "Frontend Developer"},
            {"role": "Backend Developer"},
            {"role": "Software Engineer"}
        ],
        "aiAnalysis": {
            "strengths": [
                "Strong technical skill set",
                "Relevant experience for target role",
                "Good educational background"
            ],
            "improvements": [
                "Add more quantifiable achievements",
                "Include leadership examples",
                "Highlight problem-solving abilities"
            ],
            "recommendations": [
                "Consider adding a professional summary",
                "Include links to portfolio/GitHub",
                "Add relevant certifications"
            ]
        },
        "jobMarketData": {
            "averageSalary": "$85,000 - $120,000",
            "demandLevel": "High",
            "topSkills": ["JavaScript", "Python", "React", "AWS", "Docker"],
            "growthProjection": "15% over next 5 years"
        }
    }
    
    return mock_analysis

if __name__ == "__main__":
    print("Starting Mock AI Service...")
    print("This service provides mock data for development/testing")
    uvicorn.run(app, host="0.0.0.0", port=8002)