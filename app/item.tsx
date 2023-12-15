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

function Item(props:MyProps) {
    const matrix = itemsRotations[props.shape][props.rotation]

    return (
      <div className="item">
        { matrix.map((col, x) => 
            col.map((cellHasBlock, y) => cellHasBlock ? <Block key={x+10*(y+1)} x={x + props.x} y={y + props.y} color={props.shape}/> : undefined)
        ) }
      </div>
    );
}

export default Item