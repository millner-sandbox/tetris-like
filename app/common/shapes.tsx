
// rotations in a human readable format
// 
const itemsRawRotations = {
    I: `░ ░ ░ ░    ░ ░ █ ░    ░ ░ ░ ░    ░ █ ░ ░
        █ █ █ █    ░ ░ █ ░    ░ ░ ░ ░    ░ █ ░ ░
        ░ ░ ░ ░    ░ ░ █ ░    █ █ █ █    ░ █ ░ ░
        ░ ░ ░ ░    ░ ░ █ ░    ░ ░ ░ ░    ░ █ ░ ░`,
        
    L: `░ ░ █    ░ █ ░    ░ ░ ░    █ █ ░
        █ █ █    ░ █ ░    █ █ █    ░ █ ░
        ░ ░ ░    ░ █ █    █ ░ ░    ░ █ ░`,
        
    F: `░ ░ ░    ░ █ ░    █ ░ ░    ░ █ █
        █ █ █    ░ █ ░    █ █ █    ░ █ ░
        ░ ░ █    █ █ ░    ░ ░ ░    ░ █ ░`,
        
    S: `░ ░ ░    █ ░ ░    ░ █ █    ░ █ ░
        ░ █ █    █ █ ░    █ █ ░    ░ █ █
        █ █ ░    ░ █ ░    ░ ░ ░    ░ ░ █`,
  
    N: `░ ░ ░    ░ █ ░    █ █ ░    ░ ░ █
        █ █ ░    █ █ ░    ░ █ █    ░ █ █
        ░ █ █    █ ░ ░    ░ ░ ░    ░ █ ░`,
  
    T: `░ ░ ░    ░ █ ░    ░ █ ░    ░ █ ░
        █ █ █    █ █ ░    █ █ █    ░ █ █
        ░ █ ░    ░ █ ░    ░ ░ ░    ░ █ ░`,
    
    O: `█ █   █ █   █ █   █ █
        █ █   █ █   █ █   █ █`,
  }
  
  // make them matrices or booleans
  type Matrix = Array<Array<boolean>>

  const itemsRotations = { } as Record<string, Array<Matrix>>
  for(const [shape, rawRotations] of Object.entries(itemsRawRotations)){
    const buffer = rawRotations.replace(/\s+/g, ' ').split(' ');
    // there are 4 rotations (matrices) each or them HAS T░ be a square
    const size = Math.sqrt(buffer.length / 4)
    const rotations = []
    for(let step=0; step < 4; step++){
        const matrix =  Array.from(Array(size), () => new Array(size)) as Matrix
        for(let y=0; y < size; y++){
            const start = step * size + y * 4 * size
            for(let x=0; x < size; x++){
                matrix[x][y] = buffer[start + x] === '█'
            }
        }
        rotations.push(matrix as Matrix)
    }
    itemsRotations[shape] = rotations
  }


  export default itemsRotations