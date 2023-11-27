'use client'

import React from "react";
import Block from './block'
import itemsRotations from './common/shapes'

type MyProps = {
  shape: string;
  x: number;
  y: number;
  rotation: number; /* 0 to 3 (* 90°) */
}

// some overloaded type hints, for IDE mostly
class Item extends React.Component<MyProps> {
    constructor(props:MyProps) {
      super(props);
    }
  
    render() {
      const matrix = itemsRotations[this.props.shape][this.props.rotation]

      return (
        <div className="item">
          { matrix.map((col, x) => 
              col.map((cellHasBlock, y) => cellHasBlock ? <Block key={x+10*(y+1)} x={x + this.props.x} y={y + this.props.y} color={this.props.shape}/> : undefined)
          ) }
        </div>
      );
    }
  }

export default Item