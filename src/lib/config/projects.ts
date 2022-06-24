export type Project = {
    id: string
    name: string
    tags?: string[]
    feature?: string
    description?: string
    img: string
    link?: string
}

export const projects: Project[] = [
    {
        id: 'MiniMelbourne',
        name: 'Mini Melbourne',
        tags: ['FastAPI', 'React', 'JS', 'API', 'Mapbox'],
        feature: '',
        description:
            'A live train map of Melbourne designed with FastAPI and React.',
        img: 'https://github.com/weLoveTrainz/MiniMelbourne/raw/main/images/bullet-train.png',
        link: 'https://github.com/weLoveTrainz/MiniMelbourne'
    },
    {
        id: 'uwucode',
        name: 'uwucode',
        tags: ['Rust', 'Language Design'],
        feature: '',
        description:
            'A toy programming language designed in Rust.',
        img: 'https://github.com/saikumarmk/uwucode/raw/main/images/uwucode_logo.png',
        link: 'https://github.com/saikumarmk/uwucode'
    },
    {
        id: 'setools',
        name: 'SETools',
        tags: ['Python', 'Dash', 'Scraping', 'Heroku'],
        feature: '',
        description:
            'A visualisation tool for unit scores.',
        img: 'https://github.com/saikumarmk/SETool/raw/main/assets/logo.png',
        link: 'https://github.com/saikumarmk/SETool'
    },
    {
        id: 'voltchip',
        name: 'voltchip',
        tags: ['WebAssembly', 'C', 'Emsripten', 'SDL'],
        feature: '',
        description:
            'A CHIP-8 emulator designed in C that can be targetted for the web',
        img: 'https://github.com/saikumarmk/web-voltchip/raw/main/assets/logo.png',
        link: 'https://github.com/saikumarmk/web-voltchip'
    }
]