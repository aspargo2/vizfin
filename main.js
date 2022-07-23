//https://d3-graph-gallery.com/graph/line_basic.html
//https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html

// message
//ton of demographic information missing
//

window.onload = function () {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 1660 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("border", "thin solid #000")
    .style("background", "white")
    .text("a simple tooltip");


  const type = d3.annotationLabel;

  const annotations = [{
    note: {
      label: "Longer text to show text wrapping",
      bgPadding: 20,
      title: "Annotations :)",
      align: "right"
    },
    //can use x, y directly instead of data
    data: { date: "05-28-2020" },
    className: "show-bg",
    dy: 107,
    dx: 260
  }];

  const parseTime = d3.timeParse("%d-%b-%y");
  const timeFormat = d3.timeFormat("%d-%b-%y");

  d3.csv('https://raw.githubusercontent.com/aspargo2/vizfin/main/PPP-data-under-150k-080820-HI.csv',
    function (d) {
      d.date = d3.timeParse("%m/%d/%Y")(d.DateApproved);
      d['LoanAmount'] = Number(d['LoanAmount']);
      return d;
    }
  ).then(function (data) {
    var outerGroupField = 'DateApproved';
    var innerGroupField = 'Gender';//RaceEthnicity //BusinessType //Gender
    var valueField = 'LoanAmount';
    //race ~54M on 4/28


    // List of subgroups = header of the csv files = soil condition here
    //vertical groups (the stacked bar grouping)
    // var subgroups = data.columns.slice(1)
    var m = d3.map(data, function (d) { return (d[innerGroupField]) })
    var subgroups = m.filter((v, i, a) => a.indexOf(v) === i);
    console.log("subgroups", Array.from(subgroups));

    // the horizontal bar bins
    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var m2 = d3.map(data, function (d) { return (d[outerGroupField]) })
    var groups = m2.filter((v, i, a) => a.indexOf(v) === i);
    console.log("groups", Array.from(groups));

    fdat = {};
    data.forEach(d => {
      if (!fdat[d[outerGroupField]]) {
        fdat[d[outerGroupField]] = {};
        fdat[d[outerGroupField]][d[innerGroupField]] = {};
        fdat[d[outerGroupField]][d[innerGroupField]][outerGroupField] = d[outerGroupField];
        fdat[d[outerGroupField]][d[innerGroupField]][innerGroupField] = d[innerGroupField];
        fdat[d[outerGroupField]][d[innerGroupField]][valueField] = d[valueField];
      } else {
        if (!fdat[d[outerGroupField]][d[innerGroupField]]) {
          fdat[d[outerGroupField]][d[innerGroupField]] = {};
          fdat[d[outerGroupField]][d[innerGroupField]][outerGroupField] = d[outerGroupField];
          fdat[d[outerGroupField]][d[innerGroupField]][innerGroupField] = d[innerGroupField];
          fdat[d[outerGroupField]][d[innerGroupField]][valueField] = d[valueField];
        } else {
          fdat[d[outerGroupField]][d[innerGroupField]][valueField] += d[valueField];
        }
      }
    });
    console.log('fdat', fdat)
    fflat = [];
    Object.values(fdat).forEach(v1 => {
      Object.values(v1).forEach(v2 => {
        v2[valueField] = v2[valueField].toString();
        v2[v2[innerGroupField]] = v2[valueField];
        delete v2[valueField];
        delete v2[innerGroupField];
        subgroups.forEach(sg => {
          if (!v2[sg]) {
            v2[sg] = 0;
          }
        });
        v2.group = v2[outerGroupField];
        // if(v2.Unanswered == 0 || !v2.Unanswered)
        fflat.push(v2);
      })
    })

    fflat = fflat.sort((a, b) => new Date(a[outerGroupField]).getTime() - new Date(b[outerGroupField]).getTime());

    console.log('fflat', fflat);

    // Add X axis
    var x2 = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
    var x = d3.scaleTime()
      .domain(d3.extent(fflat, function (d) { return new Date(d[outerGroupField]); }))
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(d3.timeDay.every(4)));//.tickSizeOuter(15)

    // Add Y axis
    var y = d3.scaleLinear()
      //.domain([0, 60000000])
      .domain([0, 60000000])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(d3.schemeTableau10);

    subgroups.forEach(sg => {
      d3.select('#legend').append('p').text(sg).style('color', color(sg));
    })

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
      .keys(subgroups)(fflat);

    console.log(stackedData);

    const makeAnnotations = d3.annotation()
      .editMode(true)
      //also can set and override in the note.padding property
      //of the annotation object
      .notePadding(15)
      .type(type)
      //accessors & accessorsInverse not needed
      //if using x, y in annotations JSON
      .accessors({
        x: d => x(parseTime(d.date)),
        y: d => y(d.close)
      })
      .accessorsInverse({
        date: d => timeFormat(x.invert(d.x)),
        close: d => y.invert(d.y)
      })
      .annotations(annotations)

    d3.select("svg")
      .append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations)


    // Show the bars
    svg.append("g")
      .selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .enter().append("g")
      .attr("fill", function (d) { return color(d.key); })
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function (d) { return d; })

      .enter().append("rect")
      .filter(function (d) { return d[1] != 0; })
      .attr("x", function (d) { return x2(d.data['DateApproved']); })
      .attr("y", function (d) { /*console.log(d);*/ return y(d[1]); })
      .attr("height", function (d) { if (d.data.DateApproved == '04/28/2020') console.log('height', d); return y(d[0]) - y(d[1]); })
      .attr("width", x2.bandwidth())
      .on("mouseover", function (event, d) { tooltip.text(Object.entries(d.data).filter(e => e[1] != 0 && isNaN(e[1]))[0][1] + ': ' + Object.entries(d.data).filter(e => e[1] != 0 && !isNaN(e[1]))[0][0] + ': ' + d[1]); return tooltip.style("visibility", "visible"); })
      .on("mousemove", function (event, d) { return tooltip.style("top", (event.clientY - 10) + "px").style("left", (event.clientX + 10) + "px"); })
    // .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

  })
}