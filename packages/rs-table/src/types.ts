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

interface GridContextType {
    headers: Header[]
    headHeight: number
    rowLen: number
    scroll: Scroll
    onScroll: (scroll: Scroll) => void
    headItemRender?: (headers: Header)=> React.ReactNode
    emptyRender?: React.ReactNode
    updatePerfectScroll?:(updateFunc: (scroll: Scroll) => void) => void
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
    onChange?: () => void
    onPageSizeChange?: () => void
    className?: string
}

interface RsTableProps {
    headers: RsHeader[]
    rows: RsRow[]
    className?: string
    headHeight?: number
    minRowHeight?: number
    minColWidth?: number
    emptyRender?: React.ReactNode
    showColResize?: boolean
    showRowResize?: boolean
    showRowNumbers?: boolean
    pageOption?: RsPageOption | boolean
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
