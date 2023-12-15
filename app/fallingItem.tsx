'use client'

import React from "react";
import Item from './item'
import itemsRotations from './common/shapes'
import Queue from "./common/queue";

type MyProps = {
  shape: string;
  speed: number;
  isRunning: Function;
  isWithinBound: Function;
  isEmpty: Function;
  fixBlock: Function;
  newPiece: Function;
}

type MyState = {
  x: number;
  y: number;
  rotation: number;
}

type Position = Pick<MyState, 'x'|'y'|'rotation'>

const startingPoint = {x:4, y:0, rotation:0} as Position

let currentItem:FallingItem
if(typeof document !== 'undefined'){
  document.addEventListener('keydown', event => {
    if(!currentItem) return
    const move = currentItem.move.bind(currentItem)
    switch (event.key) {
      case "ArrowDown":
        move({ y: currentItem.state.y + 1 })
        break;
      case "ArrowUp":
        move({ rotation: (currentItem.state.rotation + 1) % 4 })
        break;
      case "ArrowLeft":
        move({ x: currentItem.state.x - 1 })
        break;
      case "ArrowRight":
        move({ x: currentItem.state.x + 1 })
        break;
      case " ":
        for(let y=currentItem.state.y+1; y<20; y++){
          currentItem.moveQueue.push(() => move({ y }, true))
        }
        break;
      default:
        return;
    }

    event.preventDefault();
  })
}

// some overloaded type hints, for IDE mostly
class FallingItem extends React.Component<MyProps, MyState> {
  matrix!: Array<Array<boolean>>;
  rotations!: Array<Array<Array<boolean>>>;
  timerID: ReturnType<typeof setTimeout> | undefined;
  lastTick: number;
  moveQueue: Queue;

  constructor(props: MyProps) {
    super(props);
    this.moveQueue = new Queue
    this.lastTick = Date.now(),


    this.state = {
      ...startingPoint
    }
    this.addKeyboardControls()
  }

  addKeyboardControls = () => {
    currentItem = this
  }

  startFresh(){
    if(!this.props.isRunning()) return
    this.props.newPiece()
    this.setState(startingPoint)
  }


  // move IF POSSIBLE
  move(nextPosition: Partial<Position>, preventFix=false) {
    // the game gets paused while lines are removed
    if(!this.props.isRunning()) return false

    const { x=this.state.x, y=this.state.y, rotation=this.state.rotation } = nextPosition
    const matrix = itemsRotations[this.props.shape][rotation]

    // check if any block is in an impossible position (occupied or out of bound)
    const isImpossible = matrix.some((col, block_x) => 
      col.some((block, block_y) => !!block && (
        !this.props.isWithinBound(x + block_x, y + block_y) || !this.props.isEmpty(x + block_x, y + block_y))
      )
    )

    // if impossible, different effects depending on move
    if(isImpossible){
      // Going down? time to let that piece rest and start fresh
      if(y && y > this.state.y){
        // forget about next moves if any
        this.moveQueue.clear()
        // using y-1 instead of state because in fast fall (space bar) states maybe "late"
        // you can prevent fixing, mostly for "fast drop" to allow last minute changes
        if(!preventFix){
          this.props.fixBlock(this.state.x, y-1, this.props.shape, matrix)        
          // if y is 0, you just lost the game, otherwise, another piece goes down
          if(y > 0){
            this.startFresh()
          }
        }
      }
      return false
    }

    // apply new position
    this.setState(state => nextPosition as Position)
    return true
  }

  // setup a timer with high frequency
  // that way we can deal with multiple speeds
  componentDidMount() {
    this.timerID = setInterval(
        () => this.tick(),
        50
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    const now = Date.now()
    if(now - this.lastTick < 1000 / this.props.speed) return
    this.lastTick = now
    this.move({ y: this.state.y + 1 })
  }

  render() {
    return (
      <Item shape={this.props.shape} x={this.state.x} y={this.state.y} rotation={this.state.rotation} />
    );
  }
}

export default FallingItem