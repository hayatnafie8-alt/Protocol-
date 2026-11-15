export interface GuideSlide {
  id: number;
  slideNumber: number;
  section: 'intro' | 'axis1' | 'axis2_stage1' | 'axis2_stage2' | 'axis3' | 'conclusion';
  axisTitle: string;
  axisTitleEn?: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  badge: string;
  badgeEn?: string;
  leadParagraph?: string;
  leadParagraphEn?: string;
  contentBlocks: {
    type: 'quote' | 'study' | 'steps' | 'case_story' | 'tips' | 'protocol' | 'card_grid';
    title?: string;
    titleEn?: string;
    items?: {
      title?: string;
      titleEn?: string;
      desc?: string;
      descEn?: string;
      behavioralAnalysis?: string;
      behavioralAnalysisEn?: string;
      quote?: string;
      quoteEn?: string;
      icon?: string;
    }[];
    text?: string;
    textEn?: string;
    highlight?: string;
    highlightEn?: string;
  }[];
  authorNote?: string;
  authorNoteEn?: string;
}

export const PATIENT_COMMUNICATION_GUIDE: GuideSlide[] = [
  {
    id: 1,
    slideNumber: 1,
    section: 'intro',
    axisTitle: 'الغلاف والتقديم العام',
    axisTitleEn: 'Cover & Executive Overview',
    title: 'دليل التعامل الصحيح مع المراجعين',
    titleEn: 'Clinical Patient Communication & Relationship Management Guide',
    subtitle: 'من أول سؤال بـ الـ History إلى تسليم الحالة بتميز بدون توتر',
    subtitleEn: 'From Initial Anamnesis to Clinical Case Delivery with Stress-Free Excellence',
    badge: 'سيكولوجية طب الأسنان | Dental Psychology',
    badgeEn: 'Dental Psychology & Chairside Protocol',
    leadParagraph:
      'دليل عملي شامل يتضمن 3 محاور رئيسية تضمن لك بناء ثقة واستقرار نفسي بدرجة ممتازة مع المريض في عيادات الكلية والعيادة الخاصة.',
    leadParagraphEn:
      'A comprehensive practical clinical guide detailing 3 core sequential axes to establish solid patient rapport, anxiety mitigation, and therapeutic adherence across university clinics and private practice.',
    contentBlocks: [
      {
        type: 'card_grid',
        title: 'المحاور الثلاثة الرئيسية في الدليل:',
        titleEn: 'Three Core Sequential Clinical Axes:',
        items: [
          {
            title: 'المحور الأول: ما قبل العلاج',
            titleEn: 'Axis 1: Pre-Procedural Engagement',
            desc: 'التجهيز النفسي وبناء الانطباع الأول (First Impression) وصناعة الأمان.',
            descEn: 'Psychological onboarding, priming trust, and creating an empathetic clinical safety envelope.',
            icon: '1',
          },
          {
            title: 'المحور الثاني: أثناء العلاج',
            titleEn: 'Axis 2: Intra-Operative Management',
            desc: 'بروتوكول التواصل الذكي، أخذ الـ History، الفحص الشامل، والشغل الفعلي وإدارة التوتر.',
            descEn: 'Strategic communication, thorough medical history taking, objective examination, and pain control.',
            icon: '2',
          },
          {
            title: 'المحور الثالث: ما بعد العلاج',
            titleEn: 'Axis 3: Post-Operative Debriefing',
            desc: 'أول 5 دقائق بعد نهاية الجلسة، التوعية وضمان المتابعة وبناء الولاء (Word of Mouth).',
            descEn: 'First 5 post-treatment minutes, recovery guidance, compliance assurance, and retention building.',
            icon: '3',
          },
        ],
      },
    ],
    authorNote: 'إعداد وتصميم: د. حياه نافع فجر | مرحلة رابعة - جامعة المعارف - مهتمة بسيكولوجية طب الأسنان.',
    authorNoteEn: 'Authored & Designed by: Dr. Hayat Nafea Fajer | Al-Maarif University | Dental Psychology Division.',
  },
  {
    id: 2,
    slideNumber: 2,
    section: 'axis1',
    axisTitle: 'المحور الأول: ما قبل العلاج',
    axisTitleEn: 'Axis 1: Pre-Procedural Engagement',
    title: 'المحور الأول: ما قبل العلاج (التجهيز النفسي وبناء الثقة)',
    titleEn: 'Axis 1: Pre-Operative Psychological Priming & Building Rapport',
    subtitle: 'لماذا يفشل الأطباء في كسب المراجعين رغم براعتهم السريرية؟',
    subtitleEn: 'Why Do Clinicians Lose Patient Compliance Despite Technical Dexterity?',
    badge: 'التجهيز النفسي وبناء الانطباع الأول',
    badgeEn: 'Psychological Preparation & First Impression',
    leadParagraph:
      'دكتور/ة العزيز/ة.. قبل أن تبدأ بأول خطوة علاجية، أنت بحاجة إلى تجهيز المريض نفسياً سواء داخل العيادة أو عبر الرسائل والمواعيد. الانطباع الأول (First Impression) هو أول وأوثق خيوط بناء الثقة.',
    leadParagraphEn:
      'Dear Doctor.. Before performing the first mechanical step, you must prime the patient psychologically. The initial chairside impression forms the neurological foundation of trust and pain modulation.',
    contentBlocks: [
      {
        type: 'quote',
        title: 'قاعدة سلوكية أساسية في جودة الرعاية:',
        titleEn: 'Core Behavioral Rule in Healthcare Quality:',
        text: '«كلما زادت الأعداد.. قلت الجودة»',
        textEn: '“As Patient Volume Surges Without Systems, Clinical Empathy Declines”',
        highlight:
          'وهذا بالذات ما حدث بعد التكدس الكبير للأعداد داخل أغلب المجالات ومنها المجال الطبي، لذلك نرى اليوم زيادة ملحوظة في شكاوى المراجعين.',
        highlightEn:
          'High clinic congestion without structured communication protocols drives the contemporary surge in patient dissatisfaction and malpractice grievances.',
      },
      {
        type: 'study',
        title: '💡 دراسة سريرية موثوقة في التواصل الطبي:',
        titleEn: '💡 Peer-Reviewed Landmark Communication Study:',
        text: 'أظهرت إحدى الدراسات السريرية الحديثة أن 96% من شكاوى المراجعين ناتجة بالأساس عن ضعف التواصل والتجهيز النفسي، وليس بسبب جودة الرعاية الطبية أو التقنية نفسها!',
        textEn: 'A clinical study revealed that 96% of formal patient complaints stem primarily from communication deficits and emotional alienation, rather than operative technical errors!',
      },
      {
        type: 'tips',
        title: 'الرسالة الجوهرية:',
        titleEn: 'Core Clinical Principle:',
        text: 'لتكون طبيباً متميزاً ولك اسم ورسالة بالمجال الطبي، يجب أن تعمل على تطوير عدة جوانب؛ فالجانب العلمي والعملي وحده لن يبني لك ولاءً أو ثقة دائمة مع المراجعين. الجانب النفسي والسلوكي هو العمود الفقري لنجاحك.',
        textEn: 'Technical precision alone will never secure enduring patient adherence or clinical prestige. Behavioral dentistry and psychological communication form the true backbone of clinical mastery.',
      },
    ],
    authorNote: 'إعداد وتصميم: د. حياه نافع فجر | مرحلة رابعة - جامعة المعارف - مهتمة بسيكولوجية طب الأسنان.',
    authorNoteEn: 'Authored & Designed by: Dr. Hayat Nafea Fajer | Al-Maarif University | Dental Psychology Division.',
  },
  {
    id: 3,
    slideNumber: 3,
    section: 'axis1',
    axisTitle: 'المحور الأول: ما قبل العلاج',
    axisTitleEn: 'Axis 1: Pre-Procedural Engagement',
    title: 'خطوات عملية لتجهيز المريض نفسياً',
    titleEn: 'Chairside Protocols for Psychological Priming & Anxiolysis',
    subtitle: 'بناء تجربة إيجابية استثنائية تضمن ربط المريض بك للأبد',
    subtitleEn: 'Engineering an Empathetic Patient Journey That Fosters Lifetime Compliance',
    badge: 'بروتوكول الخطوات العملية',
    badgeEn: 'Practical Behavioral Action Protocol',
    contentBlocks: [
      {
        type: 'steps',
        title: 'الخطوات السريرية السلوكية المعتمدة:',
        titleEn: 'Evidence-Based Chairside Behavioral Interventions:',
        items: [
          {
            title: '1. الترحيب الدافئ وابتسامة الأمان',
            titleEn: '1. Empathetic Reception & Affective Safety',
            desc: 'استقبال المريض بابتسامة وهدوء يقلل فوراً من إفراز هرمونات التوتر (Cortisol) ويُشعر المريض بأنه في بيئة آمنة ومرحبة.',
            descEn: 'A composed, welcoming greeting immediately downregulates acute systemic cortisol spikes, priming the autonomic nervous system for psychological safety.',
          },
          {
            title: '2. مناداة المريض باسمه والتخاطب الراقي',
            titleEn: '2. Personalized Address & Professional Dignity',
            desc: 'استخدام اسم المريض بشكل مباشر عند الحديث معه، أو استخدام ألقاب الاحترام والتقدير مثل ("أستاذ" أو "ست")، يمنح المريض شعوراً فورياً بالاهتمام الشخصي ويكسر حاجز الجفاف والرسمية.',
            descEn: 'Addressing patients by their preferred name and respectful title establishes instant individualized rapport and dissolves transactional clinical detachment.',
          },
          {
            title: '3. التواصل البصري والاستماع الفعال',
            titleEn: '3. Direct Eye Contact & Active Listening',
            desc: 'التعامل بأسلوب محترم وراقي مع الاستماع الفعال بدون مقاطعة المريض وهو يشرح معاناته، فهذا يعطيه شعوراً بالتقدير والاهتمام الكامل.',
            descEn: 'Uninterrupted active listening coupled with non-verbal validation conveys therapeutic respect and allows complete subjective symptom expression.',
          },
          {
            title: '4. الضبط النفسي وفصل الضغوطات',
            titleEn: '4. Emotional Compartmentalization & Clinician Composure',
            desc: 'مهما بلغت صعوبة الحالة أو نسبة التوتر الداخلي لديك (سواء من صعوبة الشغل أو ضغوطات اليوم)، احرص تماماً على عدم نقل هذا التوتر أو الضيق لمحيط المريض.',
            descEn: 'Never project intra-operative frustration, technical bottlenecks, or ambient clinic fatigue into the patient field; emotional stability is contagious.',
          },
          {
            title: '5. إظهار الاهتمام المباشر ولغة الجسد (Body Language)',
            titleEn: '5. Non-Verbal Body Language & Mindful Presence',
            desc: 'تجنب إظهار أي علامات ملل، استعجال، أو قلة اهتمام أثناء أخذ الـ History، فالمريض يلاحظ لغة الجسد بذكاء شديد وحساسية بالغة.',
            descEn: 'Eliminate subtle micro-expressions of haste, impatience, or cognitive distraction; anxious patients demonstrate heightened hypervigilance to body cues.',
          },
          {
            title: '6. التمهيد والتوضيح المسبق',
            titleEn: '6. Procedural Transparency & Pre-Warning',
            desc: 'اشرح خطوات العلاج والتوقعات ببساطة قبل البدء؛ المريض عندما يعلم ما الذي سيحدث بالخطوة القادمة يقل خوفه من المجهول بنسبة 80%!',
            descEn: 'Demystifying upcoming mechanical sensations and sequencing reduces fear of the unknown by up to 80% through cognitive predictability.',
          },
        ],
      },
    ],
    authorNote: 'بهذه الخطوات، يربط المريض اسمك دائماً بتجربة إيجابية ومميزة مثلك دكتور/ة.',
    authorNoteEn: 'Mastering these behavioral nuances ensures your clinical reputation is forever anchored to empathy and professional excellence.',
  },
  {
    id: 4,
    slideNumber: 4,
    section: 'axis2_stage1',
    axisTitle: 'المحور الثاني: أثناء العلاج',
    axisTitleEn: 'Axis 2: Intra-Operative Management',
    title: 'المحور الثاني: أثناء العلاج (المرحلتان الأساسيتان)',
    titleEn: 'Axis 2: Intra-Operative Management (The Dual-Phase Framework)',
    subtitle: 'الانتقال من مرحلة الاستماع النظري إلى الإتقان السريري',
    subtitleEn: 'Bridging the Transition from Anamnesis to Operative Mastery',
    badge: 'خارطة طريق التفاعل السريري',
    badgeEn: 'Clinical Interaction Roadmap',
    leadParagraph:
      'بعد أن استمعت للمريض باهتمام وناقشته نظرياً بأساس مشكلته، تبدأ الآن الخطوات العملية للعلاج، والتي تنقسم إلى مرحلتين أساسيتين:',
    leadParagraphEn:
      'Following comprehensive subjective engagement and diagnosis, direct chairside therapy initiates across two distinct and meticulously organized clinical stages:',
    contentBlocks: [
      {
        type: 'card_grid',
        title: 'المرحلتان السريريتان الأساسيتان:',
        titleEn: 'Two Essential Clinical Execution Phases:',
        items: [
          {
            title: 'المرحلة الأولى: التحري والتخطيط',
            titleEn: 'Phase 1: Diagnostic Workup & Treatment Planning',
            desc: 'أخذ التاريخ الطبي (History Taking)، الفحص السريري الشامل، ووضع الخطة العلاجية الذكية.',
            descEn: 'Targeted anamnesis, comprehensive oral and occlusal examination, and formulating shared, risk-managed treatment plans.',
            icon: '📋',
          },
          {
            title: 'المرحلة الثانية: العمل الفعلي بالعيادة',
            titleEn: 'Phase 2: Chairside Operative Execution',
            desc: 'بروتوكول التخدير المريح بدون ألم، شارات الأمان والتواصل أثناء تشغيل التورباين والأدوات.',
            descEn: 'Painless local anesthesia induction, stop-signal autonomy, and real-time verbal reassurance during mechanical preparation.',
            icon: '🩺',
          },
        ],
      },
    ],
  },
  {
    id: 5,
    slideNumber: 5,
    section: 'axis2_stage1',
    axisTitle: 'المحور الثاني: أثناء العلاج (المرحلة الأولى)',
    axisTitleEn: 'Axis 2: Intra-Operative (Phase 1)',
    title: 'أخذ التاريخ الطبي (History Taking) بذكاء وصيانة السمعة',
    titleEn: 'Strategic Medical History Taking (Anamnesis) & Reputation Safeguarding',
    subtitle: 'كيف يحميك الـ History الذكي من الأخطاء ويضاعف مراجعيك؟',
    subtitleEn: 'How Insightful History Taking Averts Iatrogenic Errors and Drives Practice Growth',
    badge: 'المرحلة الأولى: History Taking',
    badgeEn: 'Phase 1: Strategic Anamnesis',
    leadParagraph:
      'أخذ الـ History بأسئلة ذكية وطريقة علمية يضمن لك شغلاً سليماً ويحافظ على سمعتك الطبية بامتياز.',
    leadParagraphEn:
      'Employing structured, probing questions during anamnesis safeguards against medical catastrophes, uncovers hidden behavioral patterns, and anchors your clinical authority.',
    contentBlocks: [
      {
        type: 'quote',
        title: '💡 قاعدة التسويق بالعيادة الشفهي (Word of Mouth):',
        titleEn: '💡 Clinical Word-of-Mouth Referral Paradigm:',
        text: '• المراجع بتجربة إيجابية: يعتبر أداة تسويق ناجحة ينقل تجربتك وموثوقيتك للآخرين.\n• المراجع بتجربة سلبية: يعتبر تسويقاً ناجحاً أيضاً، لكن بأثر سلبي وسريع الانتشار! فنقل التجربة السلبية يمنع عنك عشرات المراجعين المحتملين.',
        textEn: '• A validated, satisfied patient serves as a vocal practice advocate, multiplying peer referrals organically.\n• An alienated, distressed patient generates rapid negative virality, preemptively deterring scores of prospective patients.',
      },
    ],
  },
  {
    id: 6,
    slideNumber: 6,
    section: 'axis2_stage1',
    axisTitle: 'المحور الثاني: أثناء العلاج (المرحلة الأولى)',
    axisTitleEn: 'Axis 2: Intra-Operative (Phase 1)',
    title: 'فك شفرة السؤال الذهبي: "هل زرت طبيب أسنان قبلي؟"',
    titleEn: 'Decoding the Cardinal Question: "Have You Visited a Dentist for This Tooth?"',
    subtitle: 'استنتاج سلوك المريض ومدى التزامه قبل أن تلمس السن',
    subtitleEn: 'Inferring Compliance, Pain Tolerance, and Psychological Adherence Before Touching the Tooth',
    badge: 'التحليل النفسي للإجابات',
    badgeEn: 'Psychological Analysis of Patient Responses',
    leadParagraph:
      'السؤال الذهبي: "هل زرت طبيب أسنان سابقاً على هذا السن أو المشكلة؟"\nهذا السؤال يكشف لك سلوك المريض ومدى التزامه بالتعليمات والجلسات قبل أن تبدأ بالشغل، وغالباً لن يكتفي المريض بكلمة "نعم أو لا"، بل سيمنحك تفاصيل ذكية:',
    leadParagraphEn:
      'The Cardinal Diagnostic Question: "Have you sought dental care elsewhere for this specific tooth?" unmasks baseline adherence, past traumatic triggers, and compliance risks well before picking up a handpiece:',
    contentBlocks: [
      {
        type: 'steps',
        title: 'قراءة وتحليل ردود المريض السلوكية:',
        titleEn: 'Deciphering Key Behavioral Patient Responses:',
        items: [
          {
            title: '1. مدى الالتزام بالجلسات (Session Adherence)',
            titleEn: '1. Multi-Session Adherence & Follow-Through',
            quote: '«رحت لطبيب وقال حشوة جذر، وبس خف الألم بعد أول جلسة ما رجعت!»',
            quoteEn: '“I started root canal therapy with a dentist, but once the pain stopped after visit 1, I didn’t go back!”',
            behavioralAnalysis:
              'التحليل السلوكي: تعرف هنا أن المريض عجول ويتوقف فور زوال الألم، وواجبك الآن توعيته المسبقة بخطورة ترك حشوة الجذر مفتوحة وتأكيد أن إيقاف الألم لا يعني شفاء السن لتفادي فقدانه وقلعه.',
            behavioralAnalysisEn:
              'Behavioral Analysis: Highlights a symptom-driven dropout risk. Preemptively educate the patient that acute pain relief is merely palliative; unsealed endodontic access causes reinfection, coronal fracture, and catastrophic tooth loss.',
          },
          {
            title: '2. مدى الالتزام بالتعليمات (Instructions Compliance)',
            titleEn: '2. Post-Operative Adherence & Guidance Compliance',
            quote: '«الدكتور قال عندك التهاب لثة وتحتاج تخفف تدخين بس ما سويت..» أو «سويت حشوة جذر وقالي تغلف وما غلفت وانكسر السن!»',
            quoteEn: '“The dentist advised smoking cessation for my gingivitis, but I didn’t follow it...” or “They told me to crown the tooth after root canal, but I waited and it fractured!”',
            behavioralAnalysis:
              'التحليل السلوكي: يعطيك انطباعاً مسبقاً بمدى تطبيق المريض لإرشاداتك العلاجية مستقبلاً، ويحتم عليك توثيق التعليمات كتابياً ومراجعته بها بحزم لطيف.',
            behavioralAnalysisEn:
              'Behavioral Analysis: Reveals poor long-term preventive adherence. Mandates providing written post-operative protocols, explicit informed consent, and firm verbal reinforcement of crown restoration timelines.',
          },
          {
            title: '3. التجارب السابقة وسقف التوقعات (Past Trauma & Expectations)',
            titleEn: '3. Historical Dental Trauma & Pain Catastrophizing',
            quote: '«رحت لطبيب وكانت إيده ثقيلة وعانيت بـ التخدير والوجع!»',
            quoteEn: '“My previous dentist had heavy hands, the injection was excruciating, and I felt everything!”',
            behavioralAnalysis:
              'التحليل السلوكي: يساعدك على تحديد سقف توقعات معقول للمريض، وتفادي تكرار التجارب المزعجة له من خلال بروتوكول تخدير هادئ وتواصل مستمر.',
            behavioralAnalysisEn:
              'Behavioral Analysis: Signals odontophobia and conditioned hyperalgesia. Requires empathetic validation of past pain, application of profound topical anesthesia, slow injection rates, and ongoing verbal comfort.',
          },
        ],
      },
    ],
  },
  {
    id: 7,
    slideNumber: 7,
    section: 'axis2_stage1',
    axisTitle: 'المحور الثاني: أثناء العلاج (المرحلة الأولى)',
    axisTitleEn: 'Axis 2: Intra-Operative (Phase 1)',
    title: 'الفحص السريري (Clinical Examination)',
    titleEn: 'Comprehensive Clinical & Occlusal Examination',
    subtitle: 'القاعدة الذهبية التي تحميك من الأخطاء التشخيصية القاتلة',
    subtitleEn: 'The Cardinal Diagnostic Axiom That Protects Against Catastrophic Pitfalls',
    badge: 'الفحص السريري الشامل',
    badgeEn: 'Thorough Diagnostic Workup',
    leadParagraph:
      'بعد أن جمعت كمية معلومات قيمة عن سلوك المريض وكسبت ثقته من خلال أسئلتك واهتمامك الواعي، جاء الآن دور مهاراتك وخبرتك السريرية.',
    leadParagraphEn:
      'Once qualitative patient rapport and behavioral profiling are established, your diagnostic precision and objective clinical examination skills take center stage.',
    contentBlocks: [
      {
        type: 'quote',
        title: '💡 القاعدة الذهبية بالفحص السريري:',
        titleEn: '💡 Cardinal Rule of Clinical Dental Examination:',
        text: '«لا تفحص السن المسبب للألم فقط! بل افحص الأنسجة المحيطة، الأسنان المجاورة، والأهم دائماً: الأسنان في الفك المقابل (Opposing Arch).»',
        textEn: '“Never confine your examination to the chief-complaint tooth! Thoroughly evaluate surrounding periodontium, adjacent contacts, and above all: the opposing dental arch.”',
        highlight: 'النظر إلى الفك المقابل يكشف لك مفتاح اللغز في أغلب الحالات المعقدة وغير المفسرة.',
        highlightEn: 'Scrutinizing opposing arch contacts unmasks the primary mechanical etiology in the vast majority of perplexing clinical presentations.',
      },
    ],
  },
  {
    id: 8,
    slideNumber: 8,
    section: 'axis2_stage1',
    axisTitle: 'المحور الثاني: قصة سريرية واقعية',
    axisTitleEn: 'Axis 2: Real-World Clinical Detective Case',
    title: 'قصة حالة سريرية واقعية: لغز السن المتآكل 🦷🔍',
    titleEn: 'Real-World Clinical Case: The Mystery of Severe Localized Tooth Wear 🦷🔍',
    subtitle: 'موقف واقعي من أروقة التدريب السريري',
    subtitleEn: 'An Instructive Diagnostic Dilemma from University Clinic Rounds',
    badge: 'Clinical Case Detective',
    badgeEn: 'Clinical Diagnostic Detective',
    leadParagraph:
      'حضر مراجع يعاني من ألم شديد في أحد الأسنان، وبعد الفحص السريري تبين أن التسوس والضرر أصبح على بعد خطوة واحدة فقط من العصب (Near Pulp Exposure).',
    leadParagraphEn:
      'A patient presented with excruciating dentinal pain. Objective probing revealed advanced occlusal destruction stopping a mere millimeter short of irreversible pulpal exposure (Impending Micro-Exposure).',
    contentBlocks: [
      {
        type: 'case_story',
        title: 'اللغز الغريب في الحالة:',
        titleEn: 'The Baffling Diagnostic Conundrum:',
        text: 'الغريب في الأمر لم يكن اقتراب التآكل من العصب، بل إن السن لم يكن به تسوس بكتيري تقليدي! كان السن فقط متآكلاً تماماً ومفقود العلامات التشريحية (Loss of Anatomic Landmarks).\n\nالتفكير الأولي للطبيب المبتدئ: قد تقول إن التآكل بسبب صرير الأسنان الليلي (Bruxism) أو عامل حمضي كيميائي (Erosion)..\n\nلكن السؤال الذهبي الأهم: لماذا هذا السن تحديداً هو الوحيد المتآكل بهذه الطريقة العميقة دون باقي الأسنان المجاورة في نفس القوس؟ 🤔',
        textEn: 'The true anomaly was not proximity to the pulp chamber, but total absence of primary carious demineralization! The occlusal surface presented severe mechanical wear with complete loss of anatomical landmarks.\n\nA novice clinician might hastily label this generalized nocturnal bruxism or chemical acid erosion...\n\nYet the cardinal differential question arises: Why is this solitary tooth catastrophically worn while adjacent ipsilateral teeth remain pristine? 🤔',
      },
    ],
  },
  {
    id: 9,
    slideNumber: 9,
    section: 'axis2_stage1',
    axisTitle: 'المحور الثاني: قصة سريرية واقعية',
    axisTitleEn: 'Axis 2: Real-World Clinical Detective Case',
    title: 'حل اللغز وأهمية الفحص المكتمل',
    titleEn: 'Cracking the Clinical Enigma: The Supremacy of Opposing Arch Analysis',
    subtitle: 'هنا يظهر الفرق الحاسم بين الطبيب التقليدي والطبيب المتمكن',
    subtitleEn: 'Where Thorough Differential Diagnosis Separates True Master Clinicians from Novices',
    badge: 'التشخيص السريري الشامل',
    badgeEn: 'Holistic Diagnostic Integration',
    contentBlocks: [
      {
        type: 'case_story',
        title: 'اكتشاف السبب الخفي:',
        titleEn: 'Uncovering the Latent Mechanical Etiology:',
        text: 'بعد إجراء الفحص الشامل (Comprehensive Examination) وفحص الفك المقابل، اكتشفنا وجود حشوة أمالجم قديمة مرتفعة (High Amalgam Restoration) على السن المقابل تماماً!\n\nكان هذا التلامس الإطباقي العالي المستمر لسنوات (Premature Contact) بمثابة مطرقة يومية أدت إلى سحق وتآكل السن المقابل بمرور الوقت حتى اقترب تماماً من الحجرة اللبية وسبب الألم الشديد!',
        textEn: 'Conducting a rigorous full-mouth examination and articulating the antagonist teeth uncovered an unadjusted, hyper-occluding Class I amalgam restoration in the opposing arch!\n\nThis chronic premature occlusal contact acted as a relentless daily mechanical piston, pulverizing opposing enamel and dentin over years, culminating in near-pulpal necrosis and severe acute pulpitis.',
      },
      {
        type: 'tips',
        title: '📌 العبرة السريرية المستفادة:',
        titleEn: '📌 Core Clinical Takeaway:',
        text: 'الفحص السريري الذكي والشامل يختصر عليك وعلى المريض أخطاء تشخيصية كبيرة، ويقودك مباشرة نحو وضع الخطة العلاجية الذكية (Smart Treatment Plan).',
        textEn: 'Meticulous, multi-quadrant occlusal assessment prevents disastrous misdiagnoses (such as unindicated RCT or unnecessary extractions) and paves the way for definitive, conservative treatment planning.',
      },
    ],
  },
  {
    id: 10,
    slideNumber: 10,
    section: 'axis2_stage1',
    axisTitle: 'المحور الثاني: أثناء العلاج (المرحلة الأولى)',
    axisTitleEn: 'Axis 2: Intra-Operative (Phase 1)',
    title: 'وضع الخطة العلاجية الذكية والمشاركة بالقرار',
    titleEn: 'Formulating Smart Treatment Plans & Shared Clinical Decision-Making',
    subtitle: 'لا تبدأ العلاج فوراً دون تمهيد، ولا تتخذ القرار بمفردك!',
    subtitleEn: 'Never Initiate Irreversible Procedures in Isolation: Engage the Patient in Informed Consent',
    badge: 'Smart Treatment Plan',
    badgeEn: 'Shared Treatment Planning',
    leadParagraph:
      'هناك حالات سريرية كثيرة تتطلب وجود أكثر من خطة علاجية مجهزة، وتتفاوت بحسب: الوقت المتاح للمريض، طبيعة الحالة البيولوجية، والتكلفة المادية المناسبة له.',
    leadParagraphEn:
      'Complex dental presentations invariably warrant tiered therapeutic options adapted to biologic prognosis, patient time constraints, and financial capacity.',
    contentBlocks: [
      {
        type: 'quote',
        title: '💡 القاعدة الذهبية بعد انتهاء الفحص:',
        titleEn: '💡 Golden Rule Following Examination:',
        text: '«اترك أدواتك جانباً بعد الفحص مباشرةً، واشرح للمريض كل ما شخصته بلغة بسيطة ومفهومة، وناقش معه الخيارات المتاحة لتقررا معاً الخطة الأنسب لحالته وظروفه.»',
        textEn: '“Place your instruments down immediately upon completing the exam, explain diagnostic findings in lucid non-intimidating terminology, and co-design the optimal therapeutic pathway together.”',
      },
    ],
  },
  {
    id: 11,
    slideNumber: 11,
    section: 'axis2_stage1',
    axisTitle: 'المحور الثاني: أثناء العلاج (المرحلة الأولى)',
    axisTitleEn: 'Axis 2: Intra-Operative (Phase 1)',
    title: 'ليش "لا تشتغل وأنت ساكت"؟',
    titleEn: 'Why You Must "Never Work in Pure Silence": The Neuroscience of Chairside Dialogue',
    subtitle: 'لماذا يجب أن تشارك المريض في تفاصيل خطة العلاج؟',
    subtitleEn: 'How Transparent Chairside Communication Lowers Sensory Pain Thresholds',
    badge: 'علم النفس السريري وإدارة التوتر',
    badgeEn: 'Clinical Psychology & Anxiolysis',
    contentBlocks: [
      {
        type: 'steps',
        title: 'الفوائد الثلاث الحتمية للشرح والتواصل:',
        titleEn: 'Three Cardinal Clinical Benefits of Ongoing Communication:',
        items: [
          {
            title: '1. إدارة سقف التوقعات (Managing Expectations)',
            titleEn: '1. Calibrating Esthetic & Functional Expectations',
            desc: 'مناقشة الخطوات تجعلك تعرف ما الذي ينتظره المريض تماماً من الناحية الجمالية والوظيفية، وهل يمكنك علمياً وسريرياً الوصول لهذه النتيجة أم لا، مما يمنع الصدام بعد التسليم.',
            descEn: 'Transparent discourse aligns patient hopes with biological realities, defining what is clinically achievable and preventing post-treatment disputes.',
          },
          {
            title: '2. تقليل التوتر وحساسية الألم (Anxiety & Pain Control)',
            titleEn: '2. Anxiolysis & Cortical Pain Modulation',
            desc: 'أكثر ما يسبب الشكوى والتوتر لدى المراجعين هو الطبيب الذي يعمل بصمت تام دون أي توضيح! المريض عندما يعرف الخطوة القادمة يشعر بالسيطرة (Sense of Control)، مما يقلل إفراز الأدرينالين والتوتر وحساسية الألم بشكل ملحوظ.',
            descEn: 'Operative silence heightens patient hypervigilance and sympathetic tone. Forewarning predictable stimuli instills perceived control, visibly dampening nociceptive amplification.',
          },
          {
            title: '3. زيادة الثقة والالتزام بالعلاج',
            titleEn: '3. Enhancing Therapeutic Trust & Long-Term Adherence',
            desc: 'عندما يشعر المريض بأنه جزء أصيل من القرار العلاجي، تزداد ثقته بمهنيتك العالية ويلتزم بتعليماتك ومواعيدك بنسبة أعلى بكثير.',
            descEn: 'Patients treated as active partners exhibit exponentially higher commitment to follow-up visits, oral hygiene protocols, and restorative maintenance.',
          },
        ],
      },
    ],
  },
  {
    id: 12,
    slideNumber: 12,
    section: 'axis2_stage2',
    axisTitle: 'المحور الثاني: أثناء العلاج (المرحلة الثانية)',
    axisTitleEn: 'Axis 2: Intra-Operative (Phase 2)',
    title: 'المرحلة الثانية: الشغل الفعلي بالعيادة',
    titleEn: 'Phase 2: Chairside Operative Execution & Overcoming the Primary Phobia',
    subtitle: 'الانتقال إلى العمل الإجرائي وتفكيك حاجز الخوف الأكبر',
    subtitleEn: 'Dismantling the Odontophobia Barrier through Profound Anesthetic Mastery',
    badge: 'الشغل الفعلي بالعيادة',
    badgeEn: 'Chairside Operative Phase',
    leadParagraph:
      'هذه المرحلة تعتمد بشكل أساسي على كل ما سبق من تحضير نفسي وفحص، فبناء الثقة يكتمل بالخطوات الفعلية بشكل تدريجي ومدروس.',
    leadParagraphEn:
      'Operational success rests squarely on previous psychological conditioning; technical rapport crystallizes through deliberate, empathetic operative steps.',
    contentBlocks: [
      {
        type: 'study',
        title: '💡 حقائق علمية عن خوف المراجعين:',
        titleEn: '💡 Evidence-Based Psychosocial Findings on Dental Phobia:',
        text: 'أظهرت الدراسات السلوكية أن 75% من خوف وتوتر المراجعين في عيادة الأسنان مرتبط فقط بلحظة إعطاء إبرة التخدير (Local Anesthesia) والوخزة الأولى!',
        textEn: 'Behavioral literature demonstrates that ~75% of dental anxiety and chairside tachycardia is provoked exclusively by local anesthetic needle entry and anticipation of the puncture!',
      },
      {
        type: 'tips',
        title: 'القرار السريري الأول:',
        titleEn: 'The Pivotal Clinical Priority:',
        text: 'خطوتك الأولى بالشغل الفعلي هي إعطاء التخدير بتكنيك مريح وناعم؛ لكي تثبت للمراجع صحة اختياره وثقته بك من أول لحظة على الكرسي.',
        textEn: 'Your foremost clinical priority is mastering gentle, painless local anesthetic delivery—proving the validity of their trust from the very first minute in your operatory.',
      },
    ],
  },
  {
    id: 13,
    slideNumber: 13,
    section: 'axis2_stage2',
    axisTitle: 'المحور الثاني: أثناء العلاج (المرحلة الثانية)',
    axisTitleEn: 'Axis 2: Intra-Operative (Phase 2)',
    title: 'تريكات التخدير الموضعي وتخفيف الألم',
    titleEn: 'Advanced Local Anesthesia Chairside Nuances & Pain Elimination',
    subtitle: 'بروتوكول الحقن السلس بدون دراما أو صدمة للأنسجة',
    subtitleEn: 'The Atraumatic Deposition Protocol: Zero Tissue Shock & Anxiety Dissolution',
    badge: 'Pain-Free Anesthesia Protocol',
    badgeEn: 'Atraumatic Anesthesia Protocol',
    contentBlocks: [
      {
        type: 'steps',
        title: 'عناصر بروتوكول التخدير المريح:',
        titleEn: 'Key Components of Atraumatic Local Anesthetic Delivery:',
        items: [
          {
            title: '1. التخدير السطحي الموضعي (Topical Anesthesia)',
            titleEn: '1. Strategic Topical Anesthetic Application',
            desc: 'استخدام المخدر السطحي الصحيح مع تجفيف النسيج والانتظار دقيقتين يقلل بنسبة 60% من ألم الوكزة السطحية الأولية.',
            descEn: 'Thoroughly drying mucosal target sites and maintaining high-potency topical benzocaine contact for a full 2 minutes attenuates needle puncture discomfort by ~60%.',
          },
          {
            title: '2. الحقن البطيء جداً (Slow Injection Technique)',
            titleEn: '2. Ultra-Slow Solution Deposition Rate',
            desc: 'إعطاء المخدر ببطء شديد يمنع تمدد الأنسجة المفاجئ (Tissue Distension) الذي يمثل 90% من سبب الألم أثناء حقن المحلول.',
            descEn: 'Depositing solution over 60 seconds (1 mL/min) mitigates hydrodynamic tissue distension and periosteal tearing, eliminating over 90% of procedural sting.',
          },
        ],
      },
      {
        type: 'protocol',
        title: '💡 كورس العيادات الشامل مع منصة ليرنو:',
        titleEn: '💡 Comprehensive Clinical Training Series with LearnO Platform:',
        text: 'إذا حاب تطور مهاراتك بـ التخدير، الحشوات، والقلع بشكل عملي وشامل، منصة ليرنو وفرت كورس العيادات الشامل بخصم 70% (آخر موعد للحجز هو 1/10). للاستفسار والتسجيل، تواصل معنا عبر الحساب: t.me/hay_a_2',
        textEn: 'For clinicians seeking practical mastery in local anesthesia blocks, modern adhesive restorations, and exodontia, LearnO Platform provides the Comprehensive Clinical Skills Course. Inquiries & registration via Telegram: t.me/hay_a_2',
      },
    ],
  },
  {
    id: 14,
    slideNumber: 14,
    section: 'axis2_stage2',
    axisTitle: 'المحور الثاني: أثناء العلاج (المرحلة الثانية)',
    axisTitleEn: 'Axis 2: Intra-Operative (Phase 2)',
    title: 'قواعد وأمان الشغل الفعلي بالعيادة',
    titleEn: 'Operative Safety Mandates & Ergonomic Patient Comfort',
    subtitle: 'شارات الأمان وإدارة إجهاد مفصل الفك أثناء الجلسات الطويلة',
    subtitleEn: 'The Stop-Signal Contract & Proactive TMJ Fatigue Management',
    badge: 'بروتوكول السلامة والراحة السريرية',
    badgeEn: 'Clinical Safety & Comfort Protocol',
    contentBlocks: [
      {
        type: 'steps',
        title: '3 ركائز أمان أثناء استخدام التورباين والأدوات:',
        titleEn: 'Three Chairside Pillars During Rotary Instrumentation:',
        items: [
          {
            title: '1. الاتفاق على "شارة التوقف" (Stop Signal)',
            titleEn: '1. Contractual "Stop Signal" Autonomy',
            desc: 'اتفق مع المراجع قبل تشغيل التورباين على حركة واضحة بيده (مثل رفع اليد اليسرى) عند الشعور بضيق أو رغبة بالبصاق، ونبهه دائماً بحزم لطيف من الحركات المفاجئة بالرأس ومخاطرها أثناء عمل البيرات السريعة.',
            descEn: 'Establish an unequivocal hand signal (e.g., raising the left hand) prior to depressing the foot pedal. Reassure the patient of immediate stoppage, preventing dangerous involuntary head jerks.',
          },
          {
            title: '2. التنبيه المسبق قبل أي إحساس بضغط أو حساسية',
            titleEn: '2. Sensory Pre-Warning (Pressure & Thermal Changes)',
            desc: 'أي خطوة قد تسبب اهتزازاً أو ضغطاً أو برودة مفاجئة (مثل تركيب الماتريكس Matrix Placement، أو حفر العاج العميق)، نبه المراجع إليها قبل ثانيتين لكي لا يتفاجأ برد فعل دفاعي لا إرادي.',
            descEn: 'Forewarn the patient 2 seconds before transient tactile sensations (matrix band ring placement, cold water coolant spray, or deep dentin vibration) to eliminate startled startle reflexes.',
          },
          {
            title: '3. إدارة إجهاد مفصل الفك (TMJ Fatigue)',
            titleEn: '3. Proactive TMJ & Masseter Fatigue Alleviation',
            desc: 'إذا لاحظت ارتجاف شفة المريض أو تعب مفصل الفك أثناء الجلسة الطويلة: استشره فوراً إذا كان يفضل التوقف وأخذ استراحة دقيقة، أو استخدام Bite Block، أو إكمال العمل بجلسة قادمة. وإذا اشتكى من ألم المفصل، أنهِ الجلسة بأسرع وأأمن طريقة واشرح له الأسباب.',
            descEn: 'Observe peri-oral muscle tremors and capsular fatigue. Offer immediate micro-rests, employ soft silicone bite blocks, or staged appointments. If acute TMJ arthralgia occurs, safely terminate the visit.',
          },
        ],
      },
    ],
  },
  {
    id: 15,
    slideNumber: 15,
    section: 'axis3',
    axisTitle: 'المحور الثالث: ما بعد العلاج',
    axisTitleEn: 'Axis 3: Post-Operative Management',
    title: 'المحور الثالث: ما بعد العلاج (أول 5 دقائق بعد نهاية الجلسة)',
    titleEn: 'Axis 3: Post-Operative Debriefing (The Crucial First 5 Minutes)',
    subtitle: 'التوقيع والختم للانطباع الأخير الذي يستقر بذهن المريض',
    subtitleEn: 'The Final Clinical Signature: Cementing Long-Term Memory & Patient Gratitude',
    badge: 'الانطباع الأخير والوفاء السريري',
    badgeEn: 'Peak-End Rule & Clinical Allegiance',
    leadParagraph:
      'أكبر خطأ يرتكبه الطبيب بعد انتهاء الخطوات العلاجية، هو العجلة بإنهاء التواجد مع المريض وترك العيادة فوراً!',
    leadParagraphEn:
      'The single most detrimental behavioral blunder clinicians commit post-treatment is an abrupt, rushed departure from the operatory the moment burs stop spinning!',
    contentBlocks: [
      {
        type: 'quote',
        title: 'قاعدة الختام الذهبية:',
        titleEn: 'The Golden Peak-End Axiom:',
        text: '«كثيراً ما نتحدث عن أهمية الانطباع الأول، لكن يجب أن تعرف أن آخر 5 دقائق بنفس الأهمية؛ لأنها بمثابة التوقيع والختم للانطباع الأخير الذي سيستقر في ذاكرة المريض ويحكيه لأهله وأصدقائه.»',
        textEn: '“While the primacy effect shapes the first impression, the psychological peak-end rule proves that the final 5 minutes solidify enduring emotional recall and word-of-mouth testimony.”',
      },
      {
        type: 'study',
        title: '💡 حقيقة نفسية مهمة:',
        titleEn: '💡 Landmark Cognitive Insight:',
        text: 'المريض أثناء وجوده على الكرسي يكون شديد الملاحظة والذكاء! تعاملك اللطيف أثناء العمل ثم استعجالك بالخروج بمجرد انتهاء الشغل يجعله يشعر أنك ركزت على الجانب الإجرائي والتجاري فقط وأهملت الجانب الإنساني!',
        textEn: 'Patients exhibit acute social sensitivity. Flawless intra-operative warmth followed by sudden abandonment leads patients to interpret care as purely transactional rather than genuinely empathetic.',
      },
    ],
  },
  {
    id: 16,
    slideNumber: 16,
    section: 'axis3',
    axisTitle: 'المحور الثالث: ما بعد العلاج',
    axisTitleEn: 'Axis 3: Post-Operative Management',
    title: 'بروتوكول الـ 5 دقائق الأخيرة الذكي',
    titleEn: 'The 5-Minute Post-Operative Debriefing Protocol',
    subtitle: 'طبق هذه الخطوات في نهاية كل جلسة علاجية وسترى النتيجة بنفسك',
    subtitleEn: 'Systematic Chairside Steps to Reinforce Outcomes & Prevent Complications',
    badge: 'بروتوكول الـ 5 دقائق الذكي',
    badgeEn: 'Smart Debriefing Protocol',
    contentBlocks: [
      {
        type: 'steps',
        title: 'الخطوات الثلاث لإنهاء الجلسة بامتياز:',
        titleEn: 'Three Essential Protocols for an Exemplary Visit Conclusion:',
        items: [
          {
            title: '1. إظهار النتيجة للمريض (Mirror Validation)',
            titleEn: '1. Mirror Validation & Esthetic Co-Inspection',
            desc: 'اشترِ مرآة يدوية أنيقة واحتفظ بها معك دائماً. بعد الانتهاء، سلم المرآة للمريض بنفسه واسأله بابتسامة دافئة: "عجبتك النتيجة؟ عندك أي ملاحظة أو استفسار؟" هذا التصرف يبث الثقة الفورية.',
            descEn: 'Equip your operatory with an elegant hand mirror. Hand it to the patient and invite collaborative feedback: “How do you feel about the contour and match?” This transparency radiates unmatched clinical confidence.',
          },
          {
            title: '2. التركيز والتواصل البصري الكامل',
            titleEn: '2. Undivided Attention & Eye-Level Communication',
            desc: 'اترك أدواتك وأغراضك تماماً، اجلس بمستوى المريض وركز معه كإنسان محترم قدم لك وقته وقدمت له خدمة طبية راقية، مع الحفاظ على الهيبة والرصانة الطبية دون إلغاء الاحترام.',
            descEn: 'Disengage completely from clinical tray clean-up. Lower your stool to eye level and engage in warm, attentive dialogue, upholding dignified clinical posture and deep human respect.',
          },
          {
            title: '3. التعليمات الواضحة وتفادي المخاطر المستقبلية',
            titleEn: '3. Lucid Home-Care Instructions & Complication Preemption',
            desc: 'إرشاد المريض للتعليمات بدقة بعد الجلسة (متى يأكل، كيف ينظف)، وإذا كانت لديه جلسة قادمة (مثل حشوة جذر)، نبهه بحزم على مخاطر إهمال الحشوة المؤقتة وتجنب الأكل القاسي عليها.',
            descEn: 'Deliver precise verbal and written post-op guidance (mastication onset, soft diet, analgesia). If intermediate visits remain, firmly stress the vulnerability of provisional restorations against heavy loads.',
          },
        ],
      },
    ],
  },
  {
    id: 17,
    slideNumber: 17,
    section: 'axis3',
    axisTitle: 'المحور الثالث: ما بعد العلاج',
    axisTitleEn: 'Axis 3: Post-Operative Management',
    title: 'الانطباع الأخير والنية الصافية',
    titleEn: 'The Enduring Impression & Authentic Clinical Intent',
    subtitle: 'كيف تصنع تسويقاً شفهياً (Word of Mouth) بقيمة آلاف الدولارات بدون أي تكلفة؟',
    subtitleEn: 'How Sincere Clinical Empathy Generates Thousands of Dollars in Organic Word-of-Mouth',
    badge: 'سر التسويق الطبي الأرقى',
    badgeEn: 'Organic Clinical Advocacy',
    contentBlocks: [
      {
        type: 'steps',
        title: 'لمسات التميز الإنساني:',
        titleEn: 'Hallmarks of Compassionate Dental Professionalism:',
        items: [
          {
            title: 'كلمات التقدير والكارت الشخصي',
            titleEn: 'Gratitude & Accessible Direct Contact',
            quote: '«شكراً لحضورك أستاذ وتعبناك ويانا، إن شاء الله النتيجة تكون مرضية ومريحة إلك.»',
            quoteEn: '“Thank you sincerely for your patience and trust today; my priority is that your recovery is completely comfortable.”',
            desc: 'سلم عليه وأعطه كارت العيادة أو حسابك المهني: «هذا الكارت مالتي إذا واجهتك أي مشكلة أو استفسار، وإذا حاب تنشر وتعمل لي تاك راح تكون خطوة لطيفة منك.»',
            descEn: 'Provide your professional contact card: “Here is my clinical contact should any questions arise over the next 48 hours; your well-being remains our continuous priority.”',
          },
          {
            title: 'النية الصافية والوداع الدافئ',
            titleEn: 'Heartfelt Integrity & Warm Departure',
            quote: '«حاولت بكل جهدي أطلع بنتيجة ترضي رب العالمين أولاً وترضيك.»',
            quoteEn: '“I dedicated every ounce of clinical precision to achieve a restorative outcome of the highest standard for your health.”',
            desc: 'كلمة صادقة تخرج من القلب تدخل لقلب المريض مباشرة وتجعله سفيراً لاسمك وعيادتك.',
            descEn: 'Authentic commitment conveyed with humility resonates deeply, converting patients into passionate lifelong ambassadors for your practice.',
          },
        ],
      },
      {
        type: 'quote',
        title: '💡 الخلاصة الجوهرية:',
        titleEn: '💡 Essential Behavioral Summary:',
        text: '«هذه الـ 5 دقائق كفيلة بأن تجلب لك مراجعين جدد دون أن تدفع فلساً واحد! فالعامل النفسي والتسويق الشفهي (Word of Mouth) عن طريق مراجع سعيد هو أعلى وأقوى مراتب التسويق لعيادتك.» 💎✨',
        textEn: '“These final 5 minutes hold greater practice equity than any marketing budget! A thoroughly validated, pain-free patient sharing their story is the most prestigious referral asset in healthcare.” 💎✨',
      },
    ],
  },
  {
    id: 18,
    slideNumber: 18,
    section: 'conclusion',
    axisTitle: 'الخاتمة والدعوة للتميز',
    axisTitleEn: 'Conclusion & Aspiration to Excellence',
    title: 'رحلتك نحو التميز الأكاديمي والسريري تبدأ هنا',
    titleEn: 'Your Journey Toward Academic & Clinical Supremacy Begins Here',
    subtitle: 'أتمنى أن يكون هذا الدليل خطوة أولى ملهمة لتطوير مهاراتك العيادية وبناء شخصية طبيب الأسنان الناجح',
    subtitleEn: 'May this guide serve as an inspiring blueprint for your chairside mastery and professional leadership',
    badge: 'خاتمة الدليل ورسالة المشرفة',
    badgeEn: 'Author Epilogue & Supervisor Message',
    leadParagraph:
      'مهنة طب الأسنان هي مزيج بديع بين العلم الدقيق، الفن اليدوي الراقي، والإنسانية العميقة. عندما تمتلك الجانب النفسي وتتعامل مع المريض كإنسان وليس كمجرد سن في الفك، ستصل إلى القمة حتماً.',
    leadParagraphEn:
      'Dentistry is a magnificent fusion of rigorous science, delicate manual dexterity, and profound human empathy. When you master patient psychology and treat individuals rather than isolated teeth, clinical distinction is inevitable.',
    contentBlocks: [
      {
        type: 'protocol',
        title: 'إعداد وتصميم الدليل:',
        titleEn: 'Curated & Authored By:',
        text: 'د. حياه نافع فجر | مرحلة رابعة - كلية طب الأسنان - جامعة المعارف\nمهتمة بالجانب النفسي لطب الأسنان (سيكولوجية طب الأسنان)\n\nللتواصل، الاستفسارات ومناقشة الحالات:\n• إنستغرام: @hay_a_2\n• تليجرام: t.me/hay_a_2',
        textEn: 'Dr. Hayat Nafea Fajer | Al-Maarif University College of Dentistry\nSpecialized Interest in Behavioral Dentistry & Dental Psychology\n\nClinical inquiries, case discussions & communication:\n• Instagram: @hay_a_2\n• Telegram: t.me/hay_a_2',
      },
    ],
    authorNote: 'تم تطوير هذا الدليل ليكون مرجعاً عملياً دائماً لطلبة وأطباء الأسنان.',
    authorNoteEn: 'Developed as an enduring chairside reference for dental students and practicing clinicians.',
  },
];
