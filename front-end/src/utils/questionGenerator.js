/**
 * Generates contextually relevant interview questions from job details.
 * Since the backend doesn't expose a question-generation HTTP endpoint,
 * we derive questions from the job title and requirements using a
 * role-aware template system.
 */

const BEHAVIOURAL = [
  'Tell me about yourself and why you are excited about this role.',
  'Describe a challenging project you led and how you overcame obstacles.',
  'Give an example of a time you had to learn something new very quickly.',
  'How do you prioritise tasks when you have multiple competing deadlines?',
  'Describe a situation where you disagreed with a team member and how you resolved it.',
  'Tell me about a time you received critical feedback and how you handled it.',
  'What is your greatest professional achievement and what impact did it have?',
  'Describe a time you had to adapt quickly to a significant change at work.',
];

const TECHNICAL_TEMPLATES = {
  default: [
    'Walk me through your technical experience most relevant to this role.',
    'What tools and technologies do you use most effectively in your daily work?',
    'Describe your approach to troubleshooting a complex technical problem.',
    'How do you stay up to date with industry developments and best practices?',
  ],
  engineering: [
    'Explain how you design systems for scalability and maintainability.',
    'Describe your code review process and what you look for.',
    'How do you approach writing tests for new features?',
    'Tell me about a time you identified and fixed a production bug under pressure.',
  ],
  design: [
    'Walk me through your design process from discovery to delivery.',
    'How do you incorporate user research into your design decisions?',
    'Describe how you have balanced aesthetics with usability constraints.',
    'Tell me about a design you are most proud of and the problem it solved.',
  ],
  management: [
    'How do you build trust with a new team?',
    'Describe your approach to performance conversations.',
    'How do you align your team with company strategy?',
    'Tell me about a time a project went off track and how you recovered it.',
  ],
  sales: [
    'Walk me through your typical sales cycle from prospecting to close.',
    'How do you handle objections from prospects?',
    'Describe your most challenging deal and how you won it.',
    'What metrics do you use to measure your sales performance?',
  ],
  marketing: [
    'How do you develop a go-to-market strategy for a new product?',
    'Describe a campaign you led — goals, execution, and results.',
    'How do you use data to drive marketing decisions?',
    'Tell me about a time a campaign underperformed and what you learned.',
  ],
  data: [
    'Walk me through your process for cleaning and analysing a large dataset.',
    'How do you communicate data insights to non-technical stakeholders?',
    'Describe a time your analysis directly influenced a business decision.',
    'What are your go-to tools for data visualisation and why?',
  ],
};

const CLOSING = [
  'Where do you see yourself professionally in the next three to five years?',
  'What questions do you have for us about this role or the team?',
];

function detectCategory(title = '', requirements = '') {
  const text = `${title} ${requirements}`.toLowerCase();
  if (/engineer|developer|software|backend|frontend|full.?stack|devops|platform/.test(text)) return 'engineering';
  if (/design|ux|ui|product design|visual/.test(text)) return 'design';
  if (/manager|director|head of|vp of|lead/.test(text)) return 'management';
  if (/sales|account executive|business development|ae|sdr|bdr/.test(text)) return 'sales';
  if (/marketing|growth|content|seo|sem|brand/.test(text)) return 'marketing';
  if (/data|analyst|analytics|scientist|ml|machine learning/.test(text)) return 'data';
  return 'default';
}

function extractSkills(requirements = '') {
  return requirements
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && s.length < 40)
    .slice(0, 4);
}

/**
 * Generate a set of interview questions for a job.
 * @param {Object} job - { title, description, requirements }
 * @param {number} count - number of questions (default 6)
 * @returns {string[]}
 */
export function generateQuestions(job, count = 6) {
  const { title = '', description = '', requirements = '' } = job || {};
  const category = detectCategory(title, requirements);
  const skills = extractSkills(requirements);

  // Build skill-specific questions
  const skillQuestions = skills
    .map((skill) => `How have you specifically applied your ${skill} expertise in a professional context?`)
    .slice(0, 2);

  const techBank = TECHNICAL_TEMPLATES[category] || TECHNICAL_TEMPLATES.default;

  // Pool: 1 opener (behavioural) + 2 role-specific + 2 skill-based + 1 closer
  const pool = [
    BEHAVIOURAL[0],
    ...techBank.slice(0, 3),
    ...skillQuestions,
    ...BEHAVIOURAL.slice(1, 4),
    CLOSING[0],
  ];

  // De-duplicate and take `count` questions
  const unique = [...new Set(pool)];
  const selected = unique.slice(0, count);

  // Always end with a closing question if there is room
  if (selected.length >= count && !selected.includes(CLOSING[0])) {
    selected[selected.length - 1] = CLOSING[0];
  }

  return selected;
}
