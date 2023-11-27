// allows to serialize a matrix as a 2D string
function boardSerializer(board:Array<Array<string | null>>){
    const WIDTH = board.length, HEIGHT = board[0]?.length ?? 0
    const reversedBoard = Array.from(Array(HEIGHT), () => new Array(WIDTH).fill(null)) as Array<Array<string | null>>
    board.forEach((col, x) => col.forEach((value, y) => {
        reversedBoard[y][x] = value
    }))
    return reversedBoard.map(row => row.map(v => v ?? '_').join(' ')).join('\n')
}


export {
    boardSerializer
}