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
        feature: 'React + FastAPI',
        description:
            'A live train map of Melbourne designed with FastAPI and React.',
        img: 'https://github.com/weLoveTrainz/MiniMelbourne/raw/main/images/bullet-train.png',
        link: 'https://github.com/weLoveTrainz/MiniMelbourne'
    }
]