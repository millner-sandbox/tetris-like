'use client'


type BlockProps = {
    x: number;
    y: number;
    color: string;
}

export default function Block({ x, y, color }: BlockProps) {

    const style = {
        "left": `calc(var(--cell-size) * ${x})`,
        "top": `calc(var(--cell-size) * ${y})`,
    }

    return (
        <div className="block" style={style} data-color={color}></div>
    )
}