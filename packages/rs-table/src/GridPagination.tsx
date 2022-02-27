
import "./style.scss";
import React, {useEffect, useRef, useState} from "react";
import ResizeObserver from 'rc-resize-observer';

import {RsPageOption} from "./types";

type PageOption = RsPageOption & {
    height: number
}
const pageOptionDef: { current: number; pageSizeOptions: number[]; pageSize: number; total: number } = {
    current: 1,
    pageSize: 30,
    pageSizeOptions: [30,50,80,100],
    total: 0
}

export const GridPagination = (props: PageOption) => {
    const {height} = props;
    // options
    const pageSizeOptions = props.pageSizeOptions || pageOptionDef.pageSizeOptions;
    const firstPage = 1;
    const [lastPage, setLastPage] = useState<number>(0);
    useEffect(() =>{
        const pageSize = props.pageSize || pageOptionDef.pageSize;
        const total = props.total || pageOptionDef.total;
        if(total != 0){
            setLastPage(() => Math.ceil(total / pageSize));
        }else{
            setLastPage(() => 0);
        }
    }, [props.pageSize, props.total]);
    // 页码
    const [pageNumbers, setPageNumbers] = useState<number[]>([]);
    useEffect(() =>{
        const _pageNumbers: number[] = [];
        const pageSize = props.pageSize || pageOptionDef.pageSize;
        const total = props.total || pageOptionDef.total;
        if(total != 0){
            const pages = Math.ceil(total / pageSize);
            for (let i = 1; i < pages + 1; i++) {
                _pageNumbers.push(i)
            }
        }
        setPageNumbers(() => _pageNumbers);
    }, [props.pageSize, props.total]);
    // 当前页
    const [current, setCurrent] = useState<number>(props.current || pageOptionDef.current);
    useEffect(() =>{
        setCurrent(() => props.current || pageOptionDef.current)
    }, [props.current]);
    // 每页条数
    const [pageSize, setPageSize] = useState<number>(props.pageSize || pageOptionDef.pageSize);
    useEffect(() =>{
        setPageSize(() => props.pageSize || pageOptionDef.pageSize)
    }, [props.pageSize]);
    const onChange = (page: number, pageSize: number) =>{
        setCurrent(page);
        props.onChange?.(page, pageSize)
    }
    // 上一页
    const prev = () =>{
        if(current - 1 > 1){
            onChange(current - 1 , pageSize);
        }
    }
    // 下一页
    const next = () =>{
        if(current + 1 < lastPage){
            onChange(current + 1 , pageSize);
        }
    }
    // 固定页
    const changePage = (page: number) =>{
        onChange(page, pageSize);
    }
    // 上一页 禁用
    const prevDisabled = (): boolean => {
        return current <= firstPage;
    }
    // 下一页 禁用
    const nextDisabled = (): boolean => {
        return current >= lastPage;
    }

    // 是否是当前页
    const isCurrent = (page: number): boolean => current === page;

    // 开始五页
    const firstFivePage = (): boolean => current < 5;
    // 最后五页
    const lastFivePage = (): boolean => current >= lastPage - 2;
    // 向前5页
    const prevFivePage = () => {
        if(current - 5 >= 1){
            onChange(current - 5, pageSize);
        } else{
            onChange(1, pageSize);
        }
    }
    // 向后5页
    const nextFivePage = () => {
        if(current + 5 <= lastPage){
            onChange(current + 5, pageSize);
        } else{
            onChange(lastPage, pageSize);
        }
    }

    const changePageSize = (v: number) => {
        props.onPageSizeChange?.(current, v);
    }

    return (
        <ul className={`rs-pagination ${props.className || ''}`}
            style={{height}}>
            <li className={`rs-pagination-prev rs-page-button ${prevDisabled()? 'disabled-prev':''}`}
                onClick={prev}
                title="上一页">
                <span>∟</span>
            </li>
            {
                !firstFivePage() ? (
                    <>
                        <li className={`rs-pagination-first rs-page-button ${isCurrent(firstPage) ? 'current':''}`}
                            onClick={()=> changePage(firstPage)}>
                            1
                        </li>
                        <li className={`rs-pagination-jump-prev rs-page-button `}
                            onClick={prevFivePage}
                            title="向后5页">
                            <span className="ellipsis">...</span>
                            <span className="arrowheads">{'<<'}</span>
                        </li>
                    </>
                ) : ''
            }
            {
                pageNumbers.map(page =>{
                    let show = page <= current + 2 && page >= current - 2;
                    if(firstFivePage()){
                        show = page <= 5;
                    }
                    if(lastFivePage()){
                        show = page > lastPage - 5;
                    }
                    return show ? (
                        (
                            <li className={`rs-pagination-page-num rs-page-button ${isCurrent(page) ? 'current':''}`}
                                key={page}
                                onClick={()=> changePage(page)}>
                                {page}
                            </li>
                        )
                    ) : ''
                })
            }
            {
                !lastFivePage() ? (
                    <>
                        <li className={`rs-pagination-jump-next rs-page-button `}
                            onClick={nextFivePage}
                            title="向前5页">
                            <span className="ellipsis">...</span>
                            <span className="arrowheads">{'>>'}</span>
                        </li>
                        <li className={`rs-pagination-last rs-page-button ${isCurrent(lastPage) ? 'current' : ''}`}
                            onClick={() => changePage(lastPage)}>
                            {lastPage}
                        </li>
                    </>
                ) : ''
            }
            <li className={`rs-pagination-next rs-page-button ${nextDisabled()? 'disabled-next':''}`}
                onClick={next}
                title="下一页">
                <span>∟</span>
            </li>
            <li className="dropdown-pages">
                <Select defValue={pageSize} options={pageSizeOptions} onChange={changePageSize}/>
            </li>
        </ul>
    )
}

const Select = (props: {defValue: number,options: number[], onChange: (size: number)=> void}) =>{
    const [value, setValue] = useState<number>(props.defValue);
    const [open, setOpen] = useState<boolean>(false);
    const [selectorWidth, setSelectorWidth] = useState<number>(80);
    const [defDropDownY, setDefDropDownY] = useState<number>(0);
    const [dropDownTop, setDropDownTop] = useState<number>(0);
    const dropDownRef = useRef<HTMLDivElement>(null);

    const onChange = (v: number) => {
        setValue(v);
        setOpen(false);
        props.onChange(v);
    }

    const onVisibility = () => {
        setOpen( v =>{
            if(v){
                return false;
            }else {
                if(dropDownRef.current){
                    const {height} = dropDownRef.current.getBoundingClientRect();
                    setDropDownTop(defDropDownY - height - 5);
                }
                const _setOpen = (event: MouseEvent) => {
                    // @ts-ignore
                    if(event.target.className !== 'rs-select-selector'){
                        setOpen(false);
                    }
                    document.body.removeEventListener('mouseup', _setOpen);
                }
                document.body.addEventListener('mouseup', _setOpen);
                return true;
            }
        });
    }

    const onResize = (event: {width: number}, ele: HTMLElement) => {
        setSelectorWidth(event.width);
        setDefDropDownY(ele.offsetTop);
    }

    return (
        <ResizeObserver onResize={onResize}>
            <div className="rs-select" style={{minWidth: 80}}>
                <div className="rs-select-selector" onClick={onVisibility}>
                    <div className="rs-select-selector-value">
                        {value}
                    </div>
                    <div className="rs-select-selector-icon">
                        <span>∟</span>
                    </div>
                </div>
                <div className="rs-select-dropdown"
                     ref={dropDownRef}
                     style={{width: selectorWidth, top: dropDownTop, opacity: open ? 1 : 0, zIndex: open ? 1 : -1}}>
                    {
                        props.options.map(item =>{
                            return (
                                <div className={`rs-select-dropdown-item ${item === value? 'rs-selected' : ''}`}
                                     key={item}
                                     onClick={()=> onChange(item)}>
                                    {item}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </ResizeObserver>
    )
}
