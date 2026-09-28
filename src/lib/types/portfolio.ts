export type Badge = {
  name: string
  colorScheme: string
}

export type Button = {
  label: string
  href: string
}

export type Position = {
  position: string
  duration: string
  description?: string
  badges?: string[]
  buttons?: Button[]
  listItems?: string[]
}

export type Experience = {
  id: string
  company: string
  img: string
  tags: string[]
  positions: Position[]
}

export type Partner = {
  /** pokesprite class name, e.g. 'porygon-z' */
  name: string
  /** one line on why this Pokémon suits the project */
  reason: string
}

export type Project = {
  /** also the Dex deep link, `/dex#<id>` */
  id: string
  name: string
  tags?: string[]
  feature?: string
  description?: string
  majorProject: boolean
  badges?: string[]
  buttons?: Button[]
  img?: string
  link?: string
  /** Dex category, shown as "The <category> Project" */
  category: string
  partner: Partner
  /** slug of the post that writes the project up */
  post?: string
  /** id of the project that replaced this one */
  retired?: string
}
