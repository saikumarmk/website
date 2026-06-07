export type PostConfig = {
  bridgy?: {
    [kind: string]: ('fed' | 'mastodon' | 'flickr' | 'github' | 'twitter')[]
  }
}
