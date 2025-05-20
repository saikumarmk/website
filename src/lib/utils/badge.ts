type BadgeStyle = {
    bgColor: string
    textColor: string
}

export type BadgeColorScheme = 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'pink' | 'gray' | 'orange'

const colorMap: Record<BadgeColorScheme, BadgeStyle> = {
    blue: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
    },
    red: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
    },
    green: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
    },
    yellow: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
    },
    purple: {
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800'
    },
    pink: {
        bgColor: 'bg-pink-100',
        textColor: 'text-pink-800'
    },
    gray: {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
    },
    orange: {
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800'
    }
}

export const badgeMap: Record<string, { colorScheme: BadgeColorScheme, displayName?: string }> = {
    // Your existing badge map remains unchanged
    'AS': { colorScheme: 'green', displayName: 'Applied Scientist' },
    'Intern': { colorScheme: 'blue' },
    'Research Assistant': { colorScheme: 'red' },
    'Honours': { colorScheme: 'red' },
    'President': { colorScheme: 'red' },
    'Python': { colorScheme: 'yellow' },
    'TypeScript': { colorScheme: 'blue' },
    'WASM': { colorScheme: 'green' },
    'C': { colorScheme: 'blue' },
    'Go': { colorScheme: 'blue' },
    'React': { colorScheme: 'pink' },
    'Rust': { colorScheme: 'orange' },
    'Svelte': { colorScheme: 'red' },
    'ML': { colorScheme: 'green' },
    'AI': { colorScheme: 'green' },
    'Wolfram': { colorScheme: 'purple' },
    'Hardware': { colorScheme: 'red' }
}

export function getBadgeInfo(name: string) {
    const info = badgeMap[name] || { colorScheme: 'gray' }
    return {
        ...info,
        ...colorMap[info.colorScheme]
    }
}