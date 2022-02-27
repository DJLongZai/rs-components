import React from "react";
import {RsTable} from "@rs-components/rs-table";

function App() {
      const heads = new Array(30).fill(0).map((i,index)=> {
          return {name: 'a'+index}
      });
    const row = new Array(100).fill(0).map((i1,index1)=> {
        return new Array(30).fill(0).map((i,index)=> {
            return ''+index1+'-'+index
        });
    });
    return (
        <div className="App">
            <div style={{width: 100,height: 100}}/>
            <RsTable headers={heads} rows={row} pageOption={false} rowNum={true}/>
        </div>
    )
}

export default App;
