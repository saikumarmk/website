export const techColors: Record<string, string[]> = {
  // Languages
  'Python': ['#4B8BBE', '#4B8BBE', '#FFD43B', '#FFD43B'],
  'JavaScript': ['#f0db4f', '#f0db4f', '#323330', '#323330'],
  'JS': ['#f0db4f', '#f0db4f', '#323330', '#323330'],
  'TypeScript': ['#007acc', '#007acc', '#007acc', '#007acc'],
  'Rust': ['#f74c00', '#f74c00', '#CE422B', '#CE422B'],
  'C': ['#5c6bc0', '#5c6bc0', '#283593', '#283593'],
  'C++': ['#659AD2', '#659AD2', '#004482', '#004482'],
  'Go': ['#00ADD8', '#00ADD8', '#00ADD8', '#00ADD8'],
  'ASM': ['#6E4C13', '#6E4C13', '#4A3408', '#4A3408'],
  'Wolfram': ['#DD1100', '#DD1100', '#AA0000', '#AA0000'],
  
  // Frameworks & Libraries
  'React': ['#61DBFB', '#61DBFB', '#61DBFB', '#61DBFB'],
  'SvelteKit': ['#FF3E00', '#FF3E00', '#FF3E00', '#FF3E00'],
  'FastAPI': ['#009688', '#009688', '#009688', '#009688'],
  'Dash': ['#119DFF', '#119DFF', '#119DFF', '#119DFF'],
  'Streamlit': ['#FF4B4B', '#FF4B4B', '#FF4B4B', '#FF4B4B'],
  'THREE.js': ['#000000', '#000000', '#049EF4', '#049EF4'],
  'D3.js': ['#F9A03C', '#F9A03C', '#F9A03C', '#F9A03C'],
  'TailwindCSS': ['#06B6D4', '#06B6D4', '#06B6D4', '#06B6D4'],
  
  // Tools/Platforms
  'WebAssembly': ['#654FF0', '#654FF0', '#654FF0', '#654FF0'],
  'WASM': ['#654FF0', '#654FF0', '#654FF0', '#654FF0'],
  'Emscripten': ['#006064', '#006064', '#006064', '#006064'],
  'SDL': ['#1E88E5', '#1E88E5', '#1E88E5', '#1E88E5'],
  'Heroku': ['#430098', '#430098', '#430098', '#430098'],
  'Scraping': ['#4CAF50', '#4CAF50', '#2E7D32', '#2E7D32'],
  'API': ['#FF6F00', '#FF6F00', '#E65100', '#E65100'],
  'Mapbox': ['#0080EF', '#0080EF', '#0080EF', '#0080EF'],
  'mapbox': ['#0080EF', '#0080EF', '#0080EF', '#0080EF'],
  'Language Design': ['#9C27B0', '#9C27B0', '#6A1B9A', '#6A1B9A'],
  'Hardware': ['#D32F2F', '#D32F2F', '#B71C1C', '#B71C1C'],
  'CLI': ['#4CAF50', '#4CAF50', '#388E3C', '#388E3C'],
  'Data Analysis': ['#FF9800', '#FF9800', '#F57C00', '#F57C00'],
  'GPT-2': ['#10A37F', '#10A37F', '#10A37F', '#10A37F'],
  
  // Default
  'default': ['#666666', '#666666', '#444444', '#444444']
};

export function getTechColors(tech: string): string[] {
  return techColors[tech] || techColors['default'];
}

