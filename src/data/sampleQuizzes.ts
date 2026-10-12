import { Quiz } from '../types/quiz';

export const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: 'sample-astronomy-1',
    title: 'Cosmic Frontiers: Astrophysics & Space Exploration',
    description: 'Test your understanding of stellar lifecycles, exoplanets, relativistic physics, and the modern space race.',
    topic: 'Astrophysics & Space',
    difficulty: 'intermediate',
    estimatedMinutes: 8,
    tags: ['Astronomy', 'Physics', 'Space Missions', 'Cosmology'],
    createdAt: new Date().toISOString(),
    sourceType: 'sample',
    questions: [
      {
        id: 'q1',
        question: 'What physical boundary defines the threshold around a black hole beyond which light cannot escape?',
        type: 'multiple-choice',
        options: [
          'The Chandrasekhar Limit',
          'The Event Horizon',
          'The Roche Radius',
          'The Oort Cloud'
        ],
        correctAnswer: 'The Event Horizon',
        explanation: 'The event horizon is the theoretical boundary around a black hole where the escape velocity strictly equals the speed of light. Inside this boundary, nothing, not even photons, can escape.',
        hint: 'Think about the boundary that separates observable events from unseen phenomena.',
        difficulty: 'medium',
        keyConcept: 'Black Hole Physics'
      },
      {
        id: 'q2',
        question: 'True or False: The James Webb Space Telescope (JWST) orbits Earth at low altitude similar to the Hubble Space Telescope.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'JWST orbits the Sun at the second Sun-Earth Lagrange point (L2), approximately 1.5 million kilometers (1 million miles) away from Earth, unlike Hubble which orbits in Low Earth Orbit (~540 km).',
        hint: 'Consider the need for extreme thermal shielding from Earth and Sun radiation.',
        difficulty: 'easy',
        keyConcept: 'Lagrange Points & JWST'
      },
      {
        id: 'q3',
        question: 'Which thermonuclear process powers main-sequence stars with masses comparable to our Sun?',
        type: 'multiple-choice',
        options: [
          'Proton-Proton (p-p) Chain Fusion',
          'CNO (Carbon-Nitrogen-Oxygen) Cycle',
          'Triple-Alpha Process',
          'Silicon Burning Fusion'
        ],
        correctAnswer: 'Proton-Proton (p-p) Chain Fusion',
        explanation: 'The proton-proton chain reaction dominates in stars with masses up to roughly 1.3 solar masses (like our Sun). The CNO cycle becomes dominant only in significantly hotter and more massive stars.',
        hint: 'It begins with two fundamental hydrogen nuclei joining together.',
        difficulty: 'hard',
        keyConcept: 'Stellar Nucleosynthesis'
      },
      {
        id: 'q4',
        question: 'What caused the cosmic microwave background (CMB) radiation observed across the sky today?',
        type: 'multiple-choice',
        options: [
          'Thermal radiation released during the Recombination era ~380,000 years after the Big Bang',
          'Continuous radioactive decay of heavy isotopes in interstellar dust clouds',
          'Synchrotron emission from spinning neutron stars in distant galaxies',
          'Gravitational redshift of light passing through dark energy voids'
        ],
        correctAnswer: 'Thermal radiation released during the Recombination era ~380,000 years after the Big Bang',
        explanation: 'During the Recombination era (~380,000 years post Big Bang), electrons and protons coalesced into neutral hydrogen, decoupling photons and allowing light to travel freely across the universe.',
        hint: 'Look for the fundamental phase transition where the early universe cooled enough for neutral atoms to form.',
        difficulty: 'hard',
        keyConcept: 'Cosmic Microwave Background'
      },
      {
        id: 'q5',
        question: 'Which of Saturn’s moons is renowned for subterranean oceans and active cryovolcanic plumes ejecting water vapor and organic molecules into space?',
        type: 'multiple-choice',
        options: [
          'Titan',
          'Enceladus',
          'Mimas',
          'Iapetus'
        ],
        correctAnswer: 'Enceladus',
        explanation: 'Enceladus harbors a global liquid ocean underneath an icy shell, venting geysers through "tiger stripe" fractures at its south pole, detected by NASA\'s Cassini spacecraft.',
        hint: 'It is a small, brilliant white moon whose geysers supply Saturn’s E ring.',
        difficulty: 'medium',
        keyConcept: 'Ocean Worlds in the Solar System'
      }
    ]
  },
  {
    id: 'sample-webdev-2',
    title: 'Modern Frontend Architecture: React 19 & TypeScript',
    description: 'Master core principles of React 19 hooks, concurrent rendering, virtual DOM reconciler, and state patterns.',
    topic: 'Software Engineering',
    difficulty: 'advanced',
    estimatedMinutes: 7,
    tags: ['React 19', 'TypeScript', 'Frontend', 'Performance'],
    createdAt: new Date().toISOString(),
    sourceType: 'sample',
    questions: [
      {
        id: 'rq1',
        question: 'What is the primary architectural purpose of the `useTransition` hook introduced in modern React?',
        type: 'multiple-choice',
        options: [
          'To defer non-urgent state updates and keep the user interface responsive during heavy renders',
          'To handle CSS transition keyframe animations and spring physics in the canvas',
          'To intercept HTTP route transitions during server-side static page generation',
          'To synchronously flush microtask queues before repainting the browser window'
        ],
        correctAnswer: 'To defer non-urgent state updates and keep the user interface responsive during heavy renders',
        explanation: 'useTransition marks state updates as non-blocking transitions. If an urgent event (like keystroke or click) occurs, React can interrupt or yield the transition render to keep input response instantaneous.',
        hint: 'Distinguish between urgent user interactions vs secondary UI updates.',
        difficulty: 'medium',
        keyConcept: 'React Concurrent Rendering'
      },
      {
        id: 'rq2',
        question: 'In React 19, which hook is natively provided for reading the value of Promises or contexts directly within render functions without suspense boilerplate?',
        type: 'multiple-choice',
        options: [
          'use()',
          'usePromise()',
          'useAsyncResource()',
          'useResolve()'
        ],
        correctAnswer: 'use()',
        explanation: 'React 19 introduces the `use` API, which allows developers to read the resolved value of resources (like Promises or React Context) conditionally and directly inside components or hooks.',
        hint: 'It is the most concise 3-letter hook name introduced in React 19.',
        difficulty: 'hard',
        keyConcept: 'React 19 use API'
      },
      {
        id: 'rq3',
        question: 'True or False: In TypeScript, the `unknown` type is completely identical to `any` and bypasses all type-checking constraints.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: '`unknown` is the type-safe counterpart of `any`. Anything is assignable to `unknown`, but `unknown` is not assignable to anything else without explicit type narrowing or type assertions.',
        hint: 'Think about whether TypeScript lets you call arbitrary methods on an unknown variable without checking its type first.',
        difficulty: 'easy',
        keyConcept: 'TypeScript Type Safety'
      },
      {
        id: 'rq4',
        question: 'Why should keys passed to items rendered in a dynamic list never be set to the array index when items can be reordered or filtered?',
        type: 'multiple-choice',
        options: [
          'Because index keys can cause component state mismatches and visual bugs during reordering',
          'Because JavaScript arrays will throw a runtime OutOfBounds exception in strict mode',
          'Because indices trigger extra WebGL shader recompilations in Chromium engines',
          'Because React automatically converts numeric indices into DOM element IDs'
        ],
        correctAnswer: 'Because index keys can cause component state mismatches and visual bugs during reordering',
        explanation: 'React uses keys to identify which items have changed, been added, or removed. If you use indices and the array changes order, React reuses DOM nodes based on position, leading to uncontrolled input bugs and state leakage.',
        hint: 'Consider what happens to item-specific local state when an item is deleted from the top of a list.',
        difficulty: 'medium',
        keyConcept: 'Reconciliation & Keys'
      }
    ]
  },
  {
    id: 'sample-geography-3',
    title: 'World Curiosities: Geography & Global Landmarks',
    description: 'A fascinating journey through unusual geographical borders, biomes, archipelagos, and world history.',
    topic: 'World Geography',
    difficulty: 'beginner',
    estimatedMinutes: 6,
    tags: ['Geography', 'Trivia', 'World Cultures', 'Travel'],
    createdAt: new Date().toISOString(),
    sourceType: 'sample',
    questions: [
      {
        id: 'gq1',
        question: 'Which is the only country in the world that spans across all four hemispheres (North, South, East, and West)?',
        type: 'multiple-choice',
        options: [
          'Kiribati',
          'Indonesia',
          'Brazil',
          'United Kingdom'
        ],
        correctAnswer: 'Kiribati',
        explanation: 'Kiribati is an island nation in the central Pacific Ocean comprising 33 atolls that cross both the Equator and the 180th Meridian (Antimeridian), placing its territory in all four hemispheres.',
        hint: 'It is an island nation made of multiple atoll groups in the Pacific Ocean.',
        difficulty: 'medium',
        keyConcept: 'Hemispheric Geography'
      },
      {
        id: 'gq2',
        question: 'What is the largest landlocked country by geographic area in the entire world?',
        type: 'multiple-choice',
        options: [
          'Kazakhstan',
          'Mongolia',
          'Chad',
          'Bolivia'
        ],
        correctAnswer: 'Kazakhstan',
        explanation: 'Kazakhstan covers approximately 2.72 million square kilometers, making it the ninth-largest nation globally and the largest landlocked country on Earth.',
        hint: 'Located in Central Asia, it borders Russia, China, and Uzbekistan.',
        difficulty: 'easy',
        keyConcept: 'Landlocked Nations'
      },
      {
        id: 'gq3',
        question: 'True or False: The Amazon River is the longest river in the world according to the Guinness World Records, exceeding the Nile.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'While the Amazon has by far the largest water discharge volume in the world, the Nile River is traditionally recognized by Guinness World Records and international geographical authorities as the longest (~6,650 km vs ~6,400 km).',
        hint: 'Think about the distinction between highest water volume versus total linear length.',
        difficulty: 'easy',
        keyConcept: 'River Hydrology'
      },
      {
        id: 'gq4',
        question: 'Which body of water is so dense with dissolved salts and minerals that swimmers naturally float without sinking?',
        type: 'multiple-choice',
        options: [
          'The Dead Sea',
          'The Caspian Sea',
          'Lake Baikal',
          'The Baltic Sea'
        ],
        correctAnswer: 'The Dead Sea',
        explanation: 'The Dead Sea has a salinity of approximately 34%, roughly 9.6 times saltier than the ocean. The resulting high density causes the human body to float effortlessly.',
        hint: 'Located between Jordan and Israel, it sits at the lowest land elevation on Earth.',
        difficulty: 'easy',
        keyConcept: 'Salinity & Water Density'
      }
    ]
  }
];
