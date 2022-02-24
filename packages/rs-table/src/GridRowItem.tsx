import React, {useContext} from "react";
import {GridChildComponentProps} from "react-window";
import {GridContextType} from "./types";
import {GridContext} from "./RsTable";


export const GridRowItem = React.memo((props: GridChildComponentProps) => {
    const context = useContext<GridContextType | undefined>(GridContext);
    if(!context){
        return <></>;
    }
    const {headers} = context;
    const {columnIndex, rowIndex, style, data} = props;
    // 当前表头
    const head = headers[columnIndex];
    // 值
    const value = data[rowIndex][head.dataIndex];
    const stripes = rowIndex % 2 === 0 ? 'stripes' : '';
    const top = style.top && typeof style.top === 'number'? style.top + 1 : style.top;
    return (
        <div className={`rs-grid-column ${stripes} ${head.highlight?'rs-highlight-col':' '}`}
             style={{...style,top}}
             key={`${columnIndex}-${rowIndex}`}
        >
            <div className="value">{value}</div>
        </div>
    )
})
