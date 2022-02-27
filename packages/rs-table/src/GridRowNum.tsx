import React, {CSSProperties} from "react";
import {GridRect, RowNumber} from "./types";
import {setUserSelect} from "./Utils";


export const createRowNumbers = (rowNumberLen: number,height: number): RowNumber[] => {
    const rowNumbers: RowNumber[] = [];
    for (let i = 1; i < rowNumberLen + 100; i++) {
        rowNumbers.push({
            index: i, height: height, highlight: false
        })
    }
    return rowNumbers;
}

type Props = {
    rowNumberLen: number
    rowNumbers: RowNumber[]
    gridRect: GridRect
    headHeight: number
    footerHeight: number
    rowNumberWidth: number
    minRowHeight: number
    scrollTop: number
    rowNumberWidthChange: (width: number) => void
    rowNumberChange:(rowNumber: RowNumber, index: number) => void
    onScrollTop: (top: number)=> void
    itemRender?: (num: number) => React.ReactNode
}

type State = {
    colResize: {left: number, show: boolean}
    rowResize: {top: number, show: boolean}
}

export class GridRowNum extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            colResize: {left: 0, show: false},
            rowResize: {top: 0, show: false}
        }
    }

    private resizePos = {start: 0, end: 0};


    private getLeftOriginPoint = (left: number): number =>{
        const {gridRect} = this.props;
        return left - gridRect.left;
    }
    private getTopOriginPoint = (left: number): number =>{
        const {gridRect} = this.props;
        return left - gridRect.top;
    }

    private colResizeHandler = (event: any) =>{
        event.stopPropagation();
        event.preventDefault();
        if(event.buttons !== 1){
            return;
        }
        const start = this.getLeftOriginPoint(event.clientX);
        this.resizePos = {
            start: start,
            end: start
        }
        this.setState({
            colResize: {show: true,left: start}
        });
        setUserSelect('none');
        // 拖拽改变
        const colResizing = (event: MouseEvent) => {
            const {colResize} = this.state;
            const {clientX} = event;
            const {end} = this.resizePos;
            const left = colResize.left + (this.getLeftOriginPoint(clientX) - end);
            this.resizePos.end = this.getLeftOriginPoint(clientX);
            this.setState({
                colResize: {...colResize,left: left}
            });
        }
        // 拖拽改变结束
        const colResizeEnd = () => {
            const {rowNumberWidthChange, rowNumberWidth, gridRect} = this.props;
            const {start, end} = this.resizePos;
            const width = Math.min(Math.max(rowNumberWidth + (end - start), 40), gridRect.width / 2);
            this.resizePos = {start: 0, end: 0};
            rowNumberWidthChange(width);
            this.setState({
                colResize: {show: false,left: 0}
            });
            setUserSelect('auto');
            window.removeEventListener('mousemove', colResizing);
            window.removeEventListener('mouseup', colResizeEnd);
        }
        window.addEventListener('mousemove', colResizing);
        window.addEventListener('mouseup', colResizeEnd);
    }

    private rowResizeHandler = (event: any, rowNumberIndex: number) =>{
        event.stopPropagation();
        event.preventDefault();
        if(event.buttons !== 1){
            return;
        }
        const start = this.getTopOriginPoint(event.clientY);
        this.resizePos = {
            start: start,
            end: start
        }
        this.setState({
            rowResize: {show: true,top: start}
        });
        setUserSelect('none');
        // 拖拽改变行高
        const rowResizing = (event: MouseEvent) => {
            const {rowResize} = this.state;
            const {clientY} = event;
            const {end} = this.resizePos;
            const top = rowResize.top + (this.getTopOriginPoint(clientY) - end);
            this.resizePos.end = this.getTopOriginPoint(clientY);
            this.setState({
                rowResize: {...rowResize,top}
            });
        }
        // 拖拽改变行高结束
        const rowResizeEnd = () =>{
            const {rowNumberChange, rowNumbers, minRowHeight} = this.props;
            const {start, end} = this.resizePos;
            const rowNumber = rowNumbers[rowNumberIndex - 1];
            rowNumber.height = Math.max(rowNumber.height + (end - start), minRowHeight);
            rowNumberChange(rowNumber, rowNumberIndex - 1);
            this.setState({
                rowResize: {show: false,top: 0}
            });
            this.resizePos = {start: 0, end: 0};
            setUserSelect('auto');
            window.removeEventListener('mousemove', rowResizing);
            window.removeEventListener('mouseup', rowResizeEnd);
        }
        window.addEventListener('mousemove', rowResizing);
        window.addEventListener('mouseup', rowResizeEnd);
    }

    private onWheel = (event: React.UIEvent<HTMLDivElement>) => {
        const {onScrollTop} = this.props;
        // @ts-ignore
        const wheelDelta = event.nativeEvent.wheelDelta;
        if (wheelDelta > 0) {
            onScrollTop(-100);
        } else {
            if(this.isWheel()){
                onScrollTop(100);
            }
        }
    }

    private isWheel = (): boolean=>{
        const {rowNumbers, rowNumberLen} = this.props;
        const nodes = document.querySelectorAll('.rs-grid-row-num-item');
        if(nodes){
            const node = nodes.item(rowNumberLen - 1);
            const bottom = document.querySelector('.rs-grid-row-num-block-bottom');
            if(node && bottom){
                const {y} = bottom.getBoundingClientRect();
                const {y: nodeY} = node.getBoundingClientRect();
                const num = rowNumbers[rowNumberLen - 1];
                if(num){
                    if(nodeY + num.height <= y){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    render() {
        const {
            gridRect ,
            headHeight,
            rowNumbers,
            scrollTop,
            rowNumberWidth,
            footerHeight,
            itemRender
        } = this.props;
        const {
            rowResize,
            colResize
        } = this.state;
        return (
            <div className={`rs-grid-row-num-main`} style={{width: rowNumberWidth - 1}}>
                <div className={`rs-grid-row-num-block`} style={{height: headHeight , width: '100%'}}>
                    <div className={`col-resize`}
                         style={{height: headHeight}}
                         onMouseDown={this.colResizeHandler}/>
                </div>
                {
                    rowResize.show ?(
                        <div className="row-resize-mark" style={{top: rowResize.top}}>
                            <div className="row-resize-dotted" style={{width: gridRect.width + rowNumberWidth}}/>
                        </div>
                    ) : ''
                }
                {
                    colResize.show ? (
                        <div className="col-resize-mark" style={{left: colResize.left}}>
                            <div className="col-resize-dotted" style={{height: gridRect.height + headHeight}}/>
                        </div>
                    ) : ''
                }
                <div className={`rs-grid-row-num-body`}
                     onWheel={this.onWheel}
                     style={{top: -scrollTop + headHeight}}>
                    {
                        rowNumbers.map(rn =>{
                            const colStyle: CSSProperties = {
                                height: rn.height - 1
                            }
                            const rowStyle: CSSProperties = {
                                width: rowNumberWidth
                            }
                            return (
                                <div key={rn.index}
                                     style={colStyle}
                                     className={`rs-grid-row-num-item`}
                                >
                                    {
                                        itemRender ? (
                                            itemRender(rn.index)
                                        ) : <div className={`rs-num-value`}>{rn.index}</div>
                                    }
                                    <div className={`col-resize`}
                                         style={colStyle}
                                         onMouseDown={this.colResizeHandler}/>
                                    <div className={`row-resize`}
                                         style={rowStyle}
                                         onMouseDown={(e) => this.rowResizeHandler(e, rn.index)}/>
                                </div>
                            )
                        })
                    }
                </div>
                <div className={`rs-grid-row-num-block-bottom`} style={{height: footerHeight + 10 , width: '100%'}}>
                    <div className={`col-resize`}
                         style={{height: headHeight}}
                         onMouseDown={this.colResizeHandler}/>
                </div>
            </div>
        );
    }
}
