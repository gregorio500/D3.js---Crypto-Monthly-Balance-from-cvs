const parseDate = d3.timeParse("%m/%y");
const month = d3.timeFormat("%B");
const year = d3.timeFormat("%Y");

let itr = 1;

next = () => {
  let n;
  n = itr % 4; 
  itr++;
  return n;
}

back = () => {
  let n;
  n = itr % 4;
  itr == 0 ? itr = 4 : 1; 
  itr--;
  return n;
}


// chart
const svg = d3.select('.bar-chart')
  .append('svg')
  .attr('width', 400)
  .attr('height', 200)

const margin = { top: 0, right: 0, bottom: 60, left: 80 };
const graphWidth =  200 - margin.left - margin.right;
const graphHeight = 200 - margin.top - margin.bottom;

const graph =  svg.append('g')
  .attr('width', graphWidth )
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);
const xAxisGroup = graph.append('g')
    .attr('transform', `translate(0, ${graphHeight})`)
const yAxisGroup = graph.append('g')

const x = d3.scaleBand()
  .range([0, 300])
  .paddingInner(0.2)
  .paddingOuter(1)
const y = d3.scaleLinear()
  .range([graphHeight, 0])
const xAxis = d3.axisBottom(x)
const yAxis = d3.axisLeft(y)
  .ticks(2)
  .tickFormat(d =>  d + ' sum');  //sumOfMonth[0].values[0].month


const widthTween = (d) => {
  let i = d3.interpolate(0, x.bandwidth());
    return function(t) {
        return i(t);
        }
      }  
// end chart

//pie chart
const dims = { width: 200, height: 200, radius: 100 }
const cent = { x: (dims.width /2 ), y: (dims.height / 2 ) }  

const svgPie = d3.select('.pie-chart')
    .append('svg')
    .attr('width', dims.width+200)
    .attr('height', dims.height)
    .attr('transform', `translate(${0}, 0)`)

const graphPie = svgPie.append('g')
    .attr('transform', `translate(${cent.x}, ${cent.y})`)  

const pie = d3.pie()  //this is responsible for an angle
    .sort(null)
    .value(d => d.value.sum)

const arcPath = d3.arc()   //this is resposible for a path
    .outerRadius(dims.radius)
    .innerRadius(dims.radius/2)


const arcTweenStart = (d) => {
  let i = d3.interpolate(d.endAngle, d.startAngle);
    return function(t) {
        d.startAngle = i(t);
        return arcPath(d)
    }
  };
  
  
  const arcTweenEnd = (d) => {
      let i = d3.interpolate(d.startAngle, d.endAngle);
    
      return function(t) {
          d.startAngle = i(t);
          return arcPath(d)
      }
  };
  
  function arcUpdateTween(d) {
      
      let i = d3.interpolate(this._current, d);
      this._current = i(1);
      
      return function(t) {
          return arcPath(i(t))
      }
  };
// end pie


//start table

const table = d3.select(".tab").append("table");
const thead = table.append("thead");
let tbody = table.append("tbody");

const columns = ["rank", "balance_ETH"];
thead.append("tr")
  .selectAll("th")
  .data(columns)
  .enter()
  .append("th")
  .text(function(column) { return column.charAt(0).toUpperCase() + column.substr(1).replace(/_/g, " "); });

//end table

///////////////////////////
//// Update all values ////    
///////////////////////////

const update = (data) => {

  const colorsChart = d3.scaleLinear()
    .domain([0, data.length *0.33,
              data.length *0.66,
              data.length 
    ])
    .range(['rgb(38, 170, 208)', 'rgb(82,131, 245)', 'rgb(135, 71, 247' ]);
  x.domain(data.map(item => item.month));   
  y.domain([0, d3.max(data, d => d.value.sum )]);

const rects = graph.selectAll('rect')
  .data(data);

rects.exit().remove();

rects.attr('height', 0)
  .attr('width', x.bandwidth)
  .attr('x', (d,i) => x(d.month))
  .attr('y', graphHeight) 

rects.enter()
  .append('rect')
  .attr('height', 0)
  .attr('width', x.bandwidth)
  .attr('x', (d,i) => x(d.month))
  .attr('y', graphHeight)  //start the position for each bar from the bottom
  .merge(rects)
  .transition().duration(1000)
      .attrTween('width', widthTween)
      .attr('height', d => graphHeight - y(d.value.sum))
      .attr('y', d =>  y(d.value.sum))
      .attr('fill', (d,i) => colorsChart(i)) 
      .delay(function(d,i) { return i*50; })
      .ease(d3.easeQuad)

      
xAxisGroup.call(xAxis);
yAxisGroup.call(yAxis);

xAxisGroup.selectAll('text')  //must be below a call function to select all text
.attr('transform', 'rotate(-45)')
.attr('text-anchor', 'end');

///end chart


// Start pie update
 
  const color2 = d3.scaleLinear()
    .domain([0, data.length *0.33,
              data.length *0.66,
              data.length 
    ])
    .range(['rgb(38, 170, 208)', 'rgb(82,131, 245)', 'rgb(135, 71, 247' ]);



let legend = graphPie.selectAll('rect')
    .data(data)

legend
  .enter()
  .append('rect')
  //.merge(legend)
  .attr('class', 'legend-entry')
  .attr("transform", function(d, i) { return `translate(${210}, ${-90})`; })
  .attr('x', 0)
  .attr('y', function (d, i) { return i * 15 })
  .attr('width', 30)
  .attr('height', 7)
  .attr('fill', function (d, i) {
    return color2(i)
   })

legend.exit().remove();

let textLegend = graphPie.selectAll('text')
  .data(data)
  
  textLegend.enter()
  .append('text')
  .merge(textLegend)
  .attr('x', 0)
  .attr('y', function (d, i) { return i * 15 })
  .attr("transform", function(d, i) { return `translate(${250}, ${-83})`; })
  .style('font-size', '.6rem')
  .style('font-family', 'Arial')
  .text(function(d) { return parseInt(d.value.sum); });
  
  textLegend.exit().remove();

    //end legend update
   
const paths = graphPie.selectAll('path')
    .data(pie(data));

paths.exit()
    .transition().duration(1600)
    .attrTween('d', arcTweenEnd)
    .remove();


paths.transition().duration(1600)
  .attrTween('d', arcUpdateTween);

paths.enter()
    .append('path')
    .attr('class', 'arc')
    .attr('d', arcPath)
    .attr('stroke', "rgb(177, 192, 221)")
    .attr('stroke-width', 3)
    .attr('fill', (d,i) => color2(i))
    .each(function(d){ this._current = d; })
    .transition().duration(1000)
        .attrTween('d', arcTweenStart)
//  graph.selectAll('path')
//     .on('mouseover', handleMouseOver)
//     .on('mouseout', handleMouseOut)
//     .on('click', handleClick)

// End pie update

// start table update

let obj = data.map(function(element, i)  { return element.value.balance_ETH; })  //.reduce((arr, el) => { arr.concat(el) });
let merge = obj.flat(1).sort(function(a,b){ return b-a; });

var arr = [];
for (var i = 0; i < 10; i++) {
  arr.push({
      rank: i+1,
      balance_ETH: merge[i]
  });
  }

let rows= tbody.selectAll("tr")
  .data(arr)
  .enter()
  .append("tr");

let cells = rows.selectAll("td")
.data(function(row) { 
  return columns.map(function(column) { 
    return {
      column: column,
      value: row[column]
    }
  })
})
.enter()
.append("td")
.text(function (d, i) { return d.value; });

//
tbody.remove();
tbody = table.append("tbody");
rows = tbody.selectAll("tr")
  .data(arr)
  .enter()
  .append("tr");

cells = rows.selectAll("td")

  .data(function(row) { 
    return columns.map(function(column) { 
      return {
        column: column,
        value: row[column]
      }
    })
  })
  .enter()
  .append("td")
  .text(function (d) { return d.value; });

//end table update

  }  //end of update

d3.csv("whale_balances.csv", function(d, i) {
    return {
        date: parseDate(d.date.slice(3)),
        rank: d.rank,
        address: d.address,
        balance_ETH: +d.balance_ETH.replace(/,/g, ''),
        block_number: d.block_number
    };
}).then(function(d) {
    
    sumOfMonth = d3.nest()
    .key(function(d) { return year(d.date); })
    .key(function(d) { return month(d.date); })
    .rollup(function(v) { return {
        rank: v.map(function(d){ return d.rank }),
        address: v.map(function(d){ return d.address }),
        balance_ETH: v.map(function(d){ return d.balance_ETH }),
        block_number: v.map(function(d){ return d.block_number }),
        avg: d3.mean(v, function(d) { return d.balance_ETH; }),
        med: d3.median(v, function(d) { return d.balance_ETH; }),
        sum: d3.sum(v, function(d) { return d.balance_ETH })
    };  }).entries(d)
    .map(function(group) { 
        return {year: group.key, values: group.values.map(function(d) { return {month: d.key, value: d.value}})};
    });


update(sumOfMonth[0].values);
      
    }) //.then

    d3.select(".btn")
    .on("click", () => {
        //console.log(sumOfMonth[itr].year);
        //console.log(d3.event.target.className == "next");
        if(d3.event.target.className == "next") { 
          next(); 
          itr = next();}
        if(d3.event.target.className == "back") { 
          back(); 
          itr = back();}

        update(sumOfMonth[itr].values);
        })