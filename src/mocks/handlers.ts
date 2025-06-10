import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock OpenAI API
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              summary:
                'This is a well-structured resume with strong technical skills and relevant experience.',
              overallScore: 85,
              sections: {
                skills: 90,
                experience: 85,
                education: 80,
                format: 88,
                keywords: 82,
              },
              strengths: [
                'Strong technical skill set with modern technologies',
                'Relevant work experience in software development',
                'Clear and concise formatting',
              ],
              improvements: [
                'Add more specific achievements with quantifiable results',
                'Include more industry-specific keywords',
                'Expand on leadership and collaboration experience',
              ],
              atsScore: 88,
              atsIssues: [
                'Consider using more standard section headings',
                'Add more keywords related to the target job description',
              ],
              recommendations: [
                'Quantify achievements with specific numbers and percentages',
                'Add a professional summary section',
                'Include relevant certifications if available',
              ],
            }),
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300,
      },
    });
  }),

  // Mock job matching analysis
  http.post('https://api.openai.com/v1/chat/completions', ({ request }) => {
    const isJobMatching = request.url.includes('job-match');

    if (isJobMatching) {
      return HttpResponse.json({
        id: 'chatcmpl-job-match',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: JSON.stringify({
                summary:
                  'Good match with room for improvement in specific areas.',
                matchScore: 78,
                skillsMatch: 85,
                experienceMatch: 75,
                educationMatch: 80,
                keywordMatch: 70,
                strengthsAlignment: [
                  'Strong programming skills match job requirements',
                  'Relevant experience in web development',
                  'Educational background aligns with technical needs',
                ],
                gaps: [
                  'Limited experience with specific framework mentioned in job',
                  'Missing some preferred certifications',
                  'Could highlight more relevant project experience',
                ],
                recommendations: [
                  'Emphasize experience with React and TypeScript',
                  'Add more details about team collaboration',
                  'Include any relevant side projects or contributions',
                ],
                improvementPotential: 15,
              }),
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 150,
          completion_tokens: 180,
          total_tokens: 330,
        },
      });
    }

    // Default comprehensive analysis response
    return HttpResponse.json({
      id: 'chatcmpl-comprehensive',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              summary: 'Professional resume with strong technical foundation.',
              overallScore: 82,
              sections: {
                skills: 88,
                experience: 80,
                education: 85,
                format: 90,
                keywords: 75,
              },
              strengths: [
                'Well-organized structure and formatting',
                'Comprehensive technical skill set',
                'Relevant educational background',
              ],
              improvements: [
                'Add more quantified achievements',
                'Include leadership experience',
                'Expand on recent projects',
              ],
              atsScore: 85,
              atsIssues: [
                'Use more standard section headings',
                'Increase keyword density for target roles',
              ],
              recommendations: [
                'Add metrics to demonstrate impact',
                'Include a professional summary',
                'Consider adding relevant certifications',
              ],
            }),
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 120,
        completion_tokens: 160,
        total_tokens: 280,
      },
    });
  }),

  // Mock optimization suggestions
  http.post('https://api.openai.com/v1/chat/completions', ({ request }) => {
    const isOptimization = request.url.includes('optimize');

    if (isOptimization) {
      return HttpResponse.json({
        id: 'chatcmpl-optimize',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: JSON.stringify({
                summary:
                  'Here are specific optimization recommendations for your resume.',
                topSkills: [
                  'React and TypeScript development',
                  'Full-stack web development',
                  'Database design and optimization',
                  'API development and integration',
                  'Agile development methodologies',
                ],
                improvements: [
                  'Replace generic descriptions with specific achievements',
                  'Add quantifiable metrics to demonstrate impact',
                  'Include relevant industry keywords',
                  'Optimize formatting for ATS compatibility',
                  'Strengthen professional summary section',
                ],
                tips: [
                  'Use action verbs to start bullet points',
                  'Include relevant certifications and training',
                  'Tailor content to specific job descriptions',
                  'Keep consistent formatting throughout',
                  'Proofread for grammar and spelling errors',
                ],
                formattingTips: [
                  'Use consistent bullet point styles',
                  'Maintain proper spacing and margins',
                  'Choose ATS-friendly fonts',
                  'Use clear section headings',
                  'Keep file in PDF format for consistency',
                ],
                contentSuggestions: [
                  'Add a compelling professional summary',
                  'Include relevant technical projects',
                  'Highlight collaborative achievements',
                  'Mention specific technologies and tools',
                  'Include any relevant publications or presentations',
                ],
              }),
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 140,
          completion_tokens: 200,
          total_tokens: 340,
        },
      });
    }

    // Fallback to comprehensive analysis
    return HttpResponse.json({
      id: 'chatcmpl-fallback',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              summary: 'Mock AI analysis completed successfully.',
              score: 80,
              suggestions: ['Mock suggestion for testing'],
            }),
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    });
  }),

  // Mock UploadThing API
  http.post(/uploadthing\.com\/api/, () => {
    return HttpResponse.json({
      data: [
        {
          name: 'test-resume.pdf',
          size: 1024 * 1024, // 1MB
          key: 'test-file-key-123',
          url: 'https://utfs.io/f/test-file-key-123',
          type: 'application/pdf',
        },
      ],
    });
  }),

  // Mock rate limit status
  http.get('/api/rate-limit', () => {
    return HttpResponse.json({
      remaining: 50,
      limit: 100,
      resetTime: Date.now() + 3600000, // 1 hour from now
    });
  }),
];
