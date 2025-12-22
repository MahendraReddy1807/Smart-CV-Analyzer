/**
 * Property-based tests for data persistence functionality
 * **Feature: smart-cv-analyzer, Property 7: Data Persistence Integrity**
 */

const { expect } = require('chai');
const mongoose = require('mongoose');
const fc = require('fast-check');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const User = require('../models/User');

describe('Data Persistence Properties', function() {
    this.timeout(10000); // Increase timeout for database operations
    
    before(async function() {
        // Connect to test database
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cv_analyzer_test');
        }
    });
    
    beforeEach(async function() {
        // Clean up test data before each test
        await ResumeAnalysis.deleteMany({});
        await User.deleteMany({});
    });
    
    after(async function() {
        // Clean up and close connection
        await ResumeAnalysis.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });
    
    /**
     * **Feature: smart-cv-analyzer, Property 7: Data Persistence Integrity**
     * For any completed analysis, storing the results should preserve all analysis components 
     * (scores, recommendations, enhancements, original content) such that retrieval returns identical data
     */
    it('should preserve all analysis data during storage and retrieval', async function() {
        await fc.assert(fc.asyncProperty(
            fc.record({
                uploadedFileName: fc.string({ minLength: 1, maxLength: 100 }),
                jobRole: fc.string({ minLength: 1, maxLength: 50 }),
                parsedText: fc.string({ minLength: 10, maxLength: 1000 }),
                sections: fc.record({
                    contactInfo: fc.record({
                        name: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
                        email: fc.option(fc.emailAddress()),
                        phone: fc.option(fc.string({ minLength: 10, maxLength: 15 })),
                        location: fc.option(fc.string({ minLength: 1, maxLength: 100 }))
                    }),
                    education: fc.string({ maxLength: 500 }),
                    skills: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 20 }),
                    experience: fc.string({ maxLength: 1000 }),
                    projects: fc.string({ maxLength: 1000 }),
                    certifications: fc.string({ maxLength: 300 })
                }),
                overallScore: fc.integer({ min: 0, max: 100 }),
                scoreBreakdown: fc.record({
                    structureScore: fc.integer({ min: 0, max: 100 }),
                    skillsScore: fc.integer({ min: 0, max: 100 }),
                    contentScore: fc.integer({ min: 0, max: 100 }),
                    atsCompatibility: fc.integer({ min: 0, max: 100 })
                }),
                issues: fc.array(fc.string({ minLength: 1, maxLength: 200 }), { maxLength: 10 }),
                suggestedKeywords: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 15 }),
                missingComponents: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 10 }),
                enhancedBullets: fc.array(fc.record({
                    original: fc.string({ minLength: 10, maxLength: 200 }),
                    improved: fc.string({ minLength: 10, maxLength: 300 }),
                    section: fc.constantFrom('projects', 'experience', 'general')
                }), { maxLength: 5 })
            }),
            async (analysisData) => {
                // Store the analysis
                const analysis = new ResumeAnalysis({
                    ...analysisData,
                    uploadTimestamp: new Date(),
                    processingTime: Math.floor(Math.random() * 5000),
                    aiServiceVersion: '1.0.0'
                });
                
                const savedAnalysis = await analysis.save();
                expect(savedAnalysis._id).to.exist;
                
                // Retrieve the analysis
                const retrievedAnalysis = await ResumeAnalysis.findById(savedAnalysis._id);
                expect(retrievedAnalysis).to.exist;
                
                // Verify all data is preserved
                expect(retrievedAnalysis.uploadedFileName).to.equal(analysisData.uploadedFileName);
                expect(retrievedAnalysis.jobRole).to.equal(analysisData.jobRole);
                expect(retrievedAnalysis.parsedText).to.equal(analysisData.parsedText);
                expect(retrievedAnalysis.overallScore).to.equal(analysisData.overallScore);
                
                // Verify sections are preserved
                expect(retrievedAnalysis.sections.education).to.equal(analysisData.sections.education);
                expect(retrievedAnalysis.sections.experience).to.equal(analysisData.sections.experience);
                expect(retrievedAnalysis.sections.projects).to.equal(analysisData.sections.projects);
                expect(retrievedAnalysis.sections.certifications).to.equal(analysisData.sections.certifications);
                
                // Verify arrays are preserved
                expect(retrievedAnalysis.sections.skills).to.deep.equal(analysisData.sections.skills);
                expect(retrievedAnalysis.issues).to.deep.equal(analysisData.issues);
                expect(retrievedAnalysis.suggestedKeywords).to.deep.equal(analysisData.suggestedKeywords);
                expect(retrievedAnalysis.missingComponents).to.deep.equal(analysisData.missingComponents);
                
                // Verify score breakdown is preserved
                expect(retrievedAnalysis.scoreBreakdown.structureScore).to.equal(analysisData.scoreBreakdown.structureScore);
                expect(retrievedAnalysis.scoreBreakdown.skillsScore).to.equal(analysisData.scoreBreakdown.skillsScore);
                expect(retrievedAnalysis.scoreBreakdown.contentScore).to.equal(analysisData.scoreBreakdown.contentScore);
                expect(retrievedAnalysis.scoreBreakdown.atsCompatibility).to.equal(analysisData.scoreBreakdown.atsCompatibility);
                
                // Verify enhanced bullets are preserved
                expect(retrievedAnalysis.enhancedBullets).to.have.lengthOf(analysisData.enhancedBullets.length);
                for (let i = 0; i < analysisData.enhancedBullets.length; i++) {
                    expect(retrievedAnalysis.enhancedBullets[i].original).to.equal(analysisData.enhancedBullets[i].original);
                    expect(retrievedAnalysis.enhancedBullets[i].improved).to.equal(analysisData.enhancedBullets[i].improved);
                    expect(retrievedAnalysis.enhancedBullets[i].section).to.equal(analysisData.enhancedBullets[i].section);
                }
            }
        ), { numRuns: 20 });
    });
    
    it('should handle edge cases in data storage', async function() {
        await fc.assert(fc.asyncProperty(
            fc.record({
                uploadedFileName: fc.constantFrom('', 'a', 'very-long-filename-that-might-cause-issues.pdf'),
                jobRole: fc.constantFrom('', 'a', 'software engineer with very specific requirements'),
                parsedText: fc.constantFrom('', 'short', 'a'.repeat(10000)),
                sections: fc.record({
                    contactInfo: fc.record({
                        name: fc.option(fc.constantFrom(null, '', 'John Doe')),
                        email: fc.option(fc.constantFrom(null, '', 'invalid-email', 'valid@email.com')),
                        phone: fc.option(fc.constantFrom(null, '', '123', '(555) 123-4567')),
                        location: fc.option(fc.constantFrom(null, '', 'NYC'))
                    }),
                    education: fc.constantFrom('', 'Bachelor Degree'),
                    skills: fc.constantFrom([], ['Python'], ['Python', 'Java', 'JavaScript']),
                    experience: fc.constantFrom('', 'Some experience'),
                    projects: fc.constantFrom('', 'Built an app'),
                    certifications: fc.constantFrom('', 'AWS Certified')
                }),
                overallScore: fc.constantFrom(0, 50, 100),
                scoreBreakdown: fc.record({
                    structureScore: fc.constantFrom(0, 100),
                    skillsScore: fc.constantFrom(0, 100),
                    contentScore: fc.constantFrom(0, 100),
                    atsCompatibility: fc.constantFrom(0, 100)
                }),
                issues: fc.constantFrom([], ['Issue 1'], ['Issue 1', 'Issue 2']),
                suggestedKeywords: fc.constantFrom([], ['Python'], ['Python', 'React']),
                missingComponents: fc.constantFrom([], ['Projects section']),
                enhancedBullets: fc.constantFrom([], [{
                    original: 'worked on project',
                    improved: 'developed comprehensive project',
                    section: 'projects'
                }])
            }),
            async (edgeCaseData) => {
                // Should handle edge cases without crashing
                const analysis = new ResumeAnalysis({
                    ...edgeCaseData,
                    uploadTimestamp: new Date(),
                    processingTime: 1000,
                    aiServiceVersion: '1.0.0'
                });
                
                const savedAnalysis = await analysis.save();
                const retrievedAnalysis = await ResumeAnalysis.findById(savedAnalysis._id);
                
                // Basic integrity check
                expect(retrievedAnalysis).to.exist;
                expect(retrievedAnalysis.overallScore).to.be.a('number');
                expect(retrievedAnalysis.overallScore).to.be.at.least(0);
                expect(retrievedAnalysis.overallScore).to.be.at.most(100);
            }
        ), { numRuns: 10 });
    });
    
    it('should maintain data consistency across multiple operations', async function() {
        const testData = {
            uploadedFileName: 'test-resume.pdf',
            jobRole: 'software engineer',
            parsedText: 'Sample resume content with various sections',
            sections: {
                contactInfo: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '(555) 123-4567',
                    location: 'New York, NY'
                },
                education: 'Bachelor of Computer Science',
                skills: ['Python', 'JavaScript', 'React', 'Node.js'],
                experience: 'Senior Software Engineer with 5 years experience',
                projects: 'Built multiple web applications using modern frameworks',
                certifications: 'AWS Certified Solutions Architect'
            },
            overallScore: 85,
            scoreBreakdown: {
                structureScore: 90,
                skillsScore: 85,
                contentScore: 80,
                atsCompatibility: 85
            },
            issues: ['Add more quantifiable achievements', 'Include more technical skills'],
            suggestedKeywords: ['Docker', 'Kubernetes', 'Microservices'],
            missingComponents: ['Certifications section could be expanded'],
            enhancedBullets: [
                {
                    original: 'worked on web applications',
                    improved: 'developed and deployed scalable web applications serving 10,000+ users',
                    section: 'projects'
                }
            ],
            uploadTimestamp: new Date(),
            processingTime: 2500,
            aiServiceVersion: '1.0.0'
        };
        
        // Create analysis
        const analysis = new ResumeAnalysis(testData);
        const savedAnalysis = await analysis.save();
        
        // Update analysis
        savedAnalysis.overallScore = 90;
        savedAnalysis.issues.push('Consider adding more projects');
        const updatedAnalysis = await savedAnalysis.save();
        
        // Retrieve and verify
        const finalAnalysis = await ResumeAnalysis.findById(savedAnalysis._id);
        
        expect(finalAnalysis.overallScore).to.equal(90);
        expect(finalAnalysis.issues).to.include('Consider adding more projects');
        expect(finalAnalysis.sections.skills).to.deep.equal(testData.sections.skills);
        expect(finalAnalysis.enhancedBullets[0].original).to.equal(testData.enhancedBullets[0].original);
    });
    
    it('should handle concurrent access correctly', async function() {
        const baseData = {
            uploadedFileName: 'concurrent-test.pdf',
            jobRole: 'data scientist',
            parsedText: 'Test content for concurrent access',
            sections: {
                contactInfo: { name: 'Test User', email: 'test@example.com' },
                education: 'PhD in Data Science',
                skills: ['Python', 'R', 'Machine Learning'],
                experience: 'Data Scientist with research background',
                projects: 'Published research on ML algorithms',
                certifications: 'Google Cloud Certified'
            },
            overallScore: 75,
            scoreBreakdown: {
                structureScore: 80,
                skillsScore: 75,
                contentScore: 70,
                atsCompatibility: 75
            },
            issues: [],
            suggestedKeywords: ['TensorFlow', 'PyTorch'],
            missingComponents: [],
            enhancedBullets: [],
            uploadTimestamp: new Date(),
            processingTime: 3000,
            aiServiceVersion: '1.0.0'
        };
        
        // Create multiple analyses concurrently
        const promises = [];
        for (let i = 0; i < 5; i++) {
            const analysisData = {
                ...baseData,
                uploadedFileName: `concurrent-test-${i}.pdf`,
                overallScore: 75 + i
            };
            promises.push(new ResumeAnalysis(analysisData).save());
        }
        
        const savedAnalyses = await Promise.all(promises);
        
        // Verify all were saved correctly
        expect(savedAnalyses).to.have.lengthOf(5);
        for (let i = 0; i < 5; i++) {
            expect(savedAnalyses[i].uploadedFileName).to.equal(`concurrent-test-${i}.pdf`);
            expect(savedAnalyses[i].overallScore).to.equal(75 + i);
        }
        
        // Verify retrieval
        const retrievedAnalyses = await ResumeAnalysis.find({ 
            uploadedFileName: { $regex: /^concurrent-test-/ } 
        });
        expect(retrievedAnalyses).to.have.lengthOf(5);
    });
});