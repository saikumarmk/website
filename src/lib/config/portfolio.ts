import type { Experience, Project } from '$lib/types/portfolio';

export const projects: Project[] = [
    {
        id: 'pokered-tournament',
        name: 'pokered-trainer-tournament',
        tags: ['Simulation'],
        feature: '',
        description:
            'A recreation of the Pokemon Red ELO tournament using the PKMN engine.',
        majorProject: false,
        badges: ['Python', 'ASM'],
        link: 'https://github.com/saikumarmk/pokered-trainer-tournament'
    },
    {
        id: 'monash-handbook-scraper',
        name: 'monash-handbook-scraper',
        tags: ['Scraping'],
        feature: '',
        description:
            'Scraper + Formatter for the Monash Handbooker written in Go.',
        majorProject: false,
        badges: ['Go'],
        link: 'https://github.com/saikumarmk/monash-handbook-scraper'
    },
    {
        id: 'unit-dashboard',
        name: 'unit-scores-dashboard',
        tags: ['Data Vis'],
        feature: '',
        description:
            'A newer SETU visualisation tool prompted in React.',
        majorProject: false,
        badges: ['React'],
        buttons: [{ label: 'Demo', href: 'https://saikumarmk.github.io/unit-scores-dashboard/' }],
        link: 'https://github.com/saikumarmk/unit-scores-dashboard'
    },
    {
        id: 'vicroads-transport-api',
        name: 'vicroads-transport-api',
        tags: ['Library'],
        feature: '',
        description:
            'An async python wrapper for the VicRoads DataExchange API ',
        majorProject: false,
        badges: ['Python'],
        link: 'hhttps://github.com/saikumarmk/vicroads-transport-api'
    },
    {
        id: 'tungsten',
        name: 'tungsten',
        tags: ['Library'],
        feature: '',
        description:
            'A Wolfram library written to assist with high school mathematics assessments.',
        majorProject: false,
        badges: ['Wolfram'],
        link: 'https://github.com/saikumarmk/tungsten'
    },
    {
        id: 'neochomp',
        name: 'neochomp',
        tags: ['Low Level'],
        feature: '',
        description:
            'Software for rendering animations on a LED-Matrix.',
        majorProject: false,
        badges: ['Python', 'Hardware'],
        link: 'https://github.com/saikumarmk/neochomp'
    },
    {
        id: 'maidenless',
        name: 'project-maidenless',
        tags: ['AI', 'Data Vis'],
        feature: '',
        description:
            'A streamlit application which generates text from Love Letter pages and visualises information about them. ',
        majorProject: false,
        badges: ['Python', 'GPT-2', 'Streamlit'],
        link: 'https://github.com/saikumarmk/project-maidenless'
    },
    {
        id: 'MiniMelbourne',
        name: 'Mini Melbourne',
        tags: ['Data Vis'],
        feature: '',
        description:
            'A live train map of Melbourne designed with FastAPI and React.',
        majorProject: false,
        badges: ['Python', 'React'],
        link: 'https://github.com/weLoveTrainz/MiniMelbourne'
    },
    {
        id: 'uwucode',
        name: 'uwucode',
        tags: ['Low Level'],
        feature: '',
        description:
            'A toy programming language designed in Rust.',
        majorProject: false,
        badges: ['Rust'],
        link: 'https://github.com/saikumarmk/uwucode'
    },
    {
        id: 'setools',
        name: 'SETools',
        tags: ['Data Vis', 'Scraping'],
        feature: '',
        description:
            'A visualisation tool for unit scores.',
        majorProject: false,
        badges: ['Python'],
        link: 'https://github.com/saikumarmk/SETool'
    },
    {
        id: 'voltchip',
        name: 'voltchip',
        tags: ['Low Level'],
        feature: '',
        majorProject: false,
        badges: ['C', 'WASM'],
        description:
            'A CHIP-8 emulator designed in C that can be targetted for the web',
        link: 'https://github.com/saikumarmk/web-voltchip'
    },
    {
        id: 'acmonaghan',
        name: "acmonaghan.github.io",
        tags: ['THREE', 'web-dev'],
        feature: '',
        majorProject: false,
        badges: ['THREE.js'],
        description: 'A CV site built on eldoraboo/portable-portfolio with THREE.js rendering the background',
        link: 'https://github.com/acmonaghan/acmonaghan.github.io',
        buttons: [{ label: 'Website', href: 'https://acmonaghan.github.io' }]
    }
]


export const experience: Experience[] = [
    {
        id: 'canva-pfx-as',
        company: 'Canva',
        description: 'Applied Scientist - Photo Effects',
        img: 'https://public.canva.site/logo/media/dfb96cc174513093cd6ed61489ccb750.svg',
        position: "Applied Scientist - Photo Effects",
        duration: "Feb 2024 - Current",
        listItems: ["R&D on Background Generator, a feature with over 1 million MAUs",
            "Fine-tuned diffusion models for image editing tasks such as outpainting",
        ],
        tags: ['Work'],
        badges: ['AS'],
        buttons: [{ label: 'Link', href: 'https://canva.com' }]
    },
    {
        id: 'canva-pfx-mle-intern',
        company: 'Canva',
        description: 'Machine Learning Engineer Intern - Photo Effects',
        img: 'https://public.canva.site/logo/media/dfb96cc174513093cd6ed61489ccb750.svg',
        position: "Machine Learning Engineer Intern - Photo Effects",
        duration: "December 2022 - February 2023",
        listItems: ["Developed a debiasing framework for Stable Diffusion for Canva’s Text to Image feature",
            "Researched and developed bias mitigation strategies targetting Stable Diffusion, addressing harmful and nonrepresentative biases in sensitive categories such as gender and ethnicity"
        ],
        tags: ['Work'],
        badges: ['Intern'],
        buttons: [{ label: 'Link', href: 'https://canva.com' }]
    },
    {
        id: 'digicor-intern',
        company: 'DiGiCOR',
        description: 'Machine Learning Engineer Intern - Photo Effects',
        img: '../assets/digicor.jpg',
        position: "Data Science Intern",
        duration: "July 2022 - October 2022",
        listItems: ["Managed a team of four to build a real-time sales dashboard using Streamlit, pulling data from NetSuite’s REST API. Visualised millions of rows in customer interactions for key insights.",
        ],
        tags: ['Work'],
        badges: ['Intern'],
        buttons: [{ label: 'Link', href: 'https://www.digicor.com.au/' }]
    },
    {
        id: 'monash-ra-winter',
        company: 'Monash University',
        position: 'Winter Research Assistant',
        img: '../assets/monash.jpeg',
        duration: "June 2022 - July 2022",
        tags: ['Work'],
        description: 'Developed a genetic programming framework using simulation in Julia to address a game theoretic problem called paramless. The problem studies function valued traits, specifically in the context of journal/author dynamics.',
        badges: ['Research Assistant'],
        buttons: [{ label: 'Link', href: 'https://www.monash.edu/' }]
    },
    {
        id: 'monash-ra-summer',
        company: 'Monash University',
        duration: "November 2021 - January 2022",
        position: "Summer Research Assistant",
        description: 'Parsed and analyzed commit data from over 30,000 deep-learning libraries using GitHub’s REST API and Python to understand the evolution of deep-learning libraries for AutoML',
        img: '../assets/monash.jpeg',
        tags: ['Work'],
        badges: ['Research Assistant'],
        buttons: [{ label: 'Link', href: 'https://www.monash.edu/' }]
    },
    {
        id: 'monash-bads-hons',
        company: 'Monash University',
        description: 'Bachelor of Applied Data Science Advanced Honours',
        listItems: ['First Class Honours with a final grade of 90',
            'Dean’s List Award for academic excellence (2021, 2022), Summer and Winter Research scholarships',
            'Thesis: Bias Modelling and Mitigation in Diffusion Models'
        ],
        img: '../assets/monash.jpeg',
        tags: ['Education'],
        duration: "February 2020 - December 2023",
        badges: ['Honours'],
        buttons: [{ label: 'Link', href: 'https://www.monash.edu/' }]
    },
    {
        id: 'mac-president',
        company: 'Monash Association of Coding',
        description: '',
        position: 'Events Officer -> Events Director -> President',
        duration: "February 2021 - September 2023",
        img: 'https://media.licdn.com/dms/image/v2/C560BAQE0LOusk-hGHg/company-logo_200_200/company-logo_200_200/0/1630565733466/monashcoding_logo?e=2147483647&v=beta&t=UJYzYGDtIE-4hhA0YbD-8n56fUnLDaMHhAgm4eE470Y',
        tags: ['Extracurricular'],
        listItems: ["Overseen growth to over 1100 members, running a technical careers evening with over 100 attendees",
            "Conducted 4 successful coding workshops in Python, covering topics such as FastAPI, discord.py, and web development, reaching over 200 attendees"
        ],
        badges: ['President'],
        buttons: [{ label: 'Link', href: 'https://www.monashcoding.com/' }]
    }
];
