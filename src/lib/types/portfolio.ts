export type Badge = {
    name: string;
    colorScheme: string;
};

export type Button = {
    label: string;
    href: string;
};

export type Experience = {
    id: string;
    company: string;
    position?: string;
    duration?: string;
    description: string;
    img: string;
    tags: string[];
    badges?: string[];
    buttons?: Button[];
    listItems?: string[];
};

export type Project = {
    id: string
    name: string
    tags?: string[]
    feature?: string
    description?: string
    majorProject: boolean
    badges?: string[];
    buttons?: Button[];
    img?: string
    link?: string
}