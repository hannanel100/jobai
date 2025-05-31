const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugResumeContent() {
  try {
    const resumes = await prisma.resume.findMany({
      select: {
        id: true,
        title: true,
        fileName: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log('Recent resumes:');
    resumes.forEach((resume, index) => {
      console.log(`\n--- Resume ${index + 1} ---`);
      console.log('ID:', resume.id);
      console.log('Title:', resume.title);
      console.log('Filename:', resume.fileName);
      console.log('Content type:', typeof resume.content);
      console.log('Content:', JSON.stringify(resume.content, null, 2));
      console.log('Created:', resume.createdAt);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugResumeContent();
