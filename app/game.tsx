'use client'

import React, { ReactElement } from "react";
import { boardSerializer } from './common/helpers'
import Item from "./item";
import Block from './block'
import FallingItem from "./fallingItem";

const storage = (typeof window !== 'undefined' ? localStorage : { setItem(){}, getItem(){} })

// board size could be defined as constants, but
// then for consistency, we should use them in CSS too, cumbersome for now, see later if it makes sense

type MyProps = {
}

type MyState = {
    score: number;
    started: boolean;   // start button pushed
    running: boolean;   // currently responding (not in the middle of some blocking action)
    over: boolean;      // game lost
    currentItem: ReactElement | null;
    board: Array<Array<string | null>>;
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


// some overloaded type hints, for IDE mostly
class Game extends React.Component<MyProps, MyState> {
    currentShape!: string;

    constructor(props: MyProps) {
        super(props);
        this.state = {
            score: 0,
            speed: 1,
            running: true,
            over: false,
            started: false,
            currentItem: <div />,
            nextShape: null,
            highscores: [] as Array<number>,
            // setup board as 10x20 matric (x, y)
            board : Array.from(Array(10), () => new Array(20).fill(null)),
        };

    }

    componentDidMount(): void {
        this.setState({ highscores:(JSON.parse(storage?.getItem('highscores') ?? '[2000, 1000, 500, 100]')) as Array<number> })
    }

    start = () => {
        this.newPiece()
        this.setState({ started: true })
    }

    audio(sound:string, volume = 0.6){
        // we could probably reuse the Audie element, just not the point of this work
        const myAudioElement = new Audio(sound)
        myAudioElement.volume = volume

        myAudioElement.addEventListener("canplaythrough", (event) => {
            myAudioElement.play();
        });
    }

    isEmpty(x:number, y:number){
        return !this.state.board[x][y]
    }

    isWithinBound(x:number, y:number){
        return x >= 0 && y >= 0 && x < 10 && y < 20
    }

    gameOver(){
        const highscores = this.state.highscores
        highscores.push(this.state.score)
        highscores.sort((a,b) => a > b ? -1 : 1)
        storage?.setItem('highscores', JSON.stringify(highscores.slice(0, 5)))
        this.setState({running: false, over: true, highscores})
        this.audio(SOUNDS.sadTrombone)
    }

    fixBlock(x0:number, y0:number, shape:string, matrix:Array<Array<string | null>>){
        if(this.state.over){
            console.log('OVER')
            return
        }
        this.audio(SOUNDS.blob)
        const board = structuredClone(this.state.board)

        matrix.forEach((col, block_x) => col.forEach((block, block_y) => {
            if(!block) return;
            const x = x0 + block_x, y = y0 + block_y
            if(y === 0){
                this.gameOver()
            }
            if(!this.isWithinBound(x,y)) {
                return
            }
            board[x][y] = shape
        }))

        // update board, then check if any line is complete
        this.setState({ board },
            () =>  this.checklines(y0, 4)
        )

    }

    // check if any row is complete
    checklines(y0:number, height:number){
        this.setState({running : false })
        const rowsToRemove = [] as number[]
        for(let y = y0; y < Math.min(20, y0+height); y++){
            let anyEmpty = false
            for(let x=0; x < 10; x++){
                if(!this.state.board[x][y]){
                    anyEmpty = true
                    break
                }
            }
            if(!anyEmpty){
                rowsToRemove.push(y)
            }
        }

        if(rowsToRemove.length === 0 ) {
            this.setState({running : !this.state.over})
            return
        }


        // FULL lINES, YEAH
        // => play sound, increase score, and remove lines
        // 1. play sound (the more lines, the louder)
        this.audio(SOUNDS.woosh, rowsToRemove.length / 4)
        const board = structuredClone(this.state.board)
        for(let y of rowsToRemove){
            for(let x=0; x < 10; x++){
                board[x][y] = 'x'
            }
        }
        this.setState({board})

        setTimeout(() => {
                const board = structuredClone(this.state.board)
                const score = this.state.score + SCORING.ROWS_AT_ONCE[rowsToRemove.length-1]
                let y0:number
                while(y0 = rowsToRemove.shift() as number){
                    for(let y=y0; y >= 0; y--){
                        for(let x=0; x < 10; x++){
                            board[x][y] = board[x][y-1]
                        }
                    }
                }
                const speed = SPEED_STEPS.findIndex(n => n > score)

                this.setState({board, score, speed, running:!this.state.over})
            }
            ,1000
        )
    }

    newPiece(){
        this.currentShape = this.state.nextShape ?? 'FILONS'.split('')[Math.floor(Math.random() * 6)]
        this.setState({nextShape: 'FILONS'.split('')[Date.now() % 6]})
    }

    render() {
        return (
            <div className="game-container">
                <div className="sidebar">
                    <div className="side-box text-xl">
                        <h2>High Scores</h2>
                        <ul>{
                            this.state.highscores.map((score, key) => <li key={key}>{score}</li>)
                            }</ul>
                    </div>
                </div>
                <div className="game">
                    { this.state.over && <div className="absolute text-lg z-10 bg-black text-white font-bold py-2 px-4 w-full rounded">GAME OVER</div>}
                    { this.state.started ? 
                        <FallingItem speed={this.state.speed} isRunning={() => this.state.running} newPiece={this.newPiece.bind(this)} isEmpty={this.isEmpty.bind(this)} isWithinBound={this.isWithinBound.bind(this)} fixBlock={this.fixBlock.bind(this)} shape={this.currentShape} />
                         : 
                         <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-8 rounded" onClick={this.start}>START</button>
                    }
                    { this.state.board.map((col, x) => col.map((shape, y) => 
                        shape ? <Block key={x+10*(y+1)} x={x} y={y} color={shape}/> : undefined
                    )) }
                </div>
                <div className="sidebar">
                    <div className="side-box text-xl">{ this.state.score }</div>
                    <div className="side-box h-48">
                        { this.state.nextShape && <Item shape={this.state.nextShape} x={1.5} y={1} rotation={0}/>}
                    </div>
                </div>
            </div>
        );
    }
}

export default Game