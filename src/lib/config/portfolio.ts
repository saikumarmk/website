import type { Experience, Project } from '$lib/types/portfolio'
import { assets } from '$lib/config/assets'

/** In Dex order: roughly by how much of me went into each. */
export const projects: Project[] = [
    {
        id: 'monash-handbook-plus',
        name: "monash-handbook-plus",
        tags: ['Data Vis', 'Web', 'Education'],
        feature: '',
        majorProject: true,
        badges: ['React', 'TypeScript', 'D3.js'],
        description: 'Unit search, cost calculator, areas of study browser, an interactive prerequisite graph, a degree planner with auto-scheduling, a pathway finder and shareable study plans.',
        img: '/assets/monash-handbook-plus-logo.png',
        link: 'https://github.com/saikumarmk/monash-handbook-plus',
        buttons: [{ label: 'Website', href: 'https://saikumarmk.github.io/monash-handbook-plus/' }],
        category: 'Planner',
        partner: { name: 'xatu', reason: 'sees the past and future at once, like a degree planner' },
        post: 'circles-clone-requirements'
    },
    {
        id: 'saikumarmk-website',
        name: "saikumarmk.com",
        tags: ['Web', 'Portfolio'],
        feature: '',
        majorProject: true,
        badges: ['SvelteKit', 'TypeScript', 'Tailwind', 'THREE.js'],
        description: 'This site: writing, the Yggdrasil skill tree, the project dex and a few 3D visualisations.',
        img: '/assets/sai_red.webp',
        link: 'https://github.com/saikumarmk/saikumarmk.github.io',
        buttons: [{ label: 'Website', href: 'https://saikumarmk.com' }],
        category: 'Home',
        partner: { name: 'smeargle', reason: 'paints its own territory' },
        post: 'cool-stuff'
    },
    {
        id: 'mini-melbourne-3d',
        name: "mini-melbourne-3d",
        tags: ['Data Vis', 'Web'],
        feature: '',
        majorProject: false,
        badges: ['Mapbox GL JS'],
        description: 'A new Mini Melbourne: buses, trams and V/Line in 3D.',
        img: '/assets/projects/minimelbnew.webp',
        link: 'https://github.com/saikumarmk/mini-melbourne-3d',
        buttons: [{ label: 'Website', href: 'https://transit.saikumarmk.com/' }],
        category: 'Transit',
        partner: { name: 'porygon', reason: 'made entirely of polygons, like the city' }
    },
    {
        id: 'pokered-tournament',
        name: 'pokered-trainer-tournament',
        tags: ['Simulation'],
        feature: '',
        description: 'A recreation of the Pokémon Red Elo tournament on the pkmn engine.',
        majorProject: false,
        badges: ['Python', 'ASM'],
        img: '/assets/red.png',
        link: 'https://github.com/saikumarmk/pokered-trainer-tournament',
        category: 'Tournament',
        partner: { name: 'pikachu', reason: "Red's partner, naturally" },
        post: 'pokered-elo-1'
    },
    {
        id: 'skirtor',
        name: "skirtor",
        tags: ['Data Vis', 'Astrophysics'],
        feature: '',
        majorProject: false,
        badges: ['Streamlit'],
        description: 'Compressing the SKIRTOR model files and visualising them.',
        img: '/assets/blackhole.png',
        link: 'https://github.com/saikumarmk/skirtor',
        buttons: [{ label: 'Website', href: 'https://skirtor.saikumarmk.com/' }],
        category: 'Dust Torus',
        partner: { name: 'lunatone', reason: 'fell from space' }
    },
    {
        id: 'voltchip',
        name: 'voltchip',
        tags: ['Low Level'],
        feature: '',
        description: 'A CHIP-8 emulator written in C that can target the web.',
        majorProject: false,
        badges: ['C', 'WASM'],
        img: 'https://github.com/saikumarmk/web-voltchip/raw/main/assets/logo.png',
        link: 'https://github.com/saikumarmk/web-voltchip',
        category: 'Emulator',
        partner: { name: 'rotom', reason: 'lives inside machines' },
        post: 'emulation-wasm'
    },
    {
        id: 'uwucode',
        name: 'uwucode',
        tags: ['Low Level'],
        feature: '',
        description: 'A toy language with a lexer and parser built from scratch, written to learn compiler design.',
        majorProject: false,
        badges: ['Rust'],
        img: 'https://github.com/saikumarmk/uwucode/raw/main/images/uwucode_logo.png',
        link: 'https://github.com/saikumarmk/uwucode',
        category: 'Compiler',
        partner: { name: 'unown', reason: 'a language made of glyphs' },
        post: 'uwucode'
    },
    {
        id: 'unit-scores-dashboard',
        name: 'unit-scores-dashboard',
        tags: ['Data Vis'],
        feature: '',
        description: 'A newer SETU visualisation tool.',
        majorProject: false,
        badges: ['React'],
        img: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
        buttons: [{ label: 'Demo', href: 'https://saikumarmk.github.io/unit-scores-dashboard/' }],
        link: 'https://github.com/saikumarmk/unit-scores-dashboard',
        category: 'Survey',
        partner: { name: 'alakazam', reason: 'keeps score (IQ of 5,000)' },
        post: 'unit-scores-dashboard'
    },
    {
        id: 'setools',
        name: 'SETools',
        tags: ['Data Vis', 'Scraping'],
        feature: '',
        description: 'A visualisation tool for unit scores. Retired in favour of unit-scores-dashboard.',
        majorProject: false,
        badges: ['Python'],
        img: 'https://github.com/saikumarmk/SETool/raw/main/assets/logo.png',
        link: 'https://github.com/saikumarmk/SETool',
        category: 'Survey',
        partner: { name: 'natu', reason: 'stares at things until it understands them' },
        post: 'the-story-of-setool',
        retired: 'unit-scores-dashboard'
    },
    {
        id: 'monash-handbook-scraper',
        name: 'monash-handbook-scraper',
        tags: ['Scraping'],
        feature: '',
        description: 'Scraper and formatter for the Monash Handbook.',
        majorProject: false,
        badges: ['Go'],
        img: 'https://go.dev/blog/go-brand/Go-Logo/PNG/Go-Logo_Blue.png',
        link: 'https://github.com/saikumarmk/monash-handbook-scraper',
        category: 'Harvester',
        partner: { name: 'sableye', reason: 'digs up gems in the dark' },
        post: 'universe-of-units'
    },
    {
        id: 'neochomp',
        name: 'neochomp',
        tags: ['Low Level'],
        feature: '',
        description: 'Software for rendering animations on an LED matrix.',
        majorProject: false,
        badges: ['Python', 'Hardware'],
        img: '/assets/neochomp.png',
        link: 'https://github.com/saikumarmk/neochomp',
        category: 'Lantern',
        partner: { name: 'lanturn', reason: 'lights up the dark' },
        post: 'neochomp-blog-1'
    },
    {
        id: 'maidenless',
        name: 'project-maidenless',
        tags: ['AI', 'Data Vis'],
        feature: '',
        description: 'Generates text from love-letter pages and visualises information about them.',
        majorProject: false,
        badges: ['Python', 'GPT-2', 'Streamlit'],
        img: '/assets/projects/maidenless.webp',
        link: 'https://github.com/saikumarmk/project-maidenless',
        category: 'Love Letter',
        partner: { name: 'luvdisc', reason: 'shaped like a love letter' }
    },
    {
        id: 'vicroads-transport-api',
        name: 'vicroads-transport-api',
        tags: ['Library'],
        feature: '',
        description: 'An async Python wrapper for the VicRoads DataExchange API.',
        majorProject: false,
        badges: ['Python'],
        img: '/assets/tram.png',
        link: 'https://github.com/saikumarmk/vicroads-transport-api',
        category: 'Wrapper',
        partner: { name: 'klink', reason: 'gears that mesh with other gears' }
    },
    {
        id: 'tungsten',
        name: 'tungsten',
        tags: ['Library'],
        feature: '',
        description: 'A Wolfram library to help with high school mathematics assessments.',
        majorProject: false,
        badges: ['Wolfram'],
        img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/888.png',
        link: 'https://github.com/saikumarmk/tungsten',
        category: 'Maths',
        partner: { name: 'metagross', reason: 'four brains, all doing maths' }
    },
    {
        id: 'acmonaghan',
        name: "acmonaghan.github.io",
        tags: ['Web'],
        feature: '',
        majorProject: false,
        badges: ['THREE.js'],
        description: 'A CV site built on portable-portfolio, with THREE.js rendering the background.',
        img: '/assets/projects/acm.webp',
        link: 'https://github.com/acmonaghan/acmonaghan.github.io',
        buttons: [{ label: 'Website', href: 'https://acmonaghan.github.io' }],
        category: 'Portfolio',
        partner: { name: 'ditto', reason: 'a copy of portable-portfolio, made its own' }
    }
]

export const experience: Experience[] = [
    {
        id: 'canva',
        company: 'Canva',
        img: assets.canvaLogo,
        tags: ['Work'],
        positions: [
            {
                position: "Senior Applied Scientist - VDAS (Video Studio)",
                duration: "March 2026 - Current",
                listItems: ["Stuff yet to come :p"],
                badges: ['AS'],
                buttons: [{ label: 'Link', href: 'https://canva.com' }]},
            {
                position: "Applied Scientist - VDAS (Video Studio)",
                duration: "Sep 2025 - February 2026",
                listItems: ["Worked on stuff :p"],
                badges: ['AS'],
                buttons: [{ label: 'Link', href: 'https://canva.com' }]
            },
            {
                position: "Applied Scientist - Photo Effects",
                duration: "Feb 2024 - Sep 2025",
                listItems: [
                    "R&D on Background Generator, a feature with over 1 million MAUs",
                    "Fine-tuned diffusion models for image editing tasks such as outpainting",
                    "Back up (carry) research engineer, I helped with research enablement by building out the code for running training on our Anyscale HPC "
                ],
                badges: ['AS'],
                buttons: [{ label: 'Link', href: 'https://canva.com' }]
            },
            {
                position: "Machine Learning Engineer Intern - Photo Effects",
                duration: "December 2022 - February 2023",
                listItems: [
                    "Developed a debiasing framework for Stable Diffusion for Canva's Text to Image feature",
                    "Researched and developed bias mitigation strategies targetting Stable Diffusion, addressing harmful and nonrepresentative biases in sensitive categories such as gender and ethnicity"
                ],
                badges: ['Intern'],
                buttons: [{ label: 'Link', href: 'https://canva.com' }]
            }
        ]
    },
    {
        id: 'digicor',
        company: 'DiGiCOR',
        img: '/assets/digicor.jpg',
        tags: ['Work'],
        positions: [
            {
                position: "Data Science Intern",
                duration: "July 2022 - October 2022",
                listItems: ["Managed a team of four to build a real-time sales dashboard using Streamlit, pulling data from NetSuite's REST API. Visualised millions of rows in customer interactions for key insights."],
                badges: ['Intern'],
                buttons: [{ label: 'Link', href: 'https://www.digicor.com.au/' }]
            }
        ]
    },
    {
        id: 'monash-work',
        company: 'Monash University',
        img: '/assets/monash.jpeg',
        tags: ['Work'],
        positions: [
            {
                position: 'Winter Research Assistant',
                duration: "June 2022 - July 2022",
                description: 'Developed a genetic programming framework using simulation in Julia to address a game theoretic problem called paramless. The problem studies function valued traits, specifically in the context of journal/author dynamics.',
                badges: ['Research Assistant'],
                buttons: [{ label: 'Link', href: 'https://www.monash.edu/' }]
            },
            {
                position: "Summer Research Assistant",
                duration: "November 2021 - January 2022",
                description: "Parsed and analyzed commit data from over 30,000 deep-learning libraries using GitHub's REST API and Python to understand the evolution of deep-learning libraries for AutoML",
                badges: ['Research Assistant'],
                buttons: [{ label: 'Link', href: 'https://www.monash.edu/' }]
            }
        ]
    },
    {
        id: 'monash-edu',
        company: 'Monash University',
        img: '/assets/monash.jpeg',
        tags: ['Education'],
        positions: [
            {
                position: 'Bachelor of Applied Data Science Advanced Honours',
                duration: "February 2020 - December 2023",
                listItems: [
                    'First Class Honours with a final grade of 90',
                    "Dean's List Award for academic excellence (2021, 2022), Summer and Winter Research scholarships",
                    'Thesis: Bias Modelling and Mitigation in Diffusion Models'
                ],
                badges: ['Honours'],
                buttons: [{ label: 'Link', href: 'https://www.monash.edu/' }]
            }
        ]
    },
    {
        id: 'mac',
        company: 'Monash Association of Coding',
        img: 'https://media.licdn.com/dms/image/v2/C560BAQE0LOusk-hGHg/company-logo_200_200/company-logo_200_200/0/1630565733466/monashcoding_logo?e=2147483647&v=beta&t=UJYzYGDtIE-4hhA0YbD-8n56fUnLDaMHhAgm4eE470Y',
        tags: ['Extracurricular'],
        positions: [
            {
                position: 'Events Officer -> Events Director -> President',
                duration: "February 2021 - September 2023",
                listItems: [
                    "Overseen growth to over 1100 members, running a technical careers evening with over 100 attendees",
                    "Conducted 4 successful coding workshops in Python, covering topics such as FastAPI, discord.py, and web development, reaching over 200 attendees"
                ],
                badges: ['President'],
                buttons: [{ label: 'Link', href: 'https://www.monashcoding.com/' }]
            }
        ]
    }
];
