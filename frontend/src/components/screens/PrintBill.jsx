import React from 'react'

const PrintBill = ({data}) => {

 return (
    <div>
      <div>
        {data.map((item,index)=>(<div key={index}>
          <h1>{item.itemName}</h1>


        </div>))}
        <h1>Tabel</h1>
      </div>
    </div>
  )
}

export default PrintBill