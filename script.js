/* --- Data & Configuration --- */
const curriculum = {
    "Math": {
        "Grade 10": ["Algebra", "Geometry", "Trigonometry"],
        "Grade 11": ["Calculus I", "Statistics", "Vectors"],
        "Grade 12": ["Calculus II", "Probability", "Complex Numbers"]
    },
    "Physics": {
        "Grade 10": ["Kinematics", "Forces", "Energy"],
        "Grade 11": ["Waves", "Electricity", "Thermodynamics"],
        "Grade 12": ["Quantum Mechanics", "Relativity", "Astrophysics"]
    },
    "Biology": {
        "Grade 9": ["Human Biology and Health"],
        "Grade 10": ["Cells", "Genetics", "Ecology"],
        "Grade 11": ["Anatomy", "Evolution", "Botany"],
        "Grade 12": ["Biochemistry", "Neurology", "Immunology"]
    }
};

// Theme configurations
const themes = ["theme-light", "theme-dark", "theme-minimal", "theme-paper"];
const themeNames = ["Light", "Dark", "Minimal", "Paper"];

/* --- State Management --- */
let state = {
    subject: null,
    grade: null,
    unit: null,
    timeLimit: 10,
    questions: [],
    currentIndex: 0,
    answers: {}, // Stores index: choiceKey (0,1,2,3)
    timer: null,
    secondsRemaining: 0,
    startTime: 0,
    endTime: 0
};

/* --- DOM Elements --- */
const screens = {
    home: document.getElementById('screen-home'),
    setup: document.getElementById('screen-setup'),
    quiz: document.getElementById('screen-quiz'),
    result: document.getElementById('screen-result')
};

const sels = {
    subject: document.getElementById('sel-subject'),
    grade: document.getElementById('sel-grade'),
    unit: document.getElementById('sel-unit')
};

const groups = {
    grade: document.getElementById('group-grade'),
    unit: document.getElementById('group-unit')
};

/* --- Initialization --- */
document.addEventListener('DOMContentLoaded', () => {
    initHome();
    initTheme();
});

/* --- Home / Selection Logic --- */
function initHome() {
    // Populate Subjects
    Object.keys(curriculum).forEach(subj => {
        const opt = document.createElement('option');
        opt.value = subj;
        opt.textContent = subj;
        sels.subject.appendChild(opt);
    });

    // Event Listeners for cascading dropdowns
    sels.subject.addEventListener('change', (e) => handleSubjectChange(e.target.value));
    sels.grade.addEventListener('change', (e) => handleGradeChange(e.target.value));
    sels.unit.addEventListener('change', validateHome);
    
    document.getElementById('btn-setup').addEventListener('click', () => switchScreen('setup'));
}

function handleSubjectChange(subject) {
    state.subject = subject;
    resetSelect(sels.grade, "Select Grade...");
    resetSelect(sels.unit, "Select Unit...");
    groups.unit.classList.add('hidden');
    
    if (subject && curriculum[subject]) {
        groups.grade.classList.remove('hidden');
        Object.keys(curriculum[subject]).forEach(grade => {
            const opt = document.createElement('option');
            opt.value = grade;
            opt.textContent = grade;
            sels.grade.appendChild(opt);
        });
    } else {
        groups.grade.classList.add('hidden');
    }
    validateHome();
}

function handleGradeChange(grade) {
    state.grade = grade;
    resetSelect(sels.unit, "Select Unit...");
    
    if (grade && state.subject) {
        groups.unit.classList.remove('hidden');
        const units = curriculum[state.subject][grade];
        units.forEach(unit => {
            const opt = document.createElement('option');
            opt.value = unit;
            opt.textContent = unit;
            sels.unit.appendChild(opt);
        });
    } else {
        groups.unit.classList.add('hidden');
    }
    validateHome();
}

function resetSelect(element, defaultText) {
    element.innerHTML = `<option value="">${defaultText}</option>`;
    element.value = "";
}

function validateHome() {
    state.unit = sels.unit.value;
    const isValid = state.subject && state.grade && state.unit;
    document.getElementById('btn-setup').disabled = !isValid;
}

/* --- Pre-Quiz Setup --- */
document.getElementById('btn-back-home').addEventListener('click', () => switchScreen('home'));
document.getElementById('btn-start-quiz').addEventListener('click', startQuiz);

function startQuiz() {
    const timeInput = document.getElementById('time-input');
    let minutes = parseInt(timeInput.value);
    if (!minutes || minutes < 1) minutes = 1;
    
    state.timeLimit = minutes;
    state.secondsRemaining = minutes * 60;
    state.questions = generateQuestions(10); // Generate 10 mock questions
    state.currentIndex = 0;
    state.answers = {};
    state.startTime = Date.now();

    updateTimerDisplay();
    renderQuestion();
    switchScreen('quiz');
    document.getElementById('quiz-header').classList.remove('hidden');
    
    // Start Timer
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(() => {
        state.secondsRemaining--;
        updateTimerDisplay();
        if (state.secondsRemaining <= 0) {
            finishQuiz();
        }
    }, 1000);
}

//******************************************************************* 
//    $$\       $$\          $$$$$$$\                      $$\             
//  $$$$$$\   $$$$$$\        $$  __$$\                     $$ |            
// $$  __$$\ $$  __$$\       $$ |  $$ | $$$$$$\  $$$$$$$\  $$ |  $$\       
// $$ /  \__|$$ /  \__|      $$$$$$$\ | \____$$\ $$  __$$\ $$ | $$  |      
// \$$$$$$\  \$$$$$$\        $$  __$$\  $$$$$$$ |$$ |  $$ |$$$$$$  /       
//  \___ $$\  \___ $$\       $$ |  $$ |$$  __$$ |$$ |  $$ |$$  _$$<        
// $$\  \$$ |$$\  \$$ |      $$$$$$$  |\$$$$$$$ |$$ |  $$ |$$ | \$$\       
// \$$$$$$  |\$$$$$$  |      \_______/  \_______|\__|  \__|\__|  \__|      
//  \_$$  _/  \_$$  _/                                                     
//    \ _/      \ _/                                                       
//*******************************************************************                                                                     

const QUESTION_BANK = {
    "Math": {
        "Algebra": [
            {
                text: "What is the square root of 144?",
                options: ["10", "12", "14", "16"],
                correct: 1 // (B) 12
            },
            {
                text: "Solve for x: 2x - 4 = 10",
                options: ["3", "5", "7", "9"],
                correct: 2 // (C) 7
            }
        ],
        "Geometry": [
            {
                text: "How many degrees are in a right angle?",
                options: ["45°", "90°", "180°", "360°"],
                correct: 1
            }
        ]
    },
    "Biology": {
        "Human Biology and Health": [
    {
        text: "A researcher conducted an experiment comparing starch digestion rates at different temperatures. At 37°C, starch was completely digested in 5 minutes; at 50°C in 8 minutes; at 60°C in 15 minutes; and at 20°C in 12 minutes. Which explanation BEST accounts for this pattern?",
        options: [
            "Enzymes denature at high temperatures, so 60°C shows the slowest rate, while 37°C is optimal for human amylase; 20°C is suboptimal but better than 50°C which shows partial denaturation",
            "Higher temperatures always increase enzyme activity linearly, but substrate concentration becomes limiting at 60°C causing slower digestion despite optimal temperature",
            "The enzyme works best at body temperature (37°C); both high (50-60°C) and low (20°C) temperatures reduce activity, but high temperatures cause more damage than low temperatures",
            "Starch molecules aggregate at high temperatures making them harder to digest, while at low temperatures enzyme-substrate collisions are simply reduced without structural damage"
        ],
        correct: 0
    },
    {
        text: "A student tested three food samples (A, B, C) with Benedict's solution after heating. Sample A turned brick red immediately, Sample B remained blue, and Sample C turned green-yellow. When the same samples were tested with iodine solution, only Sample B turned blue-black. What can be conclusively determined about these samples?",
        options: [
            "Sample A contains only glucose, Sample B contains only starch, Sample C contains maltose or fructose",
            "Sample A contains high concentration of reducing sugars, Sample B contains starch but no reducing sugars, Sample C contains low concentration of reducing sugars",
            "Sample A is pure glucose solution, Sample B is pure starch solution, Sample C is a mixture of sucrose and maltose",
            "Sample A contains any monosaccharide, Sample B is complex carbohydrate, Sample C contains disaccharides only"
        ],
        correct: 1
    },
    {
        text: "During protein synthesis, a peptide bond forms between two amino acids through a condensation reaction. If 500 amino acids join to form a single protein molecule, and each amino acid has an average molecular mass of 110 daltons with water molecules having a mass of 18 daltons, what is the approximate molecular mass of the final protein?",
        options: [
            "55,000 daltons, because 500 × 110 = 55,000",
            "46,018 daltons, because (500 × 110) - (499 × 18) = 46,018",
            "64,000 daltons, because (500 × 110) + (499 × 18) = 64,000",
            "53,982 daltons, because (500 × 110) - (500 × 18) = 46,000 but must account for terminal groups"
        ],
        correct: 1
    },
    {
        text: "A nutritionist analyzes a patient's diet and finds they consume 2500 kJ from carbohydrates, 1800 kJ from proteins, and 3200 kJ from fats daily. The patient is a 16-year-old male office worker who exercises 30 minutes daily. According to the textbook's daily energy requirements, what is the MOST accurate assessment?",
        options: [
            "The patient is significantly undernourished and needs to increase intake by at least 3500 kJ daily",
            "The patient's energy intake is approximately adequate but may need slight adjustment based on exercise intensity and growth requirements",
            "The patient is consuming excess energy and is at risk of obesity, particularly given the high fat content",
            "The patient needs to reduce protein intake and increase carbohydrates to meet the recommended 12,000 kJ for teenage males"
        ],
        correct: 1
    },
    {
        text: "In a community health study in a drought-affected Ethiopian region, researchers found children with the following symptoms: distended bellies despite thin limbs, edema, skin depigmentation, and lethargy. Blood tests showed normal caloric intake but very low serum albumin. What is the MOST likely diagnosis and underlying mechanism?",
        options: [
            "Marasmus caused by overall caloric deficiency leading to muscle wasting and energy depletion in all body tissues",
            "Kwashiorkor caused by protein deficiency leading to decreased oncotic pressure, allowing fluid to accumulate in tissues",
            "Vitamin D deficiency (rickets) causing bone malformation and calcium redistribution leading to abdominal swelling",
            "Anaemia caused by iron deficiency reducing oxygen-carrying capacity and causing compensatory fluid retention"
        ],
        correct: 1
    },
    {
        text: "A biochemist studying lipid metabolism discovers that when cells are deprived of oxygen, they preferentially break down carbohydrates over fats for energy. Which explanation BEST accounts for this metabolic preference?",
        options: [
            "Carbohydrates can be metabolized through both aerobic and anaerobic pathways, while fats absolutely require oxygen for beta-oxidation and the citric acid cycle",
            "Lipids have lower energy content per gram than carbohydrates, making them less efficient during oxygen scarcity",
            "The enzymes that break down lipids are denatured in low-oxygen conditions while carbohydrate-digesting enzymes remain functional",
            "Carbohydrates dissolve in water while lipids do not, making carbohydrates more accessible to enzymes during stress conditions"
        ],
        correct: 0
    },
    {
        text: "An experiment tested the emulsification effect of bile on fats. Test tube A contained fat + water + lipase. Test tube B contained fat + water + bile + lipase. Both were maintained at 37°C and pH 8. After 30 minutes, test tube B showed 8 times more fatty acid production than tube A. What is the PRIMARY reason for this difference?",
        options: [
            "Bile contains lipase enzymes that work synergistically with pancreatic lipase, directly doubling the enzyme concentration",
            "Bile emulsifies large fat droplets into smaller ones, increasing surface area for lipase action by approximately 8-fold",
            "Bile changes the pH to be more alkaline (pH 9-10), which is the optimal pH for lipase enzyme activity",
            "Bile neutralizes the fatty acids produced, preventing product inhibition and allowing the reaction to continue faster"
        ],
        correct: 1
    },
    {
        text: "A patient presents with night blindness, dry corneas, and frequent respiratory infections. Blood tests show normal levels of vitamins B1, C, and D, but significantly reduced retinol. However, their diet includes adequate carrots and dark green vegetables. What is the MOST likely explanation?",
        options: [
            "The patient has a genetic disorder preventing retinol synthesis from carotenoids in their body",
            "The patient has fat malabsorption syndrome (e.g., celiac disease) preventing absorption of fat-soluble vitamin A despite adequate dietary intake",
            "The patient's liver is damaged and cannot store vitamin A, though absorption is normal",
            "The patient has increased metabolic breakdown of vitamin A due to chronic stress or illness"
        ],
        correct: 1
    },
    {
        text: "Researchers tested vitamin C content in various fruits using DCPIP. Fresh orange juice required 8 drops to decolorize DCPIP, fresh lemon juice required 6 drops, and fresh tomato juice required 15 drops. If each drop is approximately 0.05 mL, which fruit has the HIGHEST concentration of vitamin C per unit volume?",
        options: [
            "Orange juice, because it took more drops showing more vitamin C molecules",
            "Lemon juice, because fewer drops were needed to achieve decolorization indicating higher concentration",
            "Tomato juice, because it required the most drops showing the highest vitamin C content",
            "All three have equal concentration; the difference is due to experimental error or pH variations"
        ],
        correct: 1
    },
    {
        text: "A 14-year-old Ethiopian girl's diet consists mainly of teff-based injera, shiro wot (ground chickpeas), and occasional vegetables. She rarely consumes meat, dairy, or eggs. She presents with fatigue, pale conjunctiva, and reduced exercise tolerance. Her hemoglobin is 9 g/dL (normal: 12-16 g/dL). Which combination of dietary modifications would be MOST effective?",
        options: [
            "Increase vitamin C-rich foods with meals and add iron-fortified foods; the vitamin C will enhance iron absorption from plant sources",
            "Add more carbohydrates for energy and increase water intake to improve blood volume",
            "Increase dairy consumption for calcium and vitamin D to strengthen bones and improve blood production",
            "Add vitamin B1 supplements and reduce fiber intake to improve nutrient absorption in the gut"
        ],
        correct: 0
    },
    {
        text: "In an experiment, equal masses of butter (saturated fat) and niger seed oil (unsaturated fat) were mixed separately with ethanol, then added to water. Both formed emulsions, but the butter mixture formed larger, more visible droplets while the oil formed a finer, more stable emulsion. This difference is BEST explained by:",
        options: [
            "Saturated fats have no double bonds, making them pack more tightly and aggregate into larger droplets, while unsaturated fats with double bonds remain more dispersed",
            "Butter contains more water naturally, which interferes with emulsion formation causing larger droplets",
            "Unsaturated oils are liquid at room temperature allowing better mixing with water, while butter's solid state prevents proper emulsification",
            "The chemical structure of saturated fats makes them more soluble in water than unsaturated fats, forming bigger droplets"
        ],
        correct: 0
    },
    {
        text: "A student notices that when they add iodine to a starch solution, it immediately turns blue-black. However, after adding saliva to the starch and waiting 5 minutes before adding iodine, the color is only slightly blue. After 15 minutes with saliva, there is no color change. This demonstrates that:",
        options: [
            "Iodine loses its ability to detect starch over time, independent of enzymatic activity",
            "Saliva contains amylase which progressively hydrolyzes starch into smaller sugars that don't react with iodine; complete digestion takes about 15 minutes",
            "The pH of saliva neutralizes the iodine solution making it unable to react with starch after prolonged exposure",
            "Starch concentration decreases over time through evaporation, requiring longer time periods to show visible color change"
        ],
        correct: 1
    },
    {
        text: "Two athletes are preparing for a marathon. Athlete A loads up on pasta and bread (high carbohydrate) the night before. Athlete B loads up on steak and eggs (high protein). During the race (2-3 hours), which athlete will likely perform BETTER and why?",
        options: [
            "Athlete B, because proteins provide more energy per gram (4 kcal/g) and are broken down more slowly providing sustained energy",
            "Athlete A, because carbohydrates are stored as glycogen in muscles and liver, providing readily accessible energy for endurance activities",
            "Both equally, because the body can convert proteins to glucose through gluconeogenesis as efficiently as using stored glycogen",
            "Athlete B, because proteins build and repair muscles during exercise, preventing fatigue and muscle damage"
        ],
        correct: 1
    },
    {
        text: "A researcher studying protein denaturation exposes egg albumin to various conditions: (A) pH 2, (B) pH 7, (C) 80°C for 5 minutes, (D) pH 11. After treatment, each sample is returned to pH 7 and 37°C. Which samples will MOST likely regain their original enzymatic function?",
        options: [
            "Only sample B, because it was never denatured in the first place",
            "Samples A and D, because pH changes cause reversible denaturation while heat causes irreversible denaturation",
            "Samples B and possibly A or D if exposure was brief, because some pH-denatured proteins can refold, but heat-denatured proteins rarely can",
            "All samples can recover equally because denaturation is always reversible if conditions are normalized"
        ],
        correct: 2
    },
    {
        text: "A food scientist analyzes three Ethiopian traditional foods: kocho (enset), genfo (porridge), and kitfo (raw minced meat). Using Benedict's test, iodine test, Biuret test, and emulsion test, which combination of results would be expected for kitfo?",
        options: [
            "Benedict's (+), Iodine (-), Biuret (+++), Emulsion (++)",
            "Benedict's (-), Iodine (-), Biuret (+++), Emulsion (+++)",
            "Benedict's (-), Iodine (+), Biuret (++), Emulsion (++)",
            "Benedict's (++), Iodine (++), Biuret (+), Emulsion (-)"
        ],
        correct: 1
    },
    {
        text: "A patient with celiac disease (autoimmune reaction to gluten causing intestinal damage) is at risk for multiple nutritional deficiencies. Which vitamin deficiency would be MOST concerning in the long term and why?",
        options: [
            "Vitamin C deficiency because it's water-soluble and cannot be stored, leading to scurvy within weeks",
            "Vitamin D deficiency because it's fat-soluble and intestinal damage impairs fat absorption, leading to rickets and osteoporosis",
            "Vitamin B1 deficiency because gluten-containing grains are the primary source, and elimination causes direct deficiency",
            "Vitamin A deficiency because night blindness develops rapidly and can cause permanent corneal damage"
        ],
        correct: 1
    },
    {
        text: "An experiment compared enzyme activity: amylase was added to starch at pH 7, and pepsin was added to egg white at pH 7. Neither showed significant activity. When the amylase-starch mixture pH was maintained at 7 but pepsin-egg white was adjusted to pH 2, pepsin showed high activity. This demonstrates:",
        options: [
            "Pepsin is universally more active than amylase regardless of conditions",
            "Enzymes require specific optimal pH conditions; pepsin works best in acidic conditions (stomach pH ~2) while amylase works in neutral conditions (mouth/small intestine pH ~7)",
            "pH changes denature all enzymes, but some like pepsin can renature when returned to acidic conditions",
            "The egg white substrate required acid to denature before pepsin could act on it, while starch doesn't need preparation"
        ],
        correct: 1
    },
    {
        text: "A person drinks 2 liters of water containing lime juice after heavy exercise in hot conditions. They urinate 500 mL and sweat 1500 mL over the next 3 hours. Their water balance appears normal. However, blood tests show hyponatremia (low sodium). What is the BEST explanation and appropriate intervention?",
        options: [
            "The lime juice caused acidosis, requiring immediate bicarbonate supplementation to restore pH balance",
            "Exercise-induced dehydration concentrated blood sodium initially, and rehydration diluted it; add electrolyte solution not just water",
            "The person lost sodium through sweat and urine but replaced only water, diluting blood sodium concentration; they need oral rehydration solution with electrolytes",
            "Vitamin C in lime juice interferes with sodium absorption in the kidneys; stop citrus intake and increase salt consumption"
        ],
        correct: 2
    },
    {
        text: "A biology class designed an experiment to test the effect of fiber on digestion. They added equal amounts of lipase to two test tubes: one with olive oil alone, and one with olive oil mixed with cellulose powder. Which result would be expected and what does it demonstrate about fiber's role?",
        options: [
            "Tube with cellulose shows faster fat digestion because fiber helps emulsify fats",
            "Tube without cellulose shows faster fat digestion because fiber physically interferes with enzyme access to fat molecules; this demonstrates fiber's role in slowing nutrient absorption",
            "Both tubes show equal digestion rates because fiber is not digested and doesn't interact with fat digestion",
            "Tube with cellulose shows no digestion because fiber inhibits enzyme activity completely"
        ],
        correct: 1
    },
    {
        text: "A person with lactose intolerance (lacking lactase enzyme) drinks milk and experiences bloating, gas, and diarrhea. The undigested lactose passes to the large intestine where bacteria ferment it. Which statement BEST explains the mechanism of symptoms?",
        options: [
            "Undigested lactose draws water into the intestine through osmosis (causing diarrhea) and bacterial fermentation produces gases (causing bloating)",
            "Lactose is toxic to intestinal cells, causing inflammation and fluid secretion leading to diarrhea and gas production",
            "Bacteria consume lactose producing lactic acid that damages intestinal walls, causing all symptoms",
            "The absence of lactase causes the immune system to attack the intestinal lining, producing inflammatory symptoms"
        ],
        correct: 0
    },
    {
        text: "A nutritionist calculates that a pregnant woman in her third trimester needs approximately 10,000 kJ per day. Her pre-pregnancy requirement was 9,000 kJ. The EXTRA 1,000 kJ is primarily needed for:",
        options: [
            "Increased maternal metabolism and activity as her body mass increases",
            "Fetal growth, placental development, increased maternal blood volume, and preparation for lactation",
            "Supporting the development of maternal adipose tissue for postpartum recovery",
            "Compensating for decreased absorption efficiency due to hormonal changes during pregnancy"
        ],
        correct: 1
    },
    {
        text: "A study compared three groups: (A) BMI 18, (B) BMI 25, (C) BMI 36. Group C showed highest rates of diabetes, cardiovascular disease, and joint problems. Which physiological mechanism BEST explains the link between high BMI and diabetes?",
        options: [
            "Excess body fat secretes hormones that promote insulin resistance, reducing cells' ability to take up glucose from blood",
            "High body weight mechanically compresses the pancreas, reducing its ability to produce insulin",
            "Excess fat cells consume glucose preferentially, leaving insufficient glucose for other tissues",
            "High BMI individuals eat more sugar, directly damaging pancreatic beta cells through glucose toxicity"
        ],
        correct: 0
    },
    {
        text: "An Ethiopian family's traditional diet includes large amounts of teff injera, berbere spices, and coffee. They notice their teeth have brown staining but no decay. Water analysis shows fluoride levels of 8 mg/L (safe level: 0.5-1.5 mg/L). What is happening and what should be done?",
        options: [
            "The berbere spices contain compounds that stain teeth; reduce spice consumption and brush more frequently",
            "Coffee tannins are causing cosmetic staining; this is harmless but can be reduced by drinking through a straw",
            "Excess fluoride causes dental fluorosis (brown staining) and potential skeletal fluorosis; they need defluorination of water supply as mentioned in the textbook",
            "The combination of acidic injera and coffee is eroding enamel causing discoloration; they need to consume more calcium"
        ],
        correct: 2
    },
    {
        text: "A researcher tests the reducing action of vitamin C on DCPIP using two samples: fresh orange juice and orange juice boiled for 10 minutes then cooled. The fresh juice decolorized DCPIP in 5 drops, while boiled juice required 20 drops. What does this demonstrate?",
        options: [
            "Boiling concentrates the juice making it more acidic, which interferes with the DCPIP test",
            "Vitamin C is heat-labile (destroyed by heat); boiling significantly reduced the vitamin C content",
            "Boiling oxidizes vitamin C to dehydroascorbic acid, which doesn't reduce DCPIP but still has vitamin activity",
            "The DCPIP reagent is less sensitive to vitamin C in boiled solutions due to pH changes"
        ],
        correct: 1
    },
    {
        text: "A person consumes 150g of glucose, 100g of protein, and 80g of fat in a day. Given that carbohydrates and proteins provide approximately 17 kJ/g, while fats provide approximately 38 kJ/g, what is their total energy intake, and how does it compare to a typical 16-year-old male's needs?",
        options: [
            "7,790 kJ; this is significantly below the 12,000 kJ needed, indicating severe malnutrition risk",
            "5,290 kJ; this is less than half the requirement and would cause rapid weight loss and malnutrition",
            "7,290 kJ; this is moderately below the 12,000 kJ requirement and would cause gradual weight loss over time",
            "9,540 kJ; this is slightly below optimal but within acceptable range with minor adjustment needed"
        ],
        correct: 2
    },

    // ADVANCED DIGESTIVE SYSTEM (20 questions)
    {
        text: "A person swallows a radioactive marker with their food. Tracking shows it takes: 10 seconds to reach the stomach, 3 hours in the stomach, 4 hours in small intestine, 12 hours in large intestine. If 90% of nutrients are absorbed in the small intestine and 9% of water in the large intestine, what would happen if a disease doubled transit time through the small intestine?",
        options: [
            "Increased nutrient absorption because more time allows more complete digestion and absorption",
            "Decreased nutrient absorption and possible bacterial overgrowth because prolonged transit allows bacteria to multiply and consume nutrients before absorption",
            "No change in absorption because the intestinal surface area remains the same regardless of transit time",
            "Better absorption of fats but worse absorption of carbohydrates due to differential enzyme activity over extended time"
        ],
        correct: 1
    },
    {
        text: "During a surgery, doctors observe that a patient's stomach produces normal amounts of pepsinogen (inactive form) but very little pepsin (active form). The patient experiences protein maldigestion. Analysis shows normal HCl production. What is the MOST likely cause?",
        options: [
            "Genetic mutation in the pepsinogen molecule preventing its conversion to pepsin even in acidic conditions",
            "Excessive mucus production coating the stomach lining and preventing pepsinogen-HCl interaction",
            "Autoimmune destruction of chief cells that produce pepsinogen, despite normal HCl from parietal cells",
            "Bacterial infection neutralizing HCl before it can activate pepsinogen to pepsin"
        ],
        correct: 0
    },
    {
        text: "An experiment measured amylase activity at different temperatures (°C): 20(slow), 30(moderate), 37(fast), 45(moderate), 55(slow), 65(none). The same enzyme tested at 37°C for 1 hour, then at 65°C showed no activity, but enzyme tested at 65°C for 1 hour then 37°C also showed no activity. This proves:",
        options: [
            "High temperatures cause reversible denaturation while optimal temperatures allow renaturation",
            "Enzyme denaturation from high heat is permanent and irreversible; once the 3D structure is destroyed, it cannot be restored",
            "Time of exposure matters more than temperature; prolonged exposure at any temperature causes permanent denaturation",
            "The enzyme has memory and cannot function normally after exposure to extreme conditions even if structure remains intact"
        ],
        correct: 1
    },
    {
        text: "A patient has a blocked pancreatic duct preventing pancreatic enzyme release but bile flow is normal. Which foods would they digest LEAST effectively?",
        options: [
            "Only proteins, because pepsin from stomach is insufficient for complete protein digestion",
            "Fats, proteins, and carbohydrates equally because pancreatic enzymes are essential for all three",
            "All three, but especially proteins and carbohydrates; fats may be partially digested because bile aids emulsification and some lipase exists in saliva",
            "Only fats, because bile alone cannot digest fats without lipase from the pancreas"
        ],
        correct: 2
    },
    {
        text: "Peristalsis moves food through the digestive tract via coordinated muscle contractions. If the circular muscles contracted but longitudinal muscles didn't relax properly (a condition called achalasia), what would result?",
        options: [
            "Food would move faster because circular muscle contraction alone is sufficient for peristalsis",
            "Food would not move forward efficiently; both coordinated circular contraction and longitudinal relaxation are needed for the wave-like movement",
            "Food would move backward causing vomiting because improper muscle coordination reverses the normal direction",
            "No effect on food movement because gravity naturally moves food downward regardless of muscle activity"
        ],
        correct: 1
    },
    {
        text: "A medical student examines tissue slides showing: (A) tissue with C-shaped cartilage rings and cilia, (B) tissue with thick muscular walls and acid-producing glands, (C) tissue with finger-like projections and microvilli. What are these tissues and their locations?",
        options: [
            "A=bronchi (respiratory), B=stomach (digestive), C=small intestine (digestive)",
            "A=trachea (respiratory), B=oesophagus (digestive), C=large intestine (digestive)",
            "A=oesophagus (digestive), B=stomach (digestive), C=small intestine (digestive)",
            "A=trachea (respiratory), B=stomach (digestive), C=small intestine (digestive)"
        ],
        correct: 3
    },
    {
        text: "A person has a genetic condition where their enterokinase enzyme (which activates trypsinogen to trypsin in the small intestine) is non-functional. Which cascade effect would occur?",
        options: [
            "Only trypsin would be non-functional; other pancreatic enzymes would work normally",
            "Trypsin and other proteases that trypsin activates (chymotrypsin, carboxypeptidase) would be non-functional, severely impairing protein digestion",
            "All pancreatic enzymes would fail because enterokinase is required to activate the pancreas itself",
            "No effect because pepsin from the stomach can compensate for the absence of trypsin"
        ],
        correct: 1
    },
    {
        text: "Dental plaque bacteria metabolize sucrose using this pathway: Sucrose → Glucose + Fructose → Lactic acid + Other acids. A person who rinses with water immediately after eating versus 30 minutes later will have different cavity risk. Why?",
        options: [
            "Immediate rinsing removes sucrose before bacteria can convert it to acid, preventing enamel demineralization; delayed rinsing allows 30 minutes of acid production",
            "Delayed rinsing allows saliva to neutralize acids naturally; immediate rinsing removes protective saliva before it can act",
            "No difference because bacteria in plaque biofilm are protected from rinsing regardless of timing",
            "Immediate rinsing spreads bacteria to other teeth increasing overall cavity risk; delayed rinsing localizes infection"
        ],
        correct: 0
    },
    {
        text: "A researcher studies three types of teeth: incisors (chisel-shaped), canines (pointed), and molars (flat with ridges). Each has different enamel thickness: incisors (1mm), canines (1.5mm), molars (2.5mm). What is the BEST evolutionary explanation?",
        options: [
            "Molars have thicker enamel because they experience greatest grinding forces; incisors need less because they only cut; enamel thickness correlates with mechanical stress",
            "Molars are older teeth evolutionarily so they developed thicker enamel; incisors evolved later and don't need as much",
            "Enamel thickness varies randomly; there's no functional relationship between tooth shape, function, and enamel thickness",
            "Canines have intermediate thickness because they evolved as a compromise between incisors and molars"
        ],
        correct: 0
    },
    {
        text: "A patient complains of severe heartburn (acid reflux). The lower esophageal sphincter is not closing properly, allowing stomach acid into the esophagus. Why does this cause pain in the esophagus but not in the stomach?",
        options: [
            "The esophagus has more pain nerve endings than the stomach making it more sensitive to irritation",
            "Stomach acid is more concentrated in the esophagus than in the stomach due to lack of dilution",
            "The stomach lining produces thick mucus and bicarbonate to protect against acid; the esophagus lacks these protections and its lining is damaged by acid",
            "The esophagus has a different pH than the stomach so acid causes chemical burns there but not in the stomach"
        ],
        correct: 2
    },
    {
        text: "Villi in the small intestine have: thin walls (one cell thick), rich blood supply, lacteals (lymph vessels), and microvilli on epithelial cells. If a genetic condition eliminated microvilli but kept villi intact, what would be the PRIMARY consequence?",
        options: [
            "No change because villi would compensate by increasing in number to maintain total surface area",
            "Approximately 20-30 fold reduction in absorptive surface area, causing severe malabsorption of nutrients",
            "Inability to absorb fats specifically because lacteals are located in microvilli (incorrect anatomy)",
            "Only water absorption would be affected because microvilli specifically transport water molecules"
        ],
        correct: 1
    },
    {
        text: "A meal of bread, cheese, and butter enters the stomach. After 30 minutes: bread (partially digested), cheese (protein clumping but not digested), butter (unchanged). After 2 hours: bread (fully broken down to sugars), cheese (partially digested), butter (emulsified but not digested). Why this sequence?",
        options: [
            "Carbohydrate digestion began in mouth with amylase; stomach pepsin digests proteins; fat digestion requires bile and lipase in small intestine",
            "The stomach produces enzymes in sequence: amylase first, then pepsin, then lipase based on meal composition",
            "Bread is smallest molecules so digests fastest; cheese is medium; butter is largest so slowest",
            "Stomach acid preferentially breaks chemical bonds in the order: carbohydrates > proteins > fats based on bond strength"
        ],
        correct: 0
    },
    {
        text: "A person eats 500g of food. After digestion, 450g of broken-down nutrients enter the bloodstream, 30g leave as feces, and 20g are used by gut bacteria. If we added radioactive tracers to all three macronutrients, where would we expect LEAST radioactivity in feces?",
        options: [
            "Carbohydrates, because they're absorbed most efficiently (95-98%) in the small intestine",
            "Proteins, because they're completely broken down to amino acids with ~100% absorption efficiency",
            "Fats, because bile and lipase ensure complete digestion and absorption",
            "All equal because the digestive system has uniform ~90% absorption efficiency for all nutrients"
        ],
        correct: 0
    },
    {
        text: "A hospital patient on intravenous feeding (bypassing the digestive system) receives glucose, amino acids, fatty acids, vitamins, and minerals directly into the bloodstream. After several weeks, what would be a likely complication?",
        options: [
            "Vitamin deficiency because IV feeding cannot provide adequate vitamins compared to oral intake",
            "Gut atrophy and bacterial overgrowth because the intestinal lining needs nutrients and mechanical stimulation to maintain health",
            "Immediate organ failure because the body cannot use nutrients that haven't been digested",
            "No complications because IV feeding is superior to normal digestion as it ensures 100% absorption"
        ],
        correct: 1
    },
    {
        text: "Constipation occurs when feces move too slowly through the large intestine. Given that the large intestine's primary function is water reabsorption, what is the MECHANISM causing hard, difficult-to-pass stools?",
        options: [
            "Slow transit allows excessive water reabsorption, making feces increasingly dry and hard as they remain in the colon",
            "Bacteria multiply excessively during slow transit, consuming water and leaving dry feces",
            "Slow transit causes the large intestine to produce extra mucus that solidifies feces",
            "The large intestine secretes binding proteins during slow transit that cement particles together"
        ],
        correct: 0
    },
    {
        text: "A food science experiment tested enzyme efficiency: Pure amylase digested 10g starch in 5 minutes. Saliva (containing amylase plus mucus, ions, etc.) digested the same amount in 7 minutes. Why isn't saliva MORE efficient?",
        options: [
            "Other saliva components dilute the amylase, reducing its concentration and therefore its reaction rate despite having identical enzyme",
            "Mucus in saliva binds to amylase and inhibits its activity, making it less efficient than pure enzyme",
            "Saliva is at the wrong pH for optimal amylase activity, while pure enzyme solution is adjusted to optimal pH",
            "Other saliva components compete with amylase for starch binding sites, slowing digestion"
        ],
        correct: 0
    },
    {
        text: "A person has ulcers (holes) in their stomach lining despite normal acid and enzyme production. Testing reveals H. pylori bacterial infection. How do these bacteria survive in the acidic stomach and cause ulcers?",
        options: [
            "H. pylori produces urease enzyme that converts urea to ammonia, neutralizing acid locally; they also produce toxins that damage the protective mucus layer",
            "H. pylori have acid-resistant cell walls that are impermeable to HCl, allowing them to survive and mechanically scrape the stomach lining",
            "H. pylori consume stomach acid as their energy source, creating localized areas of neutral pH where they multiply",
            "H. pylori hide inside stomach cells, protected from acid, and gradually destroy cells from within"
        ],
        correct: 0
    },
    {
        text: "An experiment comparing digestion in different pH environments showed: Pepsin + protein at pH 2 (high activity), pH 7 (no activity). Amylase + starch at pH 7 (high activity), pH 2 (no activity). Lipase + fat at pH 8 (high activity), pH 2 (low activity). What does this reveal about digestive system design?",
        options: [
            "Each section of the GI tract has evolved optimal pH for its resident enzymes: stomach (pH 2) for pepsin, mouth/small intestine (pH 7-8) for amylase/lipase",
            "All enzymes would work equally well at any pH, but the digestive system maintains different pH to prevent all food from being digested simultaneously",
            "pH is irrelevant to digestion; the observed effects are due to temperature differences in different parts of the digestive system",
            "Enzymes work best at extremes (very acidic or basic) because extreme conditions denature food molecules making them easier to digest"
        ],
        correct: 0
    },
    {
        text: "A biology class designed an experiment to demonstrate peristalsis using a balloon inside a tube with circular and longitudinal muscles (simulated with hands). Which sequence of actions would BEST demonstrate the peristaltic wave?",
        options: [
            "Squeeze circular muscles proximally while relaxing distally; simultaneously shorten longitudinal muscles distally creating a wave that propels the balloon forward",
            "Squeeze both circular and longitudinal muscles simultaneously along the entire length",
            "Squeeze only circular muscles in a wave pattern from top to bottom without any longitudinal muscle involvement",
            "Alternate between squeezing circular and longitudinal muscles randomly, as coordination doesn't matter for movement"
        ],
        correct: 0
    },
    {
        text: "A person eats a large fatty meal then has their gallbladder removed hours later (emergency surgery). In the immediate post-operative period (days to weeks), they experience diarrhea and fat malabsorption. After several months, symptoms improve. What adaptation occurred?",
        options: [
            "The liver increases bile production to compensate exactly for the missing gallbladder storage capacity",
            "The liver now releases bile continuously instead of in response to meals; the bile duct slowly dilates to store some bile; and the intestines adapt to more frequent, dilute bile exposure",
            "Other organs (pancreas, small intestine) begin producing bile to replace the gallbladder's function",
            "The body learns to digest fats without bile by using alternative enzyme pathways discovered after gallbladder loss"
        ],
        correct: 1
    },

    // ADVANCED RESPIRATORY SYSTEM (25 questions)
    {
        text: "A mountain climber at 5000m altitude (where atmospheric pressure is ~50% of sea level) experiences rapid breathing and dizziness. Their lungs are structurally normal. What is the PRIMARY physiological problem?",
        options: [
            "Reduced atmospheric pressure means reduced partial pressure of oxygen, leading to less O2 diffusion into blood despite normal lung function",
            "Cold temperature at altitude constricts airways reducing the volume of air that can enter the lungs",
            "Low humidity damages alveolar surfaces reducing their ability to exchange gases efficiently",
            "Reduced gravity at altitude affects blood flow to the lungs preventing normal oxygenation"
        ],
        correct: 0
    },
    {
        text: "Alveoli have: thin walls (one cell), rich capillary network, moist surface, and combined surface area of ~70 m². A disease that causes alveolar fluid buildup (pulmonary edema) impairs gas exchange. What is the MAIN mechanism?",
        options: [
            "Fluid increases the diffusion distance that O2 and CO2 must travel, dramatically slowing gas exchange despite normal surface area",
            "Fluid blocks capillaries preventing blood from reaching alveoli for gas exchange",
            "Fluid contains enzymes that destroy the alveolar cells reducing total surface area",
            "Fluid changes the pH of alveoli, denaturing surfactant and causing alveolar collapse"
        ],
        correct: 0
    },
    {
        text: "During inspiration, the diaphragm contracts and flattens, increasing thoracic volume. Simultaneously, external intercostal muscles contract, lifting the ribcage. A patient has a paralyzed diaphragm but functional intercostals. What would happen?",
        options: [
            "No breathing possible because the diaphragm accounts for 100% of breathing effort",
            "Reduced breathing efficiency; intercostals can perform ~25% of normal breathing effort, sufficient for rest but not exercise",
            "Normal breathing because intercostals alone can fully compensate for diaphragm loss",
            "Forced expiration only; the patient can breathe out but not in without a diaphragm"
        ],
        correct: 1
    },
    {
        text: "An experiment measured air composition: Inhaled air (21% O2, 0.04% CO2), Exhaled air (16% O2, 4% CO2). A student calculates ~5% O2 was absorbed and ~4% CO2 was added. However, cellular respiration uses glucose + O2 → CO2 + H2O in a 1:1 ratio. Why isn't the O2 decrease equal to CO2 increase?",
        options: [
            "Some CO2 dissolves in blood plasma and isn't exhaled; some O2 is used for non-respiratory purposes",
            "The respiratory quotient (RQ = CO2 produced/O2 consumed) varies with metabolism; at rest it's typically 0.8, not 1.0, because fats are metabolized alongside glucose",
            "Water vapor in exhaled air dilutes the CO2 concentration making it appear lower than actual production",
            "CO2 is denser than O2 so equal molecular amounts occupy different volumes, creating apparent discrepancy"
        ],
        correct: 1
    },
    {
        text: "Cigarette smoke contains: nicotine (addictive stimulant), tar (carcinogenic particles), carbon monoxide (binds hemoglobin), and irritants. A 20-year smoker develops emphysema (alveolar wall destruction). What is the MOST likely mechanism?",
        options: [
            "Carbon monoxide directly destroys alveolar walls through oxidative damage over decades",
            "Chronic inflammation from smoke irritants causes immune cells to release enzymes that digest alveolar walls; simultaneously, antioxidant defenses are overwhelmed",
            "Nicotine constricts blood vessels cutting off blood supply to alveoli causing tissue death",
            "Tar particles physically tear alveolar walls as they deposit in lung tissue over time"
        ],
        correct: 1
    },
    {
        text: "The trachea has C-shaped (incomplete) cartilage rings with the open part facing the esophagus. During development, a baby has complete O-shaped rings. What problem would this cause?",
        options: [
            "No problem; complete rings would actually be better for protecting the airway",
            "Difficulty swallowing because food bolus in esophagus cannot press against and pass by the rigid trachea",
            "Inability to breathe deeply because complete rings prevent tracheal expansion during inspiration",
            "Increased choking risk because food can get trapped between the trachea and esophagus"
        ],
        correct: 1
    },
    {
        text: "Cilia in the trachea beat ~1000 times per minute, moving mucus toward the throat at ~1 cm/minute. Cigarette smoke paralyzes cilia. If a smoker inhales bacteria-laden air, what is the MOST immediate consequence?",
        options: [
            "Immediate lung infection because without cilia, bacteria multiply unopposed",
            "Bacteria and particles remain in airways rather than being cleared; mucus accumulates leading to chronic cough ('smoker's cough') and increased infection risk",
            "No consequence because alveolar macrophages provide sufficient protection even without cilia",
            "Compensatory increase in mucus production floods the airways causing immediate breathing difficulty"
        ],
        correct: 1
    },
    {
        text: "A premature baby (born at 28 weeks) has difficulty breathing despite normal lung structure. The lungs collapse after each breath requiring great effort to reinflate. What is missing?",
        options: [
            "Adequate muscle strength in the diaphragm and intercostals to generate sufficient pressure",
            "Surfactant (a phospholipid that reduces surface tension in alveoli); without it, alveoli collapse after each exhalation",
            "Mature nervous system control of breathing rhythm; the respiratory center is underdeveloped",
            "Sufficient hemoglobin to carry oxygen; anemia causes compensatory rapid breathing"
        ],
        correct: 1
    },
    {
        text: "Carbon dioxide dissolves in blood forming carbonic acid: CO2 + H2O ⇌ H2CO3 ⇌ H+ + HCO3-. Hyperventilation (breathing very rapidly) removes excess CO2. A person hyperventilates due to anxiety. What happens to their blood pH?",
        options: [
            "Blood becomes more acidic (lower pH) because rapid breathing increases CO2 removal and reduces H+ concentration (actually alkalosis occurs, but the reasoning is backwards in this option)",
            "Blood becomes more alkaline (higher pH) because removing CO2 shifts equilibrium left, reducing H+ concentration (respiratory alkalosis)",
            "No change because the kidneys immediately compensate to maintain pH at 7.4",
            "Blood becomes more acidic because anxiety stress hormones release H+ into bloodstream"
        ],
        correct: 1
    },
    {
        text: "A diver holds their breath and descends to 10m depth (2 atmospheres pressure). Their lung volume is compressed to half its surface volume. When they ascend, if they continue holding their breath, what danger exists?",
        options: [
            "Nitrogen narcosis causing confusion and poor decision-making",
            "Air in lungs expands as pressure decreases; if it expands beyond normal lung capacity, alveoli can rupture causing pneumothorax (collapsed lung)",
            "Decompression sickness ('the bends') from nitrogen bubbles forming in blood",
            "Oxygen toxicity from breathing compressed air at depth"
        ],
        correct: 1
    },
    {
        text: "An athlete training at high altitude (3000m) for 6 weeks shows increased red blood cell count, increased hemoglobin, and improved sea-level performance after returning. What triggered these adaptations?",
        options: [
            "Low oxygen at altitude causes kidneys to release erythropoietin (EPO) which stimulates bone marrow to produce more RBCs, increasing oxygen-carrying capacity",
            "Lung damage from thin air causes compensatory blood cell production to protect remaining tissue",
            "Increased breathing effort at altitude causes mechanical stimulation of bone marrow adjacent to ribs",
            "High altitude UV radiation mutates blood cell genes causing increased production"
        ],
        correct: 0
    },
    {
        text: "The epiglottis closes over the trachea during swallowing, directing food to the esophagus. A person has a delayed epiglottic reflex (closes 0.5 seconds late). What would be the MOST serious consequence?",
        options: [
            "Food routinely enters trachea causing chronic aspiration pneumonia (lung infection from food particles and bacteria)",
            "Inability to swallow solids, though liquids pass normally",
            "Voice changes due to food particles coating the vocal cords",
            "Mild discomfort but no serious health consequence as coughing would clear any misdirected food"
        ],
        correct: 0
    },
    {
        text: "Oxygen moves from alveoli to capillaries down its concentration gradient (partial pressure in alveoli ~100 mmHg, in blood arriving at lungs ~40 mmHg). A person inhales carbon monoxide (CO) which binds hemoglobin 200× more strongly than O2. What happens?",
        options: [
            "No problem because oxygen partial pressure gradient remains unchanged",
            "Severe tissue hypoxia (oxygen starvation) despite normal blood O2 levels, because hemoglobin saturated with CO cannot carry O2 to tissues",
            "Hyperventilation compensates by increasing O2 delivery enough to overcome the CO interference",
            "CO causes immediate breathing cessation by paralyzing the respiratory center in the brainstem"
        ],
        correct: 1
    },
    {
        text: "During exercise, breathing rate increases from 14 to 40 breaths/minute, and tidal volume (amount per breath) increases from 500mL to 2000mL. Minute ventilation = rate × volume. What is the fold-increase in ventilation?",
        options: [
            "~2.9× increase (40/14 = 2.86)",
            "~4× increase (2000/500 = 4)",
            "~11.4× increase (40×2000)/(14×500) = 11.4",
            "~6× increase due to non-linear interaction effects"
        ],
        correct: 2
    },
    {
        text: "The respiratory center in the medulla oblongata monitors blood CO2, pH, and O2 levels. During normal breathing, which stimulus is the PRIMARY driver of breathing rate?",
        options: [
            "Blood oxygen level; falling O2 is the main stimulus for increased breathing",
            "Blood CO2 level and pH; rising CO2 (which lowers pH) is the main stimulus detected by chemoreceptors",
            "Conscious control from the cerebral cortex determines breathing rate continuously",
            "Oxygen and CO2 are equally important and monitored identically"
        ],
        correct: 1
    },
    {
        text: "A person has chronic obstructive pulmonary disease (COPD) with airway narrowing. Their forced expiratory volume (FEV) in 1 second is reduced from normal 80% to 40% of vital capacity. What does this measurement tell us?",
        options: [
            "Only total lung capacity is reduced; air moves normally through remaining lung tissue",
            "Airways are narrowed/obstructed, making it difficult to expel air rapidly; this indicates airflow limitation, a hallmark of COPD",
            "The person has reduced respiratory muscle strength but normal airway function",
            "Alveolar surface area is reduced by 50% causing proportional FEV reduction"
        ],
        correct: 1
    },
    {
        text: "Artificial respiration (rescue breathing) delivers air with ~16% O2 (vs. 21% in atmosphere) because it's exhaled air from the rescuer. Is this sufficient to sustain life? Why?",
        options: [
            "No, 16% O2 is insufficient; artificial respiration only buys time until professional oxygen (21%) arrives",
            "Yes, 16% O2 is adequate because: (1) Normal arterial blood is ~98% saturated at 21% O2, so 16% still achieves ~90+% saturation; (2) the main benefit is removing CO2",
            "Yes, but only because chest compressions are done simultaneously, increasing total blood O2 content",
            "No, which is why artificial respiration must be supplemented with external oxygen immediately"
        ],
        correct: 1
    },
    {
        text: "A study compared lung capacity in three groups: (A) non-smokers, (B) smokers who quit 5 years ago, (C) current smokers. Lung function order: A > B > C. What does group B's intermediate function suggest?",
        options: [
            "Smoking damage is completely irreversible; group B shows improvement only due to measurement error",
            "Smoking damage is partially reversible; group B shows significant recovery (cilia regrowth, inflammation reduction) but some permanent damage (e.g., emphysema) remains",
            "Group B's improvement is purely due to age-related differences, not smoking cessation",
            "All groups will eventually converge to identical function given enough time after quitting"
        ],
        correct: 1
    },
    {
        text: "Nasal passages warm, humidify, and filter incoming air. Mucus traps particles, and the rich blood supply warms air to body temperature. A person breathing through their mouth during heavy exercise bypasses nasal conditioning. What is the MOST likely consequence?",
        options: [
            "Immediate lung damage from cold, dry, particle-laden air",
            "Increased risk of respiratory infections because unfiltered air carries more pathogens; possible bronchial irritation from cold, dry air",
            "No consequence because the trachea and bronchi provide equivalent conditioning",
            "Improved athletic performance due to lower airway resistance allowing greater air flow"
        ],
        correct: 1
    },
    {
        text: "Traditional Ethiopian cooking fires (using wood, dung) produce significant smoke particulates (PM2.5). Women cooking 3-4 hours daily show lung function equivalent to smoking 20 cigarettes/day. What is the MECHANISM of harm?",
        options: [
            "Smoke particles deposit in alveoli causing chronic inflammation, fibrosis (scarring), increased infection risk, and potential cancer from particulate matter containing carcinogens",
            "Carbon monoxide from incomplete combustion is the sole harmful agent, reducing oxygen delivery",
            "Heat from cooking fires directly damages lung tissue causing burns and scarring",
            "Nutritional deficiencies from traditional diets cause lung tissue to be more susceptible to normal smoke levels"
        ],
        correct: 0
    },
    {
        text: "Pneumonia causes alveolar fluid accumulation. A patient's O2 saturation drops to 85% (normal: >95%). They're given supplemental O2, raising saturation to 92%. Why doesn't it reach 100%?",
        options: [
            "Supplemental O2 cannot diffuse through fluid; the remaining deficit is permanent until infection clears",
            "Some alveoli remain fluid-filled despite treatment; the fluid barrier prevents O2 diffusion in those alveoli regardless of inspired O2 concentration",
            "The patient's hemoglobin is damaged by infection and cannot bind additional oxygen",
            "92% is actually normal for this patient's age; 100% is an unrealistic target"
        ],
        correct: 1
    },
    {
        text: "Tuberculosis (TB) bacteria form granulomas (nodules) in lung tissue. If untreated, these can cavitate (form hollow spaces). A TB patient coughs up blood-tinged sputum. What's happening pathologically?",
        options: [
            "TB bacteria directly produce toxins that dissolve blood vessels causing bleeding",
            "Cavitation erodes into pulmonary blood vessels; the hollow spaces fill with blood which is coughed up (hemoptysis)",
            "Immune system attacks healthy lung tissue mistaking it for TB, causing bleeding",
            "Chronic coughing physically ruptures capillaries through mechanical force"
        ],
        correct: 1
    },
    {
        text: "A child inhales a peanut which lodges in the right main bronchus (right lung). The right lung's ventilation drops to ~20% of normal. Blood oxygen drops slightly but not critically. What compensation is occurring?",
        options: [
            "The left lung is sufficient for ~80% of oxygen needs; mild hypoxia is tolerated temporarily",
            "Hypoxic pulmonary vasoconstriction redirects blood flow away from poorly ventilated right lung to well-ventilated left lung, maintaining adequate overall oxygenation",
            "Increased respiratory rate compensates fully so there's no actual oxygen deficit",
            "The child uses supplementary breathing muscles (neck, abdomen) to force air past the obstruction"
        ],
        correct: 1
    },
    {
        text: "Asthma causes bronchiolar constriction and inflammation. Inhaled bronchodilators relax smooth muscle opening airways. A patient uses their inhaler but still has difficulty. Their peak flow (maximum exhalation speed) improves from 40% to 60% of normal. What's happening?",
        options: [
            "The bronchodilator worked perfectly; 60% is maximum possible improvement",
            "Bronchodilator addressed smooth muscle constriction, but mucus plugs and inflammation still obstruct airways; complete resolution requires anti-inflammatory treatment (steroids)",
            "The patient is using the inhaler incorrectly; proper technique would restore 100% function",
            "Bronchodilators work slowly; peak flow will reach 100% in 24-48 hours"
        ],
        correct: 1
    },
    {
        text: "A person with anxiety hyperventilates (breathing rapidly and deeply). They feel dizzy, have numbness in fingers, and muscle spasms. Blood gas shows pH 7.55 (normal 7.35-7.45), low CO2. This is respiratory alkalosis. What's the mechanism causing symptoms?",
        options: [
            "High pH denatures blood proteins causing immediate organ damage",
            "Alkalosis shifts the oxygen-hemoglobin dissociation curve left, making hemoglobin hold oxygen more tightly and release less to tissues; also, low CO2 causes cerebral vasoconstriction reducing brain blood flow",
            "Hyperventilation depletes oxygen causing hypoxia and symptoms",
            "Rapid breathing causes physical exhaustion and muscle fatigue, not pH changes"
        ],
        correct: 1
    },

    // ADVANCED CELLULAR RESPIRATION & ENERGY (15 questions)
    {
        text: "Cellular respiration: Glucose (C6H12O6) + 6O2 → 6CO2 + 6H2O + ~38 ATP. Anaerobic respiration: Glucose → 2 Lactate + 2 ATP. A sprinter runs 100m in 10 seconds (primarily anaerobic). Why don't athletes always use aerobic respiration for maximum ATP?",
        options: [
            "Anaerobic respiration is faster at producing ATP; the rate of ATP production matters more than the total amount for short, intense efforts",
            "Aerobic respiration is actually slower than stated; both produce ATP at equal rates",
            "Athletes choose anaerobic intentionally to train their lactate tolerance",
            "The sprinter's lungs cannot deliver oxygen fast enough, forcing anaerobic metabolism regardless of preference"
        ],
        correct: 0
    },
    {
        text: "Mitochondria have a folded inner membrane (cristae) that provides large surface area. Cells with high energy demands (muscle, liver, neurons) have many mitochondria. A genetic disease causes defective mitochondria in skeletal muscle. What symptoms would occur?",
        options: [
            "Immediate paralysis because muscles cannot contract without ATP",
            "Muscle weakness and fatigue during exercise because defective mitochondria produce insufficient ATP; rest allows recovery as aerobic capacity is limited but anaerobic pathways still function",
            "No symptoms because glycolysis (anaerobic) in cytoplasm can fully compensate for mitochondrial defects",
            "Cognitive symptoms only because brain cells are most sensitive to energy deficiency"
        ],
        correct: 1
    },
    {
        text: "ATP ⇌ ADP + Pi + Energy. This is a reversible reaction. A cell uses 10 million ATP per second. The cell contains only ~5 million ATP molecules at any time. How is this possible?",
        options: [
            "The calculation is wrong; cells must contain more ATP than they use per second",
            "ATP is recycled extremely rapidly; each ATP molecule is used and regenerated ~1000 times per day through cellular respiration",
            "Cells can run an 'energy deficit' and borrow ATP from neighboring cells",
            "Other energy molecules (GTP, CTP) substitute for ATP during high-demand periods"
        ],
        correct: 1
    },
    {
        text: "Cyanide is a deadly poison that inhibits cytochrome c oxidase (final enzyme in electron transport chain). This blocks the last step of aerobic respiration. Death occurs within minutes. Why is this so rapidly fatal?",
        options: [
            "Cyanide directly damages DNA in all cells causing immediate cell death",
            "Without the final step of aerobic respiration, ATP production ceases; critical organs (brain, heart) dependent on constant ATP supply fail within minutes",
            "Cyanide causes uncontrolled ATP production leading to cellular energy overload and explosion",
            "Cyanide blocks only 25% of ATP production; death results from cumulative effects over hours"
        ],
        correct: 1
    },
    {
        text: "During strenuous exercise, muscles produce lactate (lactic acid) through anaerobic respiration. After exercise, breathing remains elevated while 'oxygen debt' is repaid. What happens to the lactate?",
        options: [
            "Lactate is broken down directly to CO2 and H2O through a specific lactate destruction pathway",
            "Lactate is transported to the liver where it's converted back to glucose (gluconeogenesis) or enters aerobic respiration; this process requires oxygen, explaining continued elevated breathing",
            "Lactate accumulates in muscles causing permanent damage if exercise is repeated",
            "Lactate is excreted unchanged through sweat and urine"
        ],
        correct: 1
    },
    {
        text: "Yeast can perform both aerobic respiration (with O2: glucose → CO2 + H2O + ATP) and anaerobic fermentation (without O2: glucose → ethanol + CO2 + ATP). Bakers use yeast in bread. Which process occurs in bread dough, and what evidence supports this?",
        options: [
            "Aerobic respiration; bread rises due to H2O production expanding the dough",
            "Anaerobic fermentation; bread rises due to CO2 production (bubbles in dough); ethanol evaporates during baking",
            "Both equally; aerobic in areas exposed to air, anaerobic in the center",
            "Neither; bread rising is purely due to gluten protein expansion from kneading"
        ],
        correct: 1
    },
    {
        text: "A person holds their breath for 2 minutes. Blood O2 drops from 100 mmHg to 60 mmHg, CO2 rises from 40 mmHg to 50 mmHg. The urge to breathe becomes overwhelming. What drives this urge?",
        options: [
            "Low oxygen detected by peripheral chemoreceptors is the primary stimulus",
            "Rising CO2 (and falling pH it causes) is the primary stimulus detected by central chemoreceptors in the medulla",
            "Psychological panic from conscious awareness of not breathing",
            "Equal contribution from low O2 and high CO2 sensed equally"
        ],
        correct: 1
    },
    {
        text: "A person with carbon monoxide poisoning has blood O2 levels at 100 mmHg (normal) but tissues are starving for oxygen. How is this possible?",
        options: [
            "CO damages mitochondria preventing O2 utilization despite adequate delivery",
            "Blood O2 partial pressure is normal, but hemoglobin is saturated with CO instead of O2, so actual O2 content (and delivery to tissues) is very low; arterial blood tests measure dissolved O2 (pressure) not hemoglobin-bound O2 (content)",
            "CO causes vasoconstriction preventing blood flow to tissues despite adequate blood oxygenation",
            "This scenario is impossible; CO poisoning always reduces blood O2 levels"
        ],
        correct: 1
    },
    {
        text: "RQ (Respiratory Quotient) = CO2 produced / O2 consumed. Pure carbohydrate metabolism: RQ = 1.0. Pure fat metabolism: RQ = 0.7. A person at rest has RQ = 0.82. What does this indicate?",
        options: [
            "They're metabolizing 82% carbohydrates and 18% fats",
            "They're metabolizing a mixed fuel supply of primarily carbohydrates with some fats, indicating normal mixed diet metabolism",
            "They have a metabolic disorder causing inefficient respiration",
            "RQ of 0.82 is abnormal; normal resting RQ should be exactly 1.0"
        ],
        correct: 1
    },
    {
        text: "During the first 10 seconds of intense exercise, muscles use stored ATP and creatine phosphate. 10-90 seconds: primarily anaerobic glycolysis. Beyond 90 seconds: increasingly aerobic respiration. A 400m runner (45 seconds) would rely MOST on which system?",
        options: [
            "Pure aerobic respiration because 45 seconds is long enough for oxygen delivery",
            "Primarily anaerobic glycolysis with some creatine phosphate at the start; aerobic contribution is minimal due to short duration",
            "Equal mix of all three systems throughout the entire 45 seconds",
            "Creatine phosphate alone because it's the fastest ATP source"
        ],
        correct: 1
    },
    {
        text: "Mitochondrial DNA is inherited only from the mother (sperm mitochondria are destroyed after fertilization). A mother has a mitochondrial mutation causing 30% reduced ATP production. What would her children inherit?",
        options: [
            "Sons inherit the mutation, daughters don't due to X-chromosome linkage",
            "All children (sons and daughters) inherit the mutation because mitochondrial DNA is maternally inherited",
            "50% chance for each child to inherit, following Mendelian genetics",
            "No children inherit it because mutations in energy metabolism are lethal to embryos"
        ],
        correct: 1
    },
    {
        text: "A diabetic patient's cells cannot take up glucose effectively due to insulin deficiency. Their blood glucose is high (12 mmol/L vs. normal 5 mmol/L) but cells are starving. They begin breaking down fats and proteins for energy. What is the metabolic consequence?",
        options: [
            "Hyperglycemia causes immediate organ damage; other metabolic changes are secondary",
            "Fat metabolism produces ketones (acidic compounds) causing ketoacidosis; protein breakdown produces toxic ammonia; both can be life-threatening",
            "No problem; fats and proteins are equivalent energy sources to glucose",
            "The body prefers fat metabolism anyway; this is actually healthier than glucose metabolism"
        ],
        correct: 1
    },
    {
        text: "A biochemist studies ATP/ADP ratios in different conditions: Normal cell (100:1), During intense exercise (10:1), After cyanide poisoning (1:10). What do these ratios indicate about cellular energy status?",
        options: [
            "Ratios are meaningless; total ATP quantity matters, not the ratio",
            "High ATP:ADP ratio (100:1) indicates good energy status; low ratio (1:10) indicates energy crisis where consumption vastly exceeds production",
            "All ratios are within normal range; the cell self-adjusts to maintain any ratio",
            "The ratio should always be 1:1 for optimal function; deviations indicate malfunction"
        ],
        correct: 1
    },
    {
        text: "Brown adipose tissue (brown fat) in infants contains many mitochondria that produce heat instead of ATP (thermogenesis). A premature baby has difficulty maintaining body temperature. Giving the baby glucose but they still can't warm up. Why?",
        options: [
            "Premature babies lack sufficient brown fat and mitochondrial thermogenic capacity; glucose provides energy but insufficient heat production",
            "The baby's digestive system cannot absorb glucose properly due to prematurity",
            "Glucose is the wrong fuel; babies need fats for thermogenesis",
            "The baby's brain doesn't signal brown fat to produce heat due to underdeveloped nervous system"
        ],
        correct: 0
    },
    {
        text: "A marathon runner 'hits the wall' at 20 miles (32 km). Their glycogen stores are depleted. They continue running but much slower. What fuels them through the last 6 miles?",
        options: [
            "Anaerobic glycolysis from any remaining glucose",
            "Fat metabolism (beta-oxidation) which is slower at producing ATP but has large fuel reserves; some protein may also be broken down",
            "Adrenaline provides direct energy to muscles",
            "They cannot continue; glycogen depletion means complete inability to produce ATP"
        ],
        correct: 1
    },

    // ADVANCED CIRCULATORY SYSTEM (15 questions)
    {
        text: "The heart pumps ~5 L/min at rest. During exercise, cardiac output increases to ~25 L/min through increased heart rate (70→180 bpm) and stroke volume (70→140 mL/beat). A patient has a damaged heart valve reducing stroke volume to 50 mL/beat but heart rate can increase normally. What is their maximum likely cardiac output during exercise?",
        options: [
            "25 L/min, same as normal because heart rate compensates completely",
            "~9 L/min (180 bpm × 50 mL = 9000 mL/min = 9 L/min); insufficient for intense exercise",
            "12.5 L/min, exactly half normal because stroke volume is halved",
            "Unable to exercise at all because inadequate stroke volume prevents any cardiac output increase"
        ],
        correct: 1
    },
    {
        text: "Arteries have thick muscular walls and small lumens (high pressure ~120/80 mmHg). Veins have thin walls and large lumens (low pressure ~5-10 mmHg). If you swap a section of artery with vein tissue, what would happen?",
        options: [
            "No change because blood vessels adapt to any location",
            "The thin-walled vein tissue would bulge or rupture under arterial pressure (aneurysm); the thick-walled artery tissue would obstruct venous blood flow",
            "Blood would flow backward through the swapped section",
            "The vessel would immediately develop correct wall thickness through remodeling"
        ],
        correct: 1
    },
    {
        text: "Red blood cells (RBCs) live ~120 days. Daily, ~1% must be replaced. RBCs are made in bone marrow requiring: iron, folate, vitamin B12, and erythropoietin (EPO) hormone. A person has adequate EPO, folate, and B12, but low iron. What happens?",
        options: [
            "Normal RBC production because 3 out of 4 required factors are adequate",
            "Microcytic anemia: RBCs are produced but are smaller and contain less hemoglobin, reducing oxygen-carrying capacity",
            "Complete cessation of RBC production leading to rapid-onset lethal anemia",
            "RBC production is normal but RBCs die faster due to iron deficiency, balancing out"
        ],
        correct: 1
    },
    {
        text: "Blood pressure is 120/80 mmHg (systolic/diastolic). A patient develops atherosclerosis (artery narrowing from plaques). Their pressure rises to 160/100 mmHg. Why does narrowing INCREASE pressure?",
        options: [
            "Narrowed vessels cause blood to move faster, increasing kinetic energy and therefore pressure",
            "The heart pumps harder to force blood through narrowed vessels, increasing pressure; additionally, reduced vessel elasticity from plaques prevents normal pressure dampening",
            "More blood cells accumulate in narrowed areas increasing local pressure throughout the system",
            "Atherosclerosis stimulates the kidneys to retain more fluid, increasing blood volume and pressure"
        ],
        correct: 1
    },
    {
        text: "Capillaries have walls one cell thick. At the arterial end, pressure forces fluid out (filtration). At the venous end, osmotic pressure draws fluid back (reabsorption). A person with liver disease has low blood protein (albumin). What happens?",
        options: [
            "No change because pressure is more important than osmotic forces",
            "Reduced osmotic pressure means less fluid returns to capillaries; excess tissue fluid accumulates causing edema (swelling)",
            "Fluid moves faster due to reduced viscosity improving circulation",
            "Capillaries compensate by increasing their permeability maintaining normal fluid balance"
        ],
        correct: 1
    },
    {
        text: "The double circulation means blood goes: heart → lungs → heart → body → heart. Compare to fish (single circulation): heart → gills → body → heart. Why is double circulation advantageous for active, warm-blooded mammals?",
        options: [
            "Double circulation allows blood to be pumped twice, once at low pressure to lungs and once at high pressure to body; single circulation loses pressure after gills, delivering poorly oxygenated blood to tissues",
            "Fish don't need high pressure because they're cold-blooded",
            "Double circulation prevents mixing of oxygenated and deoxygenated blood which occurs in single circulation",
            "Single circulation is actually more efficient; mammals just evolved differently by chance"
        ],
        correct: 0
    },
    {
        text: "Blood typing: Type A has A antigens (anti-B antibodies), Type B has B antigens (anti-A antibodies), Type AB has both antigens (no antibodies), Type O has no antigens (anti-A and anti-B antibodies). A person with Type B blood needs a transfusion. They're given Type A blood by mistake. What happens?",
        options: [
            "No problem because all blood is compatible after initial exposure",
            "Recipient's anti-A antibodies attack donor Type A red blood cells causing agglutination (clumping), hemolysis (rupture), and potentially fatal transfusion reaction",
            "Donor Type A blood will gradually convert to Type B in the recipient's body",
            "Minor discomfort but no serious consequences as the body adapts to new blood type"
        ],
        correct: 1
    },
    {
        text: "Hemoglobin (Hb) binds oxygen: Hb + 4O2 ⇌ HbO2. In lungs (high O2, pH 7.4): equilibrium shifts right (loads O2). In tissues (low O2, low pH from CO2): equilibrium shifts left (releases O2). This is the Bohr effect. A person with chronic lung disease has blood pH 7.2. What happens?",
        options: [
            "Acidosis shifts equilibrium left everywhere, causing hemoglobin to release O2 more readily even in lungs, reducing overall O2 loading and worsening hypoxia",
            "Lower pH increases oxygen binding making it harder for tissues to extract oxygen",
            "pH changes don't affect hemoglobin; only O2 concentration matters",
            "The kidneys immediately compensate restoring normal pH within minutes"
        ],
        correct: 0
    },
    {
        text: "Fetal hemoglobin has higher oxygen affinity than adult hemoglobin. At the placenta, maternal blood (95% saturated) and fetal blood meet. This allows oxygen transfer from mother to fetus even though both are at similar O2 partial pressures. If a fetus had adult hemoglobin, what would happen?",
        options: [
            "No oxygen transfer would occur because partial pressures are equal; the fetus would be unable to extract oxygen from maternal blood",
            "Oxygen would transfer equally well because diffusion depends only on partial pressure differences",
            "The fetus would get more oxygen because adult hemoglobin holds more oxygen overall",
            "Maternal blood would transfer too much oxygen causing fetal oxygen toxicity"
        ],
        correct: 0
    },
    {
        text: "Arteriosclerosis (hardening of arteries) reduces vessel elasticity. Normally, arteries stretch during systole (heart contraction) and recoil during diastole, maintaining continuous blood flow. With stiff arteries, what changes in blood pressure pattern?",
        options: [
            "Both systolic and diastolic pressure decrease equally",
            "Systolic pressure increases (less vessel stretch to absorb pressure), diastolic pressure decreases (less elastic recoil to maintain pressure between beats), widening pulse pressure",
            "No change because the heart compensates perfectly",
            "Both systolic and diastolic increase equally maintaining the same pulse pressure"
        ],
        correct: 1
    },
    {
        text: "White blood cells (WBCs) defend against infection. Normal count: 4,000-11,000/µL. A patient has 50,000/µL (leukocytosis). Possible causes include: infection, leukemia (cancer), stress response. How would you differentiate?",
        options: [
            "Impossible to differentiate; high WBC count alone is diagnostic",
            "Examine blood smear: infection shows mature WBCs responding normally; leukemia shows abnormal immature WBCs (blasts); stress shows temporary elevation returning to normal",
            "WBC count doesn't matter; symptoms determine the diagnosis",
            "All causes have identical WBC patterns; additional tests (like bone marrow biopsy) are always required"
        ],
        correct: 1
    },
    {
        text: "Veins have valves that prevent backflow. Skeletal muscle contraction squeezes veins, pushing blood toward the heart (skeletal muscle pump). A person stands motionless for hours. Blood pools in leg veins. When they try to walk, they feel dizzy. Why?",
        options: [
            "Leg muscles are fatigued from standing, unable to pump blood effectively",
            "Pooled blood in legs means reduced venous return to heart, reducing cardiac output and blood pressure to brain, causing dizziness; movement helps muscle pump restore normal circulation",
            "Standing damages leg vein valves causing permanent blood pooling",
            "Nerve compression from standing causes the dizziness, not blood pooling"
        ],
        correct: 1
    },
    {
        text: "During hemorrhage (severe bleeding), the body compensates: (1) increased heart rate, (2) vasoconstriction (narrowing vessels), (3) fluid shift from tissues to blood, (4) increased breathing. A person loses 30% of blood volume (~1.5L). Despite these compensations, why might they still go into shock?",
        options: [
            "Compensations are completely effective; shock only occurs if more than 50% blood volume is lost",
            "Compensations maintain blood pressure temporarily but: (1) reduced blood volume means less oxygen delivery despite faster heart rate; (2) extreme vasoconstriction damages tissues; (3) compensations eventually fail if bleeding continues",
            "The body doesn't actually have these compensatory mechanisms; they're theoretical",
            "Shock occurs instantly with any blood loss regardless of compensation"
        ],
        correct: 1
    },
    {
        text: "Platelets initiate blood clotting: Injury → platelets adhere → release clotting factors → fibrin mesh forms → clot seals wound. A person with low platelet count (thrombocytopenia: 20,000/µL vs normal 150,000-400,000/µL) bruises easily and has prolonged bleeding. Why?",
        options: [
            "Low platelet count means insufficient platelet plug formation and reduced clotting factor release, preventing effective hemostasis",
            "Platelets carry oxygen; low count causes tissue hypoxia and fragility",
            "Other blood cells compensate completely; bruising is unrelated to platelet count",
            "Platelets have no function; bruising indicates a separate condition"
        ],
        correct: 0
    },
    {
        text: "A person exercises in hot weather. They sweat heavily (losing water and salts). Blood volume decreases slightly, blood viscosity increases. The heart must work harder to pump thicker blood. They drink only pure water (no electrolytes). What complication might develop?",
        options: [
            "Hypernatremia (high sodium) because sweat loss concentrates blood sodium",
            "Hyponatremia (low sodium) because water intake dilutes remaining blood sodium; can cause confusion, seizures, or death if severe",
            "No complication because water alone is sufficient for rehydration",
            "Dehydration worsens because pure water cannot be absorbed without electrolytes"
        ],
        correct: 1
    }

        ]
    }
};



//-----------------------------------------------------------------------------------
//                                o     o                               o__ __o      
//                              _<|>_  <|>                             <|     v\     
//                                     / \                             / \     <\    
//      __o__  \o__ __o__ __o     o    \o/    o__  __o       \o    o/  \o/       \o  
//     />  \    |     |     |>   <|>    |    /v      |>       v\  /v    |         |> 
//     \o      / \   / \   / \   / \   / \  />      //         <\/>    / \       //  
//      v\     \o/   \o/   \o/   \o/   \o/  \o    o/           o/\o    \o/      /    
//       <\     |     |     |     |     |    v\  /v __o       /v  v\    |      o     
//  _\o__</    / \   / \   / \   / \   / \    <\/> __/>      />    <\  / \  __/>     
// 
//-----------------------------------------------------------------------------------
                                                                                  
                                                                                  




function generateQuestions() {
    const subject = state.subject;
    const unit = state.unit;

    // Check if the subject and unit exist in our bank
    if (QUESTION_BANK[subject] && QUESTION_BANK[subject][unit]) {
        // Return the real questions we wrote
        return QUESTION_BANK[subject][unit];
    } else {
        // Fallback: If you haven't written questions for a unit yet, 
        // it shows this message so the app doesn't crash.
        return [{
            text: `No questions have been added to the bank for ${subject}: ${unit} yet.`,
            options: ["I'll add them soon!", "Back to Home", "Try Math", "Okay"],
            correct: 0
        }];
    }
}


function renderQuestion() {
    const q = state.questions[state.currentIndex];
    const total = state.questions.length;
    
    // 1. Update Meta & Progress
    document.getElementById('question-counter').textContent = `Question ${state.currentIndex + 1} of ${total}`;
    const pct = ((state.currentIndex) / total) * 100;
    document.getElementById('progress-bar-fill').style.width = `${pct}%`;

    // 2. Update Question Text
    document.getElementById('question-text').textContent = q.text;
    
    // 3. Render Options
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    // Check if this question has already been answered
    const userAnswer = state.answers[state.currentIndex];
    const hasAnswered = userAnswer !== undefined;

    // Add specific class if answered to disable hovers via CSS
    if (hasAnswered) {
        container.classList.add('answered');
    } else {
        container.classList.remove('answered');
    }

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        
        // Inner HTML for the button
        btn.innerHTML = `<span class="option-label">${String.fromCharCode(65 + idx)}</span> ${opt}`;

        // --- FEEDBACK LOGIC ---
        if (hasAnswered) {
            // If this specific option is the CORRECT one, mark it green
            if (idx === q.correct) {
                btn.classList.add('correct');
            }
            
            // If this option was SELECTED by user...
            if (idx === userAnswer) {
                // ...and it is WRONG, mark it red
                if (userAnswer !== q.correct) {
                    btn.classList.add('wrong');
                }
            }
            
            // Disable click since we already answered
            btn.disabled = true; 
        } else {
            // Not answered yet: Add click listener
            btn.onclick = () => selectOption(idx);
        }

        container.appendChild(btn);
    });

    // 4. Update Nav Buttons
    // Disable "Previous" if on first question
    document.getElementById('btn-prev').disabled = state.currentIndex === 0;
    
    // Change "Next" to "Finish" on last question
    document.getElementById('btn-next').textContent = (state.currentIndex === total - 1) ? "Finish" : "Next";
}

function selectOption(idx) {
    state.answers[state.currentIndex] = idx;
    renderQuestion(); // Re-render to show selection state
}

document.getElementById('btn-prev').addEventListener('click', () => {
    if (state.currentIndex > 0) {
        state.currentIndex--;
        renderQuestion();
    }
});

document.getElementById('btn-next').addEventListener('click', () => {
    if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex++;
        renderQuestion();
    } else {
        finishQuiz();
    }
});

function updateTimerDisplay() {
    const m = Math.floor(state.secondsRemaining / 60);
    const s = state.secondsRemaining % 60;
    document.getElementById('timer-display').textContent = 
        `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/* --- Results --- */
function finishQuiz() {
    clearInterval(state.timer);
    state.endTime = Date.now();
    
    // Calculate Score
    let score = 0;
    state.questions.forEach((q, idx) => {
        if (state.answers[idx] === q.correct) score++;
    });

    // Populate Results
    document.getElementById('score-val').textContent = score;
    document.querySelector('.score-total').textContent = `/ ${state.questions.length}`;
    
    // Time Stats
    const timeUsedSeconds = Math.floor((state.endTime - state.startTime) / 1000);
    const m = Math.floor(timeUsedSeconds / 60);
    const s = timeUsedSeconds % 60;
    document.getElementById('stat-time').textContent = `${m}m ${s}s`;
    document.getElementById('stat-goal').textContent = `${state.timeLimit}m 00s`;

    // Feedback
    const percent = score / state.questions.length;
    const msg = document.getElementById('feedback-msg');
    if (percent === 1) msg.textContent = "Perfect Score! Outstanding.";
    else if (percent > 0.7) msg.textContent = "Great job! Keep it up.";
    else if (percent > 0.5) msg.textContent = "Good effort. Review your errors.";
    else msg.textContent = "Keep practicing. You'll get there.";

    document.getElementById('quiz-header').classList.add('hidden');
    switchScreen('result');
}

document.getElementById('btn-restart').addEventListener('click', () => {
    switchScreen('home');
    // Reset selection logic handled by handleSubjectChange if needed, or keep previous
});

/* --- Utilities --- */
function switchScreen(screenName) {
    Object.values(screens).forEach(el => el.classList.add('hidden'));
    Object.values(screens).forEach(el => el.classList.remove('active'));
    screens[screenName].classList.remove('hidden');
    // Small timeout for fade animation
    setTimeout(() => screens[screenName].classList.add('active'), 10);
}

/* --- Theme Handling --- */
const toggleBtn = document.getElementById('theme-toggle');
const themeNameEl = document.getElementById('theme-name');

function initTheme() {
    const saved = localStorage.getItem('quizTheme') || 'theme-light';
    applyTheme(saved);
    
    toggleBtn.addEventListener('click', () => {
        const current = document.body.className;
        let idx = themes.indexOf(current);
        if (idx === -1) idx = 0;
        
        const nextIdx = (idx + 1) % themes.length;
        const nextTheme = themes[nextIdx];
        
        applyTheme(nextTheme);
    });
}

function applyTheme(themeClass) {
    document.body.className = themeClass;
    const idx = themes.indexOf(themeClass);
    themeNameEl.textContent = themeNames[idx];
    localStorage.setItem('quizTheme', themeClass);
}
