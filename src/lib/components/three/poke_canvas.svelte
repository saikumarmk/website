<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import * as THREE from 'three'

  let container: HTMLDivElement
  let renderer: THREE.WebGLRenderer
  let camera: THREE.OrthographicCamera
  let scene: THREE.Scene
  let animationFrameId: number
  let pokemonObjects: Array<{
    mesh: THREE.Mesh
    velocity: THREE.Vector2
    spriteData: {
      name: string
      x: number
      y: number
      width: number
      height: number
    }
  }> = []

  // Sprite data
  let sprites: Array<{
    name: string
    x: number
    y: number
    width: number
    height: number
  }> = []
  let textureAtlas: THREE.Texture | null = null

  // Configuration
  const maxSprites = 40
  const spriteScale = 1.2

  class PokemonSpriteManager {
    async loadSpriteData(): Promise<void> {
      try {
        let cssText: string

        try {
          // First try: relative path
          const response = await fetch('/src/styles/pokesprite-pokemon-gen8.txt')
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          cssText = await response.text()
        } catch (fetchError) {
          console.warn('Local fetch failed, trying alternatives...', fetchError)
        }

        this.parseCSSSprites(cssText)

        if (sprites.length === 0) {
          throw new Error('No sprites found in CSS file')
        }
      } catch (error) {
        console.error('Error loading sprite data:', error)
        throw error
      }
    }

    parseCSSSprites(cssText: string): void {
      const parsedSprites: typeof sprites = []
      const seenSprites = new Set<string>()
      // Regex to match .pokesprite.{name} { background-position: Xpx Ypx }
      const spritePattern =
        /\.pokesprite\.([a-zA-Z0-9-]+)(?:\.[a-zA-Z0-9-]+)*\s*{\s*background-position:\s*(-?\d+)px\s+(-?\d+)px\s*}/g

      let match: RegExpExecArray | null
      while ((match = spritePattern.exec(cssText)) !== null) {
        const [, pokemonName, xPos, yPos] = match

        // Filter out unwanted entries
        if (this.shouldSkipSprite(pokemonName)) {
          continue
        }

        // Avoid duplicates (same name and position)
        const spriteKey = `${pokemonName}:${xPos},${yPos}`
        if (seenSprites.has(spriteKey)) {
          continue
        }
        seenSprites.add(spriteKey)

        parsedSprites.push({
          name: pokemonName,
          x: parseInt(xPos, 10),
          y: parseInt(yPos, 10),
          width: 68, // Standard sprite width
          height: 56 // Standard sprite height
        })
      }

      // Sort alphabetically for consistent ordering
      parsedSprites.sort((a, b) => a.name.localeCompare(b.name))
      sprites = parsedSprites
    }

    shouldSkipSprite(name: string): boolean {
      // Skip non-Pokemon entries and variants we don't want
      const skipPatterns = [
        'pokemon', // Base class
        'shiny', // Shiny variants
        'female', // Female variants
        'totem', // Totem variants
        'egg', // Egg sprite
        'unknown', // Unknown sprite
        'mega-evolution-sigil' // UI elements
      ]

      return skipPatterns.some(pattern => name.includes(pattern))
    }

    async loadTexture(): Promise<THREE.Texture> {
      return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader()
        textureLoader.crossOrigin = 'anonymous'

        // Try loading from multiple locations
        const texturePaths = [
          '/src/styles/images/pokesprite-pokemon-gen8.png', // Same folder
          './assets/pokesprite-pokemon-gen8.png', // Assets folder
          'https://raw.githubusercontent.com/msikma/pokesprite-spritesheet/master/assets/pokesprite-pokemon-gen8.png',
          'https://cdn.jsdelivr.net/gh/msikma/pokesprite-spritesheet@master/assets/pokesprite-pokemon-gen8.png'
        ]

        let currentIndex = 0

        const tryLoadTexture = () => {
          if (currentIndex >= texturePaths.length) {
            reject(new Error('All texture loading attempts failed'))
            return
          }

          const currentPath = texturePaths[currentIndex]
          console.log(`Attempting to load texture from: ${currentPath}`)

          const texture = textureLoader.load(
            currentPath,
            loadedTexture => {
              // Configure texture for pixel-perfect sprites
              loadedTexture.magFilter = THREE.NearestFilter
              loadedTexture.minFilter = THREE.NearestFilter
              // Recall mipmaps grant you sized sprites at different viewport sizes
              loadedTexture.generateMipmaps = true

              loadedTexture.colorSpace = THREE.SRGBColorSpace

              console.log(`Texture loaded successfully from: ${currentPath}`)
              console.log(`Texture dimensions: ${loadedTexture.image.width}x${loadedTexture.image.height}`)
              resolve(loadedTexture)
            },
            progress => {
              console.log(`Loading texture: ${(progress.loaded / progress.total) * 100}%`)
            },
            error => {
              console.warn(`Failed to load texture from ${currentPath}:`, error)
              currentIndex++
              tryLoadTexture()
            }
          )
        }

        tryLoadTexture()
      })
    }
  }

  function createPokemonMesh(spriteData: (typeof sprites)[0]): (typeof pokemonObjects)[0] | null {
    if (!textureAtlas) {
      console.error('Texture atlas not loaded')
      return null
    }

    // Get texture dimensions (standard sprite sheet is 2048x1280)
    const atlasWidth = textureAtlas.image.width || 2048
    const atlasHeight = textureAtlas.image.height || 1280

    // Calculate UV coordinates for this specific sprite
    const u = -spriteData.x / atlasWidth
    const v = -spriteData.y / atlasHeight
    const uWidth = spriteData.width / atlasWidth
    const vHeight = spriteData.height / atlasHeight

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(spriteData.width * spriteScale, spriteData.height * spriteScale)

    // Set UV coordinates to show only this sprite
    const uvAttribute = geometry.attributes.uv
    const uvArray = uvAttribute.array as Float32Array

    // UV mapping: bottom-left, bottom-right, top-left, top-right
    uvArray[0] = u
    uvArray[1] = v + vHeight // bottom-left
    uvArray[2] = u + uWidth
    uvArray[3] = v + vHeight // bottom-right
    uvArray[4] = u
    uvArray[5] = v // top-left
    uvArray[6] = u + uWidth
    uvArray[7] = v // top-right

    uvAttribute.needsUpdate = true

    // Create material
    const material = new THREE.MeshBasicMaterial({
      map: textureAtlas,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide
    })

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material)

    // Random starting position
    const bounds = getScreenBounds()
    mesh.position.x = (Math.random() - 0.5) * bounds.width
    mesh.position.y = (Math.random() - 0.5) * bounds.height
    mesh.position.z = 0

    // Random velocity
    const speed = 10 + Math.random() * 50
    const angle = Math.random() * Math.PI * 2
    const velocity = new THREE.Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed)

    return {
      mesh: mesh,
      velocity: velocity,
      spriteData: spriteData
    }
  }

  function createPokemonSprites(): void {
    const numSprites = Math.min(maxSprites, sprites.length)

    for (let i = 0; i < numSprites; i++) {
      // Randomly select a sprite
      const randomIndex = Math.floor(Math.random() * sprites.length)
      const spriteData = sprites[randomIndex]

      const pokemon = createPokemonMesh(spriteData)
      if (pokemon) {
        pokemonObjects.push(pokemon)
        scene.add(pokemon.mesh)
      }
    }
  }

  function getScreenBounds() {
    const width = window.innerWidth
    const height = window.innerHeight
    return {
      width: width,
      height: height
    }
  }

  function animate(): void {
    animationFrameId = requestAnimationFrame(animate)

    const deltaTime = 1 / 60 // 60 FPS target
    const bounds = getScreenBounds()
    const halfWidth = bounds.width / 2
    const halfHeight = bounds.height / 2

    // Update each Pokemon
    pokemonObjects.forEach(pokemon => {
      const sprite = pokemon.spriteData
      const mesh = pokemon.mesh
      const vel = pokemon.velocity

      // Move sprite
      mesh.position.x += vel.x * deltaTime
      mesh.position.y += vel.y * deltaTime

      // Screen wrapping
      const spriteHalfWidth = (sprite.width * spriteScale) / 2
      const spriteHalfHeight = (sprite.height * spriteScale) / 2

      if (mesh.position.x > halfWidth + spriteHalfWidth) {
        mesh.position.x = -halfWidth - spriteHalfWidth
      } else if (mesh.position.x < -halfWidth - spriteHalfWidth) {
        mesh.position.x = halfWidth + spriteHalfWidth
      }

      if (mesh.position.y > halfHeight + spriteHalfHeight) {
        mesh.position.y = -halfHeight - spriteHalfHeight
      } else if (mesh.position.y < -halfHeight - spriteHalfHeight) {
        mesh.position.y = halfHeight + spriteHalfHeight
      }
    })

    renderer.render(scene, camera)
  }

  function handleResize(): void {
    const width = window.innerWidth
    const height = window.innerHeight

    camera.left = -width / 2
    camera.right = width / 2
    camera.top = height / 2
    camera.bottom = -height / 2
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
  }

  onMount(async () => {
    const width = window.innerWidth
    const height = window.innerHeight

    // Scene & camera (orthographic for 2D-like placement)
    scene = new THREE.Scene()
    camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 1000)
    camera.position.z = 100

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true })
    //renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0) // Transparent background
    container.appendChild(renderer.domElement)

    // Handle window resize
    window.addEventListener('resize', handleResize)

    try {
      // Initialize Pokemon sprite system
      const spriteManager = new PokemonSpriteManager()

      // Load sprite data and texture
      await spriteManager.loadSpriteData()
      textureAtlas = await spriteManager.loadTexture()

      // Create sprites and start animation
      createPokemonSprites()
      animate()
    } catch (error) {
      console.error('Failed to initialize Pokemon sprites:', error)
    }
  })
</script>

<div bind:this={container} class="canvas-container" />

<style>
  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
