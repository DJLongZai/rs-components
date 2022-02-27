import React from "react";

type Header = {
    name: string
    dataIndex: number
    width: number
    offSetLeft: number
    highlight: boolean
    data?: any
}

type RowNumber = {
    index: number
    height: number
    highlight: boolean
}
type colItemRender = (col: number, row: number,data: RsRow[], headers: Header[])=> React.ReactNode;
type headItemRender = (headers: Header)=> React.ReactNode;
interface GridContextType {
    headers: Header[]
    headHeight: number
    rowLen: number
    scroll: Scroll
    onScroll: (scroll: Scroll) => void
    updatePerfectScroll?:(updateFunc: (scroll: Scroll) => void) => void
    emptyRender?: React.ReactNode
    colItemRender?: colItemRender
    headItemRender?: headItemRender
}

type Scroll = {scrollTop:number,scrollLeft: number}

type GridRect = {width: number, height: number, top: number, left: number};

interface RsHeader {
    name: string
    data?: any
}

type RsRow = any[];

type RsPageOption = {
    current?: number
    pageSize?: number
    pageSizeOptions?: number[]
    total?: number
    onChange?: (page: number, size: number) => void
    onPageSizeChange?: (page: number, size: number) => void
    className?: string
}

type RsRowNum = {
    className?: string
    render?: () => React.ReactNode
}

interface RsTableProps {
    headers: RsHeader[]
    rows: RsRow[]
    className?: string
    headHeight?: number
    minRowHeight?: number
    minColWidth?: number
    showColResize?: boolean
    showRowResize?: boolean
    showRowNumbers?: boolean
    rowNum?: RsRowNum | boolean
    pageOption?: RsPageOption | boolean
    emptyRender?: React.ReactNode
    colItemRender?: colItemRender
    headItemRender?: headItemRender
}

export type {
    GridContextType,
    GridRect,
    Header,
    RowNumber,
    Scroll,
    RsTableProps,
    RsHeader,
    RsRow,
    RsPageOption
}
