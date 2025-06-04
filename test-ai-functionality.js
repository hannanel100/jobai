const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');

const prisma = new PrismaClient();

async function testAIFunctionality() {
  try {
    console.log('🧪 Testing AI Analysis Functionality');
    console.log('====================================');
    
    // 1. Check OpenAI connection
    console.log('\n1. Testing OpenAI Connection...');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    try {
      const models = await openai.models.list();
      console.log('✅ OpenAI connection successful');
      console.log(`📋 Available models: ${models.data.length} models found`);
    } catch (error) {
      console.log('❌ OpenAI connection failed:', error.message);
      return;
    }
    
    // 2. Check test resume data
    console.log('\n2. Checking Test Resume Data...');
    const testResumeId = 'cmbgy55xm0002oh9c0b176952';
    const resume = await prisma.resume.findUnique({
      where: { id: testResumeId },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true
      }
    });
    
    if (!resume) {
      console.log('❌ Test resume not found');
      return;
    }
    
    console.log('✅ Test resume found');
    console.log(`📄 Title: ${resume.title}`);
    console.log(`👤 User ID: ${resume.userId}`);
    console.log(`📝 Content available: ${resume.content ? 'Yes' : 'No'}`);
    
    if (resume.content && resume.content.text) {
      console.log(`📊 Content length: ${resume.content.text.length} characters`);
      console.log(`🔤 Word count: ${resume.content.wordCount || 'N/A'}`);
    }
    
    // 3. Test AI Analysis (Simple version)
    console.log('\n3. Testing AI Analysis...');
    try {
      const prompt = `Analyze this resume and provide a brief summary:

${resume.content.text}

Please provide:
1. A brief professional summary
2. Key strengths (2-3 points)
3. Areas for improvement (1-2 points)

Keep the response concise and professional.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert resume analyst. Provide concise, actionable feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const analysis = completion.choices[0].message.content;
      console.log('✅ AI Analysis successful');
      console.log('\n📋 Analysis Result:');
      console.log('==================');
      console.log(analysis);
      
      // 4. Test database storage
      console.log('\n4. Testing Database Storage...');
      const analysisRecord = await prisma.resumeAnalysis.create({
        data: {
          resumeId: testResumeId,
          userId: resume.userId,
          type: 'COMPREHENSIVE',
          analysis: {
            summary: analysis,
            testRun: true,
            timestamp: new Date().toISOString()
          }
        }
      });
      
      console.log('✅ Analysis stored in database');
      console.log(`💾 Analysis ID: ${analysisRecord.id}`);
      
    } catch (error) {
      console.log('❌ AI Analysis failed:', error.message);
    }
    
    console.log('\n🎉 AI Functionality Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAIFunctionality();
