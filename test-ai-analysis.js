const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAIAnalysis() {
  try {
    // Create or find the development user
    let user = await prisma.user.findUnique({
      where: { email: 'dev@test.com' },
    });

    if (!user) {
      console.log('Creating development user...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      user = await prisma.user.create({
        data: {
          email: 'dev@test.com',
          firstName: 'Dev',
          lastName: 'User',
          password: hashedPassword,
        },
      });
      console.log('Development user created:', user.email);
    } else {
      console.log('Using existing development user:', user.email);
    }

    // Check if we have any resumes with content for this user
    const resumes = await prisma.resume.findMany({
      where: {
        userId: user.id,
        content: {
          not: null,
        },
      },
      take: 1,
    });

    if (resumes.length === 0) {
      console.log('No resumes with content found. Creating a test resume...');

      // Create a test resume with sample content
      const testResume = await prisma.resume.create({
        data: {
          title: 'Test Resume for AI Analysis',
          fileName: 'test-resume.pdf',
          fileUrl: 'https://example.com/test-resume.pdf',
          fileSize: 1024,
          fileType: 'application/pdf',
          userId: user.id,
          content: {
            text: `John Doe
Software Engineer

EXPERIENCE
Senior Software Engineer at TechCorp (2020-2024)
- Developed and maintained web applications using React, Node.js, and PostgreSQL
- Led a team of 5 developers on multiple projects
- Improved application performance by 40% through code optimization
- Implemented CI/CD pipelines using Docker and Kubernetes

Software Engineer at StartupXYZ (2018-2020)  
- Built RESTful APIs using Express.js and MongoDB
- Collaborated with product team to deliver features on time
- Wrote comprehensive unit tests achieving 90% code coverage

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2014-2018)

SKILLS
- Programming Languages: JavaScript, Python, Java, TypeScript
- Frontend: React, Vue.js, HTML, CSS, Tailwind CSS
- Backend: Node.js, Express.js, Django, Spring Boot
- Databases: PostgreSQL, MongoDB, MySQL
- Tools: Git, Docker, Kubernetes, AWS, Jenkins

CERTIFICATIONS
- AWS Certified Solutions Architect
- Google Cloud Professional Developer`,
            metadata: {
              pages: 1,
              wordCount: 180,
              extractedAt: new Date().toISOString(),
            },
            wordCount: 180,
            extractedAt: new Date().toISOString(),
          },
        },
      });

      console.log('Created test resume:', testResume.title);

      // Now we can test the AI analysis
      console.log('\nTo test AI analysis:');
      console.log('1. Go to http://localhost:3001/dashboard/resumes');
      console.log('2. Click on the test resume');
      console.log('3. Go to the "AI Analysis" tab');
      console.log('4. Click "Analyze Resume" to test comprehensive analysis');
      console.log('5. Try job matching by entering a job description');
      console.log('6. Test optimization suggestions');
    } else {
      const resume = resumes[0];
      console.log('Found resume with content:', resume.title);
      console.log('Resume ID:', resume.id);
      console.log('\nTo test AI analysis:');
      console.log(
        `1. Go to http://localhost:3001/dashboard/resumes/${resume.id}`
      );
      console.log('2. Go to the "AI Analysis" tab');
      console.log('3. Click "Analyze Resume" to test comprehensive analysis');
      console.log('4. Try job matching by entering a job description');
      console.log('5. Test optimization suggestions');
    }

    // Check existing analyses
    const analyses = await prisma.resumeAnalysis.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    if (analyses.length > 0) {
      console.log('\nExisting analyses:');
      analyses.forEach((analysis, index) => {
        console.log(
          `${index + 1}. ${analysis.type} - Score: ${analysis.score || 'N/A'} - ${analysis.createdAt}`
        );
      });
    } else {
      console.log('\nNo existing analyses found.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAIAnalysis();
