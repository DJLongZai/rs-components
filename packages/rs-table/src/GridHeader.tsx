import React from "react";
import {GridContextType, GridRect, Header, RsHeader, Scroll} from "./types";
import {setUserSelect} from "./Utils";

export const initTableHeadData = (headers: RsHeader[], width: number, minHeadWidth = 100): Header[] =>{
    const residual = width % headers.length;
    const headWidth = Math.max((width - residual) / headers.length, minHeadWidth);
    let offSetLeft = 0;
    return headers.map((h, index) =>{
        const hasLast = headers.length - 1 === index;
        const head: Header = {
            name: h.name,
            width: hasLast ? headWidth + residual : headWidth,
            dataIndex: index,
            offSetLeft: offSetLeft,
            highlight: false,
            data: h.data
        };
        offSetLeft += headWidth;
        return head;
    });
}

enum Draggable {
    TRUE='true',FALSE='false'
}

type ColResize = {
    colIndex?: number
    show: boolean
    startLeft: number
    lastLeft: number
    left: number
}

type Props =  GridContextType &{
    showColResize?: boolean
    gridRect: GridRect
    scroll: Scroll
    rowNumberWidth: number
    minHeadWidth: number
    sort:(colIndex1: number, colIndex2: number) => void
    changeWidth:(colIndex: number, offset: number) => void
    highlight: (colIndex?: number) => void
}
type State = {
    colResize: ColResize
}

export class GridHeader extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            colResize: {...this.delColResize}
        }
    }
    private readonly delColResize: ColResize = {show: false, left: 0, startLeft: 0, lastLeft: 0};

    // 当前拖拽排序索引
    private currentColSortIndex?: number;
    // 当前高亮列索引
    private currentColHighlightIndex?: number;

    private setColResize = (colResize: ColResize) =>{
        this.setState({colResize: colResize})
    }

    private getLeftOriginPoint = (left: number): number =>{
        const {gridRect, rowNumberWidth} = this.props;
        return left - gridRect.left - rowNumberWidth;
    }

    private colResizeStart = (event: any, colIndex: number) => {
        if(event.buttons !== 1){
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        const start = this.getLeftOriginPoint(event.clientX) - 3;
        this.setColResize({
            colIndex: colIndex,
            show: true,
            left: start,
            startLeft: start,
            lastLeft: start
        });
        const colResizing = (event: MouseEvent) => {
            const {colResize} = this.state;
            const {lastLeft, left} = colResize;
            const clientX = event.clientX - 3;
            const _left = left + this.getLeftOriginPoint(clientX - lastLeft);
            this.setColResize({
                ...colResize,
                left: _left,
                lastLeft: this.getLeftOriginPoint(clientX)
            });
        }
        const colResizeEnd = () => {
            const {colResize} = this.state;
            const {changeWidth} = this.props;
            const width = colResize.lastLeft - colResize.startLeft;
            if(typeof colResize.colIndex != 'undefined'){
                changeWidth(colResize.colIndex,width);
            }
            this.setColResize({...this.delColResize});
            setUserSelect('auto');
            window.removeEventListener('mousemove', colResizing);
            window.removeEventListener('mouseup', colResizeEnd);
        }
        setUserSelect('none');
        window.addEventListener('mousemove', colResizing);
        window.addEventListener('mouseup', colResizeEnd);
    }

    private colSortStart = (event: any, index: number)=>{
        if(event.buttons !== 1){
            return;
        }
        setUserSelect('none');
        this.currentColSortIndex = index;
    }

    private colSorting = (ev: React.DragEvent,colIndex: number) =>{
        const {highlight} = this.props;
        ev.stopPropagation();
        ev.preventDefault();
        if(this.currentColSortIndex !== colIndex && this.currentColHighlightIndex !== colIndex){
            highlight(colIndex);
        }
        this.currentColHighlightIndex = colIndex;
    }

    private colSortEnd = (dropIndex: number) => {
        const {sort} = this.props;
        if(typeof this.currentColSortIndex != 'undefined' && this.currentColSortIndex !== dropIndex){
            sort(this.currentColSortIndex,dropIndex);
        }
        setUserSelect('auto');
    }

    private highlight = (colIndex: number)=>{
        const {highlight} = this.props;
        if(this.currentColHighlightIndex !== colIndex){
            highlight(colIndex);
            this.currentColHighlightIndex = colIndex;
        }else{
            highlight();
            this.currentColHighlightIndex = undefined;
        }
    }

    render() {
        const {
            gridRect,
            headers,
            headItemRender,
            headHeight,
            scroll
        } = this.props;
        const {colResize} = this.state;
        // 头样式
        const headStyle = { height: headHeight,left: -scroll.scrollLeft};
        return (
            <div className="rs-grid-header" style={headStyle}>
                {
                    headers.map((item,index) => {
                        // 最后一列
                        const lastCol = headers.length - 1 === index;
                        const width = item.width - 1;
                        return (
                            <div className="rs-grid-header-body"
                                 style={{height: headHeight, width: width}}
                                 onClick={() => this.highlight(index)}
                                 key={item.name + index}>
                                <div onDragStart={(e) => this.colSortStart(e,index)}
                                     onDragOver={(e) => this.colSorting(e,index)}
                                     onDrop={() => this.colSortEnd(index)}
                                     draggable={Draggable.TRUE}
                                     className='rs-grid-draggable'>
                                    {
                                        headItemRender ? (
                                            headItemRender(item)
                                        ) :(
                                            <span className="rs-grid-title">{item.name}</span>
                                        )
                                    }
                                </div>
                                <div className={`col-resize ${lastCol?'lastCol':''}`}
                                     style={{height: headHeight}}
                                     onMouseDown={(e) => this.colResizeStart(e, index)}>
                                    <span/>
                                </div>
                            </div>
                        )
                    })
                }
                {
                    colResize.show? (
                        <div className="col-resize-mark" style={{left: colResize.left}}>
                            <div className="col-resize-span" style={{height: headHeight}}/>
                            <div className="col-resize-dotted" style={{height: gridRect.height,top: headHeight}}/>
                        </div>
                    ): ''
                }
            </div>
        );
    }
}
