export interface Block {
  id: number
  name: string
  type: 'hero' | 'general' | 'soldier'
  x: number
  y: number
  w: number
  h: number
}

export const WIDTH = 4
export const HEIGHT = 5

export const initialBlocks: Block[] = [
  { id: 1, name: 'Cao Cao', type: 'hero', x: 1, y: 0, w: 2, h: 2 },
  { id: 2, name: 'Zhang', type: 'general', x: 0, y: 0, w: 1, h: 2 },
  { id: 3, name: 'Zhao', type: 'general', x: 3, y: 0, w: 1, h: 2 },
  { id: 4, name: 'Ma', type: 'general', x: 0, y: 2, w: 1, h: 2 },
  { id: 5, name: 'Huang', type: 'general', x: 3, y: 2, w: 1, h: 2 },
  { id: 6, name: 'Guan', type: 'general', x: 1, y: 2, w: 2, h: 1 },
  { id: 7, name: 'Soldier', type: 'soldier', x: 0, y: 4, w: 1, h: 1 },
  { id: 8, name: 'Soldier', type: 'soldier', x: 1, y: 3, w: 1, h: 1 },
  { id: 9, name: 'Soldier', type: 'soldier', x: 2, y: 3, w: 1, h: 1 },
  { id: 10, name: 'Soldier', type: 'soldier', x: 3, y: 4, w: 1, h: 1 },
]

export function canMove(block: Block, dx: number, dy: number, allBlocks: Block[]): boolean {
  const newX = block.x + dx
  const newY = block.y + dy

  // Check boundaries
  if (newX < 0 || newX + block.w > WIDTH) return false
  if (newY < 0 || newY + block.h > HEIGHT) return false

  // Check collision with other blocks
  for (const other of allBlocks) {
    if (other.id === block.id) continue
    
    // Check if rectangles overlap
    // Rectangle 1: newX, newY, w, h
    // Rectangle 2: other.x, other.y, other.w, other.h
    if (
      newX < other.x + other.w &&
      newX + block.w > other.x &&
      newY < other.y + other.h &&
      newY + block.h > other.y
    ) {
      return false
    }
  }

  return true
}
