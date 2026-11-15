/**
 * Direct Pulp Capping Protocol (DPC)
 * بروتوكول التغطية اللبية المباشرة
 *
 * Supervisor: Dr. Hayat Nafee Fajer (د. حياة نافع فجر)
 * Complete, precise, evidence-based protocol for Vital Pulp Therapy (VPT)
 * utilizing MTA micro-placement, hemostasis diagnosis, and GIC sandwich isolation.
 */

export interface PulpCappingSlide {
  slideNumber: number;
  phaseTitle: string;
  phaseTitleEn: string;
  badge: string;
  badgeEn: string;
  category: 'prerequisites' | 'hemostasis' | 'mta' | 'gic' | 'composite' | 'followup' | 'failure';
  clinicalStep: {
    title: string;
    points: string[];
  };
  clinicalStepEn?: {
    title: string;
    points: string[];
  };
  scientificRationale: {
    title: string;
    points: Array<{
      heading: string;
      description: string;
      isWarning?: boolean;
    }>;
  };
  scientificRationaleEn?: {
    title: string;
    points: Array<{
      heading: string;
      description: string;
      isWarning?: boolean;
    }>;
  };
  warningBox?: {
    title: string;
    text: string;
    severity: 'danger' | 'warning' | 'info';
  };
  warningBoxEn?: {
    title: string;
    text: string;
    severity: 'danger' | 'warning' | 'info';
  };
  keyInstruments: Array<{
    name: string;
    nameEn: string;
    purpose: string;
    purposeEn?: string;
  }>;
}

export const DIRECT_PULP_CAPPING_INFO = {
  id: 'pulp_capping',
  title: 'بروتوكول التغطية اللبية المباشرة',
  titleEn: 'Direct Pulp Capping Protocol (Vital Pulp Therapy)',
  supervisor: 'د. حياة نافع فجر',
  department: 'المعالجة اللبية الحيوية ومداواة الأسنان المحافظة (Vital Pulp Therapy)',
  departmentEn: 'Conservative Operative Dentistry & Vital Pulp Therapy (VPT)',
  objective:
    'الحفاظ على حيوية اللب السني السليم بعد الانكشاف الميكانيكي أو الرضي، وتحفيز تشكل الجسر العاجي (Dentin Bridge) بواسطة الـ MTA وتقنية الساندوتش المحكمة.',
  objectiveEn:
    'Preserve physiological pulp vitality following mechanical or traumatic micro-exposure, inducing tertiary reparative dentinogenesis (dentin bridge) using hydraulic calcium silicate (MTA) and hermetic GIC sandwich seal.',
  goldenRule:
    'عزل السن بالرابر دام شرط إلزامي 100%؛ والنزيف غير المتوقف خلال 5 دقائق يعني التهاب لب غير ردود ويستوجب استئصال اللب الكامل فورا.',
  goldenRuleEn:
    'Complete rubber dam isolation is 100% mandatory; persistent pulpal bleeding exceeding 5 minutes pathologically confirms irreversible pulpitis requiring immediate pulpectomy.',
};

export const DIRECT_PULP_CAPPING_SLIDES: PulpCappingSlide[] = [
  {
    slideNumber: 1,
    phaseTitle: 'المقدمة والشروط المسبقة (Pre-requisites)',
    phaseTitleEn: 'Clinical Indications & Absolute Prerequisites',
    badge: 'الخطوة 1 • معايير القبول السريري',
    badgeEn: 'Step 1 • Diagnostic Selection Criteria',
    category: 'prerequisites',
    clinicalStep: {
      title: 'الشروط الثلاثة الإلزامية قبل البدء بالتغطية المباشرة:',
      points: [
        'عزل السن (Rubber Dam Isolation): استخدام الحاجز المطاطي إلزامي 100% بدون أي استثناء (دخول قطرة لعاب واحدة يعني الفشل الحتمي بسبب البكتيريا الفموية اللاهوائية).',
        'حالة اللب السني (Pulp Status): التأكد من أن السن حيوي تماماً (Vital) بدون أي تاريخ ألم تلقائي مستمر، لنفي وجود التهاب اللب غير الردود (Irreversible Pulpitis).',
        'طبيعة الانكشاف (Nature of Exposure): انكشاف ميكانيكي أثناء حفر نخر سليم أو ناتج عن صدمة رضحية حديثة (Trauma)، بقطر أقل من 1 مم، ومحاط بعاج سليم تماماً وصلب ونظيف من التسوس.',
      ],
    },
    clinicalStepEn: {
      title: 'The Three Mandatory Prerequisites for Vital Pulp Therapy:',
      points: [
        'Impermeable Rubber Dam Isolation: 100% mandatory without compromise (a single salivary drop introduces high-density anaerobic microbiota causing inevitable failure).',
        'Pre-Operative Pulp Vitality: Verified normal or reversible pulp response with zero history of spontaneous nocturnal or lingering thermal pain (ruling out irreversible pulpitis).',
        'Exposure Dimension & Margins: Mechanical or acute traumatic exposure (< 1.0 mm diameter) entirely encircled by sound, firm, caries-free dentin with healthy vascularized pulpal stroma.',
      ],
    },
    scientificRationale: {
      title: 'التفسير العلمي والأكاديمي لمعايير الشروط المسبقة:',
      points: [
        {
          heading: 'حتمية العزل بالرابر دام',
          description:
            'اللعاب يحتوي على أكثر من 700 نوع بكتيري؛ أي تلامس لعابي مع اللب المكشوف ينقل العدوى الميكروبية لأنسجة اللب العميقة محولاً الحالة من التهاب سطحي ردود إلى تنخر لبي شامل.',
        },
        {
          heading: 'التحقق من حيوية اللب مسبقاً',
          description:
            'إذا كان اللب مصاباً بالتهاب غير ردود (Irreversible Pulpitis)، فإن خلايا اللب تفقد قدرتها التجددية وتتكاثر البكتيريا داخل القنوات، مما يجعل التغطية مضيعة للوقت ومصدراً للألم الشديد.',
        },
        {
          heading: 'حجم الانكشاف ومحيط العاج السليم',
          description:
            'الانكشاف الأقل من 1 مم المحاط بعاج سليم يوفر بيئة غنية بالأوعية الدموية الدقيقة السليمة القادرة على إفراز الخلايا الشبيهة بمصورة العاج (Odontoblast-like cells) لبناء جسر كلسي متين.',
        },
      ],
    },
    scientificRationaleEn: {
      title: 'Histological & Pathophysiological Rationale:',
      points: [
        {
          heading: 'Absolute Salivary Exclusion via Rubber Dam',
          description:
            'Saliva harbors > 700 bacterial taxa. Any salivary contact inoculates opportunistic pathogens directly into the exposed vascular bed, transforming superficial reversible hyperemia into irreversible pulp necrosis.',
        },
        {
          heading: 'Confirmation of Pulpal Regenerative Potential',
          description:
            'Irreversibly inflamed pulpal tissue exhibits micro-abscesses and lost progenitor odontoblastic capability; capping an irreversibly inflamed pulp inevitably triggers severe pain and periapical pathology.',
        },
        {
          heading: 'Exposure Caliber (< 1.0 mm) in Sound Dentin',
          description:
            'Micro-exposures surrounded by sound dentin conserve rich subodontoblastic capillary plexuses (Plexus of Raschkow) capable of recruiting stem cells for reactionary and reparative dentinogenesis.',
        },
      ],
    },
    warningBox: {
      title: 'تحذير سريري حاسم (Clinical Warning):',
      text: 'يمنع منعاً باتاً إجراء التغطية اللبية المباشرة في حال وجود انكشاف داخل تسوس عفن رطب أو في سن يظهر ألماً ليلياً عفوياً مسبقاً؛ العلاج الصحيح هنا هو استئصال اللب (RCT).',
      severity: 'danger',
    },
    warningBoxEn: {
      title: 'Decisive Clinical Contraindication:',
      text: 'Direct pulp capping is strictly contraindicated in exposures presenting within moist soft infected caries, or teeth exhibiting spontaneous lingering nocturnal pain. Immediate pulpectomy / RCT is mandated.',
      severity: 'danger',
    },
    keyInstruments: [
      { name: 'حاجز مطاطي (Rubber Dam Sheet & Clamp)', nameEn: 'Rubber Dam System', purpose: 'تأمين عزل ميكروبي كيميائي جاف 100%', purposeEn: 'Establishes 100% hermetic microbial & moisture barrier' },
      { name: 'جهاز فحص الحيوية الكهربائي والحراري', nameEn: 'Cold Test & EPT Device', purpose: 'تأكيد الحيوية ونفي الالتهاب اللاعكوس', purposeEn: 'Confirms pulpal vitality and rules out necrotic degeneration' },
      { name: 'عدسة تكبير جراحية أو مجهر سنّي', nameEn: 'Surgical Loupes / Dental Microscope', purpose: 'فحص قطر الانكشاف وخلو الحواف من النخر', purposeEn: 'Magnifies exposure site to verify absence of demineralized caries' },
    ],
  },
  {
    slideNumber: 2,
    phaseTitle: 'المرحلة الأولى - السيطرة على النزيف والتعقيم (Hemostasis & Disinfection)',
    phaseTitleEn: 'Hemostasis Control & Diagnostic Assessment',
    badge: 'الخطوة 2 • إيقاف النزيف والمقياس التشخيصي',
    badgeEn: 'Step 2 • Diagnostic Hemostasis Protocol',
    category: 'hemostasis',
    clinicalStep: {
      title: 'الخطوة السريرية التنفيذية:',
      points: [
        'تجهيز قطنة صغيرة معقمة ومبللة بمحلول كلورهيكسيدين 2% (CHX) أو هيبوكلوريت الصوديوم 1% - 5% (NaOCl).',
        'تطبيق القطنة بضغط خفيف ومستقر مباشرة فوق نقطة الانكشاف اللبي لمدة تتراوح بين دقيقتين إلى 5 دقائق دون تحريك القطنة أو فركها بعنف.',
        'إزالة القطنة برفق ومراقبة موقع الانكشاف: يجب أن يتوقف النزيف تماماً ويتشكل سطح أحمر متماسك ونظيف.',
      ],
    },
    clinicalStepEn: {
      title: 'Chairside Operative Execution:',
      points: [
        'Moisten a micro-sterile cotton pellet with 2.5% - 5.25% Sodium Hypochlorite (NaOCl) or 2.0% Chlorhexidine (CHX).',
        'Apply passive, steady micro-compression directly over the pulp exposure site for 2 to 5 minutes without rubbing or mechanical agitation.',
        'Gently retrieve the pellet and inspect under magnification: active bleeding must completely cease, revealing a clean, bright red, coagulated tissue surface.',
      ],
    },
    scientificRationale: {
      title: 'التفسير العلمي الثلاثي لمرحلة السيطرة على النزيف:',
      points: [
        {
          heading: '1. كبح البكتيريا وتطهير السطح (Antimicrobial Efficacy)',
          description:
            'محلول CHX 2% أو NaOCl يقضي على أي ملوثات ميكروبية دقيقة على السطح اللبي ويذيب الخثرات السطحية المتفككة دون إحداث سمية خلوية للأنسجة الحيوية العميقة.',
        },
        {
          heading: '2. مقياس تشخيصي إلزامي لحالة اللب (Diagnostic Indicator)',
          description:
            'توقف النزيف خلال مدة أقصاها 5 دقائق يؤكد سريرياً أن الالتهاب اللبي التهاب رجوعي سطحي (Reversible Pulpitis) صالح تماماً للتغطية؛ أما إذا استمر النزيف بالتدفق بعد 5 دقائق، فهذا دليل قاطع على التهاب لبي عميق لا عكوس ويجب التحول فوراً لاستئصال اللب (Pulpectomy / RCT).',
        },
        {
          heading: '3. منع الفشل الميكانيكي ومشاكل الالتصاق',
          description:
            'وجود الدم السائل بين اللب ومادة التغطية يمنع التلاصق الفيزيائي المباشر، ويتفكك لاحقاً ليشكل فجوات مجهرية تنمو فيها البكتيريا وتؤدي لفشل التغطية.',
        },
      ],
    },
    scientificRationaleEn: {
      title: 'Triad Scientific Rationale for Hemostatic Protocol:',
      points: [
        {
          heading: '1. Superior Antimicrobial Disinfection & Clot Lysis',
          description:
            'NaOCl (2.5%-5.25%) dissolves necrotic micro-clots, hydrolyzes bacterial proteins, and sterilizes the dentin-pulp junction without damaging underlying mesenchymal progenitor cells.',
        },
        {
          heading: '2. The 5-Minute Biological Diagnostic Threshold',
          description:
            'Cessation of pulpal hemorrhage within 2-5 minutes biologically confirms reversible coronal hyperemia. Persistent extravasation beyond 5 minutes signifies widespread irreversible radicular microvascular breakdown, dictating full pulpectomy.',
        },
        {
          heading: '3. Prevention of Interfacial Micro-Voids',
          description:
            'Interposed blood clots degrade into micro-voids beneath the capping biomaterial, creating a culture substrate for anaerobic proliferation and breaking the bioceramic seal.',
        },
      ],
    },
    warningBox: {
      title: 'معيار الـ 5 دقائق الذهبي (The 5-Minute Rule):',
      text: 'لا تتهاون أبداً: إذا لم يتوقف النزيف بعد 5 دقائق من الضغط اللطيف بـ NaOCl / CHX، فاللب يعاني من احتقان التهابي غير عكوس. إكمال التغطية سينتهي بفشل مؤلم ونخر داخلي حتمي.',
      severity: 'warning',
    },
    warningBoxEn: {
      title: 'The Golden 5-Minute Diagnostic Rule:',
      text: 'Never compromise: Hemorrhage failing to cease within 5 minutes under gentle NaOCl compression indicates irreversible inflammatory congestion. Capping will cause severe pain and acute pulp necrosis.',
      severity: 'warning',
    },
    keyInstruments: [
      { name: 'محلول هيبوكلوريت الصوديوم NaOCl (1.5% - 5%)', nameEn: 'Sodium Hypochlorite Solution (2.5%-5%)', purpose: 'تعقيم وتنظيف وإيقاف النزيف', purposeEn: 'Chemical hemostasis, organic tissue dissolution, and broad disinfection' },
      { name: 'محلول كلورهيكسيدين 2% (CHX)', nameEn: '2% Chlorhexidine Gluconate', purpose: 'تطهير الحفرة وتثبيط إنزيمات MMPs', purposeEn: 'Cavity disinfectant and endogenous collagenase (MMP) inhibitor' },
      { name: 'كريات قطن طبية معقمة دقيقة', nameEn: 'Sterile Micro-Cotton Pellets', purpose: 'ضغط لطيف مباشر على نقطة الانكشاف', purposeEn: 'Passive targeted delivery of hemostatic disinfectant' },
    ],
  },
  {
    slideNumber: 3,
    phaseTitle: 'المرحلة الثانية - تطبيق مادة الـ MTA بحجم دقيق (Micro-placement)',
    phaseTitleEn: 'Bioceramic MTA Precision Micro-Placement',
    badge: 'الخطوة 3 • الختم الحيوي والتحفيز النانوي',
    badgeEn: 'Step 3 • Hydraulic Tricalcium Silicate Seal',
    category: 'mta',
    clinicalStep: {
      title: 'الخطوة السريرية التنفيذية:',
      points: [
        'خلط بودرة MTA المعتمدة (ProRoot MTA / Biodentine) مع السائل المخصص على لوح زجاجي حتى الحصول على قوام الرمل الرطب المتماسك (Wet Sand Consistency).',
        'نقل كمية ميكرو-صغيرة بواسطة أداة نقل خاصة (MTA Gun / Micro-carrier) ووضعها بلطف فائق فوق نقطة الانكشاف حصرياً.',
        'تكثيف المادة بنعومة دون أي ضغط زائد، لتغطي الانكشاف بسماكة موحدة تتراوح بين (1.5 إلى 2 مم).',
        'تجنب فرد المادة على جدران العاج السليم المحيط، وإبقاؤها محصورة في منطقة الانكشاف فقط.',
      ],
    },
    clinicalStepEn: {
      title: 'Chairside Operative Execution:',
      points: [
        'Mix certified hydraulic tricalcium silicate (ProRoot MTA / Biodentine) to a cohesive, moldable "wet sand" putty consistency.',
        'Transfer a precise micro-aliquot using a specialized carrier (MTA Gun / Messing Gun / Micro-carrier) directly over the pinpoint exposure.',
        'Gently condense with a micro-ball burnisher with zero pressure to achieve a uniform 1.5 - 2.0 mm therapeutic layer.',
        'Strictly confine the material to the exposure orifice; leave peripheral cavity dentin walls pristine for adhesive resin bonding.',
      ],
    },
    scientificRationale: {
      title: 'التفسير العلمي وتحذير تداخل الارتباط السريري:',
      points: [
        {
          heading: 'تحفيز التجدد والختم القلوي الفائق (Alkaline Bio-induction)',
          description:
            'مادة الـ MTA تطلق أيونات الكالسيوم وهيدروكسيد الكالسيوم، مما يرفع درجة الحموضة (pH إلى 12.5). هذا الوسط القلوي يثبط البكتيريا ويحفز الخلايا الجذعية اللبية للتمايز إلى خلايا مصورة للعاج، مما ينتج جسراً عاجياً كلسياً صلباً (Dentin Bridge Formation).',
        },
        {
          heading: 'تحذير تداخل الارتباط (Bond Interference Warning)',
          description:
            'مادة الـ MTA هي مادة هيدروليكية ذات أساس مائي أسمنتي، تفتقر تماماً للقدرة على الارتباط براتنج الكومبوزيت (Composite Resin). فرد الـ MTA على جدران العاج السليم يحجب مساحة سطح العاج ويمنع تغلغل البوند وتكون الطبقة الهجينة (Hybrid Layer)، مما يتسبب في فشل الحشوة وتسرب السوائل.',
          isWarning: true,
        },
      ],
    },
    scientificRationaleEn: {
      title: 'Bio-Inductive Mechanism & Adhesion Conflict:',
      points: [
        {
          heading: 'Hydraulic Bioactivity & Hydroxyapatite Precipitation',
          description:
            'MTA constantly dissociates into calcium and hydroxyl ions, establishing an alkaline microenvironment (pH 12.5). This induces dentinogenic signaling (BMP-7, TGF-beta1), activating mesenchymal differentiation into odontoblast-like cells that form a dense dentin bridge.',
        },
        {
          heading: 'Composite Resin Bond Interference (Critical Pitfall)',
          description:
            'MTA is a hydrophilic calcium silicate cement with zero chemical affinity for methacrylate monomers. Smearing MTA onto sound dentin walls obliterates the dentinal tubule substrate, preventing hybrid layer formation and predisposing to massive microleakage.',
          isWarning: true,
        },
      ],
    },
    warningBox: {
      title: 'قاعدة الحصر الدقيق (Confined Micro-placement):',
      text: 'لا تفرش الـ MTA كبطانة عامة على كل الحفرة! الـ MTA فوق نقطة الانكشاف فقط (1.5 - 2 مم)، وأي زيادة على جدران العاج يجب إزالتها بقطنة جافة فوراً قبل تصلبها لحماية قوة ارتباط الكومبوزيت.',
      severity: 'danger',
    },
    warningBoxEn: {
      title: 'Strict Confinement Protocol (Zero Dentin Smear):',
      text: 'Confine MTA solely to the 1.5-2.0 mm exposure perimeter. Any excess on lateral dentin walls must be immediately debrided with a dry micro-sponge to safeguard coronal adhesive hybrid bonding.',
      severity: 'danger',
    },
    keyInstruments: [
      { name: 'بودرة وسائل MTA / Biodentine معتمدة', nameEn: 'ProRoot MTA / Biodentine Bioceramic', purpose: 'تحفيز التكلس وختم الانكشاف الحيوي', purposeEn: 'Bioactive calcium silicate for pulp capping & reparative dentin induction' },
      { name: 'حاقن أو ناقل الـ MTA الميكروي', nameEn: 'MTA Micro-Carrier Gun', purpose: 'نقل كمية دقيقة فوق نقطة الانكشاف', purposeEn: 'Precise delivery of MTA without contaminating cavity walls' },
      { name: 'مكثف لطيف كروي صغير', nameEn: 'Micro Ball Burnisher / Plugger', purpose: 'تسوية سطح المادة دون الضغط على اللب', purposeEn: 'Atraumatic planar adaptation over exposed pulpal tissues' },
    ],
  },
  {
    slideNumber: 4,
    phaseTitle: 'المرحلة الثالثة - طبقة الحماية الفوقية بطريقة الساندوتش (GIC Liner)',
    phaseTitleEn: 'Resin-Modified Glass Ionomer (RMGI) Protective Sandwich',
    badge: 'الخطوة 4 • تقنية الساندوتش العازل',
    badgeEn: 'Step 4 • Structural RMGI Barrier Layer',
    category: 'gic',
    clinicalStep: {
      title: 'الخطوة السريرية التنفيذية:',
      points: [
        'خلط ووضع طبقة من الإسمنت الزجاجي المعدل بالراتنج (RMGI مثل Fuji II LC / Cavity Liner) مباشرة فوق طبقة الـ MTA لتغطيها بالكامل وتغطي هامشاً صغيراً من العاج المجاور.',
        'منع تام لعمل تخريش حمضي (Acid Etch) أو غسيل بالماء أو تجفيف هوائي قوي قبل وضع طبقة الـ GIC.',
        'تصليد طبقة الـ RMGI بالضوء لمدة 20 - 30 ثانية لتشكيل درع ميكانيكي صلب فوق الـ MTA.',
      ],
    },
    clinicalStepEn: {
      title: 'Chairside Operative Execution:',
      points: [
        'Dispense and place a protective liner of Resin-Modified Glass Ionomer (RMGI, e.g., Fuji II LC / Vitrebond) directly over the entire MTA surface, extending slightly onto surrounding dentin.',
        'Absolute prohibition of water rinsing, aggressive air desiccation, or acid etching prior to RMGI placement.',
        'Light cure the RMGI layer for 20 to 30 seconds to erect an immediate, rigid mechanical shield over the unset hydraulic cement.',
      ],
    },
    scientificRationale: {
      title: 'التفسير العلمي لتقنية الساندوتش وحماية الـ MTA:',
      points: [
        {
          heading: '1. حماية المادة الطرية غير المتصلبة (Unset MTA Protection)',
          description:
            'مادة الـ MTA التقليدية تحتاج من 2 إلى 4 ساعات للوصول إلى التصلب الابتدائي، وأياماً للتصلب الكامل. استخدام الماء أو حمض الفوسفوريك فوقها مباشرة يجرف المادة فوراً ويدمر الختم اللبي ويسمح بدخول الحمض إلى داخل اللب.',
        },
        {
          heading: '2. حاجز ميكانيكي ورابط وسيط مثالي (Chemical Bonding & Stress Relief)',
          description:
            'مادة الـ RMGI تتصلب ضوئياً خلال 20 ثانية، وترتبط كيميائياً بالعاج المحيط (Carboxyl groups to Hydroxyapatite)، موفرة سطحاً صلباً يحمي اللب من ضغوط التكثيف، ومستقبلاً مثالياً لربط الكومبوزيت لاحقاً.',
        },
      ],
    },
    scientificRationaleEn: {
      title: 'Mechanics of the Intermediate RMGI Sandwich:',
      points: [
        {
          heading: '1. Prevention of Hydrodynamic Washout of Unset MTA',
          description:
            'Hydraulic calcium silicate requires 2 to 4 hours for primary setting. Direct water spray or phosphoric acid instantly washes out unset MTA, destroying the apical-coronal seal and causing chemical pulpal necrosis.',
        },
        {
          heading: '2. Stress-Relieving Biomimetic Buffer',
          description:
            'RMGI achieves immediate light-cured rigidity in 20 seconds, bonds chemically to calcium hydroxyapatite via carboxylate cross-linking, absorbs composite polymerization contraction stress, and provides an ideal substrate for adhesive resin placement.',
        },
      ],
    },
    warningBox: {
      title: 'حظر مائي وحمضي قطعي (Strict Acid & Water Ban):',
      text: 'حظر تام لرش الماء أو وضع حمض التخريش (Phosphoric Acid) فوق الـ MTA قبل تغطيتها بـ GIC! المياه تجرف الـ MTA والحمض يتسرب مباشرة لأنسجة اللب مسبباً موتاً كيميائياً للخلايا.',
      severity: 'danger',
    },
    warningBoxEn: {
      title: 'Strict Water & Phosphoric Acid Ban:',
      text: 'Never rinse with water or apply 37% phosphoric acid directly over unshielded MTA. Liquid turbulence dilutes the bioceramic seal while acid infuses directly into the open pulpal stroma.',
      severity: 'danger',
    },
    keyInstruments: [
      { name: 'إسمنت زجاجي معدل بالراتنج (RMGI Liner)', nameEn: 'Resin-Modified Glass Ionomer (RMGI)', purpose: 'درع واقٍ متصلب ضوئياً فوق الـ MTA', purposeEn: 'Chemical dentin bond, fluoride reservoir, and protective stress-absorbing liner' },
      { name: 'أداة وضع البطانات الكروية الدقيقة', nameEn: 'Dycal Instrument / Micro-Applicator', purpose: 'تطبيق الـ RMGI بنعومة متناهية', purposeEn: 'Controlled placement of RMGI without dislodging the underlying MTA' },
      { name: 'جهاز البلمرة الضوئية عالي الشدة', nameEn: 'High-Output LED Curing Light', purpose: 'تصليب طبقة الـ RMGI لمدة 20-30 ثانية', purposeEn: 'Immediate polymerization of the protective RMGI shield' },
    ],
  },
  {
    slideNumber: 5,
    phaseTitle: 'المرحلة الرابعة - العزل المتقدم والبناء النهائي (Selective Etch & Composite)',
    phaseTitleEn: 'Selective Enamel Etch & Incremental Composite Build-up',
    badge: 'الخطوة 5 • النقش الانتقائي والبناء النانوي',
    badgeEn: 'Step 5 • Adhesive Protocol & Coronal Seal',
    category: 'composite',
    clinicalStep: {
      title: 'الخطوة السريرية التنفيذية:',
      points: [
        'حماية طبقة الـ GIC بقطعة صغيرة من شريط التفلون المعقم (PTFE Tape) أثناء مرحلة التخريش.',
        'إجراء النقش الانتقائي (Selective Etching) باستخدام حمض الفوسفوريك 37% على حواف المينا فقط لمدة 15 - 30 ثانية دون لمس العاج القريب من اللب.',
        'غسيل سريع بالماء لمدة 15 ثانية وتجفيف لطيف دون تجفيف مفرط (Avoid Desiccation).',
        'تطبيق مادة البوندينغ العالمية (Universal Bonding) مع فرك خفيف على المينا والعاج المكشوف غير المغطى وتصليبها ضوئياً.',
        'بناء حشوة الكومبوزيت طبقة تلو الأخرى (Incremental Layering) بسماكة لا تتجاوز 2 مم لكل طبقة لتفادي إجهادات الانكماش البلمري (Polymerization Shrinkage).',
      ],
    },
    clinicalStepEn: {
      title: 'Chairside Operative Execution:',
      points: [
        'Shield the RMGI liner with medical-grade sterile PTFE (Teflon) tape during acid conditioning.',
        'Perform Selective Enamel Etching with 37% phosphoric acid gel strictly on peripheral enamel margins for 15 - 30 seconds (avoid deep dentin).',
        'Rinse thoroughly for 15 seconds; blot dry leaving dentin slightly moist (preventing collagen network collapse/desiccation).',
        'Apply 10-MDP containing Universal Adhesive with active agitation for 20 seconds, air-thin to evaporate solvent, and light cure.',
        'Restore cavity anatomically using incremental composite layers (<= 2.0 mm) utilizing oblique cusp placement to minimize C-factor stress.',
      ],
    },
    scientificRationale: {
      title: 'التفسير العلمي لعزل التفلون والنقش الانتقائي:',
      points: [
        {
          heading: 'شريط التفلون الطبي المعقم (PTFE Barrier)',
          description:
            'يعمل كحاجز مؤقت خامل ميكانيكياً وكيميائياً، يمنع وصول الحمض أو البوند الفائض إلى قاع الحفرة، مما يحمي الـ GIC والـ MTA من التآكل الحمضي.',
        },
        {
          heading: 'النقش الانتقائي للمينا (Selective Enamel Etch)',
          description:
            'يحمي العاج القريب من اللب من التهيج الحمضي، وفي الوقت نفسه يمنح المينا أقصى قوة ارتباط ميكروبي هيدروليكي لمنع التسرب الحافي المجهري (Microleakage) الذي يعد العدو الأول لنجاح التغطية اللبية.',
        },
        {
          heading: 'الاستفادة من العاج السليم للارتباط الهجين',
          description:
            'بقاء العاج الجانبي نظيفاً من الـ MTA يسمح للبوندينغ بتكوين طبقة هجينة عميقة تضمن إحكام الإغلاق التاجي (Coronal Seal) التام.',
        },
      ],
    },
    scientificRationaleEn: {
      title: 'Biomechanical & Hermetic Rationale:',
      points: [
        {
          heading: 'Sterile PTFE Tape Barrier Protection',
          description:
            'PTFE is chemically inert and non-stick; it shields the immature RMGI from phosphoric acid degradation and isolates the pulp chamber base.',
        },
        {
          heading: 'Selective Enamel Conditioning',
          description:
            'Enamel selective etching maximizes micromechanical resin tag penetration (30+ MPa bond strength), eliminating marginal microleakage while shielding dentin tubules from acid trauma and postoperative sensitivity.',
        },
        {
          heading: 'Hybrid Layer Formation on Uncontaminated Dentin',
          description:
            'Peripheral dentin preserved free of MTA allows functional monomers (10-MDP) to establish stable nanolayering with intact calcium hydroxyapatite.',
        },
      ],
    },
    warningBox: {
      title: 'الإغلاق التاجي هو مفتاح البقاء (Coronal Seal is King):',
      text: 'الـ MTA تحفز التئام اللب، لكن الحشوة المركبة المحكمة هي التي تمنع دخول البكتيريا مستقبلاً. أي تسريب حافي بسبب عيب في بناء الكومبوزيت سيعيد تلويث اللب وإفشال البروتوكول.',
      severity: 'warning',
    },
    warningBoxEn: {
      title: 'Coronal Seal Dictates Long-Term Prognosis:',
      text: 'While MTA stimulates bio-reparation, only an impervious coronal composite seal prevents secondary bacterial ingress. Marginal microleakage will reinfect pulpal tissue and cause late failure.',
      severity: 'warning',
    },
    keyInstruments: [
      { name: 'شريط التفلون الطبي المعقم (PTFE Tape)', nameEn: 'Medical Grade Sterile PTFE Tape', purpose: 'عزل مؤقت للـ GIC أثناء التخريش', purposeEn: 'Inert barrier over RMGI during phosphoric acid application' },
      { name: 'حمض الفوسفوريك 37% (Phosphoric Acid)', nameEn: '37% Phosphoric Acid Etchant', purpose: 'نقش انتقائي دقيق لحواف المينا', purposeEn: 'Enamel micro-porosity generation for optimal micromechanical retention' },
      { name: 'نظام الالتصاق السني ومعجون الكومبوزيت', nameEn: '10-MDP Universal Bond & Composite', purpose: 'الارتباط الهجين والبناء الطبقي المتدرج', purposeEn: 'Hermetic coronal sealing and biomimetic restorative reconstruction' },
    ],
  },
  {
    slideNumber: 6,
    phaseTitle: 'المرحلة الخامسة - بروتوكول المتابعة والتقييم السريري (Follow-up Protocol)',
    phaseTitleEn: 'Clinical & Radiographic Follow-up Timeline',
    badge: 'الخطوة 6 • جدول المتابعة والتقييم',
    badgeEn: 'Step 6 • Follow-up & Success Metrics',
    category: 'followup',
    clinicalStep: {
      title: 'جدول المواعيد الثلاثية للمتابعة الإلزامية:',
      points: [
        'موعد المتابعة الأول (بعد 2 إلى 4 أسابيع): فحص غياب الأعراض السريرية تماماً (عدم وجود ألم مع البارد/الساخن، عدم وجود ألم عند المضغ أو الإطباق).',
        'موعد المتابعة الثاني (بعد 3 أشهر): إجراء اختبار حيوية اللب (Cold Test / Electric Pulp Tester) للتأكد من استجابة اللب الطبيعية السليمة.',
        'موعد المتابعة الثالث (بعد 6 أشهر ثم سنوياً): اختبار حيوية اللب + تصوير أشعة سينية ذروية رقمية (Periapical Radiograph) للبحث عن علامات النجاح المؤكدة.',
      ],
    },
    clinicalStepEn: {
      title: 'Mandatory Clinical Follow-Up Protocol:',
      points: [
        'Recall 1 (2 to 4 Weeks Post-Op): Verify complete absence of clinical symptoms (zero thermal sensitivity, zero masticatory or spontaneous pain).',
        'Recall 2 (3 Months Post-Op): Perform comparative thermal (Cold Test / Endo-Ice) and Electric Pulp Testing (EPT) to verify physiological pulp baseline response.',
        'Recall 3 (6 Months & Annual Review): Reassess vitality and capture parallel periapical radiographs to confirm dentin bridge and intact apical structures.',
      ],
    },
    scientificRationale: {
      title: 'علامات النجاح السريري والشعاعي المؤكدة:',
      points: [
        {
          heading: '1. تشكل الجسر العاجي الكلسي (Dentin Bridge Formation)',
          description:
            'ظهور خط ظليل كثيف في صورة الأشعة السينية تحت طبقة الـ MTA يفصل الحشوة عن الحجرة اللبية، مما يدل على تكوّن عاج ترميمي صلب.',
        },
        {
          heading: '2. سلامة النسج المحيطة بالذروة (Normal Periapical Tissues)',
          description:
            'الحفاظ على المسافة الرباطية الطبيعية (Normal PDL Space) واستمرار الصفيحة القاسية (Lamina Dura) دون أي توسع أو آفات ذروية.',
        },
        {
          heading: '3. استجابة حسية سوية ومستقرة',
          description:
            'استجابة إيجابية لحظية للفحص البارد تزول فور رفع المثير، مما يثبت احتفاظ الألياف العصبية بحيويتها الطبيعية.',
        },
      ],
    },
    scientificRationaleEn: {
      title: 'Definitive Clinical & Radiographic Success Metrics:',
      points: [
        {
          heading: '1. Radiopaque Dentin Bridge Barrier Formation',
          description:
            'Radiographic evidence of a continuous calcified barrier under the MTA plug separating the restorative base from the pulp chamber, indicating active reparative odontoblast differentiation.',
        },
        {
          heading: '2. Pristine Periapical Architecture',
          description:
            'Continuous lamina dura, absence of periodontal ligament widening, and zero apical bone rarefaction or inflammatory resorption.',
        },
        {
          heading: '3. Normal Neurovascular Threshold',
          description:
            'Normal transient response to cold testing without lingering or hypersensitivity, confirming preservation of A-delta and C sensory fibers.',
        },
      ],
    },
    warningBox: {
      title: 'أهمية التوثيق الإشعاعي الدوري:',
      text: 'لا يُحكم بنجاح التغطية اللبية من الجلسة الأولى فقط؛ المتابعة الشعاعية بعد 6 أشهر وسنة هي المعيار العلمي الدولي (Gold Standard) لإثبات سلامة الحجرة اللبية وتشكل الجسر العاجي.',
      severity: 'info',
    },
    warningBoxEn: {
      title: 'Longitudinal Radiographic Documentation Standard:',
      text: 'DPC success cannot be determined at the restorative session alone. High-resolution radiographic verification at 6 and 12 months represents the international gold standard.',
      severity: 'info',
    },
    keyInstruments: [
      { name: 'جهاز الأشعة السينية الذروي الرقمي', nameEn: 'Digital RVG Periapical X-Ray', purpose: 'مراقبة تشكل الجسر العاجي والمسافة الرباطية', purposeEn: 'High-resolution imaging to verify dentin bridge and intact lamina dura' },
      { name: 'بخاخ البرودة التشخيصي (Endo-Ice)', nameEn: '1,1,1,2-Tetrafluoroethane (Endo-Ice -50°C)', purpose: 'فحص الحيوية واستجابة ألياف A-delta', purposeEn: 'Physiological thermal sensory testing of pulpal vitality' },
      { name: 'ملف المتابعة السريرية للمريض', nameEn: 'Longitudinal Patient Logbook', purpose: 'تسجيل قراءات الحيوية وتاريخ الفحوصات', purposeEn: 'Document serial vitality readings, dates, and photographic milestones' },
    ],
  },
  {
    slideNumber: 7,
    phaseTitle: 'علامات فشل البروتوكول واستطبابات سحب العصب (Signs of Failure - Indications for RCT)',
    phaseTitleEn: 'Failure Diagnostics & Immediate RCT Transition',
    badge: 'الخطوة 7 • رصد الفشل والتدخل العلاجي',
    badgeEn: 'Step 7 • Failure Diagnostics & Endodontics',
    category: 'failure',
    clinicalStep: {
      title: 'العلامات السريرية والشعاعية الأربع لفشل التغطية المباشرة:',
      points: [
        'ألم تلقائي نابض مستمر (Spontaneous throbbing pain): ظهور ألم حاد ومفاجئ يستمر طويلاً ويزداد ليلاً عند الاستلقاء.',
        'استجابة مفرطة ومستمرة للمؤثر الحراري (Lingering pain): استمرار الألم لأكثر من 10 إلى 15 ثانية بعد إزالة المثير البارد، دلالة على التهاب اللب غير الردود.',
        'ظهور ظلال سوداء ذروية أو امتصاص داخلي (Periapical Radiolucency / Internal Resorption): تآكل العاج الداخلي أو تشكل آفة ذروية في صورة الأشعة.',
        'حساسية وألم شديد عند القرع أو اللمس (Extreme Tenderness to Percussion): دلالة على انتشار الالتهاب إلى الرباط السني المحيط بالذروة (Symptomatic Apical Periodontitis).',
      ],
    },
    clinicalStepEn: {
      title: 'The Four Cardinal Signs of Direct Pulp Capping Failure:',
      points: [
        'Spontaneous Throbbing Pain: Severe, unprovoked episodic or continuous pain exacerbated by recumbency (nocturnal escalation).',
        'Lingering Thermal Hypersensitivity: Sharp or dull ache persisting > 15-30 seconds following cold stimulus removal (irreversible pulpitis).',
        'Radiographic Pathosis: Development of periapical radiolucency, widened apical PDL, or irregular internal root canal wall resorption.',
        'Tenderness to Axial/Lateral Percussion: Positive percussion response indicating extension of pulpal necrosis into the apical periodontal ligament space.',
      ],
    },
    scientificRationale: {
      title: 'التفسير الإمراضي وخطة التدخل الفورية:',
      points: [
        {
          heading: 'تحول اللب إلى التنخر (Necrosis Pathway)',
          description:
            'وجود أي من هذه العلامات يعني أن الالتهاب اللبي تجاوز قدرة الأنسجة على التعافي وتحول إلى نخر لبي لا رجعة فيه مع انتشار بكتيري في قنوات الجذر.',
        },
        {
          heading: 'خطة التدخل السريري الفورية',
          description:
            'إزالة الحشوة والـ MTA فوراً، البدء بإجراءات المعالجة اللبية الكاملة (Pulpectomy / Root Canal Therapy)، تنظيف وتشكيل القنوات وتطهيرها هيدروليكياً بمحلول NaOCl ثم حشوها بالغوتابيركا.',
        },
      ],
    },
    scientificRationaleEn: {
      title: 'Histopathology & Immediate Corrective Protocol:',
      points: [
        {
          heading: 'Progression to Irreversible Pulpal Necrosis',
          description:
            'Manifestation of cardinal failure indicators confirms that bacterial invasion has overcome vascular immunity, resulting in diffuse liquefaction necrosis throughout the pulp chamber.',
        },
        {
          heading: 'Immediate Endodontic Intervention Protocol',
          description:
            'Promptly de-restore, excavate MTA, perform emergency pulpectomy, establish working lengths, chemo-mechanically shape with NaOCl irrigation, and obturate with warm gutta-percha and sealer.',
        },
      ],
    },
    warningBox: {
      title: 'إلزامية التحول لمعالجة الجذور (Immediate RCT):',
      text: 'عند ظهور أي من هذه العلامات الأربع، فإن إعادة التغطية أو إعطاء المسكنات فقط خطأ طبي. يجب فتح السن والبدء بعلاج العصب فوراً لتجنيب المراجع تشكل خراج سني حاد أو امتصاص عظمي ذروي.',
      severity: 'danger',
    },
    warningBoxEn: {
      title: 'Immediate Pulpectomy Mandated:',
      text: 'Upon presentation of any failure sign, re-capping or prescribing analgesics is malpractice. Immediate endodontic access and pulp extirpation are required to prevent acute apical abscess or bone destruction.',
      severity: 'danger',
    },
    keyInstruments: [
      { name: 'مسبار وقارع الأسنان السريري', nameEn: 'Percussion Probe & Mirror Handle', purpose: 'فحص القرع الرأسي والأفقي', purposeEn: 'Axial and lateral percussion assessment of apical ligament inflammation' },
      { name: 'أفلام ومستشعر الأشعة الرقمي RVG', nameEn: 'Digital RVG Sensor', purpose: 'كشف التخلخل العظمي الذروي والامتصاص', purposeEn: 'Detection of periapical radiolucency and internal resorptive defects' },
      { name: 'أدوات استئصال اللب وسنابل الفتح اللبي', nameEn: 'Endo Access Burs & NiTi Shaping Files', purpose: 'فتح الحجرة اللبية وبدء علاج الجذور', purposeEn: 'Coronal unroofing and chemo-mechanical root canal instrumentation' },
    ],
  },
];
