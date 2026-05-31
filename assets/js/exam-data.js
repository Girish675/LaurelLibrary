/**
 * Laurel Library — Exam Knowledge Base
 * Detailed, evergreen information for each competitive exam.
 * Subject IDs map to note categories used across the site so the
 * "Subjects" bar can deep-link into filtered notes.
 */
window.LL = window.LL || {};

LL.examData = {
    'UPSC': {
        name: 'UPSC',
        fullName: 'Union Public Service Commission — Civil Services Examination (CSE)',
        icon: '🏛️',
        level: 'National',
        conductedBy: 'Union Public Service Commission (UPSC)',
        frequency: 'Once a year',
        official: 'https://upsc.gov.in',
        overview: 'The Civil Services Examination (CSE) is conducted by the UPSC to recruit officers for the All India Services and Central Civil Services. Widely regarded as one of the toughest examinations in the world, it tests a candidate across an enormous syllabus, descriptive writing, and a personality interview over a process that spans nearly a year. Success demands conceptual clarity, current-affairs awareness, analytical writing and remarkable consistency rather than rote memorisation.',
        posts: ['IAS — Indian Administrative Service', 'IPS — Indian Police Service', 'IFS — Indian Foreign Service', 'IRS — Indian Revenue Service', 'IAAS, ICAS, IDAS and other Group A Central Services', 'Group B Services (DANICS, DANIPS, etc.)'],
        eligibility: {
            nationality: 'Citizen of India (for IAS/IPS/IFS). Other services also open to subjects of Nepal/Bhutan and certain PIO categories.',
            education: 'A bachelor\'s degree in any discipline from a recognised university. Final-year students may apply and produce proof before the Mains.',
            age: '21 to 32 years for General category (as on 1 August of exam year). Relaxations: OBC +3 years, SC/ST +5 years, PwBD up to +10 years.',
            attempts: 'General: 6 attempts · EWS: 6 · OBC: 9 · SC/ST: unlimited (until age limit). PwBD relaxations apply.'
        },
        stages: [
            { name: 'Stage 1 — Preliminary (Objective)', detail: 'Two MCQ papers: General Studies Paper I (200 marks, merit-deciding) and CSAT Paper II (200 marks, qualifying — minimum 33%). Acts as a screening test; marks are not counted in the final ranking.' },
            { name: 'Stage 2 — Mains (Descriptive)', detail: 'Nine descriptive papers written over five days — two qualifying language papers, an Essay, four General Studies papers, and two Optional subject papers. Total 1750 marks count towards the merit list.' },
            { name: 'Stage 3 — Personality Test (Interview)', detail: 'A 275-mark interview at UPSC, New Delhi, assessing mental calibre, balance of judgement, leadership and suitability for public service.' }
        ],
        pattern: [
            'Prelims: GS Paper I (100 questions, 200 marks, 2 hrs) + CSAT (80 questions, 200 marks, 2 hrs). Negative marking of 1/3rd.',
            'Mains: Essay (250) · GS-I (250) · GS-II (250) · GS-III (250) · GS-IV Ethics (250) · Optional Paper I (250) · Optional Paper II (250) + 2 qualifying papers (English & an Indian language, 300 each).',
            'Final merit = Mains (1750) + Interview (275) = 2025 marks.'
        ],
        syllabus: [
            { area: 'GS Paper I (Prelims)', points: ['Current events of national & international importance', 'History of India and the Indian National Movement', 'Indian & World Geography — physical, social, economic', 'Indian Polity & Governance — Constitution, Panchayati Raj, Rights', 'Economic & Social Development, Sustainable Development', 'Environment, Ecology, Biodiversity & Climate Change', 'General Science'] },
            { area: 'CSAT (Prelims Paper II)', points: ['Comprehension', 'Interpersonal & communication skills', 'Logical reasoning & analytical ability', 'Decision-making & problem-solving', 'Basic numeracy & data interpretation (Class X level)'] },
            { area: 'GS Mains', points: ['GS-I: Indian heritage & culture, History & Geography of the world & society', 'GS-II: Governance, Constitution, Polity, Social Justice & International Relations', 'GS-III: Economy, Technology, Biodiversity, Environment, Security & Disaster Management', 'GS-IV: Ethics, Integrity & Aptitude (with case studies)'] }
        ],
        importantAreas: ['NCERTs (Class VI–XII) as the foundation', 'Daily newspaper & monthly current affairs', 'Indian Polity (Laxmikanth)', 'Modern & Ancient/Medieval History', 'Indian & Physical Geography', 'Economy & Government schemes', 'Environment & Ecology', 'Ethics case studies & answer writing'],
        strategy: ['Build a strong NCERT base before standard reference books.', 'Read one newspaper daily and maintain crisp current-affairs notes.', 'Practise answer writing daily — content + structure + presentation.', 'Choose an optional you enjoy and can score in.', 'Solve previous-year papers and take regular mock tests.', 'Revise relentlessly; revision beats accumulating new sources.'],
        subjects: ['history', 'geography', 'polity', 'economics', 'science', 'current-affairs', 'general-knowledge']
    },

    'SSC': {
        name: 'SSC',
        fullName: 'Staff Selection Commission — CGL, CHSL, MTS, CPO & more',
        icon: '🏆',
        level: 'National',
        conductedBy: 'Staff Selection Commission (SSC)',
        frequency: 'Multiple exams every year',
        official: 'https://ssc.gov.in',
        overview: 'The Staff Selection Commission recruits for non-gazetted posts across central government ministries and departments. Its flagship exams — CGL (Combined Graduate Level), CHSL (10+2 level), MTS, CPO and Stenographer — are among the most popular government job exams in India, valued for stable careers and good pay. Speed, accuracy and strong fundamentals in quantitative aptitude, reasoning, English and general awareness are the keys to success.',
        posts: ['Income Tax Inspector / Examiner (CBDT, CBIC)', 'Assistant Section Officer (Ministries)', 'Auditor / Accountant (CAG, CGA)', 'Sub-Inspector (CAPF / Delhi Police) via CPO', 'Lower Division Clerk / Data Entry Operator (CHSL)', 'Multi Tasking Staff & Havaldar (MTS)'],
        eligibility: {
            nationality: 'Citizen of India (and certain other categories as per notification).',
            education: 'CGL: Bachelor\'s degree. CHSL: 12th pass. MTS: 10th pass. CPO: Bachelor\'s degree.',
            age: 'Varies by post — generally 18–27 or 18–30 years, with standard category relaxations (OBC +3, SC/ST +5).',
            attempts: 'No limit on number of attempts within the age window.'
        },
        stages: [
            { name: 'Tier I — Computer Based (Objective)', detail: 'Common qualifying/screening test covering Reasoning, Quantitative Aptitude, English and General Awareness.' },
            { name: 'Tier II — Mains (Computer Based)', detail: 'In-depth objective papers on Quantitative Abilities, English, Reasoning, General Awareness, Computer Knowledge and a Data Entry / typing module.' },
            { name: 'Skill Test / Document Verification', detail: 'Typing or data-entry skill test where applicable, followed by document verification and medical (for CPO).' }
        ],
        pattern: [
            'Tier I: 100 questions, 200 marks, 60 minutes — four sections of 25 questions each. Negative marking 0.50.',
            'Tier II: Multiple sessions/papers depending on the post; includes a typing/skill module.',
            'CPO additionally has a Physical Endurance Test (PET/PST) and medical examination.'
        ],
        syllabus: [
            { area: 'General Intelligence & Reasoning', points: ['Analogies, classification, series', 'Coding-decoding, blood relations', 'Syllogism, statements & conclusions', 'Non-verbal reasoning, figures, mirror images'] },
            { area: 'Quantitative Aptitude', points: ['Number system, simplification, percentages', 'Ratio, average, profit & loss, interest', 'Time–speed–distance, time & work', 'Geometry, mensuration, trigonometry, data interpretation'] },
            { area: 'English Language', points: ['Grammar, error spotting, sentence improvement', 'Vocabulary, synonyms/antonyms, idioms', 'Cloze test, reading comprehension', 'Para jumbles, fill in the blanks'] },
            { area: 'General Awareness', points: ['History, Geography, Polity, Economy', 'General Science (Physics, Chemistry, Biology)', 'Static GK & current affairs', 'Books, awards, sports, important days'] }
        ],
        importantAreas: ['Speed maths & shortcut techniques', 'Reasoning puzzles & series', 'English grammar & vocabulary', 'Static GK + last 6 months current affairs', 'General Science fundamentals', 'Typing speed (for CHSL/Stenographer)'],
        strategy: ['Master Tier-I fundamentals; speed and accuracy win.', 'Build a daily current-affairs and static-GK habit.', 'Solve previous-year papers — patterns repeat heavily.', 'Take sectional and full mock tests under timed conditions.', 'Improve typing speed early for CHSL/Steno posts.'],
        subjects: ['reasoning', 'aptitude', 'english', 'general-knowledge', 'current-affairs', 'mathematics']
    },

    'Banking': {
        name: 'Banking',
        fullName: 'Bank Exams — IBPS PO/Clerk/SO, SBI PO/Clerk, RBI Grade B',
        icon: '🏦',
        level: 'National',
        conductedBy: 'IBPS · SBI · RBI · NABARD',
        frequency: 'Multiple exams every year',
        official: 'https://ibps.in',
        overview: 'Banking exams recruit Probationary Officers (PO), Clerks and Specialist Officers (SO) for public-sector banks and apex institutions like the RBI, NABARD and SEBI. They reward speed, accuracy and strong reasoning. Most follow a Prelims → Mains → Interview structure (Clerk has no interview) and place heavy emphasis on quantitative aptitude, reasoning, English and banking/general awareness.',
        posts: ['Probationary Officer (PO / Management Trainee)', 'Clerk (Customer Service Associate)', 'Specialist Officer (IT, HR, Marketing, Law, Agriculture)', 'RBI Grade B Officer', 'NABARD / SEBI Grade A & B'],
        eligibility: {
            nationality: 'Citizen of India (or as per notification).',
            education: 'Bachelor\'s degree in any discipline. Specialist Officer posts need relevant qualifications.',
            age: 'Generally 20–30 years for PO and 20–28 for Clerk, with standard category relaxations.',
            attempts: 'IBPS: limited attempts for some categories; SBI PO has an attempt cap. Check the notification.'
        },
        stages: [
            { name: 'Preliminary Exam', detail: 'Objective test of English, Quantitative Aptitude and Reasoning Ability — qualifying in nature with sectional timing.' },
            { name: 'Main Exam', detail: 'Comprehensive objective test adding Reasoning + Computer Aptitude, General/Economy/Banking Awareness, plus a descriptive English (letter & essay) for PO.' },
            { name: 'Interview / Group Exercise', detail: 'For PO and SO posts. Final merit combines Mains and interview marks. Clerk selection is on Mains alone.' }
        ],
        pattern: [
            'Prelims (PO): 100 questions, 100 marks, 60 minutes (20 min per section).',
            'Mains (PO): ~155–200 questions across sections, 200 marks, plus 25-mark descriptive paper.',
            'Sectional timing and 0.25 negative marking are standard.'
        ],
        syllabus: [
            { area: 'Reasoning Ability', points: ['Puzzles & seating arrangement', 'Syllogism, inequality, coding-decoding', 'Blood relations, direction sense', 'Data sufficiency, logical reasoning'] },
            { area: 'Quantitative Aptitude', points: ['Simplification & approximation', 'Number series, quadratic equations', 'Data interpretation (tables, charts, caselets)', 'Arithmetic: percentage, ratio, interest, time & work'] },
            { area: 'English Language', points: ['Reading comprehension', 'Cloze test, error detection', 'Para jumbles, sentence rearrangement', 'Fillers, word usage & vocabulary'] },
            { area: 'General / Banking Awareness', points: ['Banking & financial terms, RBI functions', 'Monetary policy, money market instruments', 'Current affairs (last 6 months)', 'Static GK, economy & government schemes'] },
            { area: 'Computer Aptitude', points: ['Computer fundamentals & abbreviations', 'MS Office, internet, networking basics', 'Input/output devices, memory'] }
        ],
        importantAreas: ['Data Interpretation & approximation speed', 'High-level puzzles & seating arrangements', 'Banking awareness & RBI/monetary policy', 'Reading comprehension & vocabulary', 'Current affairs with a banking/economy focus'],
        strategy: ['Build calculation speed — learn tables, squares, cubes & shortcuts.', 'Practise puzzles and DI sets daily.', 'Follow banking & economy current affairs closely.', 'Attempt sectional mocks to manage sectional timing.', 'For PO, practise descriptive letter & essay writing.'],
        subjects: ['reasoning', 'aptitude', 'english', 'general-knowledge', 'current-affairs', 'computer-science']
    },

    'GATE': {
        name: 'GATE',
        fullName: 'Graduate Aptitude Test in Engineering',
        icon: '⚙️',
        level: 'National',
        conductedBy: 'IISc Bangalore & 7 IITs (rotational)',
        frequency: 'Once a year',
        official: 'https://gate.iitk.ac.in',
        overview: 'GATE tests the comprehensive understanding of undergraduate-level subjects in engineering, science, and select humanities streams. The score is used for admission to M.Tech/MS/PhD programmes at IITs, NITs and IISc, and for recruitment by leading PSUs such as IOCL, NTPC, BHEL, ONGC and PowerGrid. It rewards deep conceptual understanding and strong problem-solving over rote learning.',
        posts: ['M.Tech / MS / PhD admission at IITs, NITs, IISc', 'PSU recruitment (IOCL, NTPC, BHEL, ONGC, PowerGrid, GAIL, etc.)', 'Research fellowships & teaching positions', 'Junior Research Fellow roles'],
        eligibility: {
            nationality: 'Open to Indian & some international candidates.',
            education: 'Bachelor\'s degree in Engineering/Technology/Architecture/Science, or final-year students. No age limit.',
            age: 'No upper age limit.',
            attempts: 'No restriction on the number of attempts.'
        },
        stages: [
            { name: 'Single Computer-Based Test', detail: 'A 3-hour online exam for the chosen paper (one of 30 subjects). There is no preliminary/mains split.' },
            { name: 'Scorecard & Counselling', detail: 'A GATE score (valid 3 years) is used for IIT/NIT admissions (via COAP/CCMT) and PSU shortlists.' }
        ],
        pattern: [
            '65 questions, 100 marks, 3 hours.',
            'Question types: MCQ, MSQ (multiple select) and NAT (numerical answer type).',
            'General Aptitude: 15 marks · Engineering Mathematics + Core subject: 85 marks.',
            'Negative marking on MCQs only (not on MSQ/NAT).'
        ],
        syllabus: [
            { area: 'General Aptitude (common)', points: ['Verbal aptitude & English grammar', 'Quantitative aptitude', 'Analytical & spatial reasoning', 'Data interpretation'] },
            { area: 'Engineering Mathematics', points: ['Linear algebra & calculus', 'Differential equations', 'Probability & statistics', 'Numerical methods, transforms (stream-specific)'] },
            { area: 'Core Subject (by stream)', points: ['CSE: Algorithms, DBMS, OS, Networks, TOC, Architecture', 'ECE: Networks, Signals, EMT, Electronics, Communications', 'EE: Machines, Power Systems, Control, Power Electronics', 'ME: Thermodynamics, Fluid Mechanics, SOM, Manufacturing', 'CE: Structural, Geotech, Transportation, Environmental'] }
        ],
        importantAreas: ['Engineering Mathematics (high weightage)', 'General Aptitude (easy scoring 15 marks)', 'Core subject conceptual clarity', 'Numerical Answer Type practice', 'Previous-year problem solving'],
        strategy: ['Master Engineering Mathematics & General Aptitude — easy, high-yield marks.', 'Build concepts from standard textbooks, then solve problems.', 'Solve 10+ years of previous papers; trends repeat.', 'Take full-length timed mock tests for stamina & strategy.', 'Maintain a formula & revision notebook for the final month.'],
        subjects: ['mathematics', 'aptitude', 'computer-science', 'electronics', 'electrical', 'mechanical', 'civil']
    },

    'ESE/IES': {
        name: 'ESE/IES',
        fullName: 'Engineering Services Examination (ESE / IES)',
        icon: '🔧',
        level: 'National',
        conductedBy: 'Union Public Service Commission (UPSC)',
        frequency: 'Once a year',
        official: 'https://upsc.gov.in',
        overview: 'The Engineering Services Examination recruits engineers for techno-managerial Group A posts in central government departments and PSUs across four branches — Civil, Mechanical, Electrical, and Electronics & Telecommunications. It is among the most prestigious technical exams in India, combining deep engineering knowledge with general studies and an interview.',
        posts: ['Indian Railway Service of Engineers', 'Central Engineering / Electrical Service', 'Military Engineer Services', 'Indian Telecommunication Service', 'CPWD, CWC, BRO and other technical cadres'],
        eligibility: {
            nationality: 'Citizen of India (and certain other categories).',
            education: 'Engineering degree in the relevant branch.',
            age: '21 to 30 years with standard category relaxations.',
            attempts: 'General: 6 · OBC: 9 · SC/ST: unlimited (within age limit).'
        },
        stages: [
            { name: 'Stage 1 — Preliminary (Objective)', detail: 'Paper I: General Studies & Engineering Aptitude. Paper II: Branch-specific objective paper.' },
            { name: 'Stage 2 — Mains (Conventional)', detail: 'Two descriptive branch papers testing depth of engineering knowledge and problem-solving.' },
            { name: 'Stage 3 — Personality Test', detail: 'Interview assessing technical and managerial suitability.' }
        ],
        pattern: [
            'Prelims: GS & Engineering Aptitude (200 marks) + Engineering Discipline (300 marks).',
            'Mains: Two conventional papers of 300 marks each.',
            'Personality Test: 200 marks. Negative marking in objective papers.'
        ],
        syllabus: [
            { area: 'General Studies & Engineering Aptitude', points: ['Current affairs & general principles of design', 'Engineering maths & numerical analysis', 'Material science, ICT, ethics & values', 'Standards & quality, project management'] },
            { area: 'Core Engineering (by branch)', points: ['Civil: Structures, Geotech, Water Resources, Environmental, Transportation', 'Mechanical: Thermodynamics, Fluid Mechanics, Manufacturing, Design', 'Electrical: Machines, Power Systems, Control, Power Electronics', 'E&T: Electronics, Signals, Communications, Control Systems'] }
        ],
        importantAreas: ['Strong core engineering fundamentals', 'Engineering aptitude & general studies', 'Conventional (descriptive) answer writing', 'Previous-year branch papers'],
        strategy: ['Build deep conceptual mastery of your branch.', 'Practise conventional/descriptive answer writing.', 'Cover GS & Engineering Aptitude systematically.', 'Solve previous years for both objective and conventional papers.'],
        subjects: ['civil', 'mechanical', 'electrical', 'electronics', 'mathematics', 'general-knowledge']
    },

    'Railways': {
        name: 'Railways',
        fullName: 'Railway Recruitment Board — NTPC, Group D, ALP, JE',
        icon: '🚃',
        level: 'National',
        conductedBy: 'Railway Recruitment Boards (RRB)',
        frequency: 'Multiple exams every year',
        official: 'https://indianrailways.gov.in',
        overview: 'The Railway Recruitment Boards conduct some of the largest recruitment drives in the world for Indian Railways. Popular exams include NTPC (Non-Technical Popular Categories), Group D, ALP (Assistant Loco Pilot) & Technician, and JE (Junior Engineer). They offer secure jobs with attractive perks and are valued for their scale of vacancies.',
        posts: ['Station Master, Goods Guard, Clerk (NTPC)', 'Track Maintainer, Helper, Pointsman (Group D)', 'Assistant Loco Pilot & Technician', 'Junior Engineer / Senior Section Engineer'],
        eligibility: {
            nationality: 'Citizen of India (and notified categories).',
            education: 'Group D: 10th pass / ITI. NTPC: 12th pass or graduate (post-wise). JE: Engineering diploma/degree.',
            age: 'Generally 18–33 years with standard relaxations.',
            attempts: 'No fixed limit within the age window.'
        },
        stages: [
            { name: 'CBT 1 (Computer Based Test)', detail: 'Screening test on Mathematics, General Intelligence & Reasoning, and General Awareness/Science.' },
            { name: 'CBT 2', detail: 'More advanced stage-specific test for shortlisted candidates (NTPC/ALP/JE).' },
            { name: 'Skill / Aptitude / PET & DV', detail: 'Computer-Based Aptitude Test (ALP), typing/skill test (NTPC posts), Physical Efficiency Test (Group D) and document verification.' }
        ],
        pattern: [
            'CBT 1: ~100 questions, 90 minutes, with 1/3rd negative marking.',
            'Sections: Mathematics, General Intelligence & Reasoning, General Awareness & General Science.',
            'PET is qualifying for Group D; ALP has a second-stage CBAT.'
        ],
        syllabus: [
            { area: 'Mathematics', points: ['Number system, BODMAS, decimals & fractions', 'Percentage, ratio, profit & loss', 'Time & work, time-speed-distance', 'Mensuration, algebra, geometry, trigonometry'] },
            { area: 'General Intelligence & Reasoning', points: ['Analogies, series, coding-decoding', 'Syllogism, Venn diagrams', 'Mathematical operations, directions', 'Statement-conclusion, classification'] },
            { area: 'General Awareness & Science', points: ['General Science (Physics, Chemistry, Biology) up to 10th level', 'Current affairs (national & international)', 'History, Geography, Polity & Economy', 'Static GK & sports'] }
        ],
        importantAreas: ['General Science (10th level)', 'Speed mathematics', 'Reasoning fundamentals', 'Current affairs & static GK', 'Previous-year RRB papers'],
        strategy: ['Strengthen 10th-level science and mathematics.', 'Practise reasoning daily for speed.', 'Keep up with current affairs and static GK.', 'Solve previous-year RRB papers and take mocks.', 'Prepare physically for PET (Group D).'],
        subjects: ['mathematics', 'reasoning', 'science', 'general-knowledge', 'current-affairs']
    },

    'Defence': {
        name: 'Defence',
        fullName: 'Defence Exams — CDS, NDA, AFCAT',
        icon: '🎖️',
        level: 'National',
        conductedBy: 'UPSC · Indian Air Force',
        frequency: 'CDS & NDA twice a year; AFCAT twice a year',
        official: 'https://upsc.gov.in',
        overview: 'Defence examinations recruit officers for the Indian Army, Navy and Air Force. NDA (after 12th) and CDS (after graduation) are conducted by UPSC, while AFCAT recruits for Air Force flying and ground-duty branches. All include a written exam followed by the rigorous SSB (Services Selection Board) interview and a medical examination, selecting candidates with intellect, fitness and officer-like qualities.',
        posts: ['Commissioned Officer — Indian Army', 'Commissioned Officer — Indian Navy', 'Flying / Ground Duty Officer — Indian Air Force', 'Officers Training Academy (short service commission)'],
        eligibility: {
            nationality: 'Citizen of India (with notified provisions).',
            education: 'NDA: 12th pass (PCM for Air Force/Navy). CDS: graduate (engineering for technical entries). AFCAT: graduate + maths/physics for flying.',
            age: 'NDA: ~16.5–19.5 years. CDS: ~19–25 years. AFCAT: ~20–26 years.',
            attempts: 'No fixed limit within the prescribed age window.'
        },
        stages: [
            { name: 'Written Examination', detail: 'Objective papers on Mathematics, English and General Knowledge (NDA/CDS) or General Awareness, Verbal/Numerical/Reasoning (AFCAT).' },
            { name: 'SSB Interview (5 days)', detail: 'A two-stage process: screening (OIR + PP&DT), then psychology tests, group testing (GTO) tasks and a personal interview assessing officer-like qualities.' },
            { name: 'Medical Examination', detail: 'A detailed medical board determines final fitness for commissioning.' }
        ],
        pattern: [
            'NDA: Mathematics (300 marks) + General Ability Test (600 marks).',
            'CDS: English, General Knowledge & Elementary Mathematics (Maths not for OTA).',
            'AFCAT: General Awareness, Verbal Ability, Numerical Ability & Reasoning (plus EKT for technical).',
            'Negative marking applies; SSB carries equal weight in final selection.'
        ],
        syllabus: [
            { area: 'Mathematics', points: ['Algebra, matrices & determinants', 'Trigonometry, analytical geometry', 'Calculus, vectors', 'Statistics & probability'] },
            { area: 'English', points: ['Grammar & usage', 'Vocabulary, synonyms/antonyms', 'Comprehension & cohesion', 'Sentence ordering & spotting errors'] },
            { area: 'General Knowledge / Ability', points: ['Physics, Chemistry, Biology', 'History, Geography, Polity, Economy', 'Current events & defence affairs', 'General science & environment'] }
        ],
        importantAreas: ['Mathematics (NDA/AFCAT)', 'English & comprehension', 'General Science & GK', 'Current & defence affairs', 'SSB preparation & physical fitness'],
        strategy: ['Strengthen mathematics and English fundamentals.', 'Cover general science and current affairs broadly.', 'Practise previous-year papers for the written stage.', 'Prepare seriously for SSB — psychology, GTO and interview.', 'Maintain physical fitness throughout.'],
        subjects: ['mathematics', 'english', 'science', 'general-knowledge', 'current-affairs']
    },

    'ISRO': {
        name: 'ISRO',
        fullName: 'ISRO Scientist / Engineer Recruitment',
        icon: '🚀',
        level: 'National',
        conductedBy: 'Indian Space Research Organisation (ICRB)',
        frequency: 'As per vacancy',
        official: 'https://isro.gov.in',
        overview: 'ISRO recruits Scientists/Engineers (\u2018SC\u2019 grade) primarily in Electronics, Mechanical and Computer Science through a written test followed by an interview. It is a dream role for engineers seeking to work on India\u2019s space programme. The written exam focuses purely on core engineering subjects, demanding strong conceptual depth.',
        posts: ['Scientist / Engineer \u2018SC\u2019 — Electronics', 'Scientist / Engineer \u2018SC\u2019 — Mechanical', 'Scientist / Engineer \u2018SC\u2019 — Computer Science', 'Technical Assistant & Scientific Assistant'],
        eligibility: {
            nationality: 'Citizen of India.',
            education: 'BE/B.Tech (or equivalent) in the relevant discipline with a strong academic record (typically 65%+ or 6.84 CGPA).',
            age: 'Generally up to 28 years with standard relaxations.',
            attempts: 'No fixed limit within the age window.'
        },
        stages: [
            { name: 'Written Test', detail: 'Objective test based entirely on the core engineering discipline.' },
            { name: 'Interview', detail: 'Shortlisted candidates face a technical interview; final selection is based on interview performance.' }
        ],
        pattern: [
            '80 questions, 240 marks, 90 minutes (3 marks per correct, 1 negative).',
            'Entirely core-subject based — no general aptitude section.',
            'Interview is the final, decisive stage.'
        ],
        syllabus: [
            { area: 'Core Engineering (by discipline)', points: ['CSE: DS & Algorithms, OS, DBMS, Networks, TOC, Architecture', 'ECE: Networks, EMT, Analog & Digital Electronics, Signals, Communications', 'Mechanical: Thermodynamics, Fluid Mechanics, SOM, Manufacturing, Design'] },
            { area: 'Engineering Mathematics', points: ['Linear algebra & calculus', 'Differential equations', 'Probability & statistics'] }
        ],
        importantAreas: ['Deep core-subject concepts', 'GATE-level problem solving', 'Engineering mathematics', 'Interview/technical projects readiness'],
        strategy: ['Prepare core subjects to GATE depth or beyond.', 'Solve ISRO & GATE previous papers.', 'Revise fundamentals and standard derivations.', 'Prepare thoroughly for the technical interview and project work.'],
        subjects: ['electronics', 'mechanical', 'computer-science', 'mathematics']
    },

    'DRDO': {
        name: 'DRDO',
        fullName: 'DRDO — Scientist (RAC) & CEPTAM Recruitment',
        icon: '🔬',
        level: 'National',
        conductedBy: 'Defence Research & Development Organisation',
        frequency: 'As per vacancy',
        official: 'https://drdo.gov.in',
        overview: 'The Defence Research & Development Organisation recruits Scientists through GATE-based RAC selection and technical/support staff through CEPTAM (Senior Technical Assistant, Technician, Administrative posts). Working at DRDO means contributing to India\u2019s indigenous defence technology across missiles, electronics, aeronautics and more.',
        posts: ['Scientist \u2018B\u2019 (via GATE + interview)', 'Senior Technical Assistant \u2018B\u2019 (CEPTAM)', 'Technician \u2018A\u2019 (CEPTAM)', 'Administrative & Allied posts'],
        eligibility: {
            nationality: 'Citizen of India.',
            education: 'Scientist: BE/B.Tech with valid GATE score. STA-B: Diploma/B.Sc. Technician: 10th + ITI.',
            age: 'Generally up to 28 years (Scientist) and 18–28 for technical cadres, with relaxations.',
            attempts: 'No fixed limit within the age window.'
        },
        stages: [
            { name: 'Tier I (CBT)', detail: 'Section A — discipline-specific technical questions; Section B — quantitative aptitude, reasoning, general awareness & English.' },
            { name: 'Tier II (CBT)', detail: 'Advanced discipline-specific test for shortlisted candidates (CEPTAM).' },
            { name: 'Document Verification / Interview', detail: 'GATE-based Scientist selection includes a technical interview.' }
        ],
        pattern: [
            'CEPTAM Tier I: 150 questions, 150 marks, 2 hours.',
            'Scientist entry: GATE score + personal interview.',
            'Negative marking applies in CBT stages.'
        ],
        syllabus: [
            { area: 'Discipline-Specific (Section A)', points: ['Core engineering / science subject of the post', 'Concepts to diploma/degree level', 'Applied problem solving'] },
            { area: 'General Section (Section B)', points: ['Quantitative ability', 'General intelligence & reasoning', 'General awareness & current affairs', 'English language'] }
        ],
        importantAreas: ['Core technical subject', 'Quantitative aptitude & reasoning', 'General awareness', 'GATE preparation (for Scientist entry)'],
        strategy: ['Master your discipline-specific subject thoroughly.', 'Practise aptitude, reasoning and English for Section B.', 'For Scientist posts, target a strong GATE score.', 'Solve CEPTAM previous papers and take mocks.'],
        subjects: ['electronics', 'mechanical', 'computer-science', 'electrical', 'aptitude', 'reasoning']
    },

    'BARC': {
        name: 'BARC',
        fullName: 'BARC — OCES/DGFS Scientific Officer Recruitment',
        icon: '\u269b\ufe0f',
        level: 'National',
        conductedBy: 'Bhabha Atomic Research Centre',
        frequency: 'Once a year',
        official: 'https://barc.gov.in',
        overview: 'BARC recruits Scientific Officers through the OCES (Orientation Course for Engineering Graduates and Science Postgraduates) and DGFS schemes, via either a GATE score or the BARC online examination, followed by an interview. Selected trainees join the BARC Training School and work on India\u2019s nuclear science and technology programme.',
        posts: ['Scientific Officer (OCES)', 'Scientific Officer (DGFS — with M.Tech sponsorship)', 'Trainee in BARC Training Schools', 'Roles across DAE units (NPCIL, IGCAR, etc.)'],
        eligibility: {
            nationality: 'Citizen of India.',
            education: 'BE/B.Tech or M.Sc in relevant disciplines with minimum prescribed marks (typically 60%+).',
            age: 'Generally up to 26 years with standard relaxations.',
            attempts: 'No fixed limit within the age window.'
        },
        stages: [
            { name: 'Screening — GATE or BARC Online Exam', detail: 'Candidates qualify either through a valid GATE score or the BARC computer-based examination.' },
            { name: 'Selection Interview', detail: 'Shortlisted candidates face a technical interview; final selection is interview-based.' }
        ],
        pattern: [
            'BARC online exam: 100 MCQs, 3 hours, discipline-specific.',
            'Negative marking applies (typically -1 for wrong answers).',
            'Interview is the final, decisive stage.'
        ],
        syllabus: [
            { area: 'Core Engineering / Science', points: ['Full undergraduate syllabus of the discipline', 'Strong fundamentals & derivations', 'Applied & numerical problem solving'] },
            { area: 'Engineering Mathematics', points: ['Linear algebra, calculus', 'Differential equations', 'Probability & statistics'] }
        ],
        importantAreas: ['GATE-level core concepts', 'Engineering mathematics', 'Numerical problem solving', 'Interview & fundamentals revision'],
        strategy: ['Prepare core subjects to GATE depth.', 'Solve BARC & GATE previous papers.', 'Revise fundamentals and standard problems.', 'Prepare strongly for the technical interview.'],
        subjects: ['mechanical', 'electronics', 'computer-science', 'electrical', 'mathematics', 'science']
    },

    'State PSC': {
        name: 'State PSC',
        fullName: 'State Public Service Commissions — BPSC, UPPSC, MPPSC & more',
        icon: '📝',
        level: 'State',
        conductedBy: 'Respective State Public Service Commissions',
        frequency: 'Once a year (per state)',
        official: 'https://upsc.gov.in',
        overview: 'State Public Service Commissions recruit officers for state administrative, police and allied services — for example BPSC (Bihar), UPPSC (Uttar Pradesh), MPPSC (Madhya Pradesh), RPSC (Rajasthan) and others. The structure mirrors the UPSC CSE (Prelims → Mains → Interview) but adds significant weight to state-specific history, geography, polity, economy and current affairs.',
        posts: ['Deputy Collector / SDM', 'Deputy Superintendent of Police (DSP)', 'Block Development Officer', 'State Tax / Excise / Accounts Officer', 'Various Group A & B state services'],
        eligibility: {
            nationality: 'Citizen of India; many states prefer/require domicile for certain posts.',
            education: 'Bachelor\'s degree in any discipline.',
            age: 'Generally 21–40 years (varies widely by state) with category relaxations.',
            attempts: 'Varies by state; many have no fixed limit within the age window.'
        },
        stages: [
            { name: 'Preliminary (Objective)', detail: 'General Studies and (in many states) a CSAT/aptitude paper — screening in nature.' },
            { name: 'Mains (Descriptive)', detail: 'Multiple descriptive papers on General Studies, essay, language and (in some states) an optional subject — counts towards merit.' },
            { name: 'Interview / Personality Test', detail: 'Final stage assessing suitability for state administration.' }
        ],
        pattern: [
            'Prelims: GS paper + aptitude paper (state-dependent).',
            'Mains: descriptive GS papers, essay & language papers.',
            'Interview marks added to Mains for the final merit list.'
        ],
        syllabus: [
            { area: 'General Studies (National)', points: ['History, Geography, Polity, Economy', 'Science & technology, environment', 'Current affairs (national & international)', 'General mental ability'] },
            { area: 'State-Specific GK', points: ['State history, art & culture', 'State geography & economy', 'State polity & governance', 'State current affairs & schemes'] }
        ],
        importantAreas: ['State-specific history, geography & polity', 'National GS (NCERT base)', 'Current affairs (state + national)', 'Answer writing for Mains'],
        strategy: ['Build a strong NCERT base, then add state-specific material.', 'Prioritise state history, geography, polity and economy.', 'Maintain state + national current-affairs notes.', 'Practise descriptive answer writing for Mains.', 'Solve the commission\u2019s previous-year papers.'],
        subjects: ['history', 'geography', 'polity', 'economics', 'general-knowledge', 'current-affairs']
    },

    'Teaching': {
        name: 'Teaching',
        fullName: 'Teaching Exams — UGC NET, CSIR NET, CTET, KVS, NVS',
        icon: '🎓',
        level: 'National',
        conductedBy: 'NTA · CBSE · KVS · NVS',
        frequency: 'UGC/CSIR NET & CTET twice a year',
        official: 'https://ugcnet.nta.ac.in',
        overview: 'Teaching examinations qualify candidates for the teaching profession and research. UGC NET determines eligibility for Assistant Professor and JRF, CSIR NET covers science streams, while CTET/State TET, KVS and NVS recruit school teachers. These exams test subject mastery along with teaching aptitude and research methodology.',
        posts: ['Assistant Professor (UGC/CSIR NET)', 'Junior Research Fellow (JRF)', 'PRT / TGT / PGT (KVS, NVS, DSSSB)', 'Primary & Elementary Teachers (CTET/TET)'],
        eligibility: {
            nationality: 'Citizen of India.',
            education: 'UGC/CSIR NET: Master\'s degree (typically 55%+). CTET: graduation + D.El.Ed/B.Ed as per level.',
            age: 'NET JRF: up to 30 years (relaxations apply). No upper age for Assistant Professor eligibility.',
            attempts: 'No fixed limit on attempts.'
        },
        stages: [
            { name: 'Paper I — Teaching & Research Aptitude (NET)', detail: 'Common paper on teaching aptitude, research methodology, comprehension, reasoning, data interpretation, ICT and higher education.' },
            { name: 'Paper II — Subject Specific (NET)', detail: 'In-depth test of the candidate\u2019s chosen subject.' },
            { name: 'Eligibility / Recruitment', detail: 'NET qualifies for Assistant Professor/JRF; CTET/KVS/NVS lead directly to teaching posts after further stages.' }
        ],
        pattern: [
            'UGC NET: Paper I (50 questions, 100 marks) + Paper II (100 questions, 200 marks), single 3-hour session, no negative marking.',
            'CTET: Paper I (primary) & Paper II (elementary), 150 marks each.',
            'KVS/NVS: subject knowledge + teaching aptitude + interview.'
        ],
        syllabus: [
            { area: 'Teaching & Research Aptitude (Paper I)', points: ['Teaching & learning aptitude', 'Research aptitude & methodology', 'Comprehension, reasoning & DI', 'ICT, environment & higher-education system'] },
            { area: 'Subject-Specific (Paper II)', points: ['Complete syllabus of the chosen subject', 'Concepts, theories & applications', 'Recent developments in the field'] },
            { area: 'Child Development & Pedagogy (CTET)', points: ['Child development & learning', 'Inclusive education', 'Pedagogy of languages, maths, EVS', 'Assessment & evaluation'] }
        ],
        importantAreas: ['Teaching & research aptitude (Paper I)', 'Deep subject knowledge (Paper II)', 'Child development & pedagogy (CTET)', 'Previous-year question practice'],
        strategy: ['Master Paper I aptitude — it is common and scoring.', 'Study your subject (Paper II) to postgraduate depth.', 'For CTET, focus on pedagogy and child development.', 'Solve previous-year papers and take subject-wise mocks.'],
        subjects: ['english', 'reasoning', 'aptitude', 'general-knowledge', 'science', 'mathematics']
    }
};

/* Friendly display names for subject category IDs (used by the subjects bar). */
LL.subjectNames = {
    'geography': 'Geography', 'history': 'History', 'polity': 'Polity',
    'economics': 'Economics', 'science': 'Science', 'mathematics': 'Mathematics',
    'reasoning': 'Reasoning', 'aptitude': 'Aptitude', 'english': 'English',
    'current-affairs': 'Current Affairs', 'general-knowledge': 'General Knowledge',
    'computer-science': 'Computer Science', 'electronics': 'Electronics',
    'electrical': 'Electrical', 'mechanical': 'Mechanical', 'civil': 'Civil'
};

LL.subjectIcons = {
    'geography': '🌍', 'history': '📜', 'polity': '⚖️', 'economics': '💰',
    'science': '🔬', 'mathematics': '➗', 'reasoning': '🧩', 'aptitude': '🎯',
    'english': '📖', 'current-affairs': '📰', 'general-knowledge': '🧠',
    'computer-science': '💻', 'electronics': '📡', 'electrical': '⚡',
    'mechanical': '⚙️', 'civil': '🏗️'
};
