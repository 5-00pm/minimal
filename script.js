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
        "Cells": [
            {
                text: "Which organelle is known as the powerhouse of the cell?",
                options: ["Nucleus", "Ribosome", "Mitochondria", "Vacuole"],
                correct: 2
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