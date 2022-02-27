import "./style.scss";
import 'react-perfect-scrollbar/dist/css/styles.css';
import React from "react";
import ResizeObserver from 'rc-resize-observer';
import {VariableSizeGrid} from 'react-window';
import PerfectScroll from "react-perfect-scrollbar";

import {GridContextType, GridRect, Header, RowNumber, RsTableProps, Scroll} from "./types";
import {UUID} from "./Utils";
import {GridHeader, initTableHeadData} from "./GridHeader";
import {GridRowItem} from "./GridRowItem";
import {createRowNumbers, GridRowNum} from "./GridRowNum";
import {GridPagination} from "./GridPagination";

export const GridContext = React.createContext<GridContextType | undefined>(undefined);

type State = {
    headers: Header[]
    gridRect: GridRect
    scroll: Scroll
    rowNumberWidth: number
    rowNumbers: RowNumber[]
}

export class RsTable extends React.Component<RsTableProps, State>{

    constructor(props: RsTableProps) {
        super(props);
        this.state = this.initState(props);
    }

    private readonly gridId = `rs-grid-${UUID()}`;
    private gridEle: Element | null = null;
    private readonly defColWidth = 100;
    private readonly defHeadHeight = 40;
    private readonly defRowHeight = 30;
    private readonly paginationHeight = 42;
    // 滚动条手动更新
    private updatePerfectScroll?: (scroll: Scroll) => void

    // 表格实例
    private variableSizeGridRef = React.createRef<VariableSizeGrid>();

    private initState = (props: RsTableProps): State =>{
        // 不显示行号
        const rowNumberWidth = this.showRowNum() ? 40 : 0;
        return {
            headers: [],
            gridRect: {width: 0, height: 0, left: 0, top: 0},
            scroll: {scrollTop: 0, scrollLeft: 0},
            rowNumbers: createRowNumbers(props.rows.length, props.minRowHeight || this.defRowHeight),
            rowNumberWidth
        }
    }

    private getKey = (): string => {
        const {rowNumbers, headers} = this.state;
        return headers.reduce((sum, item) => sum + item.width + item.name, '') +
                rowNumbers.reduce((k,r)=> k + r.height,'');
    }

    //
    private getHeadHeight = () =>{
        return this.props.headHeight || this.defHeadHeight;
    }

    // 获取列宽
    private getColWidth = (index: number): number => {
        const {headers} = this.state;
        return headers[index].width;
    }

    // 获取列高
    private getColHeight = (index: number): number => {
        const {rowNumbers} = this.state;
        return rowNumbers[index].height;
    }

    private gridResize = () =>{
        const {headers} = this.props;
        const {headers: stateHeaders, rowNumberWidth} = this.state;
        const rsHeaders = stateHeaders.length > 0? stateHeaders : headers;
        if(!this.gridEle){
            this.gridEle = document.querySelector(`#${this.gridId}`);
        }
        if(this.gridEle){
            const {width, height, top, left} = this.gridEle.getBoundingClientRect();
            // 重置表格
            this.setState({
                gridRect: {
                    width: width - rowNumberWidth,
                    height: height - this.getHeadHeight() - (this.showPage() ? this.paginationHeight : 0),
                    top,
                    left
                },
                headers: initTableHeadData(rsHeaders, width)
            });
        }
    }

    private onScroll = (scroll?: Scroll): void => {
        if(scroll){
            this.variableSizeGridRef.current?.scrollTo(scroll);
            this.setState({
                scroll: scroll
            });
        }else{
            const {scroll} = this.state;
            this.variableSizeGridRef.current?.scrollTo(scroll);
        }
    }

    private changeHeadWidth = (colIndex: number, offset: number)=>{
        const {minColWidth} = this.props;
        const {headers} = this.state;
        const find = headers.find((e,index) => index === colIndex);
        if(find){
            find.width = Math.max(find.width + offset , minColWidth || this.defColWidth);
            this.setState({
                headers: [...headers]
            }, ()=>{
                this.onScroll();
            })
        }
    }

    private headSort = (colIndex1: number, colIndex2: number)=>{
        const {headers} = this.state;
        headers.forEach(h=> h.highlight = false);
        const col = headers.splice(colIndex1,1,headers[colIndex2])[0];
        headers.splice(colIndex2, 1, col);
        headers.forEach(e => e.highlight = false);
        this.setState({
            headers: [...headers]
        });
    }

    private highlightCol = (colIndex?: number) =>{
        const {headers} = this.state;
        headers.forEach((h,i) =>{
            h.highlight = colIndex === i;
        });
        this.setState({
            headers: [...headers]
        });
    }

    private rowNumberWidthChange = (_width: number) =>{
        this.setState({
            rowNumberWidth: _width
        }, () =>{
            if(this.gridEle){
                const {gridRect} = this.state;
                const {width} = this.gridEle.getBoundingClientRect();
                this.setState({
                    gridRect: {
                        ...gridRect,
                        width: width - _width
                    }
                })
            }
        })
    }

    private rowNumberChange = (rowNumber: RowNumber, index: number) =>{
        const {rowNumbers} = this.state;
        rowNumbers[index] = rowNumber;
        this.setState({
            rowNumbers: [...rowNumbers]
        }, ()=>{
            this.onScroll();
        });
    }

    private getMaxScrollTop = (): number =>{
        const {rowNumbers, gridRect} = this.state;
        const colAllHeight = rowNumbers.reduce((colAllHeight, rowNumber) =>{
            return colAllHeight + rowNumber.height;
        }, 0);
        return colAllHeight - gridRect.height;
    }

    private onScrollTop = (top: number)=>{
        const {scroll} = this.state;
        let _top = scroll.scrollTop;
        if(top > 0){
            _top += top;
            _top = Math.min(this.getMaxScrollTop(), _top)
        }else {
            if(_top > 0){
                _top = Math.max(_top + top,0);
            }
        }
        if(_top === scroll.scrollTop){
            return;
        }
        this.setState({
            scroll: {...scroll,scrollTop: _top}
        }, ()=>{
            const {scroll} = this.state;
            this.variableSizeGridRef.current?.scrollTo(scroll);
            this.updatePerfectScroll?.(scroll)
        });
    }

    //
    private showPage = (): boolean =>{
        const {pageOption} = this.props;
        return !(pageOption === false);
    }

    private showRowNum = (): boolean =>{
        const {rowNum} = this.props;
        return !(rowNum === false);
    }

    render() {
        const {
            minRowHeight,
            minColWidth,
            rows,
            pageOption,
            colItemRender,
            headItemRender,
            emptyRender
        } = this.props;
        const {
            headers,
            scroll,
            gridRect,
            rowNumbers,
            rowNumberWidth
        } = this.state;
        const contextValue: GridContextType = {
            headers: headers,
            onScroll: this.onScroll,
            headHeight: this.getHeadHeight(),
            rowLen: rows.length,
            scroll: scroll,
            updatePerfectScroll: (updateFunc) =>{
                this.updatePerfectScroll = updateFunc
            },
            colItemRender: colItemRender,
            headItemRender: headItemRender,
            emptyRender: emptyRender
        }
        return (
            <ResizeObserver onResize={this.gridResize}>
                <div id={this.gridId} className={`rs-grid-main`}>
                    {
                      this.showRowNum() ? (
                          <GridRowNum headHeight={this.getHeadHeight()}
                                      scrollTop={scroll.scrollTop}
                                      gridRect={gridRect}
                                      onScrollTop={this.onScrollTop}
                                      rowNumberChange={this.rowNumberChange}
                                      rowNumberWidth={rowNumberWidth}
                                      minRowHeight={minRowHeight || this.defRowHeight}
                                      footerHeight={this.showPage() ? this.paginationHeight : 0}
                                      rowNumberWidthChange={this.rowNumberWidthChange}
                                      rowNumberLen={rows.length}
                                      rowNumbers={rowNumbers}/>
                      ) : ''
                    }
                    <div className="rs-grid-context" style={{width: `calc(100% - ${rowNumberWidth}px)`}}>
                        <GridHeader {...contextValue}
                                    gridRect={gridRect}
                                    minHeadWidth={minColWidth || this.defHeadHeight}
                                    rowNumberWidth={rowNumberWidth}
                                    sort={this.headSort}
                                    scroll={scroll}
                                    highlight={this.highlightCol}
                                    changeWidth={this.changeHeadWidth}/>
                        <div style={{height: this.getHeadHeight(), width: 1}}/>
                        <GridContext.Provider value={contextValue}>
                            <VariableSizeGrid
                                className='rs-variable-size-grid'
                                columnCount={headers.length}
                                {...gridRect}
                                ref={this.variableSizeGridRef}
                                rowCount={rows.length}
                                rowHeight={this.getColHeight}
                                columnWidth={this.getColWidth}
                                innerElementType={InnerGridElement}
                                itemData={rows}
                                key={this.getKey()}
                            >
                                {GridRowItem}
                            </VariableSizeGrid>
                        </GridContext.Provider>
                        {
                            this.showPage() ? (
                                <GridPagination height={this.paginationHeight} {...pageOption}/>
                            ) : ''
                        }
                    </div>
                </div>
            </ResizeObserver>
        );
    }
}

type InnerGridElementProps = {
    style: any
    children?: React.ReactNode
}



const Empty = () =>{
    return (
        <div>
            kong
        </div>
    )
}

class InnerGridElement extends React.Component<InnerGridElementProps, any>{

    static contextType = GridContext;
    private perfectScroll = React.createRef<PerfectScroll>();
    private perfectScrollContainerRef: HTMLElement | null = null;

    componentDidMount() {
        const {scroll} = this.context as GridContextType;
        this.updateScroll(scroll)
    }

    private updateScroll = (scroll: Scroll) =>{
        const {updatePerfectScroll} = this.context as GridContextType;
        this.perfectScrollContainerRef?.scrollTo(scroll.scrollLeft, scroll.scrollTop);
        this.perfectScroll.current?.updateScroll();
        updatePerfectScroll?.(this.updateScroll)

    }

    private _onScroll = (event: any) => {
        const {onScroll} = this.context as GridContextType;
        onScroll({
            scrollTop: event.target.scrollTop,
            scrollLeft: event.target.scrollLeft
        })
    }

    render() {
        const {headers, rowLen, emptyRender} = this.context as GridContextType;
        const {children, style} = this.props;
        // 表容器样式
        const containerStyle = {
            width: style.width + 5,
            height: style.height + 15,
        }
        const gridWidth = headers.reduce((width, head) => {
            return width + head.width
        },0);
        return (
            <>
                {
                    rowLen === 0?(emptyRender||<Empty />): (
                        <>
                            <PerfectScroll ref={this.perfectScroll}
                                           containerRef={(e)=> this.perfectScrollContainerRef = e}
                                           options={{
                                               minScrollbarLength: 80,
                                               wheelSpeed: 0.5
                                           }}
                                           onScroll={this._onScroll}>
                                <div className={'rs-grid-inner'}
                                     style={{
                                         ...containerStyle,
                                         width: rowLen === 0 ? '100%' : gridWidth
                                     }}>
                                    <div className={'rs-grid-data-container'}>
                                        {children}
                                    </div>
                                </div>
                            </PerfectScroll>
                        </>
                    )}
            </>
        );
    }
}
