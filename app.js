/* ============================================================
   EmpowerAll — Application Logic
   Router, Modules, Forms, Quizzes, Uploads, Animations
   ============================================================ */

// ============================================================
// API CONFIGURATION — Configured from config.js
// ============================================================
const YOUTUBE_API_KEY = window.CONFIG?.YOUTUBE_API_KEY || '';

// ============================================================
// N8N WEBHOOK CONFIGURATION
// ============================================================
const N8N_WEBHOOK_URL = window.CONFIG?.N8N_WEBHOOK_URL || '';

/**
 * callN8nWebhook() — Universal AI call via N8N Webhook.
 * Passes query and context to N8N to trigger specific chatbots.
 */
async function callN8nWebhook(query, contextType) {
  let webhookUrl = '';
  
  if (contextType === 'legal_advisor') webhookUrl = window.CONFIG.N8N_WEBHOOK_LEGAL;
  else if (contextType === 'skill_course_quiz') webhookUrl = window.CONFIG.N8N_WEBHOOK_QUIZ;
  else if (contextType === 'skill_course') webhookUrl = window.CONFIG.N8N_WEBHOOK_SKILLS;
  else if (contextType === 'voice_assistant') webhookUrl = window.CONFIG.N8N_WEBHOOK_VOICE;
  else webhookUrl = window.CONFIG.N8N_WEBHOOK_HOME; // Default or 'home'

  if (!webhookUrl || webhookUrl.includes('YOUR_N8N_WEBHOOK_URL_HERE')) {
    return { content: null, source: null, error: `Webhook URL for ${contextType} is not configured in config.js` };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        context: contextType
      })
    });

    if (res.ok) {
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        data = rawText;
      }
      
      // Attempt to extract the response depending on how N8N formats it.
      // N8N most commonly returns [{output: "...quiz text..."}]
      let content = null;
      if (typeof data === 'string') {
        content = data;
      } else if (Array.isArray(data) && data.length > 0) {
        // MOST COMMON N8N FORMAT: [{output: "..."}]
        const first = data[0];
        if (typeof first === 'string') {
          content = first;
        } else if (first && typeof first === 'object') {
          content = first.output || first.text || first.data || first.content || first.message || JSON.stringify(first);
        }
      } else if (data && typeof data === 'object') {
        if (data.output) {
          content = typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
        } else if (data.content) {
          content = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
        } else if (data.data) {
          content = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
        } else if (data.text) {
          content = typeof data.text === 'string' ? data.text : JSON.stringify(data.text);
        } else {
          content = JSON.stringify(data);
        }
      }

      if (content) {
        console.log(`✅ N8N Webhook responded successfully for context: ${contextType}`);
        return { content, source: `N8N Webhook`, error: null };
      }
    } else {
      const errData = await res.text();
      console.warn(`N8N Webhook error ${res.status}: ${errData}`);
      return { content: null, source: null, error: `HTTP ${res.status}: ${errData}` };
    }
  } catch (e) {
    console.warn(`N8N Webhook network error:`, e.message);
    return { content: null, source: null, error: e.message };
  }

  return { content: null, source: null, error: 'Empty response from N8N Webhook' };
}

// ============================================================
// DATA: India-Specific Rights Modules
// ============================================================

const rightsModules = [
  {
    id: 'hr-1',
    title: 'Fundamental Rights (Articles 14–32)',
    description: 'The backbone of Indian democracy — your constitutionally guaranteed freedoms that no government can take away.',
    icon: 'shield',
    color: 'purple',
    progress: 0,
    videoUrl: '',
    videoTitle: 'Understanding Fundamental Rights',
    questions: [
      {
        q: 'What are the Fundamental Rights in the Indian Constitution?',
        a: 'The Indian Constitution guarantees 6 Fundamental Rights under Part III (Articles 14–32): (1) Right to Equality (Art. 14–18) — equal treatment before law, prohibition of discrimination on grounds of religion, race, caste, sex, or place of birth, abolition of untouchability. (2) Right to Freedom (Art. 19–22) — freedom of speech, assembly, association, movement, residence, and profession. (3) Right Against Exploitation (Art. 23–24) — prohibition of human trafficking, forced labour, and child labour under 14. (4) Right to Freedom of Religion (Art. 25–28). (5) Cultural & Educational Rights (Art. 29–30) — protection of minorities. (6) Right to Constitutional Remedies (Art. 32) — the right to approach the Supreme Court directly if any fundamental right is violated.'
      },
      {
        q: 'What is Article 21 and why is it the most powerful right?',
        a: 'Article 21 states: "No person shall be deprived of his life or personal liberty except according to procedure established by law." The Supreme Court has expanded this to include: Right to live with dignity, Right to clean environment, Right to livelihood, Right to privacy (Puttaswamy case, 2017), Right to shelter, Right to health, Right to education (now Art. 21A), Right to legal aid, Right to speedy trial, and Right against solitary confinement. If any of these are violated, you can file a writ petition under Article 32 (Supreme Court) or Article 226 (High Court).'
      },
      {
        q: 'How can you enforce your Fundamental Rights?',
        a: 'Article 32 is called the "Heart and Soul" of the Constitution (Dr. B.R. Ambedkar). You can file 5 types of writs: (1) Habeas Corpus — if someone is illegally detained. (2) Mandamus — to order a government official to perform their duty. (3) Prohibition — to stop a lower court from exceeding its jurisdiction. (4) Certiorari — to quash an order of a lower court. (5) Quo Warranto — to question the authority of a person holding public office. These can be filed in the Supreme Court (Art. 32) or High Court (Art. 226). No court fees are required for fundamental rights cases and you can even send a letter/postcard to the court.'
      },
      {
        q: 'What is the Right to Equality and how does it protect against caste discrimination?',
        a: 'Articles 14–18 guarantee: Article 14 — Equality before law and equal protection of laws. Article 15 — Prohibition of discrimination on grounds of religion, race, caste, sex, or place of birth. Article 16 — Equal opportunity in public employment. Article 17 — Abolition of "Untouchability" — practicing untouchability in ANY form is a punishable offence under the Protection of Civil Rights Act, 1955 and SC/ST (Prevention of Atrocities) Act, 1989. Article 18 — Abolition of titles. If you face caste-based discrimination, you can: file an FIR under the SC/ST Act (police MUST register it), complain to the National Commission for Scheduled Castes, or file a writ petition.'
      }
    ]
  },
  {
    id: 'hr-2',
    title: 'Consumer Protection Act, 2019',
    description: 'Your rights as a consumer in India — how to fight fraud, file complaints, and get justice for defective products or services.',
    icon: 'scale',
    color: 'blue',
    progress: 0,
    videoUrl: '',
    videoTitle: 'Consumer Rights Overview',
    questions: [
      {
        q: 'What are your 6 Consumer Rights under Indian law?',
        a: 'The Consumer Protection Act, 2019 guarantees: (1) Right to Safety — protection against hazardous goods/services. (2) Right to be Informed — full disclosure about quality, quantity, potency, purity, price. (3) Right to Choose — access to a variety of products at competitive prices. (4) Right to be Heard — your complaint must be heard at consumer forums. (5) Right to Seek Redressal — compensation for unfair trade practices. (6) Right to Consumer Education — awareness about rights. These apply to ALL goods and services including e-commerce, online shopping, and digital services.'
      },
      {
        q: 'How do you file a consumer complaint in India?',
        a: 'You can file complaints at 3 levels based on the claim amount: (1) District Commission — claims up to ₹1 crore. (2) State Commission — ₹1 crore to ₹10 crore. (3) National Commission — above ₹10 crore. Filing process: You can file ONLINE at consumerhelpline.gov.in or edaakhil.nic.in. No lawyer is needed — you can argue your own case! Documents needed: bill/receipt, product details, proof of defect, communication with seller. Time limit: File within 2 years of the cause of action. Helpline: Call 1800-11-4000 (toll-free National Consumer Helpline).'
      },
      {
        q: 'What are your rights in e-commerce and online shopping?',
        a: 'Under the Consumer Protection (E-Commerce) Rules, 2020: Every e-commerce platform MUST display: seller details, return/refund/exchange policy, grievance officer details, total price breakdown. Your rights: 14-day return policy for most products, full refund if product is defective or not as described, no seller can refuse to take back defective goods, platform is liable if it doesn\'t resolve complaints within 30 days. For complaints: First contact the platform\'s grievance officer. If not resolved in 30 days, file at consumerhelpline.gov.in.'
      },
      {
        q: 'What is unfair trade practice and what can you do about it?',
        a: 'Unfair trade practices include: false or misleading advertisements, bait-and-switch tactics, hidden charges, selling goods without proper MRP labelling, not honouring warranty/guarantee, charging above MRP (it\'s illegal — MRP is the MAXIMUM price). What you can do: (1) Take a photo/screenshot of the violation. (2) File complaint at the Consumer Forum. (3) Report misleading ads to ASCI (Advertising Standards Council of India). (4) Report MRP violations to the Legal Metrology Department. Penalties: Courts can award compensation, refund, replacement, and even punitive damages.'
      }
    ]
  },
  {
    id: 'hr-3',
    title: 'Right to Information (RTI) Act, 2005',
    description: 'The most powerful transparency tool — how any Indian citizen can demand information from any government body.',
    icon: 'users',
    color: 'warm',
    progress: 0,
    videoUrl: '',
    videoTitle: 'The Power of RTI',
    questions: [
      {
        q: 'What is the RTI Act and who can use it?',
        a: 'The Right to Information Act, 2005 empowers EVERY Indian citizen to request information from any public authority (Central, State, or Local government body). You can ask for: copies of documents, inspection of records, certified samples of material, information in electronic form. Applies to: All government departments, PSUs, courts, police, municipalities, panchayats, and even private bodies that receive government funding. You do NOT need to give any reason for seeking information. The authority CANNOT ask why you want it.'
      },
      {
        q: 'How do you file an RTI application?',
        a: 'Step 1: Write a simple application addressed to the Public Information Officer (PIO) of the relevant department. Step 2: Pay ₹10 as application fee (BPL families are exempt). Step 3: Submit by post, in person, or ONLINE at rtionline.gov.in (for Central Government). State RTI portals are also available. The PIO MUST reply within 30 days (48 hours if it concerns life/liberty). If no reply or unsatisfactory reply: File First Appeal to the Appellate Authority (within 30 days). If still not satisfied: File Second Appeal to the Information Commission (within 90 days). Penalty: PIO can be fined ₹250/day (up to ₹25,000) for delays or denials.'
      },
      {
        q: 'What information can you NOT get under RTI?',
        a: 'Section 8 lists exemptions: (1) Information affecting sovereignty, security, or strategic interests. (2) Information expressly forbidden by courts. (3) Information that would cause breach of parliamentary privilege. (4) Commercial confidence, trade secrets (unless larger public interest). (5) Information received in fiduciary relationship. (6) Information from foreign governments. (7) Information that would endanger life or safety. (8) Cabinet papers. (9) Personal information with no public interest. HOWEVER: Section 8(2) says if the public interest in disclosure outweighs harm, the information SHALL be provided. Also, information relating to corruption or human rights violations MUST be disclosed.'
      },
      {
        q: 'Real-life examples of RTI changing lives in India?',
        a: 'RTI has been used to: expose the Adarsh Housing Society scam in Mumbai, uncover irregularities in MGNREGA wage payments (villagers got their pending wages), reveal illegal constructions approved by municipal bodies, get birth/death certificates issued within days instead of months, force hospitals to display rates for procedures, expose fake teachers in government schools, check status of pending government applications, and verify if road construction funds were actually spent. Tips: Be specific in your question, ask for records/documents (not opinions), keep copies of everything, and follow up with appeals if needed.'
      }
    ]
  },
  {
    id: 'hr-4',
    title: 'Protection of Women — Laws & Rights',
    description: 'Comprehensive legal protections for women in India — from workplace harassment to domestic violence and beyond.',
    icon: 'child',
    color: 'green',
    progress: 0,
    videoUrl: '',
    videoTitle: "Women's Rights in India",
    questions: [
      {
        q: 'What legal protections exist against domestic violence?',
        a: 'The Protection of Women from Domestic Violence Act, 2005 covers: physical, emotional, verbal, sexual, and economic abuse. It protects not just wives but ALL women in a domestic relationship (mothers, sisters, daughters, live-in partners). Rights: (1) Right to reside in the shared household — husband CANNOT throw you out. (2) Protection orders — court can restrain the abuser. (3) Residence orders — exclusive right to live in shared home. (4) Monetary relief — maintenance, medical expenses, loss of earnings. (5) Custody orders — temporary custody of children. How to file: approach the Protection Officer, Magistrate court, or call Women Helpline 181 (toll-free, 24/7). You can also go to any police station — they MUST register your complaint.'
      },
      {
        q: 'What is the POSH Act and how does it protect against workplace harassment?',
        a: 'The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (POSH Act): Applies to ALL workplaces — offices, factories, hospitals, schools, sports institutions, and even homes where domestic workers are employed. Sexual harassment includes: physical contact, demand for sexual favours, sexually coloured remarks, showing pornography, any unwelcome sexual conduct. Every organization with 10+ employees MUST have an Internal Complaints Committee (ICC). Filing a complaint: Written complaint to ICC within 3 months of incident. ICC must complete inquiry within 90 days. If your workplace doesn\'t have an ICC, complain to the Local Complaints Committee at the District level.'
      },
      {
        q: 'What are the laws against dowry in India?',
        a: 'Dowry Prohibition Act, 1961: Giving or taking dowry is a criminal offence — punishment: minimum 5 years imprisonment + fine. Section 498A IPC: Cruelty by husband or relatives for dowry — punishment: up to 3 years imprisonment. Section 304B IPC: Dowry death — if a woman dies within 7 years of marriage under abnormal circumstances and there is evidence of dowry harassment, it is presumed to be a dowry death. Punishment: minimum 7 years to life imprisonment. What to do: File FIR at the nearest police station (police MUST register it), contact Women Helpline 181, approach the National/State Commission for Women, or contact any women\'s rights NGO.'
      },
      {
        q: 'What emergency helplines and support services are available for women?',
        a: 'Emergency helplines: 181 — Women Helpline (24/7, toll-free, all states). 112 — Emergency Response (like 911). 1091 — Women in distress. 1098 — Childline (for girls under 18). Online: NCW complaint portal at ncw.nic.in. One Stop Centres (Sakhi Centres): Available in every district — provide medical, legal, psychological support and temporary shelter under one roof. Free legal aid: Available through District Legal Services Authority — any woman can get a FREE lawyer. Mahila Police Volunteers: Women volunteers at police stations to help women file complaints comfortably.'
      }
    ]
  },
  {
    id: 'hr-5',
    title: 'Child Rights & POCSO Act',
    description: 'Every child in India deserves protection — understand the laws that shield children from exploitation, abuse, and neglect.',
    icon: 'globe',
    color: 'rose',
    progress: 0,
    videoUrl: '',
    videoTitle: 'Child Rights & Protection laws',
    questions: [
      {
        q: 'What is the POCSO Act and how does it protect children?',
        a: 'The Protection of Children from Sexual Offences (POCSO) Act, 2012 is India\'s strongest law for child protection. Key features: Covers ALL children under 18 years (both boys and girls). Defines sexual assault, sexual harassment, and use of children for pornography. Provides for SPECIAL courts for speedy trial. Trial must be completed within 1 year. Child\'s identity is kept confidential. Child-friendly procedures — child can have a support person, questions are asked in simple language. Punishments: Penetrative sexual assault — minimum 10 years to life. Aggravated assault — minimum 20 years to life. Using child for pornography — 5 years to life. Reporting: ANY person who knows of child abuse MUST report it — failure to report is a punishable offence. Call Childline 1098 (24/7, toll-free).'
      },
      {
        q: 'What is the Right to Education (RTE) Act?',
        a: 'The Right of Children to Free and Compulsory Education Act, 2009 (Article 21A): Every child aged 6–14 has the RIGHT to free and compulsory education in a neighbourhood school. Key provisions: NO child can be denied admission for lack of documents or late admission. NO child can be held back, expelled, or required to pass a board exam until Class 8. 25% seats in private schools must be reserved for children from weaker sections and disadvantaged groups (with fees reimbursed by the government). Schools must maintain minimum pupil-teacher ratios. No physical punishment or mental harassment. No capitation fees or screening of children/parents. If your child is denied admission: Complain to the local authority or file in the National Commission for Protection of Child Rights (NCPCR).'
      },
      {
        q: 'What are the child labour laws in India?',
        a: 'The Child and Adolescent Labour (Prohibition and Regulation) Act, 1986 (amended 2016): Complete prohibition of child labour (under 14) in ALL occupations and processes. Adolescents (14–18) are prohibited from working in hazardous occupations. Exceptions: Children can help in family business or as child artists (with conditions). Penalties: Employer hiring a child — imprisonment 6 months to 2 years + fine ₹20,000 to ₹50,000. Repeat offence — 1 to 3 years. Parents are exempt from punishment for first offence. Where to report: Childline 1098, District Magistrate, Labour Inspector, National Commission for Protection of Child Rights (NCPCR) at ncpcr.gov.in, or the nearest police station.'
      },
      {
        q: 'What is the Juvenile Justice (JJ) Act?',
        a: 'The Juvenile Justice (Care and Protection of Children) Act, 2015: Covers two categories: (1) Children in Conflict with Law (CCL) — children who have committed offences. (2) Children in Need of Care and Protection (CNCP) — orphans, abandoned, abused children. Key features: Juvenile Justice Boards handle CCL cases with a child-friendly approach. Child Welfare Committees (CWC) handle CNCP cases in every district. Adoption: Regulated under this Act through CARA (Central Adoption Resource Authority). Foster care and sponsorship programs for children. For abandoned/orphaned children: Contact the nearest CWC, Childline 1098, or any police station. They MUST produce the child before the CWC within 24 hours.'
      }
    ]
  }
];

const skillCourses = [
  {
    id: 'sc-1',
    title: 'Digital Literacy Basics',
    description: 'Learn essential computer and internet skills to navigate the digital world with confidence.',
    icon: 'monitor',
    color: 'blue',
    progress: 0,
    videoUrl: 'https://youtu.be/8fCQ_ZuL2TY?si=ORJkgXKzzkh7Zfn5',
    videoTitle: 'Introduction to Digital Literacy',
    questions: [
      { q: 'What is a web browser?', options: ['A program to create documents', 'A program to access the internet', 'A program to edit photos', 'A program to play music'], correct: 1 },
      { q: 'What does "URL" stand for?', options: ['Universal Resource Locator', 'Uniform Resource Locator', 'United Resource Link', 'Universal Reference Library'], correct: 1 },
      { q: 'What is the purpose of a search engine?', options: ['To create websites', 'To find information on the internet', 'To send emails', 'To make phone calls'], correct: 1 },
      { q: 'Which of the following is a strong password?', options: ['password123', '12345678', 'MyD0g$Name!2024', 'abcdefgh'], correct: 2 }
    ]
  },
  {
    id: 'sc-2',
    title: 'Financial Awareness',
    description: 'Understand basic financial concepts, budgeting, savings, and how to protect yourself from financial fraud.',
    icon: 'wallet',
    color: 'green',
    progress: 0,
    videoUrl: 'https://youtu.be/kbYzVFkfCow?si=sD21N2ADy1XZ8jQ5',
    videoTitle: 'Introduction to Financial Literacy',
    questions: [
      { q: 'What is a budget?', options: ['A type of bank account', 'A plan for how to spend and save money', 'A government tax', 'A type of loan'], correct: 1 },
      { q: 'Why is saving important?', options: ['To impress others', 'To have money for emergencies and future goals', 'It is not important', 'To avoid spending'], correct: 1 },
      { q: 'What is compound interest?', options: ['Interest on the original amount only', 'Interest on both the original amount and accumulated interest', 'A type of tax', 'A bank fee'], correct: 1 },
      { q: 'How can you protect yourself from financial fraud?', options: ['Share your PIN with friends', 'Never check your bank statements', 'Verify sources before sharing personal info', 'Click on all email links'], correct: 2 }
    ]
  },
  {
    id: 'sc-3',
    title: 'Communication Skills',
    description: 'Master the art of effective communication — speaking, listening, writing, and connecting with others.',
    icon: 'message',
    color: 'warm',
    progress: 0,
    videoUrl: 'https://youtu.be/HAnw168huqA?si=_a7VEIdixJawfStY',
    videoTitle: 'Effective Communication 101',
    questions: [
      { q: 'What is active listening?', options: ['Hearing without paying attention', 'Fully concentrating on what is being said', 'Talking over others', 'Reading while someone talks'], correct: 1 },
      { q: 'Which is an example of non-verbal communication?', options: ['Writing an email', 'Making eye contact', 'Sending a text message', 'Making a phone call'], correct: 1 },
      { q: 'What makes communication effective?', options: ['Using complex words', 'Being clear, concise, and respectful', 'Speaking loudly', 'Avoiding feedback'], correct: 1 },
      { q: 'How can you improve your public speaking?', options: ['Avoid practicing', 'Practice regularly and seek feedback', 'Memorize everything word-for-word', 'Never make eye contact'], correct: 1 }
    ]
  },
  {
    id: 'sc-4',
    title: 'Health & Wellness',
    description: 'Learn about physical health, mental wellness, nutrition, and how to take care of yourself and your family.',
    icon: 'heart',
    color: 'rose',
    progress: 0,
    videoUrl: 'https://youtu.be/cb5fmH5ffTE?si=gMh2xLvq3Ax1k3DC',
    videoTitle: 'Health & Wellness Fundamentals',
    questions: [
      { q: 'How much water should an average adult drink daily?', options: ['1 glass', '2-3 liters', '5 liters', 'Only when thirsty'], correct: 1 },
      { q: 'What is mental health?', options: ['Only about mental illness', 'Our emotional, psychological, and social well-being', 'Something only adults deal with', 'Not important'], correct: 1 },
      { q: 'Why is regular exercise important?', options: ['Only for weight loss', 'It improves both physical and mental health', 'It is not necessary', 'Only for athletes'], correct: 1 },
      { q: 'What should you do if you feel persistently sad or anxious?', options: ['Ignore it', 'Talk to a trusted person or seek professional help', 'Stay alone', 'It will go away on its own'], correct: 1 }
    ]
  },
  {
    id: 'sc-5',
    title: 'Environmental Awareness',
    description: 'Understand our responsibility to protect the planet — sustainability, conservation, and eco-friendly living.',
    icon: 'leaf',
    color: 'green',
    progress: 0,
    videoUrl: 'https://youtu.be/B_bbeGiqPOU?si=J2JmWmtr5dBxT_6M',
    videoTitle: 'Environmental Awareness & Action',
    questions: [
      { q: 'What is climate change?', options: ['Daily weather changes', 'Long-term shifts in global temperatures and weather patterns', 'A seasonal change', 'It doesn\'t exist'], correct: 1 },
      { q: 'What are the 3 R\'s of sustainability?', options: ['Read, Run, Rest', 'Reduce, Reuse, Recycle', 'React, Respond, Retreat', 'Research, Report, Review'], correct: 1 },
      { q: 'How does planting trees help the environment?', options: ['It doesn\'t help much', 'Trees absorb CO2 and produce oxygen', 'Trees only provide shade', 'Planting trees is too expensive'], correct: 1 },
      { q: 'What can individuals do to reduce their carbon footprint?', options: ['Nothing, it\'s only up to governments', 'Use public transport, reduce waste, conserve energy', 'Buy more products', 'Carbon footprint doesn\'t matter'], correct: 1 }
    ]
  }
];

// ============================================================
// ICON SVGs (Reusable)
// ============================================================
const icons = {
  shield: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',
  scale: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  child: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21c0-4.14 2.91-7.5 6.5-7.5s6.5 3.36 6.5 7.5"/></svg>',
  globe: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  monitor: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>',
  wallet: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
  message: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  leaf: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
  chevronDown: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  arrowRight: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
  clipboard: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
};

// ============================================================
// NAVIGATION / ROUTER
// ============================================================

function navigateTo(page) {
  // Update URL hash
  window.location.hash = page;
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const pages = document.querySelectorAll('.page');
  const links = document.querySelectorAll('.nav-link');

  pages.forEach(p => p.classList.remove('active'));
  links.forEach(l => l.classList.remove('active'));

  const targetPage = document.getElementById(`page-${hash}`);
  const targetLink = document.querySelector(`[data-page="${hash}"]`);

  if (targetPage) {
    targetPage.classList.add('active');
    // Re-trigger animations
    targetPage.style.animation = 'none';
    targetPage.offsetHeight; // Trigger reflow
    targetPage.style.animation = '';
  }
  if (targetLink) targetLink.classList.add('active');

  // Close mobile menu
  const navLinks = document.getElementById('nav-links');
  const mobileToggle = document.getElementById('mobile-toggle');
  navLinks.classList.remove('open');
  mobileToggle.classList.remove('open');
  mobileToggle.setAttribute('aria-expanded', 'false');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Manage FAB visibility
  const fab = document.getElementById('add-course-fab');
  if (fab) {
    if (hash === 'courses') {
      fab.style.display = 'flex';
    } else {
      fab.style.display = 'none';
    }
  }

  // Re-init scroll reveals for new page
  initScrollReveal();

  // Hide chatbot on specific pages
  const chatbotWidget = document.getElementById('chatbot-widget');
  if (chatbotWidget) {
    if (hash === 'voice' || hash === 'kindness' || hash === 'profile') {
      chatbotWidget.style.display = 'none';
    } else {
      chatbotWidget.style.display = 'block';
    }
  }
}

// Listen for hash changes
window.addEventListener('hashchange', handleRoute);

function openCourseModal() {
  const modal = document.getElementById('course-adder-modal');
  if (modal) modal.style.display = 'flex';
  document.getElementById('yt-finder-form').style.display = 'block';
  document.getElementById('yt-finder-results').style.display = 'none';
  document.getElementById('yt-finder-loading').style.display = 'none';
  document.getElementById('yt-preview-screen').style.display = 'none';
  document.body.style.overflow = 'hidden';
}

function closeCourseModal() {
  const modal = document.getElementById('course-adder-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Nav link clicks
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    if (link.dataset.page) {
      e.preventDefault();
      navigateTo(link.dataset.page);
    }
  });
  link.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && link.dataset.page) {
      e.preventDefault();
      navigateTo(link.dataset.page);
    }
  });
});

// Brand click → home
document.getElementById('nav-brand').addEventListener('click', () => navigateTo('home'));
document.getElementById('nav-brand').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') navigateTo('home');
});

// Mobile toggle
document.getElementById('mobile-toggle').addEventListener('click', () => {
  const navLinks = document.getElementById('nav-links');
  const toggle = document.getElementById('mobile-toggle');
  navLinks.classList.toggle('open');
  toggle.classList.toggle('open');
  toggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ============================================================
// SCROLL REVEAL (IntersectionObserver)
// ============================================================

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => {
    // Reset for re-animation
    el.classList.remove('visible');
    observer.observe(el);
  });
}

// ============================================================
// ANIMATED COUNTERS (Home Page)
// ============================================================

function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(target * eased).toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = target.toLocaleString() + '+';
      }
    }

    // Start when visible
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(update);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(counter);
  });
}

// ============================================================
// RIGHTS MODULE CARDS
// ============================================================

function renderRightsCards() {
  const container = document.getElementById('rights-cards');
  let html = rightsModules.map((mod, i) => `
    <div class="card reveal reveal-delay-${i + 1}" onclick="openRightsModule('${mod.id}')" tabindex="0" role="button" aria-label="Open ${mod.title} module" onkeydown="if(event.key==='Enter')openRightsModule('${mod.id}')">
      <div class="card-icon-wrap ${mod.color}">
        ${icons[mod.icon]}
      </div>
      <h3>${mod.title}</h3>
      <p>${mod.description}</p>
      <div class="card-footer">
        <div class="card-progress">
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${mod.progress}%" id="progress-${mod.id}"></div>
          </div>
          <span id="progress-text-${mod.id}">${mod.progress}%</span>
        </div>
        <div class="card-arrow">
          ${icons.arrowRight}
        </div>
      </div>
    </div>
  `).join('');
  
  const savedAIModules = JSON.parse(localStorage.getItem('empowerall_ai_rights_modules') || '[]');
  if (savedAIModules.length > 0) {
    html += `
      <div style="grid-column: 1 / -1; width: 100%; margin-top: var(--space-xl); margin-bottom: var(--space-md);">
        <h2 style="font-size: var(--fs-xl); font-weight: 800; border-bottom: 2px solid var(--border-light); padding-bottom: var(--space-xs); margin-bottom: var(--space-md); color: var(--primary);">Your Custom Legal Modules</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md);">
          ${savedAIModules.map((mod, i) => `
            <div class="card reveal reveal-delay-${(i % 5) + 1}" onclick="openAICustomRightsModule('${mod.id}')" style="background: var(--surface-hover); border: 1px solid var(--border); box-shadow: none;">
              <div class="card-icon-wrap primary" style="background: rgba(var(--primary-rgb), 0.1); color: var(--primary);">
                ${icons.sparkles || icons.shield}
              </div>
              <h3 style="font-size: 1.1rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.8em;">${mod.title}</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">AI Generated Module • Completed</p>
              <div class="card-footer" style="margin-top: auto; padding-top: 12px;">
                <span style="color: var(--primary); font-size: 0.85rem; font-weight: 600;">100% Mastered</span>
                <div class="card-arrow" style="background: var(--primary); color: white;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
  initScrollReveal();
}

window.openAICustomRightsModule = function(id) {
  const savedAIModules = JSON.parse(localStorage.getItem('empowerall_ai_rights_modules') || '[]');
  const mod = savedAIModules.find(m => m.id === id);
  if (mod) {
    openAILegalModuleInModal(mod.title, mod.chapters, null);
  }
};

function openRightsModule(id) {
  if (!isAuthenticated()) {
    openAuthModal();
    return;
  }
  const mod = rightsModules.find(m => m.id === id);
  if (!mod) return;

  document.getElementById('module-title').textContent = mod.title;
  document.getElementById('module-description').textContent = mod.description;

  const body = document.getElementById('module-body');
  body.innerHTML = `
    <div class="qa-section">
      <h3>${icons.sparkles} Knowledge Q&A</h3>
      ${mod.questions.map((qa, i) => `
        <div class="qa-item" id="qa-${id}-${i}">
          <button class="qa-question" onclick="toggleQA('${id}', ${i})" aria-expanded="false">
            <span>${qa.q}</span>
            ${icons.chevronDown}
          </button>
          <div class="qa-answer">
            <p>${qa.a}</p>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top: var(--space-xl); text-align: center;">
      <button class="btn btn-primary" onclick="completeRightsModule('${id}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Mark as Complete
      </button>
    </div>
  `;

  document.getElementById('module-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function toggleQA(moduleId, index) {
  const item = document.getElementById(`qa-${moduleId}-${index}`);
  const btn = item.querySelector('.qa-question');
  const isOpen = item.classList.contains('open');
  item.classList.toggle('open');
  btn.setAttribute('aria-expanded', !isOpen);
}

function completeRightsModule(id) {
  const mod = rightsModules.find(m => m.id === id);
  if (mod) {
    mod.progress = 100;
    saveProgress();
    renderRightsCards();
  }
  closeModule();
  showToast('Module Complete!', `You've mastered "${mod.title}". Keep learning!`, 'success');
}


// ============================================================
// YOUTUBE PLAYER — ERROR 153 FIX
// Click-to-play thumbnail approach: shows thumbnail first,
// loads iframe only on user click (user gesture bypasses
// file:// origin restrictions that cause Error 153).
// Uses youtube-nocookie.com + no enablejsapi for max compat.
// ============================================================

function createYTPlayer(videoId, title) {
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  
  return `
    <div class="yt-player-wrap" id="yt-wrap-${videoId}" style="position:relative; width:100%; background:#000; border-radius: var(--radius-lg); overflow:hidden; aspect-ratio:16/9; cursor:pointer;" onclick="loadYTIframe('${videoId}', '${embedUrl.replace(/'/g,"\\'")}', '${(title||'').replace(/'/g,"\\'")}')">
      <img 
        src="${thumbUrl}" 
        alt="${title}" 
        style="width:100%; height:100%; object-fit:cover; display:block;"
        onerror="this.src='https://img.youtube.com/vi/${videoId}/mqdefault.jpg'"
      >
      <!-- Play button overlay -->
      <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
        <div style="width:72px; height:72px; background:rgba(255,0,0,0.9); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 24px rgba(0,0,0,0.5); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <span style="color:white; font-size:0.85rem; font-weight:600; text-shadow:0 1px 4px rgba(0,0,0,0.8); max-width:80%; text-align:center;">${title || 'Click to play'}</span>
      </div>
      <!-- YouTube watermark -->
      <div style="position:absolute; bottom:8px; right:10px; opacity:0.7;">
        <svg height="14" viewBox="0 0 90 20" xmlns="http://www.w3.org/2000/svg" fill="white"><path d="M27.97 3.74A3.27 3.27 0 0 0 25.67 1.4C23.4.76 14.38.76 14.38.76s-9.02 0-11.3.64A3.27 3.27 0 0 0 .79 3.74 34.3 34.3 0 0 0 .16 10a34.3 34.3 0 0 0 .63 6.26 3.27 3.27 0 0 0 2.3 2.32C5.37 19.22 14.38 19.22 14.38 19.22s9.02 0 11.29-.64a3.27 3.27 0 0 0 2.3-2.32 34.3 34.3 0 0 0 .62-6.26 34.3 34.3 0 0 0-.62-6.26zM11.52 13.64V6.36L18.85 10l-7.33 3.64z"/></svg>
      </div>
    </div>
    <div style="display:flex; justify-content:flex-end; margin-top:6px;">
      <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" style="font-size:0.75rem; color:var(--text-muted); text-decoration:none; display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border:1px solid var(--border); border-radius:20px; transition:var(--transition);" onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background=''">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Open in YouTube
      </a>
    </div>
  `;
}

function loadYTIframe(videoId, embedUrl, title) {
  const wrap = document.getElementById('yt-wrap-' + videoId);
  if (!wrap) return;
  // Replace the click-to-play with the actual iframe
  wrap.outerHTML = `
    <div style="position:relative; width:100%; border-radius:var(--radius-lg); overflow:hidden; aspect-ratio:16/9;">
      <iframe 
        src="${embedUrl}"
        title="${title}"
        style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

// ============================================================
// SKILL COURSE CARDS
// ============================================================

function renderCourseCards() {
  const container = document.getElementById('courses-cards');
  
  const coreCourses = skillCourses.filter(c => !c.isCustom);
  const customCourses = skillCourses.filter(c => c.isCustom);
  
  let html = '';
  
  html += `
    <div class="course-group-section reveal" style="grid-column: 1 / -1; width: 100%; margin-bottom: var(--space-xl);">
      <h2 style="font-size: var(--fs-xl); font-weight: 800; border-bottom: 2px solid var(--border-light); padding-bottom: var(--space-xs); margin-bottom: var(--space-md); color: var(--primary);">Core Academy Courses</h2>
      <div class="card-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: var(--space-lg);">
        ${coreCourses.map((course, i) => renderSingleCourseCard(course, i)).join('')}
      </div>
    </div>
  `;
  
  if (customCourses.length > 0) {
    const grouped = {};
    customCourses.forEach(course => {
      const topic = course.topic || 'Custom Learning';
      if (!grouped[topic]) grouped[topic] = [];
      grouped[topic].push(course);
    });
    
    for (const [topic, list] of Object.entries(grouped)) {
      html += `
        <div class="course-group-section reveal" style="grid-column: 1 / -1; width: 100%; margin-bottom: var(--space-xl); margin-top: var(--space-lg);">
          <h2 style="font-size: var(--fs-xl); font-weight: 800; border-bottom: 2px solid var(--border-light); padding-bottom: var(--space-xs); margin-bottom: var(--space-md); color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"/></svg>
            ${topic} Courses
          </h2>
          <div class="card-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: var(--space-lg);">
            ${list.map((course, i) => renderSingleCourseCard(course, i + coreCourses.length)).join('')}
          </div>
        </div>
      `;
    }
  }
  
  container.innerHTML = html;
  container.style.display = 'block';
  initScrollReveal();
}

function renderSingleCourseCard(course, i) {
  return `
    <div class="card" style="margin-bottom: var(--space-xs); position: relative; min-height: 320px; display: flex; flex-direction: column; padding: 2.5rem;">
      ${course.isCustom ? `
        <button onclick="deleteCustomCourse('${course.id}', event)" style="position: absolute; top: 16px; right: 16px; padding: 6px; border: none; background: rgba(239, 68, 68, 0.1); color: #EF4444; border-radius: 50%; width: 36px; height: 36px; z-index: 10; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'" title="Delete Course">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      ` : ''}
      <div onclick="openCourseModule('${course.id}')" tabindex="0" role="button" aria-label="Open ${course.title} course" onkeydown="if(event.key==='Enter')openCourseModule('${course.id}')" style="display: flex; flex-direction: column; width: 100%; flex: 1;">
        <div class="card-icon-wrap ${course.color}" style="width: 64px; height: 64px; margin-bottom: 1.5rem;">
          ${icons[course.icon] || icons.monitor}
        </div>
        <h3 style="font-size: 1.35rem; font-weight: 800; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; padding-right: 24px; margin-bottom: 0.75rem;">${course.title}</h3>
        <p style="font-size: 1.05rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6; margin-bottom: 1.5rem;">${course.description}</p>
        <div class="card-footer" style="margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
          <div class="card-progress">
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${course.progress}%" id="progress-${course.id}"></div>
            </div>
            <span id="progress-text-${course.id}">${course.progress}%</span>
          </div>
          <div class="card-arrow">
            ${icons.arrowRight}
          </div>
        </div>
      </div>
    </div>
  `;
}

function deleteCustomCourse(id, event) {
  if (event) event.stopPropagation();
  if (confirm("Are you sure you want to delete this course? Your progress will remain saved in your account.")) {
    const idx = skillCourses.findIndex(c => c.id === id);
    if (idx !== -1) {
      skillCourses.splice(idx, 1);
      saveCustomCoursesToStorage();
      renderCourseCards();
      showToast('Course Deleted', 'The custom course has been removed.', 'info');
    }
  }
}

function openCourseModule(id) {
  if (!isAuthenticated()) {
    openAuthModal();
    return;
  }
  const course = skillCourses.find(c => c.id === id);
  if (!course) return;

  document.getElementById('module-title').textContent = course.title;
  document.getElementById('module-description').textContent = course.description;

  const body = document.getElementById('module-body');

  if (course.isCustom) {
    const firstVideoId = course.chapters[0]?.videoId || course.idVal;
    const firstVideoTitle = course.chapters[0]?.title || course.title;
    body.innerHTML = `
      <div id="module-video-container">
        ${createYTPlayer(firstVideoId, firstVideoTitle)}
      </div>

      <!-- AI Quiz Generation Section -->
      <div class="ai-quiz-generation-container" style="margin-top: 1.5rem; padding: var(--space-md); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: var(--space-sm);">
            <div style="color: var(--primary); display: flex; align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <h4 style="margin: 0; font-size: var(--fs-md); font-weight: 700; color: var(--text);">AI Interactive Quiz</h4>
              <p style="margin: 0; font-size: var(--fs-xs); color: var(--text-muted);">Generate a quiz from the video content using N8N AI.</p>
            </div>
          </div>
          <button class="btn btn-cta btn-sm" id="btn-generate-ai-quiz" onclick="generateAIQuizForYTVideo('${firstVideoId}', '${firstVideoTitle.replace(/'/g, "\\'")}', '${course.id}')" style="display: inline-flex; align-items: center; gap: 0.25rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Generate Questions
          </button>
        </div>
        
        <!-- Loading state -->
        <div id="ai-quiz-loading" style="display: none; flex-direction: column; align-items: center; gap: 12px; padding: var(--space-lg) 0;">
          <div class="ai-spinner"></div>
          <p style="margin: 0; font-size: var(--fs-sm); font-weight: 600; color: var(--primary);" id="ai-quiz-loading-text">Extracting video transcript...</p>
        </div>
        
        <!-- Interactive Quiz Output area -->
        <div id="ai-quiz-output" style="margin-top: 1rem; display: none;"></div>
      </div>

      <div class="quiz-section" style="margin-top: 1.5rem;">
        <h3>${icons.play} Course Chapters</h3>
        <div class="yt-chapters-list" style="display: flex; flex-direction: column; gap: var(--space-xs); margin-top: 1rem;">
          ${course.chapters.map((ch, idx) => `
            <div class="yt-chapter-item ${idx === 0 ? 'active' : ''}" onclick="playYTChapterInModal('${ch.videoId}', '${(ch.title||'').replace(/'/g, "\\'")}', this)" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-md); cursor: pointer; transition: var(--transition);">
              <div class="yt-chapter-info" style="display: flex; align-items: center; gap: var(--space-md);">
                <div class="yt-chapter-num" style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: var(--fs-xs); font-weight: 700;">${idx + 1}</div>
                <span class="yt-chapter-title" style="font-size: var(--fs-sm); font-weight: 600;">${ch.title}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: var(--space-xl);">
          <button class="btn btn-primary btn-lg" onclick="completeYTCourseCard('${course.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Mark as Complete
          </button>
        </div>
      </div>
    `;
  } else {
    let videoHTML = '';
    if (course.videoUrl) {
      if (course.videoUrl.includes('youtube.com') || course.videoUrl.includes('youtu.be')) {
        const videoId = course.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (videoId) {
          videoHTML = `<div id="module-video-container">${createYTPlayer(videoId[1], course.videoTitle)}</div>`;
        }
      } else {
        videoHTML = `<div class="video-container"><video controls><source src="${course.videoUrl}"></video></div>`;
      }
    } else {
      videoHTML = `
        <div class="video-container">
          <div class="video-placeholder">
            ${icons.play}
            <p>Video coming soon — ${course.videoTitle}</p>
            <p style="font-size: 0.75rem; opacity: 0.5;">Add a YouTube URL to enable playback</p>
          </div>
        </div>
      `;
    }

    body.innerHTML = `
      ${videoHTML}
      <div class="quiz-section">
        <h3>${icons.clipboard} Knowledge Check</h3>
        ${course.questions.map((q, i) => `
          <div class="quiz-question" id="quiz-${id}-${i}">
            <h4>Q${i + 1}: ${q.q}</h4>
            <div class="quiz-options">
              ${q.options.map((opt, j) => `
                <div class="quiz-option" onclick="selectQuizOption('${id}', ${i}, ${j})" tabindex="0" role="radio" aria-checked="false" onkeydown="if(event.key==='Enter')selectQuizOption('${id}',${i},${j})">
                  <div class="quiz-radio"></div>
                  <span>${opt}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
        <div style="text-align: center; margin-top: var(--space-xl);">
          <button class="btn btn-cta btn-lg" onclick="submitQuiz('${id}')" id="quiz-submit-${id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Submit Answers
          </button>
        </div>
      </div>
    `;
  }

  window._quizSelections = {};

  document.getElementById('module-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function selectQuizOption(courseId, questionIdx, optionIdx) {
  if (!window._quizSelections) window._quizSelections = {};
  window._quizSelections[`${courseId}-${questionIdx}`] = optionIdx;

  // Update UI
  const questionEl = document.getElementById(`quiz-${courseId}-${questionIdx}`);
  const options = questionEl.querySelectorAll('.quiz-option');
  options.forEach((opt, i) => {
    opt.classList.remove('selected');
    opt.setAttribute('aria-checked', 'false');
    if (i === optionIdx) {
      opt.classList.add('selected');
      opt.setAttribute('aria-checked', 'true');
    }
  });
}

function submitQuiz(courseId) {
  const course = skillCourses.find(c => c.id === courseId);
  if (!course) return;

  let allCorrect = true;
  let allAnswered = true;

  course.questions.forEach((q, i) => {
    const key = `${courseId}-${i}`;
    const selected = window._quizSelections?.[key];
    const questionEl = document.getElementById(`quiz-${courseId}-${i}`);
    const options = questionEl.querySelectorAll('.quiz-option');

    if (selected === undefined) {
      allAnswered = false;
      return;
    }

    options.forEach((opt, j) => {
      opt.classList.remove('selected', 'correct', 'incorrect');
      opt.style.pointerEvents = 'none';
      if (j === q.correct) {
        opt.classList.add('correct');
      } else if (j === selected && j !== q.correct) {
        opt.classList.add('incorrect');
        allCorrect = false;
      }
    });
  });

  if (!allAnswered) {
    showToast('Please answer all questions', 'Make sure you\'ve selected an answer for every question.', 'info');
    return;
  }

  // Disable submit button
  const submitBtn = document.getElementById(`quiz-submit-${courseId}`);
  if (submitBtn) submitBtn.disabled = true;

  if (allCorrect) {
    course.progress = 100;
    saveProgress();

    setTimeout(() => {
      closeModule();
      showCongrats(`You aced "${course.title}"! Every answer was perfect. You're becoming unstoppable!`);
      renderCourseCards();
    }, 1000);
  } else {
    showToast('Almost there!', 'Review the correct answers (green) and try again. You\'re learning!', 'info');
    // Re-enable after delay
    setTimeout(() => {
      if (submitBtn) submitBtn.disabled = false;
      course.questions.forEach((q, i) => {
        const questionEl = document.getElementById(`quiz-${courseId}-${i}`);
        if (questionEl) {
          questionEl.querySelectorAll('.quiz-option').forEach(opt => {
            opt.style.pointerEvents = '';
            opt.classList.remove('correct', 'incorrect', 'selected');
          });
        }
      });
      window._quizSelections = {};
    }, 2500);
  }
}

// ============================================================
// MODULE OVERLAY CONTROLS
// ============================================================

function closeModule() {
  document.getElementById('module-overlay').classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('module-body').innerHTML = '';
}

document.getElementById('module-close').addEventListener('click', closeModule);
document.getElementById('module-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('module-overlay')) closeModule();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModule();
    closeCongrats();
  }
});

// ============================================================
// CONGRATS MODAL
// ============================================================

function showCongrats(message) {
  document.getElementById('congrats-text').textContent = message;
  document.getElementById('congrats-modal').classList.add('active');
  launchConfetti();
}

function closeCongrats() {
  document.getElementById('congrats-modal').classList.remove('active');
}

document.getElementById('congrats-close').addEventListener('click', closeCongrats);

// Confetti effect
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#7C3AED', '#A78BFA', '#22C55E', '#C67B5C', '#3B82F6', '#E11D48', '#F59E0B'];

  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    confetti.style.animationDelay = Math.random() * 0.8 + 's';
    confetti.style.width = (Math.random() * 8 + 5) + 'px';
    confetti.style.height = (Math.random() * 8 + 5) + 'px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(confetti);
  }

  // Cleanup
  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

// ============================================================
// RAISE YOUR VOICE
// ============================================================

// Emotion tags
document.querySelectorAll('.emotion-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    tag.classList.toggle('active');
  });
});

// Anonymous toggle
document.getElementById('anon-toggle').addEventListener('click', function () {
  this.classList.toggle('active');
});

// Submit voice
document.getElementById('voice-submit').addEventListener('click', async (e) => {
  e.preventDefault();
  if (!isAuthenticated()) {
    openAuthModal();
    return;
  }
  const category = document.getElementById('voice-category').value;
  const story = document.getElementById('voice-story').value.trim();
  const emotions = Array.from(document.querySelectorAll('.emotion-tag.active')).map(t => t.dataset.emotion);
  const anonymous = document.getElementById('anon-toggle').classList.contains('active');

  if (!category || !story) {
    showToast('Please fill in the required fields', 'Select a category and share your story.', 'info');
    return;
  }

  const voice = {
    id: Date.now(),
    category,
    story,
    emotions,
    anonymous,
    authorName: anonymous ? 'Anonymous' : currentUser.name,
    authorEmail: currentUser.email,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Save to LocalStorage as a fallback/cache
  const voices = JSON.parse(localStorage.getItem('empowerall_voices') || '[]');
  voices.unshift(voice);
  localStorage.setItem('empowerall_voices', JSON.stringify(voices));

  // Save to Firestore globally
  try {
    if (typeof db !== 'undefined') {
      await db.collection('voices').add(voice);
    }
  } catch (e) {
    console.warn("Firestore error saving voice (database might not be created):", e);
  }

  // Reset form
  document.getElementById('voice-category').selectedIndex = 0;
  document.getElementById('voice-story').value = '';
  document.querySelectorAll('.emotion-tag.active').forEach(t => t.classList.remove('active'));
  document.getElementById('anon-toggle').classList.remove('active');

  // Re-render
  renderVoices();
  showToast('Your Voice Has Been Heard!', 'Thank you for sharing. Your courage inspires others.', 'success');
});

let currentVoiceFilter = 'community';

function setVoiceFilter(filterType) {
  currentVoiceFilter = filterType;
  
  document.getElementById('tab-voice-community').classList.toggle('active', filterType === 'community');
  document.getElementById('tab-voice-yours').classList.toggle('active', filterType === 'yours');
  
  renderVoices();
}

async function renderVoices() {
  const container = document.getElementById('voices-list');
  container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><h3>Loading Community Voices...</h3></div>';

  let allVoices = JSON.parse(localStorage.getItem('empowerall_voices') || '[]');

  try {
    if (typeof db !== 'undefined') {
      const snapshot = await db.collection('voices').orderBy('timestamp', 'desc').get();
      if (!snapshot.empty) {
        allVoices = [];
        snapshot.forEach(doc => {
          allVoices.push({ docId: doc.id, ...doc.data() });
        });
        localStorage.setItem('empowerall_voices', JSON.stringify(allVoices)); // Cache
      }
    }
  } catch (e) {
    console.warn("Firestore error fetching voices:", e);
  }

  // Filter logic
  let voices = allVoices;
  if (currentVoiceFilter === 'yours') {
    if (!currentUser) {
      voices = [];
    } else {
      voices = allVoices.filter(v => v.authorEmail === currentUser.email);
    }
  } else if (currentVoiceFilter === 'community') {
    if (currentUser) {
      // Exclude current user's posts from Community
      voices = allVoices.filter(v => v.authorEmail !== currentUser.email);
    }
  }

  if (voices.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
        <h3>No voices found</h3>
        <p>${currentVoiceFilter === 'yours' ? "You haven't shared a story yet." : "Be the first to share your story and inspire change."}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = voices.map(v => {
    // Truncate story to ~100 characters for the card preview
    const shortStory = v.story.length > 100 ? v.story.substring(0, 100) + '...' : v.story;
    const authorStr = v.authorName || 'Anonymous';
    
    // Safely encode for click handler
    const safeStory = v.story.replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, "<br>");
    const safeAuthor = authorStr.replace(/'/g, "\\'");
    const safeDate = v.date.replace(/'/g, "\\'");
    const tagsJson = JSON.stringify(v.emotions || []).replace(/"/g, "&quot;");

    return `
      <div class="voice-card" onclick="openStoryModal('${safeAuthor}', '${safeDate}', '${safeStory}', '${tagsJson}')" style="cursor: pointer; transition: transform 0.2s var(--ease-spring), box-shadow 0.2s var(--ease-spring);">
        <div class="voice-card-header">
          <span class="voice-card-category">${v.category}</span>
          <span class="voice-card-date">${v.date}</span>
        </div>
        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text); margin-bottom: 8px;">By ${authorStr}</div>
        <p style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${shortStory}</p>
        ${v.emotions && v.emotions.length ? `
          <div class="voice-card-emotions">
            ${v.emotions.map(e => `<span class="voice-card-emotion">${e}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ============================================================
// ACTS OF KINDNESS
// ============================================================

let selectedKindnessTag = '';
let uploadedImageData = '';

// Upload area
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('kindness-file');
const uploadForm = document.getElementById('upload-form');

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') fileInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleImageUpload(file);
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleImageUpload(file);
});

function handleImageUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImageData = e.target.result;
    document.getElementById('upload-preview').src = uploadedImageData;
    uploadForm.classList.add('active');
    uploadArea.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// Kindness tags
document.querySelectorAll('.kindness-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    document.querySelectorAll('.kindness-tag').forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    selectedKindnessTag = tag.dataset.tag;
  });
});

// Submit kindness
document.getElementById('kindness-submit').addEventListener('click', async () => {
  if (!isAuthenticated()) {
    openAuthModal();
    return;
  }
  const caption = document.getElementById('kindness-caption').value.trim();
  const story = document.getElementById('kindness-story').value.trim();

  if (!uploadedImageData) {
    showToast('Please upload a photo', 'Share a picture of your act of kindness.', 'info');
    return;
  }

  const item = {
    id: Date.now(),
    image: uploadedImageData,
    caption: caption || 'An act of kindness',
    story: story,
    tag: selectedKindnessTag || 'Other',
    likes: 0,
    authorName: currentUser.name,
    authorEmail: currentUser.email,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  const items = JSON.parse(localStorage.getItem('empowerall_kindness') || '[]');
  items.unshift(item);
  localStorage.setItem('empowerall_kindness', JSON.stringify(items));

  // Save to Firestore globally
  try {
    if (typeof db !== 'undefined') {
      await db.collection('kindness').add(item);
    }
  } catch (e) {
    console.warn("Firestore error saving kindness (database might not be created):", e);
  }

  // Reset
  uploadedImageData = '';
  selectedKindnessTag = '';
  document.getElementById('kindness-caption').value = '';
  document.querySelectorAll('.kindness-tag').forEach(t => t.classList.remove('active'));
  uploadForm.classList.remove('active');
  uploadArea.style.display = '';
  fileInput.value = '';

  renderKindnessGallery();
  showToast('Kindness Shared!', 'Your beautiful act has been added to the gallery. Thank you!', 'success');
});

// Cancel upload
document.getElementById('kindness-cancel').addEventListener('click', () => {
  uploadedImageData = '';
  uploadForm.classList.remove('active');
  uploadArea.style.display = '';
  fileInput.value = '';
});

let currentKindnessFilter = 'community';

function setKindnessFilter(filterType) {
  currentKindnessFilter = filterType;
  
  document.getElementById('tab-kindness-community').classList.toggle('active', filterType === 'community');
  document.getElementById('tab-kindness-yours').classList.toggle('active', filterType === 'yours');
  
  renderKindnessGallery();
}

async function renderKindnessGallery() {
  const gallery = document.getElementById('kindness-gallery');
  const emptyState = document.getElementById('kindness-empty');

  let allItems = JSON.parse(localStorage.getItem('empowerall_kindness') || '[]');

  try {
    if (typeof db !== 'undefined') {
      const snapshot = await db.collection('kindness').orderBy('timestamp', 'desc').get();
      if (!snapshot.empty) {
        allItems = [];
        snapshot.forEach(doc => {
          allItems.push({ docId: doc.id, ...doc.data() });
        });
        localStorage.setItem('empowerall_kindness', JSON.stringify(allItems)); // Cache
      }
    }
  } catch (e) {
    console.warn("Firestore error fetching kindness:", e);
  }
  
  // Filter logic
  let items = allItems;
  if (currentKindnessFilter === 'yours') {
    if (!currentUser) {
      items = [];
    } else {
      items = allItems.filter(item => item.authorEmail === currentUser.email);
    }
  } else if (currentKindnessFilter === 'community') {
    if (currentUser) {
      // Exclude current user's posts from Community
      items = allItems.filter(item => item.authorEmail !== currentUser.email);
    }
  }

  if (items.length === 0) {
    gallery.innerHTML = '';
    emptyState.style.display = '';
    const emptyTitle = emptyState.querySelector('h3');
    const emptyDesc = emptyState.querySelector('p');
    if (emptyTitle) emptyTitle.textContent = currentKindnessFilter === 'yours' ? 'No acts found' : 'No acts shared yet';
    if (emptyDesc) emptyDesc.textContent = currentKindnessFilter === 'yours' ? 'You haven\'t shared any acts of kindness yet.' : 'Be the first to share an act of kindness and inspire others!';
    return;
  }

  emptyState.style.display = 'none';
  gallery.innerHTML = items.map(item => {
    const authorStr = item.authorName || 'Anonymous';
    const safeCaption = (item.caption || '').replace(/'/g, "\\'").replace(/"/g, "&quot;");
    const safeStory = (item.story || '').replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, "<br>");
    const safeAuthor = authorStr.replace(/'/g, "\\'");
    const safeDate = item.date.replace(/'/g, "\\'");
    const safeTag = (item.tag || '').replace(/'/g, "\\'").replace(/"/g, "&quot;");
    const tagsJson = JSON.stringify([safeTag]).replace(/"/g, "&quot;");
    
    // We pass image to the modal
    const safeImage = (item.image || '').replace(/'/g, "\\'");

    let fullContent = `Action: ${safeCaption}`;
    if (safeStory) {
      fullContent += `<br><br>Story: ${safeStory}`;
    }

    return `
      <div class="kindness-item" style="cursor: pointer; transition: transform 0.2s var(--ease-spring), box-shadow 0.2s var(--ease-spring);" onclick="openStoryModal('${safeAuthor}', '${safeDate}', '${fullContent}', '${tagsJson}', '${safeImage}')">
        <img src="${item.image}" alt="${item.caption}" loading="lazy" style="height: 200px; object-fit: cover; width: 100%;">
        <div class="kindness-item-info">
          <h4 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px;">${item.caption}</h4>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text); margin-bottom: 4px;">By ${authorStr}</div>
          <p>${item.date}</p>
          <div class="kindness-item-footer" style="margin-top: 12px;">
            <span class="kindness-item-tag">${item.tag}</span>
            <button class="kindness-heart-btn ${item.liked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleKindnessLike(${item.id})" aria-label="Like this act of kindness">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              <span>${item.likes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleKindnessLike(id) {
  const items = JSON.parse(localStorage.getItem('empowerall_kindness') || '[]');
  const item = items.find(i => i.id === id);
  if (item) {
    if (item.liked) {
      item.likes--;
      item.liked = false;
    } else {
      item.likes++;
      item.liked = true;
    }
    localStorage.setItem('empowerall_kindness', JSON.stringify(items));
    renderKindnessGallery();
  }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(title, message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toast-icon');
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-message').textContent = message;

  toastIcon.className = 'toast-icon ' + type;

  if (type === 'info') {
    toastIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>';
  } else {
    toastIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  }

  toast.classList.add('show');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ============================================================
// PROGRESS PERSISTENCE
// ============================================================

function saveProgress() {
  const rightsProgress = rightsModules.map(m => ({ id: m.id, progress: m.progress }));
  const coursesProgress = skillCourses.map(c => ({ id: c.id, progress: c.progress }));
  localStorage.setItem('empowerall_rights_progress', JSON.stringify(rightsProgress));
  localStorage.setItem('empowerall_courses_progress', JSON.stringify(coursesProgress));
}

function loadProgress() {
  try {
    const rightsProgress = JSON.parse(localStorage.getItem('empowerall_rights_progress') || '[]');
    rightsProgress.forEach(saved => {
      const mod = rightsModules.find(m => m.id === saved.id);
      if (mod) mod.progress = saved.progress;
    });

    const coursesProgress = JSON.parse(localStorage.getItem('empowerall_courses_progress') || '[]');
    coursesProgress.forEach(saved => {
      const course = skillCourses.find(c => c.id === saved.id);
      if (course) course.progress = saved.progress;
    });
  } catch (e) {
    console.warn('Could not load progress:', e);
  }
}

// ============================================================
// AUTH & USER PROFILES
// ============================================================
let currentUser = null;

function isAuthenticated() {
  return currentUser !== null;
}

function updateAuthUI() {
  const loginBtn = document.getElementById('nav-login-btn');
  const profileLink = document.getElementById('link-profile');
  if (isAuthenticated()) {
    loginBtn.style.display = 'none';
    profileLink.style.display = 'flex';
    
    // Track Attendance
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const attendanceKey = `empowerall_attendance_${currentUser.email}`;
    const attendance = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
    if (!attendance.includes(dateStr)) {
      attendance.push(dateStr);
      localStorage.setItem(attendanceKey, JSON.stringify(attendance));
    }
  } else {
    loginBtn.style.display = 'block';
    profileLink.style.display = 'none';
    if (window.location.hash === '#profile') {
      navigateTo('home');
    }
  }
}

// Modal handling
function openAuthModal() {
  document.getElementById('auth-overlay').classList.add('active');
  document.getElementById('login-panel').style.display = 'block';
  document.getElementById('onboarding-panel').style.display = 'none';
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  document.getElementById('auth-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// Story Modal Handling
function openStoryModal(author, meta, content, tags = '[]', imageSrc = null) {
  document.getElementById('story-modal-author').textContent = author;
  document.getElementById('story-modal-meta').textContent = meta;
  document.getElementById('story-modal-content').innerHTML = content;
  
  let parsedTags = [];
  try {
    parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
  } catch(e) {
    console.error("Failed to parse tags:", tags);
  }

  const tagsContainer = document.getElementById('story-modal-tags');
  tagsContainer.innerHTML = parsedTags.map(t => `<span style="background: rgba(124, 58, 237, 0.1); color: var(--primary); padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 600;">${t}</span>`).join('');
  
  const imgEl = document.getElementById('story-modal-image');
  if (imageSrc && imageSrc !== 'null' && imageSrc !== 'undefined') {
    imgEl.src = imageSrc;
    imgEl.style.display = 'block';
  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
  }

  document.getElementById('story-modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeStoryModal() {
  document.getElementById('story-modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// Google Auth (Firebase)
function triggerGoogleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      closeAuthModal();
      showToast('Welcome!', `Logged in as ${result.user.displayName}`, 'success');
    })
    .catch((error) => {
      showToast('Login Failed', error.message, 'error');
    });
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    closeAuthModal();
    showToast('Welcome back!', 'Successfully logged in.', 'success');
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      document.getElementById('login-panel').style.display = 'none';
      document.getElementById('onboarding-panel').style.display = 'block';
      if (email.includes('@')) document.getElementById('onboard-email').value = email;
      showToast('Not Found', 'No account found. Please complete your profile.', 'info');
    } else {
      showToast('Login Failed', err.message, 'error');
    }
  }
}

// Profession Autocomplete
const professionList = document.getElementById('profession-list');
const professionInput = document.getElementById('onboard-profession');
const professions = ['Student', 'Teacher', 'Engineer', 'Doctor', 'Nurse', 'Lawyer', 'Social Worker', 'Farmer', 'Artist', 'Writer', 'Designer', 'Software Developer', 'Business Owner', 'Unemployed', 'Retired'];

professionInput.addEventListener('input', function() {
  const val = this.value.toLowerCase();
  professionList.innerHTML = '';
  if (!val) {
    professionList.style.display = 'none';
    return;
  }
  const matches = professions.filter(p => p.toLowerCase().includes(val));
  if (matches.length > 0) {
    matches.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p;
      li.onclick = () => {
        professionInput.value = p;
        professionList.style.display = 'none';
      };
      professionList.appendChild(li);
    });
    professionList.style.display = 'block';
  } else {
    professionList.style.display = 'none';
  }
});
document.addEventListener('click', (e) => {
  if (e.target !== professionInput && e.target !== professionList) professionList.style.display = 'none';
});

// Submit Onboarding
async function handleOnboardingSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('onboard-name').value;
  const email = document.getElementById('onboard-email').value;
  const location = document.getElementById('onboard-location').value;
  const profession = document.getElementById('onboard-profession').value;
  const dob = document.getElementById('onboard-dob').value;
  const password = document.getElementById('onboard-password') ? document.getElementById('onboard-password').value : '';

  // Validate DOB
  const today = new Date().toISOString().split('T')[0];
  if (dob > today) {
    showToast('Invalid Date', "Date of birth cannot be in the future.", 'warning');
    return;
  }

  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    await user.updateProfile({ displayName: name });

    const newUser = {
      id: user.uid,
      name, email, location, profession, dob,
      stats: { courses: 0, rights: 0, voices: 0, kindness: 0 }
    };

    const users = JSON.parse(localStorage.getItem('empowerall_users') || '{}');
    users[email] = newUser;
    localStorage.setItem('empowerall_users', JSON.stringify(users));
    
    closeAuthModal();
    showToast('Profile Created!', 'Welcome to the EmpowerAll community.', 'success');
  } catch (err) {
    showToast('Signup Failed', err.message, 'error');
  }
}

// Profile Page rendering
function renderProfile() {
  if (!currentUser) return;
  document.getElementById('profile-name-display').textContent = currentUser.name;
  document.getElementById('profile-profession-display').textContent = currentUser.profession;
  const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);
  document.getElementById('profile-avatar-display').textContent = initials;
  
  document.getElementById('profile-email').value = currentUser.email;
  document.getElementById('profile-location').value = currentUser.location;

  // Render Stats
  const rightsProgress = JSON.parse(localStorage.getItem('empowerall_rights_progress') || '[]');
  const coursesProgress = JSON.parse(localStorage.getItem('empowerall_courses_progress') || '[]');
  const voices = JSON.parse(localStorage.getItem('empowerall_voices') || '[]');
  
  const completedRights = rightsProgress.filter(r => r.progress === 100).length;
  const completedCourses = coursesProgress.filter(c => c.progress === 100).length;
  
  document.getElementById('profile-stat-rights').textContent = completedRights;
  document.getElementById('profile-stat-courses').textContent = completedCourses;
  document.getElementById('profile-stat-voices').textContent = voices.length; // Approximating since mock DB is global

  // Update developer database stats
  loadDbExportStats();
  
  // Render Activity Dashboard
  renderActivityDashboard();
}

// Activity Dashboard Rendering
function renderActivityDashboard() {
  const attendance = JSON.parse(localStorage.getItem(`empowerall_attendance_${currentUser.email}`) || '[]');
  
  // Month-wise Calendar
  const calGrid = document.getElementById('profile-calendar-grid');
  const monthLabel = document.getElementById('calendar-month-label');
  if (calGrid && monthLabel) {
    calGrid.innerHTML = '';
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    monthLabel.textContent = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const attended = attendance.includes(dateStr);
      
      const dayEl = document.createElement('div');
      dayEl.style.aspectRatio = '1';
      dayEl.style.borderRadius = '4px';
      dayEl.style.backgroundColor = attended ? 'var(--primary)' : 'var(--surface-hover)';
      dayEl.style.opacity = attended ? '1' : '0.6';
      dayEl.title = `${dateStr}${attended ? ' (Attended)' : ''}`;
      
      calGrid.appendChild(dayEl);
    }
  }

  // Week-wise Appearance Graph
  const graphBars = document.getElementById('profile-graph-bars');
  if (graphBars) {
    graphBars.innerHTML = '';
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const attended = attendance.includes(dateStr);
      const dayName = d.toLocaleString('default', { weekday: 'short' });
      
      const heightPercentage = attended ? '100%' : '15%';
      
      const barWrapper = document.createElement('div');
      barWrapper.style.display = 'flex';
      barWrapper.style.flexDirection = 'column';
      barWrapper.style.alignItems = 'center';
      barWrapper.style.height = '100%';
      barWrapper.style.width = '30px';
      barWrapper.style.justifyContent = 'flex-end';
      barWrapper.style.gap = '8px';
      
      const bar = document.createElement('div');
      bar.style.width = '100%';
      bar.style.height = heightPercentage;
      bar.style.backgroundColor = attended ? 'var(--secondary)' : 'var(--border)';
      bar.style.borderRadius = '4px 4px 0 0';
      bar.style.transition = 'height 0.5s var(--ease-spring)';
      
      const label = document.createElement('span');
      label.textContent = dayName;
      label.style.fontSize = '0.75rem';
      label.style.color = 'var(--text-muted)';
      label.style.fontWeight = '500';
      
      barWrapper.appendChild(bar);
      barWrapper.appendChild(label);
      graphBars.appendChild(barWrapper);
    }
  }
}

// Developer Mode: Exporter Utility Functions
function loadDbExportStats() {
  try {
    const users = JSON.parse(localStorage.getItem('empowerall_users') || '{}');
    const usersCount = Object.keys(users).length;
    const usersCountLabel = document.getElementById('db-count-users');
    if (usersCountLabel) {
      usersCountLabel.textContent = `${usersCount} user${usersCount !== 1 ? 's' : ''}`;
    }

    const rightsProgress = JSON.parse(localStorage.getItem('empowerall_rights_progress') || '[]');
    const coursesProgress = JSON.parse(localStorage.getItem('empowerall_courses_progress') || '[]');
    const totalProgress = rightsProgress.length + coursesProgress.length;
    const progressCountLabel = document.getElementById('db-count-progress');
    if (progressCountLabel) {
      progressCountLabel.textContent = `${totalProgress} record${totalProgress !== 1 ? 's' : ''}`;
    }

    const customCourses = JSON.parse(localStorage.getItem('empowerall_custom_courses') || '[]');
    const coursesCountLabel = document.getElementById('db-count-courses');
    if (coursesCountLabel) {
      coursesCountLabel.textContent = `${customCourses.length} course${customCourses.length !== 1 ? 's' : ''}`;
    }

    const stories = JSON.parse(localStorage.getItem('empowerall_voices') || '[]');
    const kindness = JSON.parse(localStorage.getItem('empowerall_kindness') || '[]');
    const supportTickets = JSON.parse(localStorage.getItem('empowerall_support_tickets') || '[]');
    const feedbackCount = stories.length + kindness.length + supportTickets.length;
    const feedbackCountLabel = document.getElementById('db-count-feedback');
    if (feedbackCountLabel) {
      feedbackCountLabel.textContent = `${feedbackCount} item${feedbackCount !== 1 ? 's' : ''}`;
    }
  } catch (err) {
    console.error("Error loading database stats:", err);
  }
}

function exportSystemDataJSON() {
  try {
    const dataExport = {
      exported_at: new Date().toISOString(),
      platform: 'EmpowerAll Local Storage Seeding File',
      collections: {
        users: JSON.parse(localStorage.getItem('empowerall_users') || '{}'),
        rights_progress: JSON.parse(localStorage.getItem('empowerall_rights_progress') || '[]'),
        courses_progress: JSON.parse(localStorage.getItem('empowerall_courses_progress') || '[]'),
        custom_courses: JSON.parse(localStorage.getItem('empowerall_custom_courses') || '[]'),
        voices: JSON.parse(localStorage.getItem('empowerall_voices') || '[]'),
        kindness: JSON.parse(localStorage.getItem('empowerall_kindness') || '[]'),
        support_tickets: JSON.parse(localStorage.getItem('empowerall_support_tickets') || '[]')
      }
    };

    const blob = new Blob([JSON.stringify(dataExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `empowerall_database_export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Database Exported', 'A database seed JSON has been downloaded successfully.', 'success');
  } catch (err) {
    console.error("Error exporting database:", err);
    showToast('Export Error', 'Failed to compile local storage data.', 'error');
  }
}

// Profile Form Submit
document.getElementById('profile-edit-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const newEmail = document.getElementById('profile-email').value;
  const newLocation = document.getElementById('profile-location').value;
  
  const users = JSON.parse(localStorage.getItem('empowerall_users') || '{}');
  
  // Handle email change
  if (newEmail !== currentUser.email) {
    users[newEmail] = users[currentUser.email];
    delete users[currentUser.email];
    users[newEmail].email = newEmail;
  }
  
  users[newEmail].location = newLocation;
  localStorage.setItem('empowerall_users', JSON.stringify(users));
  
  currentUser = users[newEmail];
  localStorage.setItem('empowerall_active_user', JSON.stringify(currentUser));
  
  showToast('Profile Updated', 'Your changes have been saved.', 'success');
});

// Sign Out
document.getElementById('signout-btn').addEventListener('click', () => {
  firebase.auth().signOut().then(() => {
    showToast('Signed Out', 'You have been successfully signed out.', 'info');
  });
});

// Listen for hash change to render profile
window.addEventListener('hashchange', () => {
  if (window.location.hash === '#profile') {
    renderProfile();
  }
});


// ============================================================
// GLOBAL CLOUD SYNC ENGINE
// ============================================================
let syncTimeout = null;
let isRestoringFromCloud = false;

function queueSyncToFirestore() {
  if (!currentUser || typeof db === 'undefined') return;
  if (syncTimeout) clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(async () => {
    try {
      const syncData = {
        users: JSON.parse(localStorage.getItem('empowerall_users') || '{}'),
        rights_progress: JSON.parse(localStorage.getItem('empowerall_rights_progress') || '[]'),
        courses_progress: JSON.parse(localStorage.getItem('empowerall_courses_progress') || '[]'),
        custom_courses: JSON.parse(localStorage.getItem('empowerall_custom_courses') || '[]'),
        ai_rights_modules: JSON.parse(localStorage.getItem('empowerall_ai_rights_modules') || '[]'),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      const attendanceKey = `empowerall_attendance_${currentUser.email}`;
      syncData.attendance = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
      
      await db.collection('user_progress').doc(currentUser.email).set(syncData, { merge: true });
      console.log('Progress synced to cloud!');
    } catch (e) {
      console.warn('Failed to sync to cloud', e);
    }
  }, 2000);
}

// Intercept native localStorage.setItem to auto-trigger sync
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);
  // If it's a progress key and we're not currently restoring, queue a sync
  if (!isRestoringFromCloud && currentUser && key.startsWith('empowerall_') && 
      !key.includes('voices') && !key.includes('kindness')) {
    queueSyncToFirestore();
  }
};

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
  // Listen to Firebase Auth state
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      // 1. Restore from Cloud Database (Global Sync)
      if (typeof db !== 'undefined') {
        try {
          const doc = await db.collection('user_progress').doc(user.email).get();
          if (doc.exists) {
            isRestoringFromCloud = true;
            const data = doc.data();
            if (data.users) localStorage.setItem('empowerall_users', JSON.stringify(data.users));
            if (data.rights_progress) localStorage.setItem('empowerall_rights_progress', JSON.stringify(data.rights_progress));
            if (data.courses_progress) localStorage.setItem('empowerall_courses_progress', JSON.stringify(data.courses_progress));
            if (data.custom_courses) localStorage.setItem('empowerall_custom_courses', JSON.stringify(data.custom_courses));
            if (data.ai_rights_modules) localStorage.setItem('empowerall_ai_rights_modules', JSON.stringify(data.ai_rights_modules));
            if (data.attendance) localStorage.setItem(`empowerall_attendance_${user.email}`, JSON.stringify(data.attendance));
            isRestoringFromCloud = false;
            console.log("Restored progress from cloud");
          }
        } catch(e) {
           console.warn("Could not load cloud progress", e);
           isRestoringFromCloud = false;
        }
      }

      // 2. Local fallback initialization
      const users = JSON.parse(localStorage.getItem('empowerall_users') || '{}');
      if (users[user.email]) {
        currentUser = users[user.email];
        loadCustomCoursesFromStorage();
      } else {
        // Fallback for new Google Sign-In users without local profile
        currentUser = {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          profession: 'Learner',
          stats: { courses: 0, rights: 0, voices: 0, kindness: 0 }
        };
        users[user.email] = currentUser;
        localStorage.setItem('empowerall_users', JSON.stringify(users));
      }
      
      // Update UI components that rely on user
      renderCourseCards();
      loadProgress();
      renderRightsCards();
    } else {
      currentUser = null;
    }
    updateAuthUI();
    if (window.location.hash === '#profile') {
      renderProfile();
    }
  });
  // Load saved progress
  loadProgress();

  // Render dynamic content
  renderRightsCards();
  renderCourseCards();
  renderVoices();
  renderKindnessGallery();

  // Handle initial route
  handleRoute();
  
  if (window.location.hash === '#profile') {
    renderProfile();
  }

  // Start counter animations
  animateCounters();

  // Init scroll reveals
  initScrollReveal();
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


// ============================================================
// FEATURE: CHATBOT WIDGET LOGIC
// ============================================================
let chatbotSelectedCategory = null;

// ============================================================
// CONTEXT-AWARE FLOATING CHATBOT
// ============================================================

function toggleChatbot() {
  const panel = document.getElementById('chatbot-panel');
  
  if (panel.style.display === 'none') {
    // Determine context based on activePage
    const activePage = window.location.hash.replace('#', '') || 'home';
    const titleEl = document.getElementById('chatbot-title');
    const welcomeEl = document.getElementById('chatbot-welcome');
    const inputEl = document.getElementById('chatbot-message');
    
    // Default / Home
    let title = 'EmpowerAll AI';
    let welcome = 'How can I help you navigate the platform today?';
    let placeholder = 'Ask anything...';
    
    if (activePage === 'rights') {
      title = 'Rights Assistant';
      welcome = 'Know what you wanted to know about your rights.';
      placeholder = 'Give the query (e.g. My landlord refuses to return deposit...)';
    } else if (activePage === 'courses') {
      title = 'Skills Assistant';
      welcome = 'What skill or concept do you want to learn today?';
      placeholder = 'I want to learn about...';
    } else if (activePage === 'voice') {
      title = 'Voice Assistant';
      welcome = 'Need help structuring or sharing your story?';
      placeholder = 'Describe your experience...';
    }

    titleEl.textContent = title;
    welcomeEl.textContent = welcome;
    inputEl.placeholder = placeholder;
    
    // Reset views
    resetChatbotUI();
    
    if (activePage === 'home') {
      document.getElementById('support-options').style.display = 'flex';
      document.getElementById('chatbot-input-area').style.display = 'none';
    } else {
      document.getElementById('support-options').style.display = 'none';
      document.getElementById('chatbot-input-area').style.display = 'block';
      document.getElementById('support-topic-label').style.display = 'none';
    }
    
    panel.style.display = 'flex';
    inputEl.focus();
  } else {
    panel.style.display = 'none';
  }
}

async function generateAIForInput(inputId, contextType) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;
  const prompt = inputEl.value.trim();
  if (!prompt) {
    showToast('Input Required', 'First explain what you want to say, then click Generate AI to summarize/expand your text.', 'warning');
    return;
  }
  
  let detailedPrompt = prompt;

  if (inputId === 'voice-story') {
    const categoryEl = document.getElementById('voice-category');
    const category = categoryEl ? categoryEl.value : '';
    const emotions = Array.from(document.querySelectorAll('.emotion-tag.active')).map(t => t.dataset.emotion).join(', ');
    
    detailedPrompt = `Please enhance and summarize the following story.\n`;
    if (category) detailedPrompt += `Category: ${category}\n`;
    if (emotions) detailedPrompt += `Emotions: ${emotions}\n`;
    detailedPrompt += `Story Draft: ${prompt}`;
  } 
  else if (inputId === 'kindness-story') {
    const actionEl = document.getElementById('kindness-caption');
    const action = actionEl ? actionEl.value.trim() : '';
    const tagEl = document.querySelector('.kindness-tag.active');
    const tag = tagEl ? tagEl.dataset.tag : '';
    
    detailedPrompt = `Please enhance and summarize this act of kindness.\n`;
    if (action) detailedPrompt += `Action taken: ${action}\n`;
    if (tag) detailedPrompt += `Category Tag: ${tag}\n`;
    detailedPrompt += `Story/Emotion Draft: ${prompt}`;
  }
  
  // Show loading on the button
  const btnId = inputId === 'voice-story' ? 'voice-ai-btn' : 'kindness-ai-btn';
  const btnEl = document.getElementById(btnId);
  if (!btnEl) return;
  const originalText = btnEl.innerHTML;
  btnEl.disabled = true;
  btnEl.innerHTML = '<span class="ai-spinner" style="width: 14px; height: 14px; border-width: 2px; margin-right: 6px; display: inline-block;"></span> Generating...';

  const result = await callN8nWebhook(detailedPrompt, contextType);
  
  btnEl.disabled = false;
  btnEl.innerHTML = originalText;

  if (result.content) {
    inputEl.value = result.content;
    showToast('AI Generated', 'Your input has been updated with the AI response.', 'success');
  } else {
    showToast('AI Error', result.error || 'Failed to generate content.', 'error');
  }
}

function selectSupportTopic(topic) {
  document.getElementById('support-options').style.display = 'none';
  const inputArea = document.getElementById('chatbot-input-area');
  inputArea.style.display = 'block';
  
  const labelEl = document.getElementById('support-topic-label');
  labelEl.style.display = 'block';
  labelEl.textContent = `Topic: ${topic}`;
  
  // Save the selected topic temporarily
  inputArea.dataset.topic = topic;
  
  // Focus textarea
  document.getElementById('chatbot-message').focus();
}

function submitSupportTicket() {
  const message = document.getElementById('chatbot-message').value.trim();
  if (!message) {
    showToast('Empty Message', 'Please enter your query before submitting.', 'info');
    return;
  }

  const resultsSection = document.getElementById('chatbot-results-section');
  const moduleContent = document.getElementById('chatbot-module-content');

  // Switch to success view
  document.getElementById('chatbot-form-section').style.display = 'none';
  resultsSection.style.display = 'flex';
  document.getElementById('chatbot-complete-btn').style.display = 'none';
  
  moduleContent.innerHTML = `<div style="background: var(--surface); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border); text-align: center;">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Query Submitted</h4>
    <p style="color: var(--text-muted); font-size: 0.95rem;">Query has been forwarded to respective team. They will look into it.</p>
  </div>`;
}

function handleChatbotSubmit() {
  const activePage = window.location.hash.replace('#', '') || 'home';
  if (activePage === 'home') {
    submitSupportTicket();
  } else {
    submitChatbotQuery();
  }
}

async function submitChatbotQuery() {
  if (!currentUser) {
    showToast('Login Required', 'Please log in to use the AI Assistant.', 'warning');
    return;
  }

  const message = document.getElementById('chatbot-message').value.trim();
  if (!message) {
    showToast('Empty Message', 'Please enter a query before submitting.', 'info');
    return;
  }

  const activePage = window.location.hash.replace('#', '') || 'home';
  const resultsSection = document.getElementById('chatbot-results-section');
  const moduleContent = document.getElementById('chatbot-module-content');
  const completeBtn = document.getElementById('chatbot-complete-btn');

  // Home Page Feedback Bypass
  if (activePage === 'home') {
    document.getElementById('chatbot-form-section').style.display = 'none';
    resultsSection.style.display = 'flex';
    completeBtn.style.display = 'none';
    moduleContent.innerHTML = `<div style="background: var(--surface); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border); text-align: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Query Submitted</h4>
      <p style="color: var(--text-muted); font-size: 0.95rem;">Your query has been submitted and the respective team will look into this.</p>
    </div>`;
    return;
  }

  // Determine N8N Context
  let contextType = 'general_assistant';
  if (activePage === 'rights') contextType = 'legal_advisor';
  else if (activePage === 'courses') contextType = 'skill_course';
  else if (activePage === 'voice') contextType = 'voice_assistant';

  // Switch to Loading View
  document.getElementById('chatbot-form-section').style.display = 'none';
  resultsSection.style.display = 'none';
  document.getElementById('chatbot-loading-section').style.display = 'flex';

  // Call Webhook
  const result = await callN8nWebhook(message, contextType);

  // Hide loading
  document.getElementById('chatbot-loading-section').style.display = 'none';
  resultsSection.style.display = 'flex';
  completeBtn.style.display = 'none';

  if (result.content) {
    let chapters = [];
    const jsonMatch = result.content.match(/\[[\s\S]*\]/) || result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) chapters = parsed;
        else if (parsed.chapters && Array.isArray(parsed.chapters)) chapters = parsed.chapters;
      } catch (e) {}
    }
    
    if (chapters.length === 0) {
      chapters = [{
        title: "AI Response",
        content: result.content
      }];
    }

    if (activePage === 'courses') {
      // Skill Course: Render structured UI INLINE in chatbot
      let html = '';
      chapters.forEach(ch => {
        let contentHtml = markdownToHtml(ch.content || ch.description || ch.text || JSON.stringify(ch));
        html += `<div style="background: var(--surface-hover); padding: 1.2rem; border-radius: var(--radius-md); border-left: 4px solid var(--secondary); margin-bottom: 1rem;">
          <h4 style="color: var(--primary); font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.02em;">${ch.title || 'Insight'}</h4>
          <div style="font-size: 0.95rem; line-height: 1.6; color: var(--text);">${contentHtml}</div>
        </div>`;
      });
      moduleContent.innerHTML = html;
      completeBtn.style.display = 'block'; // Allow them to complete it inline
    } else {
      // Other pages: Launch large module popup
      openAILegalModuleInModal(message, chapters, null);
      moduleContent.innerHTML = `<div style="background: var(--surface); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); font-size: 0.9rem; line-height: 1.5; text-align: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p style="color: var(--text-muted); font-weight: 500;">Your module has been generated and opened on your screen.</p>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">If you have any other query then click on Ask Another Query.</p>
      </div>`;
    }
  } else {
    moduleContent.innerHTML = `<div style="color: #EF4444; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: var(--radius-md);">Error: ${result.error || 'Failed to get response from N8N'}</div>`;
  }
}

function completeChatbotModule() {
  showToast('Module Completed!', 'Congratulations on completing this generated module.', 'success');
  toggleChatbot(); // close chatbot
}

function resetChatbotUI() {
  document.getElementById('chatbot-message').value = '';
  document.getElementById('chatbot-form-section').style.display = 'block';
  document.getElementById('chatbot-loading-section').style.display = 'none';
  document.getElementById('chatbot-results-section').style.display = 'none';
}


// ============================================================
// FEATURE: YOUTUBE COURSE FINDER
// ============================================================

// Motivational quotes array for loading phase
const motivationalQuotes = [
  '"The beautiful thing about learning is that nobody can take it away from you." — B.B. King',
  '"Education is the passport to the future, for tomorrow belongs to those who prepare for it today." — Malcolm X',
  '"Live as if you were to die tomorrow. Learn as if you were to live forever." — Mahatma Gandhi',
  '"The mind is not a vessel to be filled, but a fire to be kindled." — Plutarch',
  '"Learning is not attained by chance, it must be sought for with ardor and diligence." — Abigail Adams'
];

let quoteInterval = null;

function startQuoteRotation() {
  const quoteEl = document.getElementById('yt-loading-quote');
  let index = 0;
  quoteInterval = setInterval(() => {
    index = (index + 1) % motivationalQuotes.length;
    quoteEl.style.opacity = 0;
    setTimeout(() => {
      quoteEl.innerText = motivationalQuotes[index];
      quoteEl.style.opacity = 1;
    }, 300);
  }, 4000);
}

function stopQuoteRotation() {
  if (quoteInterval) {
    clearInterval(quoteInterval);
    quoteInterval = null;
  }
}

// Fallback high-quality mock data when YouTube API key is missing
const mockYTSearchData = {
  "python": [
    { id: { videoId: "_uQrJ0TkZlc" }, snippet: { title: "Python for Beginners - Full Course [Video]", channelTitle: "Programming with Mosh", thumbnails: { medium: { url: "https://img.youtube.com/vi/_uQrJ0TkZlc/0.jpg" } } } },
    { id: { playlistId: "PLu0W_TkaRv5l1I2s2YJTa4_xL1T9v8hB7" }, snippet: { title: "Python Tutorial for Beginners in Hindi [Playlist]", channelTitle: "CodeWithHarry", thumbnails: { medium: { url: "https://img.youtube.com/vi/aqvDGMrAYYY/0.jpg" } } } },
    { id: { videoId: "rfscVS0vtbw" }, snippet: { title: "Learn Python - Full Course for Beginners [Video]", channelTitle: "freeCodeCamp.org", thumbnails: { medium: { url: "https://img.youtube.com/vi/rfscVS0vtbw/0.jpg" } } } },
    { id: { playlistId: "PLsyeobzWly7oAZg81Yn58VqV27qcAUI9V" }, snippet: { title: "Python Programming Tutorial for Beginners [Playlist]", channelTitle: "Telusko", thumbnails: { medium: { url: "https://img.youtube.com/vi/hEgO047GxaQ/0.jpg" } } } },
    { id: { videoId: "JJmcL11AHZk" }, snippet: { title: "Python Crash Course [Video]", channelTitle: "Traversy Media", thumbnails: { medium: { url: "https://img.youtube.com/vi/JJmcL11AHZk/0.jpg" } } } }
  ],
  "web development": [
    { id: { videoId: "mU6an7GHgDo" }, snippet: { title: "Web Development Full Course - 10 Hours [Video]", channelTitle: "Edureka", thumbnails: { medium: { url: "https://img.youtube.com/vi/mU6an7GHgDo/0.jpg" } } } },
    { id: { playlistId: "PLu0W_TkaRv5wNTHsKpODW-nfnO-pkvWOC" }, snippet: { title: "Web Development Course for Beginners in Hindi [Playlist]", channelTitle: "CodeWithHarry", thumbnails: { medium: { url: "https://img.youtube.com/vi/6mbwJ2ElQ6M/0.jpg" } } } },
    { id: { videoId: "zjs2608S00w" }, snippet: { title: "Learn Web Development - Complete Course [Video]", channelTitle: "freeCodeCamp.org", thumbnails: { medium: { url: "https://img.youtube.com/vi/zjs2608S00w/0.jpg" } } } },
    { id: { playlistId: "PL4cUxeGkcC9ivBf_1xTOdxLDc5h9WnZ8X" }, snippet: { title: "HTML & CSS Tutorial for Beginners [Playlist]", channelTitle: "Net Ninja", thumbnails: { medium: { url: "https://img.youtube.com/vi/hu-q2zYwEYs/0.jpg" } } } },
    { id: { videoId: "Q33K3kGXyHU" }, snippet: { title: "Full Stack Web Development Course [Video]", channelTitle: "Clever Programmer", thumbnails: { medium: { url: "https://img.youtube.com/vi/Q33K3kGXyHU/0.jpg" } } } }
  ]
};

const mockYTPlaylistItems = {
  "PLu0W_TkaRv5l1I2s2YJTa4_xL1T9v8hB7": [
    { snippet: { title: "Introduction to Python & Setup", resourceId: { videoId: "aqvDGMrAYYY" } } },
    { snippet: { title: "Variables and Data Types in Python", resourceId: { videoId: "Tto8TS-fJQU" } } },
    { snippet: { title: "Strings & Slicing in Python", resourceId: { videoId: "e9yA716Ssig" } } },
    { snippet: { title: "Conditionals, Loops & Functions", resourceId: { videoId: "FLM52XN_H0c" } } }
  ],
  "PLsyeobzWly7oAZg81Yn58VqV27qcAUI9V": [
    { snippet: { title: "Python Introduction & History", resourceId: { videoId: "hEgO047GxaQ" } } },
    { snippet: { title: "Python Installation on Windows & Mac", resourceId: { videoId: "Eaz5e6M8EEM" } } },
    { snippet: { title: "Variables and Operators", resourceId: { videoId: "PqyN01yL-u4" } } },
    { snippet: { title: "Lists, Tuples, Sets and Dictionaries", resourceId: { videoId: "Gq6O1XW9Poc" } } }
  ],
  "PLu0W_TkaRv5wNTHsKpODW-nfnO-pkvWOC": [
    { snippet: { title: "Introduction to Web Development & HTML", resourceId: { videoId: "6mbwJ2ElQ6M" } } },
    { snippet: { title: "CSS Basics & Selectors", resourceId: { videoId: "ESnrn1kAD4E" } } },
    { snippet: { title: "JavaScript Introduction & Syntax", resourceId: { videoId: "vLnPwxZdW4Y" } } },
    { snippet: { title: "Building our First Responsive Website", resourceId: { videoId: "T7a0a6d1kYg" } } }
  ],
  "PL4cUxeGkcC9ivBf_1xTOdxLDc5h9WnZ8X": [
    { snippet: { title: "HTML Basics & Introduction", resourceId: { videoId: "hu-q2zYwEYs" } } },
    { snippet: { title: "CSS Colors, Fonts and Styling", resourceId: { videoId: "yfoY53QXGg0" } } },
    { snippet: { title: "Flexbox Layout & Grid System", resourceId: { videoId: "3YW6_f2dKks" } } }
  ]
};

async function searchYouTubeCourses() {
  const courseName = document.getElementById('yt-course-name').value.trim();
  const level = document.getElementById('yt-course-level').value;
  const lang = document.getElementById('yt-course-lang').value.trim();

  if (!courseName) {
    showToast('Missing Fields', 'Please enter a course name.', 'info');
    return;
  }

  // Show loading
  document.getElementById('yt-finder-form').style.display = 'none';
  document.getElementById('yt-finder-loading').style.display = 'flex';
  document.getElementById('yt-finder-results').style.display = 'none';
  
  startQuoteRotation();

  // Build Query
  const searchQuery = `${courseName} course ${level} level in ${lang}`;
  
  // Decide whether to search via API or mock
  let results = [];
  const isUsingRealAPI = YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'YOUR-YOUTUBE-API-KEY-HERE';

  // Timeout simulator for nice UX
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (isUsingRealAPI) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=5&type=video,playlist&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.items) {
        results = data.items;
      }
    } catch (e) {
      console.error('YouTube Search Failed, loading mock fallback', e);
    }
  }

  // Fallback to high quality mock data if search has 0 items or API key was offline
  if (results.length === 0) {
    const key = courseName.toLowerCase();
    let foundKey = "python";
    if (key.includes("web") || key.includes("html") || key.includes("css") || key.includes("js") || key.includes("dev")) {
      foundKey = "web development";
    }
    
    // Create custom titles based on what they wanted to learn
    const defaultFallback = mockYTSearchData[foundKey];
    results = defaultFallback.map(item => {
      const newItem = JSON.parse(JSON.stringify(item));
      newItem.snippet.title = newItem.snippet.title.replace("Python", courseName).replace("Web Development", courseName);
      return newItem;
    });
  }

  stopQuoteRotation();
  document.getElementById('yt-finder-loading').style.display = 'none';
  
  // Render results
  const resultsContainer = document.getElementById('yt-finder-results');
  resultsContainer.style.display = 'block';
  resultsContainer.innerHTML = `
    <h3>Select Your Instructor</h3>
    ${!isUsingRealAPI ? `<p class="yt-subtitle-note" style="background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2); color: #D97706;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Demonstration Mode: Offline fallback course items loaded. Configure a YouTube API key for live search results.</p>` : ''}
    <div class="yt-results-grid">
      ${results.map((item, idx) => {
        const title = item.snippet?.title || 'Unknown Title';
        const channel = item.snippet?.channelTitle || 'Unknown Channel';
        const thumb = item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || 'https://via.placeholder.com/320x180?text=No+Thumbnail';
        const isPlaylist = !!item.id?.playlistId;
        const idVal = isPlaylist ? item.id.playlistId : item.id?.videoId;
        const typeBadge = isPlaylist ? 'Playlist' : 'Full Video';
        
        // Skip if no valid ID
        if (!idVal) return '';

        return `
          <div class="yt-card">
            <div class="yt-thumb-wrap">
              <img class="yt-thumb" src="${thumb}" alt="${title}">
              <span class="yt-badge">${typeBadge}</span>
            </div>
            <div class="yt-card-body">
              <h4 class="yt-card-title">${title}</h4>
              <p class="yt-card-channel">${channel}</p>
              <button class="btn btn-cta btn-sm yt-card-btn" onclick="previewYTCourse('${idVal}', ${isPlaylist}, '${escapeHtml(title)}', '${escapeHtml(lang)}')">Preview Topics</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <button class="btn btn-outline btn-sm" style="margin-top: 1.5rem;" onclick="cancelYTSearch()">Change search details</button>
  `;
}

function escapeHtml(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function cancelYTSearch() {
  document.getElementById('yt-finder-results').style.display = 'none';
  document.getElementById('yt-finder-form').style.display = 'block';
}

async function previewYTCourse(idVal, isPlaylist, title, lang) {
  document.getElementById('yt-finder-results').style.display = 'none';
  document.getElementById('yt-finder-loading').style.display = 'flex';
  
  let chapters = [];
  const isUsingRealAPI = YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'YOUR-YOUTUBE-API-KEY-HERE';

  if (isPlaylist) {
    if (isUsingRealAPI) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${idVal}&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.items) {
          chapters = data.items.map(item => ({
            title: item.snippet.title,
            videoId: item.snippet.resourceId.videoId
          }));
        }
      } catch (e) {
        console.error('Failed to fetch playlist items from YouTube API', e);
      }
    }

    if (chapters.length === 0) {
      const mockItems = mockYTPlaylistItems[idVal] || [
        { snippet: { title: "Chapter 1: Getting Started and Environment Setup", resourceId: { videoId: "aqvDGMrAYYY" } } },
        { snippet: { title: "Chapter 2: Variables, Constants and Core Syntax", resourceId: { videoId: "Tto8TS-fJQU" } } },
        { snippet: { title: "Chapter 3: Controls, Branching and Functions", resourceId: { videoId: "FLM52XN_H0c" } } },
        { snippet: { title: "Chapter 4: Advanced Principles & Real Applications", resourceId: { videoId: "aqvDGMrAYYY" } } }
      ];
      chapters = mockItems.map(item => ({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId
      }));
    }
  } else {
    chapters = [{ title: "Full Course Video Lesson", videoId: idVal }];
  }

  const topic = document.getElementById('yt-course-name').value.trim() || 'Custom Learning';
  const level = document.getElementById('yt-course-level').value;

  window._tempCourseToSave = { idVal, isPlaylist, title, lang, chapters, topic, level };

  document.getElementById('yt-finder-loading').style.display = 'none';
  const previewEl = document.getElementById('yt-preview-screen');
  previewEl.style.display = 'block';
  previewEl.innerHTML = `
    <div style="background: var(--surface); border-radius: var(--radius-lg); padding: var(--space-lg); border: 1px solid var(--border);">
      <h3 style="margin-top: 0; color: var(--primary);">Topics Covered in this Course</h3>
      <p style="color: var(--text-muted); font-size: var(--fs-sm); margin-bottom: var(--space-md);">${chapters.length} topics • ${level} Level • ${lang}</p>
      <ul style="list-style: none; padding: 0; margin: 0 0 var(--space-lg) 0; display: flex; flex-direction: column; gap: var(--space-sm);">
        ${chapters.map((c, i) => `
          <li style="display: flex; gap: var(--space-sm); align-items: flex-start; font-size: var(--fs-sm);">
            <span style="color: var(--cta); font-weight: 700;">${i+1}.</span>
            <span style="color: var(--text);">${c.title}</span>
          </li>
        `).join('')}
      </ul>
      <div style="display: flex; gap: var(--space-sm);">
        <button class="btn btn-outline" onclick="backToYTSearchResults()">Go Back</button>
        <button class="btn btn-cta" style="flex: 1;" onclick="saveYTCourse()">Choose this Course</button>
      </div>
    </div>
  `;
}

function backToYTSearchResults() {
  document.getElementById('yt-preview-screen').style.display = 'none';
  document.getElementById('yt-finder-results').style.display = 'block';
}

function saveYTCourse() {
  const data = window._tempCourseToSave;
  if (!data) return;
  
  // Logic: 2 Courses Maximum Per Topic
  const coursesInTopic = skillCourses.filter(c => c.isCustom && c.topic.toLowerCase() === data.topic.toLowerCase());
  if (coursesInTopic.length >= 2) {
    showToast('Limit Reached', 'You can only add 2 courses per topic. Please delete an older course first.', 'warning');
    return;
  }

  const newCourse = {
    id: `sc-custom-${Date.now()}`,
    title: data.title,
    topic: data.topic,
    description: `Level: ${data.level} | Language: ${data.lang}. Master this course step by step.`,
    icon: 'monitor',
    color: 'purple',
    progress: 0,
    isCustom: true,
    idVal: data.idVal,
    isPlaylist: data.isPlaylist,
    lang: data.lang,
    chapters: data.chapters
  };

  skillCourses.push(newCourse);
  saveCustomCoursesToStorage();

  document.getElementById('yt-preview-screen').style.display = 'none';
  closeCourseModal();
  document.getElementById('yt-course-name').value = '';

  renderCourseCards();
  showToast('Course Added!', `"${data.title}" has been added as a card below.`, 'success');
}

function saveCustomCoursesToStorage() {
  if (!currentUser) return;
  const customOnly = skillCourses.filter(c => c.isCustom);
  localStorage.setItem(`empowerall_custom_courses_${currentUser.email}`, JSON.stringify(customOnly));
}

function loadCustomCoursesFromStorage() {
  if (!currentUser) return;
  try {
    const saved = localStorage.getItem(`empowerall_custom_courses_${currentUser.email}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      for (let i = skillCourses.length - 1; i >= 0; i--) {
        if (skillCourses[i].isCustom) {
          skillCourses.splice(i, 1);
        }
      }
      skillCourses.push(...parsed);
    }
  } catch (e) {
    console.error('Failed to load custom courses:', e);
  }
}

function playYTChapterInModal(videoId, title, element) {
  // Mark active chapter
  document.querySelectorAll('.yt-chapter-item').forEach(item => item.classList.remove('active'));
  if (element) element.classList.add('active');
  
  // Update video container with new click-to-play player for this chapter
  const container = document.getElementById('module-video-container');
  if (container) {
    container.innerHTML = createYTPlayer(videoId, title || 'Chapter Video');
  }
}

function completeYTCourseCard(courseId) {
  const course = skillCourses.find(c => c.id === courseId);
  if (course) {
    course.progress = 100;
    const coursesProgress = JSON.parse(localStorage.getItem('empowerall_courses_progress') || '[]');
    const existing = coursesProgress.find(p => p.id === courseId);
    if (existing) {
      existing.progress = 100;
    } else {
      coursesProgress.push({ id: courseId, progress: 100 });
    }
    localStorage.setItem('empowerall_courses_progress', JSON.stringify(coursesProgress));
    renderCourseCards();
  }
  document.getElementById('module-overlay').classList.remove('active');
  document.body.style.overflow = '';
  showToast('Course Completed!', 'Congratulations! Keep learning and growing.', 'success');
}

// ============================================================
// FEATURE: AI QUIZ GENERATOR (N8N Webhook Integration)
// Uses N8N AI + YouTube transcript to generate questions
// ============================================================

let _aiQuizSelections = {};

async function generateAIQuizForYTVideo(videoId, videoTitle, courseId) {
  const btn = document.getElementById('btn-generate-ai-quiz');
  const loadingEl = document.getElementById('ai-quiz-loading');
  const outputEl = document.getElementById('ai-quiz-output');
  const loadingText = document.getElementById('ai-quiz-loading-text');

  if (!btn || !loadingEl || !outputEl) return;

  // Show loading
  btn.disabled = true;
  btn.style.opacity = '0.6';
  loadingEl.style.display = 'flex';
  outputEl.style.display = 'none';
  _aiQuizSelections = {};

  let questions = [];
  let quizError = '';

  // --- CHECK CACHE FIRST ---
  const cacheKey = `empowerall_quiz_${videoId}`;
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      const parsedCache = JSON.parse(cachedData);
      if (parsedCache.questions && parsedCache.questions.length > 0) {
        renderAIQuiz(parsedCache.questions, videoId, videoTitle, "");
        loadingEl.style.display = 'none';
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.textContent = 'Regenerate Questions';
        return;
      } else if (parsedCache.rawString) {
        // Render raw string text format
        outputEl.style.display = 'block';
        outputEl.innerHTML = `
          <div style="border-top: 1px solid var(--border); padding-top: var(--space-md); margin-top: var(--space-md);">
            <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md);">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 7h8"/><path d="M8 11h8"/></svg>
              <h4 style="margin:0; font-weight:700; color:var(--primary);">AI Response</h4>
            </div>
            <div style="background: var(--surface-hover); border-radius: var(--radius-md); padding: var(--space-md); border: 1px solid var(--border);">
              ${markdownToHtml(parsedCache.rawString)}
            </div>
          </div>
        `;
        loadingEl.style.display = 'none';
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.textContent = 'Regenerate Questions';
        return;
      }
    } catch(e) {}
  }

  // --- GENERATE QUIZ ---
  if (loadingText) loadingText.textContent = 'Analysing video and generating questions for you.';

  const ytLink = `https://www.youtube.com/watch?v=${videoId}`;

  // Only pass the link as requested, the N8N workflow handles the prompt
  let quizResult = null;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    quizResult = await callN8nWebhook(ytLink, 'skill_course_quiz');
    
    if (quizResult.content) {
      break; // Success!
    }
    
    // If it's a network/CORS error from a timeout or 504, keep trying
    if (quizResult.error && (quizResult.error.includes('Failed to fetch') || quizResult.error.includes('504') || quizResult.error.includes('502'))) {
      attempts++;
      if (attempts < maxAttempts) {
        if (loadingText) loadingText.textContent = `Still analysing video and generating questions... (This is a large video, please wait)`;
        // Wait 8 seconds before pinging again
        await new Promise(resolve => setTimeout(resolve, 8000));
      }
    } else {
      break; // Other fatal error, stop retrying
    }
  }

  // Custom Markdown Parser for Quiz — handles ALL N8N response formats
  function parseMarkdownQuiz(markdown) {
    const qs = [];
    if (!markdown || typeof markdown !== 'string') return qs;
    
    // Normalize ALL possible newline variants
    let text = markdown;
    text = text.replace(/\\r\\n/g, '\n');  // literal \r\n
    text = text.replace(/\\n/g, '\n');     // literal \n  
    text = text.replace(/\r\n/g, '\n');   // actual \r\n
    text = text.replace(/\r/g, '\n');     // actual \r
    // Handle cases where \\n appears (double-escaped)
    text = text.replace(/\\\\n/g, '\n');
    
    // Strip leading/trailing ** from lines (bold markers)
    text = text.replace(/\*\*/g, '');
    
    // Log for debugging
    console.log('🔍 Quiz raw text (first 500 chars):', text.substring(0, 500));
    console.log('🔍 Quiz raw text has real newlines:', text.includes('\n'));
    
    // STRATEGY 1: Standard MCQ format
    const mcqRegex = /(?:MCQ\s*\d*\s*)?Question(?:\s*\d+)?[:\s]+([^\n]+)\s*\n+\s*A[.)]\s*([^\n]+)\s*\n+\s*B[.)]\s*([^\n]+)\s*\n+\s*C[.)]\s*([^\n]+)\s*\n+\s*D[.)]\s*([^\n]+)\s*\n+\s*(?:Correct\s+)?[Aa]nswer[:\s]+([A-Da-d])\s*\n+\s*(?:Short\s+)?[Ee]xplanation[:\s]+([^\n]+)/g;
    let match;
    while ((match = mcqRegex.exec(text)) !== null) {
      qs.push({
        question: match[1].trim(),
        options: [match[2].trim(), match[3].trim(), match[4].trim(), match[5].trim()],
        answer: match[6].toUpperCase().charCodeAt(0) - 65,
        explanation: match[7].trim()
      });
    }
    
    // STRATEGY 2: If strategy 1 found nothing, try splitting by --- or MCQ headers
    if (qs.length === 0) {
      // Split by --- dividers or "MCQ X" headers
      const blocks = text.split(/(?:---+|MCQ\s*\d+)/i).filter(b => b.trim());
      
      for (const block of blocks) {
        const qMatch = block.match(/Question[:\s]+([^\n]+)/i);
        const aMatch = block.match(/\n\s*A[.)]\s*([^\n]+)/i);
        const bMatch = block.match(/\n\s*B[.)]\s*([^\n]+)/i);
        const cMatch = block.match(/\n\s*C[.)]\s*([^\n]+)/i);
        const dMatch = block.match(/\n\s*D[.)]\s*([^\n]+)/i);
        const ansMatch = block.match(/(?:Correct\s+)?[Aa]nswer[:\s]+([A-Da-d])/i);
        const expMatch = block.match(/(?:Short\s+)?[Ee]xplanation[:\s]+([^\n]+)/i);
        
        if (qMatch && aMatch && bMatch && ansMatch) {
          qs.push({
            question: qMatch[1].trim(),
            options: [
              aMatch[1].trim(),
              bMatch[1].trim(),
              cMatch ? cMatch[1].trim() : '',
              dMatch ? dMatch[1].trim() : ''
            ].filter(o => o),
            answer: ansMatch[1].toUpperCase().charCodeAt(0) - 65,
            explanation: expMatch ? expMatch[1].trim() : 'See the video for a detailed explanation.'
          });
        }
      }
    }
    
    // STRATEGY 3: If still nothing, try line-by-line parsing
    if (qs.length === 0) {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      let currentQ = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detect question line (matches "MCQ 1 Question: ...", "Question 1:", "Q1.", "1.", "1)")
        const questionMatch = line.match(/^(?:MCQ\s*\d*\s*)?(?:Question|Q)(?:\s*\d+)?[:.\s]+(.+)/i) || line.match(/^\d+[.)]\s*(.+)/);
        if (questionMatch && !line.match(/^[A-D][.)]/i)) {
          if (currentQ && currentQ.question && currentQ.options.length >= 2 && currentQ.answerLetter) {
            currentQ.answer = currentQ.answerLetter.toUpperCase().charCodeAt(0) - 65;
            delete currentQ.answerLetter;
            qs.push(currentQ);
          }
          currentQ = { question: questionMatch[1].trim(), options: [], answer: 0, explanation: '' };
          continue;
        }
        
        if (!currentQ) continue;
        
        // Detect options
        const optMatch = line.match(/^([A-D])[.)]\s*(.+)/i) || line.match(/^[*-]\s*([A-D])[.)]\s*(.+)/i);
        if (optMatch) {
          const optionText = optMatch[2] ? optMatch[2].trim() : optMatch[1].trim();
          currentQ.options.push(optionText);
          continue;
        }
        
        // Detect answer
        const ansMatch = line.match(/^(?:Correct\s+)?(?:Answer|Ans)[\s:*-]+([A-Da-d])/i) || line.match(/^[*-]\s*(?:Correct\s+)?(?:Answer|Ans)[\s:*-]+([A-Da-d])/i);
        if (ansMatch) {
          currentQ.answerLetter = ansMatch[1];
          continue;
        }
        
        // Detect explanation
        const expMatch = line.match(/^(?:Short\s+)?(?:Explanation|Reason)[\s:*-]+(.+)/i) || line.match(/^[*-]\s*(?:Short\s+)?(?:Explanation|Reason)[\s:*-]+(.+)/i);
        if (expMatch) {
          currentQ.explanation = expMatch[1].trim();
          continue;
        }
      }
      
      // Push the last question
      if (currentQ && currentQ.question && currentQ.options.length >= 2 && currentQ.answerLetter) {
        currentQ.answer = currentQ.answerLetter.toUpperCase().charCodeAt(0) - 65;
        delete currentQ.answerLetter;
        qs.push(currentQ);
      }
    }
    
    // Robust Regex to match Self-Practice
    const spRegex = /Self-practice(?:\s*\d+)?\s+Question[:\s]+([^\n]+)\s*\n+\s*(?:Guidance|Explanation)[:\s]+([^\n]+)/gi;
    while ((match = spRegex.exec(text)) !== null) {
      qs.push({
        question: "[Self-Practice] " + match[1].trim(),
        options: ["I have thought about my answer (Click to reveal Guidance)"],
        answer: 0,
        explanation: match[2].trim()
      });
    }
    
    console.log(`✅ parseMarkdownQuiz found ${qs.length} questions`);
    return qs;
  }

  // Helper to extract raw string from N8N response
  // N8N typically returns: [{output: "...quiz text..."}] or [{text: "..."}] or a plain string
  function getRawString(res) {
    if (typeof res === 'string') {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(res);
        // Array format: [{output: "..."}, ...] — most common N8N format
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          return first.output || first.text || first.data || first.content || first.message || JSON.stringify(first);
        }
        // Object format: {output: "..."} or {data: "..."}
        if (parsed && typeof parsed === 'object') {
          return parsed.output || parsed.text || parsed.data || parsed.content || parsed.message || res;
        }
        // It was a plain JSON string
        if (typeof parsed === 'string') return parsed;
      } catch(e) {
        // Not valid JSON — return as-is (it's already a plain text string)
      }
      return res;
    }
    return res;
  }

  let rawString = '';
  if (quizResult.content) {
    rawString = getRawString(quizResult.content);
    questions = parseMarkdownQuiz(rawString);
    if (questions.length === 0 && !rawString) {
      quizError = quizResult.error || 'Empty response from AI.';
    }
  } else {
    quizError = quizResult.error || 'AI unavailable';
  }

  // Handle Error State in Loading Container
  if (quizError) {
    if (loadingText) {
      loadingText.textContent = `Error: ${quizError}`;
      loadingText.style.color = '#EF4444';
    }
    const spinner = loadingEl.querySelector('.ai-spinner');
    if (spinner) spinner.style.display = 'none';

    btn.textContent = 'Generate Questions';
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.color = '';
    btn.style.borderColor = '';
    return; // STOP execution here
  }

  // If we reach here, we succeeded. We either have 'questions' (Array) or 'rawString' (Text)
  if (questions.length > 0) {
    // Render standard interactive quiz
    renderAIQuiz(questions, videoId, videoTitle, "");
    localStorage.setItem(cacheKey, JSON.stringify({ questions }));
  } else {
    // Render the raw string in text format using markdownToHtml!
    outputEl.style.display = 'block';
    outputEl.innerHTML = `
      <div style="border-top: 1px solid var(--border); padding-top: var(--space-md); margin-top: var(--space-md);">
        <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md);">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 7h8"/><path d="M8 11h8"/></svg>
          <h4 style="margin:0; font-weight:700; color:var(--primary);">AI Response</h4>
        </div>
        <div style="background: var(--surface-hover); border-radius: var(--radius-md); padding: var(--space-md); border: 1px solid var(--border);">
          ${markdownToHtml(rawString)}
        </div>
      </div>
    `;
    localStorage.setItem(cacheKey, JSON.stringify({ rawString }));
  }

  loadingEl.style.display = 'none';
  btn.disabled = false;
  btn.style.opacity = '1';
  btn.textContent = 'Regenerate Questions';
  btn.style.color = '';
  btn.style.borderColor = '';
}


function getSimulatedTranscript(videoTitle) {
  const title = videoTitle.toLowerCase();
  if (title.includes('python') || title.includes('programming') || title.includes('code')) {
    return `Welcome to the Introduction to Python Programming! In this lecture, we'll cover the building blocks of coding. First, we have variables. A variable is simply a named storage space in memory that holds a data value. For example, x equals five. Next, we use functions to encapsulate blocks of code so we can run them repeatedly without rewriting. To find errors in our code, we perform debugging. Debugging is the systematic process of locating and resolving bugs or logical mistakes. Loops like while and for allow repeating blocks of code based on conditions. Finally, we work with basic data types like integers, which represent whole numbers. This wraps up our core concepts.`;
  }
  if (title.includes('ai') || title.includes('machine learning') || title.includes('generative') || title.includes('neural')) {
    return `Welcome! Today we will explore Artificial Intelligence (AI). AI refers to computer systems engineered to mimic human cognitive processes. A neural network is a machine learning structure modeled closely after the human brain's interconnected pathways. To build a model, we perform training, where we present the system with rich data examples. A common issue is overfitting, which happens when the model memorizes the training data but fails to predict unseen data. Generative AI is a subset designed to create entirely new content, including text, images, and audio.`;
  }
  return `Welcome back to another course module. Today we will dive deep into "${videoTitle}". Technical skill development relies on consistent, hands-on practice. Rather than just reading theory, you must build projects. When you encounter complex topics, break them into smaller parts. Finally, make sure to revise and test yourself, as structured testing reinforces memory retention. Let's get started.`;
}

function generateFallbackQuiz(videoTitle) {
  const title = videoTitle.toLowerCase();
  
  // Topic-aware fallback questions
  if (title.includes('python') || title.includes('programming') || title.includes('code')) {
    return [
      { question: 'What is the primary purpose of a variable in programming?', options: ['To store data values', 'To create loops', 'To define functions', 'To import modules'], answer: 0, explanation: 'Variables are containers that store data values for use throughout a program.' },
      { question: 'Which concept allows reusing blocks of code without rewriting them?', options: ['Variables', 'Functions', 'Comments', 'Indentation'], answer: 1, explanation: 'Functions encapsulate reusable logic that can be called multiple times.' },
      { question: 'What does "debugging" mean in programming?', options: ['Writing new code', 'Finding and fixing errors', 'Compiling code', 'Running code faster'], answer: 1, explanation: 'Debugging is the process of identifying and resolving bugs (errors) in code.' },
      { question: 'What is a loop used for in programming?', options: ['Storing data', 'Repeating a block of code', 'Ending a program', 'Declaring variables'], answer: 1, explanation: 'Loops allow executing code repeatedly based on a condition.' },
      { question: 'Which of these is a fundamental data type in most programming languages?', options: ['Widget', 'Integer', 'Module', 'Library'], answer: 1, explanation: 'Integer is a basic data type representing whole numbers.' }
    ];
  }
  if (title.includes('ai') || title.includes('machine learning') || title.includes('generative') || title.includes('neural')) {
    return [
      { question: 'What does AI stand for?', options: ['Automated Integration', 'Artificial Intelligence', 'Autonomous Interface', 'Applied Infrastructure'], answer: 1, explanation: 'AI stands for Artificial Intelligence — systems that mimic human cognitive functions.' },
      { question: 'What is a neural network modelled after?', options: ['Computer circuits', 'The human brain', 'Database tables', 'Cloud servers'], answer: 1, explanation: 'Neural networks are inspired by the structure and function of biological neurons.' },
      { question: 'What is "training" a model?', options: ['Writing code for AI', 'Teaching AI using data examples', 'Testing an AI model', 'Deploying an AI system'], answer: 1, explanation: 'Training involves feeding data to a model so it learns patterns and improves its accuracy.' },
      { question: 'What is overfitting in machine learning?', options: ['Model is too simple', 'Model memorises training data but fails on new data', 'Model trains too slowly', 'Model uses too little data'], answer: 1, explanation: 'Overfitting occurs when a model learns the training data too well and fails to generalise.' },
      { question: 'What is "Generative AI" primarily used for?', options: ['Only data analysis', 'Creating new content like text, images, or audio', 'Sorting databases', 'Network security'], answer: 1, explanation: 'Generative AI creates new content based on patterns learned from training data.' }
    ];
  }
  // Generic fallback
  return [
    { question: `What is the main topic covered in "${videoTitle}"?`, options: ['Introductory concepts', 'Advanced applications', 'Historical context', 'All of the above'], answer: 3, explanation: 'A comprehensive course video typically covers all these aspects of the topic.' },
    { question: 'What is the best approach to learn a new technical skill effectively?', options: ['Only reading theory', 'Practice with hands-on projects', 'Memorising facts', 'Watching videos without notes'], answer: 1, explanation: 'Hands-on practice reinforces learning and builds real competency.' },
    { question: 'What should you do when you encounter a difficult concept?', options: ['Skip it and move on', 'Break it into smaller parts and research each part', 'Give up on the course', 'Only ask others for answers'], answer: 1, explanation: 'Breaking complex topics into smaller parts makes them easier to understand and master.' },
    { question: 'Why is revision important after watching a tutorial?', options: ['It wastes time', 'It reinforces memory and understanding', 'It is only for exams', 'It makes videos shorter'], answer: 1, explanation: 'Revision strengthens neural pathways, improving long-term retention of information.' },
    { question: 'What makes a learner most successful with online courses?', options: ['Watching at 2x speed only', 'Consistency and practice', 'Completing the course in one day', 'Avoiding quizzes'], answer: 1, explanation: 'Consistent daily practice combined with self-testing leads to the best learning outcomes.' }
  ];
}

function renderAIQuiz(questions, videoId, videoTitle, transcriptText) {
  const outputEl = document.getElementById('ai-quiz-output');
  if (!outputEl) return;

  _aiQuizSelections = {};

  outputEl.style.display = 'block';
  outputEl.innerHTML = `
    <div style="border-top: 1px solid var(--border); padding-top: var(--space-md); margin-top: var(--space-md);">
      ${transcriptText ? `
      <details style="background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-md); margin-bottom: var(--space-lg); cursor: pointer;" class="details-premium">
        <summary style="font-weight: 700; color: var(--text); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); list-style: none; font-size: var(--fs-md);">
          <div style="display: flex; align-items: center; gap: var(--space-sm);">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cta)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 7h8"/><path d="M8 11h8"/></svg>
            <span>Show Video Transcript</span>
          </div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Click to toggle</span>
        </summary>
        <div style="margin-top: var(--space-md); padding: var(--space-md); border-top: 1px solid var(--border); max-height: 250px; overflow-y: auto; font-size: var(--fs-sm); line-height: 1.6; color: var(--text-muted); cursor: default;" onclick="event.stopPropagation()">
          ${transcriptText.split('\n').map(p => p.trim() ? `<p style="margin-bottom: var(--space-xs);">${p}</p>` : '').join('')}
        </div>
      </details>
      ` : ''}

      <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md);">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <h4 style="margin:0; font-weight:700; color:var(--primary);">Video Quiz — ${questions.length} Questions</h4>
      </div>
      <div id="ai-quiz-questions" style="display: flex; flex-direction: column; gap: var(--space-lg);">
        ${questions.map((q, i) => `
          <div class="ai-quiz-q" id="ai-quiz-q-${i}" style="background: var(--surface-hover); border-radius: var(--radius-md); padding: var(--space-md); border: 1px solid var(--border);">
            <p style="font-weight: 800; margin: 0 0 var(--space-md) 0; font-size: 1.1rem; background: linear-gradient(135deg, var(--primary), var(--cta)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Q${i+1}. ${q.question}</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${q.options.map((opt, j) => `
                <div class="ai-quiz-option" 
                     id="ai-qopt-${i}-${j}"
                     onclick="selectAIQuizOption(${i}, ${j}, ${q.answer})"
                     style="padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border); cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; background: var(--surface);"
                     onmouseover="if(!this.dataset.locked)this.style.borderColor='var(--primary)'"
                     onmouseout="if(!this.dataset.locked)this.style.borderColor='var(--border)'">
                  <span style="width:24px; height:24px; border-radius:50%; border: 2px solid var(--border); display:inline-flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:700; flex-shrink:0;" id="ai-qradio-${i}-${j}">${String.fromCharCode(65+j)}</span>
                  <span style="font-size: var(--fs-sm);">${opt}</span>
                </div>
              `).join('')}
            </div>
            <div id="ai-quiz-explanation-${i}" style="display:none; margin-top: var(--space-sm); padding: 10px 14px; border-radius: var(--radius-sm); font-size: var(--fs-sm); line-height:1.6;"></div>
          </div>
        `).join('')}
      </div>

      <div style="text-align: center; margin-top: var(--space-lg);">
        <button class="btn btn-cta btn-lg" onclick="submitAIQuiz(${JSON.stringify(questions).replace(/"/g, '&quot;')}, '${videoTitle.replace(/'/g,"\\'")}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Submit Quiz
        </button>
      </div>
      <div id="ai-quiz-score" style="display:none; margin-top: var(--space-md); text-align:center; padding: var(--space-md); border-radius: var(--radius-lg); background: linear-gradient(135deg, var(--primary-light, #EDE9FE), var(--surface));"></div>
    </div>
  `;

  // Store questions for submit
  window._currentAIQuizQuestions = questions;
  outputEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectAIQuizOption(questionIdx, optionIdx, correctIdx) {
  const qEl = document.getElementById(`ai-quiz-q-${questionIdx}`);
  if (!qEl || qEl.dataset.answered) return;
  
  _aiQuizSelections[questionIdx] = optionIdx;

  // Highlight selected option
  const options = qEl.querySelectorAll('.ai-quiz-option');
  options.forEach((opt, j) => {
    opt.style.borderColor = j === optionIdx ? 'var(--primary)' : 'var(--border)';
    opt.style.background = j === optionIdx ? 'linear-gradient(135deg, rgba(109,40,217,0.08), rgba(139,92,246,0.05))' : 'var(--surface)';
    const radio = document.getElementById(`ai-qradio-${questionIdx}-${j}`);
    if (radio) {
      radio.style.background = j === optionIdx ? 'var(--primary)' : '';
      radio.style.color = j === optionIdx ? 'white' : '';
      radio.style.borderColor = j === optionIdx ? 'var(--primary)' : 'var(--border)';
    }
  });
}

function submitAIQuiz(questions, videoTitle) {
  if (!questions) questions = window._currentAIQuizQuestions || [];
  let correct = 0;
  const total = questions.length;
  
  questions.forEach((q, i) => {
    const qEl = document.getElementById(`ai-quiz-q-${i}`);
    if (!qEl) return;
    
    const selected = _aiQuizSelections[i];
    const isCorrect = selected === q.answer;
    if (isCorrect) correct++;
    
    // Lock and colour all options
    const options = qEl.querySelectorAll('.ai-quiz-option');
    options.forEach((opt, j) => {
      opt.dataset.locked = 'true';
      opt.style.cursor = 'default';
      opt.onmouseover = null;
      opt.onmouseout = null;
      if (j === q.answer) {
        opt.style.background = 'rgba(34, 197, 94, 0.12)';
        opt.style.borderColor = '#22C55E';
      } else if (j === selected && selected !== q.answer) {
        opt.style.background = 'rgba(239, 68, 68, 0.10)';
        opt.style.borderColor = '#EF4444';
      }
    });
    qEl.dataset.answered = 'true';
    
    // Show explanation
    const explEl = document.getElementById(`ai-quiz-explanation-${i}`);
    if (explEl && q.explanation) {
      explEl.style.display = 'block';
      explEl.style.background = isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)';
      explEl.style.borderLeft = `3px solid ${isCorrect ? '#22C55E' : '#EF4444'}`;
      explEl.innerHTML = `<strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect.'}</strong> ${q.explanation}`;
    }
  });

  const pct = Math.round((correct / total) * 100);
  const scoreEl = document.getElementById('ai-quiz-score');
  const grade = pct >= 80 ? '🏆 Excellent!' : pct >= 60 ? '👍 Good work!' : pct >= 40 ? '📚 Keep practising!' : '💪 Review the video!';
  
  if (scoreEl) {
    scoreEl.style.display = 'block';
    scoreEl.innerHTML = `
      <h3 style="margin:0 0 8px 0; font-size:1.5rem; font-weight:800; color:var(--primary);">${grade}</h3>
      <p style="margin:0; font-size: var(--fs-lg); font-weight:700;">You scored <strong>${correct} / ${total}</strong> (${pct}%)</p>
      <p style="margin:8px 0 0; font-size:var(--fs-sm); color:var(--text-muted);">${pct >= 80 ? 'Excellent understanding of the video!' : 'Watch the highlighted questions again to improve.'}</p>
    `;
    scoreEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  showToast('Quiz Complete!', `You scored ${correct}/${total} — ${pct}%.`, pct >= 60 ? 'success' : 'info');
}

// ============================================================
// FEATURE: AI LEGAL ASSISTANT (N8N Webhook Integration)
// ============================================================

// Fallback high-quality local database for offline demonstrations
const mockLegalAnswers = [
  {
    keywords: ["discriminate", "caste", "colour", "race"],
    chapters: [
      {
        title: "1. Constitutional Protection (Article 15)",
        content: "Under **Article 15** of the Constitution of India, discrimination against any citizen on grounds only of religion, race, caste, sex, place of birth or any of them is strictly prohibited. This covers access to shops, public restaurants, hotels, and public entertainment places, as well as use of wells, tanks, and roads maintained by state funds."
      },
      {
        title: "2. The SC/ST Act (Prevention of Atrocities)",
        content: "If the discrimination is based on caste (SC/ST status), the **Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989** is applicable. Any action that humiliates, restricts access to, or harms a member of the SC/ST community is a non-bailable offence. Under Section 18 of the Act, anticipatory bail is generally denied to the accused to ensure immediate victim protection."
      },
      {
        title: "3. Mandatory Police Filing (FIR)",
        content: "You must visit the nearest Police Station to file a **First Information Report (FIR)**. The police are legally bound to register it. If they refuse, you can approach the Superintendent of Police (SP) under Section 154(3) CrPC, or submit a complaint online to the National Commission for Scheduled Castes (NCSC)."
      },
      {
        title: "4. Legal Remedies & Free Legal Aid",
        content: "Under **Section 12 of the Legal Services Authorities Act, 1987**, women and members of SC/ST communities are entitled to **Free Legal Aid**. You can visit the District Legal Services Authority (DLSA) office located in your local District Court to obtain a free lawyer to represent your case."
      }
    ]
  },
  {
    keywords: ["rent", "landlord", "security", "deposit", "tenant"],
    chapters: [
      {
        title: "1. Model Tenancy Act, 2021 Overview",
        content: "The **Model Tenancy Act (MTA), 2021** balances the rights of landlords and tenants in India. It mandates a written rent agreement registered with the Rent Authority. A landlord cannot cut off essential supplies (like water or electricity) under any circumstances during disputes."
      },
      {
        title: "2. Security Deposit Rules",
        content: "Under the Model Tenancy Act, the security deposit for residential premises is capped at a maximum of **2 months rent**. This deposit must be refunded by the landlord at the time of taking over vacant possession of the premises, after deducting valid dues."
      },
      {
        title: "3. Serving a Legal Notice",
        content: "If the landlord refuses to return your security deposit, the first formal step is to serve a **Legal Notice** via a lawyer or write one yourself, demanding return of the amount within 15 days. This acts as mandatory proof of your attempt to resolve the issue before litigation."
      },
      {
        title: "4. Rent Court / Rent Authority Remedy",
        content: "If the landlord fails to comply, you can file a petition before the local **Rent Court / Rent Authority** set up under your state's Rent Control Act. The court has the power to order the landlord to refund the security deposit along with interest and compensation."
      }
    ]
  },
  {
    keywords: ["mrp", "shopkeeper", "charge", "price", "overcharge"],
    chapters: [
      {
        title: "1. Legal Metrology Act, 2009",
        content: "Under the **Legal Metrology (Packaged Commodities) Rules, 2011**, selling any packaged commodity above the **Maximum Retail Price (MRP)** is a punishable offence. The MRP is inclusive of all taxes, and no retailer can charge extra under the guise of cooling charges, service charges, or local taxes."
      },
      {
        title: "2. Consumer Protection Act, 2019 Protection",
        content: "Overcharging is categorized as an **Unfair Trade Practice** under Section 2(47) of the Consumer Protection Act, 2019. It violates the consumer's Right to be Protected against unfair pricing."
      },
      {
        title: "3. Direct Action & Grievance Registration",
        content: "Step 1: Point out the rule to the shopkeeper and request they charge only the printed MRP. Step 2: Keep the payment invoice/receipt as evidence. Step 3: Register a complaint with the **National Consumer Helpline** by calling **1915** or texting on WhatsApp at **8130009809**."
      },
      {
        title: "4. Legal Metrology Complaint Portal",
        content: "You can file a formal complaint with the local Controller of Legal Metrology (Weights & Measures Department) of your state. Retailers can be fined up to ₹25,000 for the first offence, and up to ₹50,000 or imprisonment for subsequent violations."
      }
    ]
  }
];
async function getAILegalGuidance() {
  const query = document.getElementById('ai-legal-input').value.trim();
  if (!query) {
    showToast('Empty Field', 'Please enter your legal issue.', 'info');
    return;
  }

  // Show loading with new message
  const loadingContainer = document.getElementById('ai-legal-loading');
  loadingContainer.style.display = 'flex';
  
  // Create or update loading text dynamically
  let loadingText = loadingContainer.querySelector('.loading-text-msg');
  if (!loadingText) {
    loadingText = document.createElement('p');
    loadingText.className = 'loading-text-msg';
    loadingText.style.marginTop = 'var(--space-md)';
    loadingText.style.color = 'var(--text-muted)';
    loadingContainer.appendChild(loadingText);
  }
  loadingText.textContent = "We are working on the query to give you the exact module...";

  document.getElementById('ai-legal-results').style.display = 'none';

  let chapters = [];
  let legalAdvisorError = '';

  const legalResult = await callN8nWebhook(query, 'legal_advisor');

  if (legalResult.content) {
    const jsonMatch = legalResult.content.match(/\[[\s\S]*\]/) || legalResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) chapters = parsed;
        else if (parsed.chapters && Array.isArray(parsed.chapters)) chapters = parsed.chapters;
      } catch (e) {
        console.warn('Failed to parse legal JSON:', e);
      }
    }
    // If N8N returns an unstructured response, wrap it in a single chapter
    if (chapters.length === 0) {
      chapters = [{
        title: "AI Response",
        content: legalResult.content
      }];
    }
    console.log(`⚖️ Legal guidance via ${legalResult.source}`);
  } else {
    legalAdvisorError = legalResult.error || 'N8N Webhook unavailable';
  }

  // Offline mock fallback if AI returned nothing
  if (chapters.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const lowercaseQuery = query.toLowerCase();
    const matched = mockLegalAnswers.find(item => item.keywords.some(k => lowercaseQuery.includes(k)));
    if (matched) {
      chapters = matched.chapters;
    } else {
      chapters = [
        {
          title: "1. Right to Legal Representation & Free Legal Aid",
          content: "Under **Article 39A** of the Constitution of India, the State is mandated to provide free legal aid to ensure that opportunities for securing justice are not denied to any citizen by reason of economic or other disabilities. You can obtain a free lawyer from the local **District Legal Services Authority (DLSA)** or State Legal Services Authority (SLSA) if you are a woman, child, member of SC/ST, or have an annual income below the threshold (typically ₹3,000,000 in most states)."
        },
        {
          title: "2. Filing a First Information Report (FIR)",
          content: "Under **Section 154 of the Code of Criminal Procedure (CrPC)**, the police are required to register an FIR for any cognizable offence. If the police station refuses to register your FIR, you can send the substance of the information in writing to the Superintendent of Police (SP) under Section 154(3) CrPC, or file an e-FIR on the official portal of your state police."
        },
        {
          title: "3. Direct Complaint to Magistrate",
          content: "If the police fail to take action even after contacting the SP, you have the right to file a private criminal complaint directly before the Judicial Magistrate under **Section 200 of the CrPC**. The magistrate can examine the complaint and order a police investigation under Section 156(3) CrPC."
        },
        {
          title: "4. Actionable Steps & Guidance",
          content: "To proceed legally: Step 1: Gather and secure all physical, digital or oral evidence (witness statements, screenshots, documents, audio recordings). Step 2: Draft a clear timeline of events. Step 3: Visit the local District Court Complex and find the DLSA helpdesk to get guidance from a panel lawyer. Step 4: Write down your complaints formally and get a stamped acknowledgement of receipt from any authority you submit them to."
        }
      ];
    }
  }

  document.getElementById('ai-legal-loading').style.display = 'none';
  openAILegalModuleInModal(query, chapters, legalAdvisorError);
}

function openAILegalModuleInModal(query, chapters, apiError) {
  const activePage = window.location.hash.replace('#', '') || 'home';
  let moduleTitle = "AI Generated Module";
  if (activePage === 'rights') moduleTitle = "AI Legal Guidance Module";
  else if (activePage === 'courses') moduleTitle = "AI Skill Module";
  else if (activePage === 'voice') moduleTitle = "AI Voice Assistant Module";

  document.getElementById('module-title').textContent = moduleTitle;
  document.getElementById('module-description').textContent = `Generated for: "${query}"`;
  
  const body = document.getElementById('module-body');
  
  window.renderLegalStep = function(stepIdx) {
    const ch = chapters[stepIdx];
    const isLast = stepIdx === chapters.length - 1;
    
    body.innerHTML = `
      <div class="ai-legal-wizard" style="padding: var(--space-sm);">
        ${apiError ? `
        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-md); text-align: left; font-size: var(--fs-xs); color: var(--text-muted);">
          <div style="display: flex; align-items: center; gap: var(--space-xs); margin-bottom: 4px; color: #EF4444; font-weight: 700;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Live N8N Webhook Call Error</span>
          </div>
          Failed to generate response dynamically: <strong>${apiError}</strong>. Loaded local expert database fallback.
        </div>
        ` : ''}


        
        <div class="ai-step-card" style="border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-xl); background: var(--surface-hover); margin-bottom: var(--space-lg);">
          <h3 style="font-size: var(--fs-lg); font-weight: 700; margin-bottom: var(--space-md); color: var(--primary);">${ch.title}</h3>
          <div style="font-size: var(--fs-sm); color: var(--text); line-height: 1.6;">
            ${markdownToHtml(ch.content || ch.description || ch.text || JSON.stringify(ch))}
          </div>
        </div>
        
        <div style="display: flex; gap: var(--space-md); justify-content: flex-end;">
          ${isLast ? `
            <button class="btn btn-primary" onclick="completeAILegalModule()">Compulsory: Complete Legal Module</button>
          ` : `
            <button class="btn btn-primary" onclick="window.renderLegalStep(${stepIdx + 1})">Next Step</button>
          `}
        </div>
      </div>
    `;
  };

  window.completeAILegalModule = function() {
    document.getElementById('module-overlay').classList.remove('active');
    document.body.style.overflow = '';
    showToast('Module Completed!', 'Congratulations on completing this legal guidance module. Your knowledge score has increased!', 'success');
    
    // Save the module if it's on the Rights page
    const activePage = window.location.hash.replace('#', '') || 'home';
    if (activePage === 'rights') {
      const savedModules = JSON.parse(localStorage.getItem('empowerall_ai_rights_modules') || '[]');
      const existing = savedModules.find(m => m.title === query);
      if (!existing) {
        savedModules.push({
          id: 'ai-rights-' + Date.now(),
          title: query,
          chapters: chapters
        });
        localStorage.setItem('empowerall_ai_rights_modules', JSON.stringify(savedModules));
        if (typeof renderRightsCards === 'function') {
          renderRightsCards();
        }
      }
    }
    
    if (currentUser) {
      currentUser.stats = currentUser.stats || { courses: 0, rights: 0, voices: 0 };
      currentUser.stats.rights = (currentUser.stats.rights || 0) + 1;
      const users = JSON.parse(localStorage.getItem('empowerall_users') || '{}');
      if (users[currentUser.email]) {
        users[currentUser.email].stats = currentUser.stats;
        localStorage.setItem('empowerall_users', JSON.stringify(users));
      }
      localStorage.setItem('empowerall_active_user', JSON.stringify(currentUser));
    }
  };

  window.renderLegalStep(0);
  
  document.getElementById('module-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function markdownToHtml(text) {
  if (typeof text !== 'string') return String(text || '');
  let html = text.replace(/\\n/g, '\n'); // Convert literal \n to real newlines
  
  // Convert Markdown Tables to structured List blocks
  let inTable = false;
  let headers = [];
  let newHtmlLines = [];
  let lines = html.split('\n');
  
  for (let line of lines) {
    let trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      let cols = trimmed.split('|').map(s => s.trim()).filter((s, i, arr) => i > 0 && i < arr.length - 1);
      if (cols.every(c => c.match(/^[\-\s:]+$/))) {
        continue; // Skip separator rows
      }
      
      if (!inTable) {
        headers = cols; // First row is headers
        inTable = true;
      } else {
        // Data row -> rendered as a grouped block
        newHtmlLines.push('<div class="ai-table-card" style="margin-top: var(--space-md); margin-bottom: var(--space-md); padding: var(--space-md); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);">');
        cols.forEach((col, i) => {
          let header = headers[i] || '';
          if (header) {
             newHtmlLines.push(`<strong style="color: var(--primary); display: block; margin-bottom: 4px; margin-top: 8px;">${header}</strong>`);
          }
          // Format bullet points inside the table cell nicely
          let formattedCol = col.replace(/•\s/g, '<br>• ');
          newHtmlLines.push(`<div style="margin-bottom: 8px; line-height: 1.6;">${formattedCol}</div>`);
        });
        newHtmlLines.push('</div>');
      }
    } else {
      inTable = false;
      headers = [];
      newHtmlLines.push(line);
    }
  }
  
  html = newHtmlLines.join('\n');
  
  html = newHtmlLines.join('\n');
  
  // 1. Inline Quotes (Only match quotes preceded by space or start of line to avoid breaking HTML attributes)
  html = html.replace(/(^|\s)["“]([^\n"”<>=]+)["”]/g, '$1<q style="font-style: italic; color: var(--secondary); font-weight: 500;">$2</q>');
  
  // 2. Ellipsis
  html = html.replace(/\.{3,}/g, '&hellip;');
  
  // 3. Horizontal Rule
  html = html.replace(/(^|\n)---+(\n|$)/g, '<hr style="border: 0; border-top: 1px solid var(--border); margin: var(--space-lg) 0;">');
  
  // 4. Headings (H1 to H6)
  html = html.replace(/(^|\n)(#{1,6})\s+(.*)/g, (match, prefix, hashes, text) => {
    let level = hashes.length;
    let size = 1.7 - (level * 0.15); // H1=1.55, H2=1.4, H3=1.25, H4=1.1, H5=0.95, H6=0.8
    return `${prefix}<h${level} style="color: var(--primary); font-size: ${size}rem; font-weight: 700; margin-top: var(--space-lg); margin-bottom: var(--space-sm);">${text}</h${level}>`;
  });
  
  // 5. Bold Text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 6. Format 'Step 1:'
  html = html.replace(/(Step\s+\d+[:\-])/gi, '\n\n<strong style="color: var(--primary); font-size: 1.05em;">$1</strong>\n');
  
  // 7. Bold Heading with colon (e.g. '1. Heading:')
  html = html.replace(/(\d+\.\s+[^:\.\n]+:)/g, '\n\n<strong style="color: var(--primary); font-size: 1.05em;">$1</strong>\n');
  
  // 8. Numbered Label (e.g. '3. Text' without colon)
  html = html.replace(/(^|\n)(\d+)\.\s/g, '$1<strong style="color: var(--primary); margin-right: 0.5rem;">$2.</strong> ');
  
  // 9. Bulleted List
  html = html.replace(/(^|\n)\-\s+(.*)/g, '$1<li style="margin-left: 1.5rem; margin-bottom: 0.25rem; list-style-type: disc;">$2</li>');

  // Clean up excessive newlines
  html = html.replace(/\n\s*\n/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');
  
  // Clean up breaks around blocks
  html = html.replace(/<br>\s*<hr/g, '<hr');
  html = html.replace(/<hr([^>]*)>\s*<br>/g, '<hr$1>');
  html = html.replace(/<br>\s*<h([1-6])/g, '<h$1');
  html = html.replace(/<\/h([1-6])>\s*<br>/g, '</h$1>');
  html = html.replace(/<br>\s*<li/g, '<li');
  html = html.replace(/<\/li>\s*<br>/g, '</li>');
  
  // Remove leading breaks if any
  html = html.replace(/^(<br>)+/, '');
  return html;
}

function resetLegalAssistantForm() {
  document.getElementById('ai-legal-input').value = '';
}


