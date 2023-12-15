'use client'

import { ReactElement, useEffect, useState } from "react";
import { boardSerializer } from './common/helpers'
import Item from "./item";
import Block from './block'
import FallingItem from "./fallingItem";

const storage = (typeof window !== 'undefined' ? localStorage : { setItem(){}, getItem(){} })

// board size could be defined as constants, but
// then for consistency, we should use them in CSS too, cumbersome for now, see later if it makes sense


type MyState = {
    score: number;
    started: boolean;   // start button pushed
    running: boolean;   // currently responding (not in the middle of some blocking action)
    over: boolean;      // game lost
    currentItem: ReactElement | null;
    currentShape: string;
    nextShape: string | null;
    speed: number;      // speed increases with score
    highscores: Array<number>;
}

const SCORING = {
    ROWS_AT_ONCE: [100, 200, 400, 800],
    ACCELERATE: 1,
    DROP: 30,
}
const SPEED_STEPS = [0, 1000, 5000, 10000, 15000]
const SOUNDS = {
    click: './sounds/click.mp3',
    woosh: './sounds/woosh.mp3',
    blob: './sounds/blob.mp3',
    boom: './sounds/boom.mp3',
    sadTrombone: './sounds/sad-trombone.mp3',
}


function Game () {
    // we keep a bunch of simple variables in a "state" container
    // note that using one variable means that every time we want to change one value, we need to copy the rest (state => {...state, value})
    const [state, setState] = useState({
        score: 0,
        speed: 1,
        running: true,
        over: false,
        started: false,
        currentItem: <div />,
        currentShape: 'I',
        nextShape: null,
        highscores: [] as Array<number>,
    } as MyState)

    // but we keep the large board apart, it's a 10x20 matrix (x, y)
    const [gameBoard, setGameBoard] = useState(() => Array.from(Array(10), () => new Array(20).fill(null)))


    useEffect(() => {
        // runs once, just like componentDidMount
        setState({ ...state, highscores:(JSON.parse(storage?.getItem('highscores') ?? '[2000, 1000, 500, 100]')) as Array<number> })
      }, [])

    const start = () => {
        newPiece()
        setState(state => ({ ...state, started: true }))
    }

    const audio = (sound:string, volume = 0.6) => {
        // we could probably reuse the Audie element, just not the point of this work
        const myAudioElement = new Audio(sound)
        myAudioElement.volume = volume

        myAudioElement.addEventListener("canplaythrough", (event) => myAudioElement.play());
    }

    const isEmpty = (x:number, y:number) => !gameBoard[x][y]

    const isWithinBound = (x:number, y:number) => x >= 0 && y >= 0 && x < 10 && y < 20

    const gameOver = () => {
        const highscores = state.highscores
        highscores.push(state.score)
        highscores.sort((a,b) => a > b ? -1 : 1)
        storage?.setItem('highscores', JSON.stringify(highscores.slice(0, 5)))
        setState(state => ({...state, running: false, over: true, highscores}))
        audio(SOUNDS.sadTrombone)
    }

    // called when a block hits something below and needs to be attached to the board
    const fixBlock = (x0:number, y0:number, shape:string, matrix:Array<Array<string | null>>) => {
        if(state.over){
            console.log('OVER')
            return
        }
        audio(SOUNDS.blob)
        const board = structuredClone(gameBoard)

        matrix.forEach((col, block_x) => col.forEach((block, block_y) => {
            if(!block) return;
            const x = x0 + block_x, y = y0 + block_y
            if(y === 0){
                gameOver()
            }
            if(!isWithinBound(x,y)) {
                return
            }
            board[x][y] = shape
        }))

        // update board, then check if any line is complete
        setGameBoard(board)
        checklines(board, y0, 4)

    }

    // check if any row is complete and needs to be removed
    const checklines = (board: Array<Array<string | null>>, y0:number, height:number) => {
        setState(state => ({ ...state, running: false }))
        const rowsToRemove = [] as number[]
        for(let y = y0; y < Math.min(20, y0+height); y++){
            let anyEmpty = false
            for(let x=0; x < 10; x++){
                if(!board[x][y]){
                    anyEmpty = true
                    break
                }
            }
            if(!anyEmpty){
                rowsToRemove.push(y)
            }
        }


        if(rowsToRemove.length === 0 ) {
            console.log('nothing')
            setState(state => ({ ...state, running : !state.over}))
            return
        }


        // FULL lINES, YEAH
        // => play sound, increase score, and remove lines
        // 1. play sound (the more lines, the louder)
        audio(SOUNDS.woosh, rowsToRemove.length / 4)

        // 2. highlight blocks to be removed
        for(let y of rowsToRemove){
            for(let x=0; x < 10; x++){
                board[x][y] = 'x'
            }
        }
        setGameBoard(board)

        // 3. remove those blocks
        setTimeout(() => {
                // here we keep using the same "board" variable, since the state in this context is outdates
                // since the game is paused, there should be no change to the board in between
                const score = state.score + SCORING.ROWS_AT_ONCE[rowsToRemove.length-1]
                let y0:number
                while(y0 = rowsToRemove.shift() as number){
                    for(let y=y0; y >= 0; y--){
                        for(let x=0; x < 10; x++){
                            board[x][y] = board[x][y-1]
                        }
                    }
                }
                const speed = SPEED_STEPS.findIndex(n => n > score)

                setGameBoard(board)
                setState(state => ({ ...state, score, speed, running:!state.over}))
            }
            ,1000
        )
    }

    const newPiece = () => {
        const currentShape = state.nextShape ?? 'FILTONS'.split('')[Math.floor(Math.random() * 7)]
        console.log('NEW', currentShape)
        setState(state => ({ ...state, currentShape, nextShape: 'FILTONS'.split('')[Date.now() % 7]}))
    }

    return (
        <div className="game-container">
            <div className="sidebar">
                <div className="side-box text-xl">
                    <h2>High Scores</h2>
                    <ul>{
                        state.highscores.map((score, key) => <li key={key}>{score}</li>)
                        }</ul>
                </div>
            </div>
            <div className="game">
                { state.over && <div className="absolute text-lg z-10 bg-black text-white font-bold py-2 px-4 w-full rounded">GAME OVER</div>}
                { state.started ? 
                    <FallingItem speed={state.speed} isRunning={() => state.running} newPiece={newPiece} isEmpty={isEmpty} isWithinBound={isWithinBound} fixBlock={fixBlock} shape={state.currentShape} />
                        : 
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-8 rounded" onClick={start}>START</button>
                }
                { gameBoard.map((col, x) => col.map((shape, y) => 
                    shape ? <Block key={x+10*(y+1)} x={x} y={y} color={shape}/> : undefined
                )) }
            </div>
            <div className="sidebar">
                <div className="side-box text-xl">{ state.score }</div>
                <div className="side-box h-48">
                    { state.nextShape && <Item shape={state.nextShape} x={1.5} y={1} rotation={0}/>}
                </div>
            </div>
        </div>
    )
}

export default Game