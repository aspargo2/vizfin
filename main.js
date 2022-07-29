//links I used for the stacked bar chart and some basic d3 setup/intialization
//https://d3-graph-gallery.com/graph/line_basic.html
//https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html

// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 1000 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

const type = d3.annotationLabel;

const parseTime = d3.timeParse("%m/%d/%Y");
const timeFormat = d3.timeFormat("%m/%d/%Y");
var origData;
var svg, tooltip;

var currentSceneIndex = 0;
var scenes = [
  {
    title: `The Paycheck Protection Program or PPP was a government program designed
      to give companies forgivable loans to help keep people employed and companies from
      failing during lockdowns due to COVID-19. Because of how quickly the virus spread,
      how rapidly everything shut down, and how quickly the government sent out enormous amounts
      of money, there has been a lot of fraud and waste with money going to people that did not
      need it. NBC news reported hundreds of billions of dollars stolen, many by people not even
      in the country. The message of my narrative visualization is to highlight to the user the
      amount spent in a short amount of time, the little information known about the money
      spent, and how someone might look for suspicious data.</br></br>Notice the large missing gap
      in the data and the large ratio of unknown gender. Let\'s pick the day with the most loans and drill in.
      </br>**You can use the "Back" and "Next" buttons to move between scenes as we explore the data
      </br>**You can hover over any of the bars on the chart to see the date, value, and loan amount`,
    groupField: 'Gender',
    annotations: [{
          id: 'large-loan',
          note: {
            label: "It looks like on May 28th there was a large number of loans given",
            bgPadding: 20,
            title: "What's this?",
            align: "right"
          },
          connector: {
            end: "dot",        // Can be none, or arrow or dot
            type: "line",      // ?? don't know what it does
            lineType : "vertical",    // ?? don't know what it does
            endScale: 2     // dot size
          },
          //can use x, y directly instead of data
          // data: getMaxTotal(fflat),
          x: 245,
          y: 40,
          className: "show-bg",
          dy: 0,
          dx: 170
      },
      {
        id: 'missing-data',
        note: {
          label: "There was a period here of about 10 days where we have no data",
          bgPadding: 20,
          title: "What's this?",
          align: "right"
        },
        //can use x, y directly instead of data
        // data: getMaxTotal(fflat),
        x: 200,
        y: 340,
        subject: {
          radius: 32,
          radiusPadding: 5
        },
        type: d3.annotationCalloutCircle,
        className: "show-bg",
        dy: -40,
        dx: 260
    }],
    dateRange: ['04/03/2020', '08/08/2020'],
    filter: function(d) {
      return true;
      // return d['City'] == 'Honolulu';
    },
    ymax: 60000000
  },
  {
    title: `We're now looking at On April 28th grouped by lender. Looks like one particular bank gave out
      the largest amount of loans. Maybe we should look into that bank some more`,
    groupField: 'Lender',
    annotations: [
        {
          id: 'large-bank',
          note: {
            label: "It looks like First Hawaiian Bank gave out a lot of loans",
            bgPadding: 20,
            title: "What's this?",
            align: "right"
          },
          connector: {
            end: "dot",        // Can be none, or arrow or dot
            type: "line",      // ?? don't know what it does
            lineType : "vertical",    // ?? don't know what it does
            endScale: 2     // dot size
          },
          //can use x, y directly instead of data
          // data: getMaxTotal(fflat),
          x: 545,
          y: 340,
          className: "show-bg",
          dy: -50,
          dx: -50
      }
    ],
    dateRange: ['04/28/2020', '04/28/2020'],
    filter: function(d) {
      return true;
    },
    ymax: 60000000
  },
  {
    title: `NAICS (North American Industry Classification System)codes are a way 
      to classify various industries. This lets us have an idea
      which industries asked for the highest amount of loans. It looks like 722511 has a lot
      relative to others. 722511 is the code for 'Full Service Restaurants'. That makes sense
      for a COVID lockdown, but let's investigate one more level to be sure`,
    groupField: 'NAICSCode',
    annotations: [
        {
          id: 'large-naics',
          note: {
            label: "Looks like a relatively large number of requests for Full Service Restaurants",
            bgPadding: 20,
            title: "What's this?",
            align: "right"
          },
          connector: {
            end: "dot",        // Can be none, or arrow or dot
            type: "line",      // ?? don't know what it does
            lineType : "vertical",    // ?? don't know what it does
            endScale: 2     // dot size
          },
          //can use x, y directly instead of data
          // data: getMaxTotal(fflat),
          x: 545,
          y: 295,
          className: "show-bg",
          dy: -50,
          dx: -50
      }
    ],
    dateRange: ['04/28/2020', '04/28/2020'],
    filter: function(d) {
      return d['Lender'] == 'First Hawaiian Bank';
    },
    ymax: 25000000
  },
  {
    title: `We are now looking at loans from First Hawaiian Bank on 4/28 for Full Service Restaurants.
      The data is grouped by Zip code now so we can validate. The largest zip code is 96814, looking
      at the map below, does this seem like a reasonable location for the loans?`,
    groupField: 'Zip',
    annotations: [
      {
        id: 'large-zip',
        note: {
          label: "Zip code 96814 has the largest amount of loans",
          bgPadding: 20,
          title: "What's this?",
          align: "right"
        },
        connector: {
          end: "dot",        // Can be none, or arrow or dot
          type: "line",      // ?? don't know what it does
          lineType : "vertical",    // ?? don't know what it does
          endScale: 2     // dot size
        },
        //can use x, y directly instead of data
        // data: getMaxTotal(fflat),
        x: 545,
        y: 295,
        className: "show-bg",
        dy: -50,
        dx: -50
    }
    ],
    dateRange: ['04/28/2020', '04/28/2020'],
    filter: function(d) {
      return d['Lender'] == 'First Hawaiian Bank' && d['NAICSCode'] == '722511';
    },
    ymax: 2000000
  },
  {
    title: `I hope you were able to see how some of the data for the PPP is missing
      which makes it hard to know how the money was distributed. I hope you also
      got a sense for what an analyst or investigator might do to look for fraud or abuse`,
    groupField: 'Gender',
    annotations: [],
    dateRange: ['04/03/2020', '08/08/2020'],
    filter: function(d) {
      return true;
    },
    ymax: 60000000
  }
];

var outerGroupField = 'DateApproved';
var innerGroupField = 'Lender';//RaceEthnicity //BusinessType //Gender //Lender
var valueField = 'LoanAmount';

function changeScene(dir) {
  if(dir == 'f') {
    currentSceneIndex++;
  } else if(dir == 'b') {
    currentSceneIndex--;
  } else {
    currentSceneIndex = 0;
  }

  if(currentSceneIndex == 3) {
    document.getElementById('zipImg').style.display = 'block';
  } else {
    document.getElementById('zipImg').style.display = 'none';
  }

  d3.select('#prevBtn').attr('disabled', null);
  d3.select('#nextBtn').attr('disabled', null);
  if(currentSceneIndex == 4) {
    d3.select('#nextBtn').attr('disabled', 'disabled');
    d3.select('#exploreForm').style('display', 'block');
  }
  if(currentSceneIndex == 0) {
    d3.select('#prevBtn').attr('disabled', 'disabled');
    d3.select('#exploreForm').style('display', 'none');
  }

  document.getElementById('sceneDescription').innerHTML = scenes[currentSceneIndex].title;
  innerGroupField = scenes[currentSceneIndex].groupField;
  refresh();
}

window.onload = function () {
  d3.csv('https://raw.githubusercontent.com/aspargo2/vizfin/main/PPP-data-under-150k-080820-HI.csv',
    function (d) {
      // d.date = d3.timeParse("%m/%d/%Y")(d.DateApproved);
      d['LoanAmount'] = Number(d['LoanAmount']);
      return d;
    }
  ).then(function (data) {
    // List of subgroups = header of the csv files = soil condition here
    //vertical groups (the stacked bar grouping)
    // var subgroups = data.columns.slice(1)
    origData = data;

    // append the svg object to the body of the page
    svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("border", "thin solid #000")
      .style("background", "white")
      .text("a simple tooltip");

    changeScene();

    refresh();

  })
}

function refresh() {
  obj = processData(origData);
  var groups = obj.groups;
  var stackedData = obj.data;
  var fflat = obj.fflat;
  var color = obj.color;

  d3.select("#chart svg").remove();
  svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Add X axis
  var x2 = d3.scaleBand()
    .domain(groups)
    .range([0, width])
    .padding([0.2])


  var dateRange = [parseTime(scenes[currentSceneIndex].dateRange[0]), parseTime(scenes[currentSceneIndex].dateRange[1])];
  var dateDiff = parseTime(scenes[currentSceneIndex].dateRange[1]) - parseTime(scenes[currentSceneIndex].dateRange[0]);
  var x = d3.scaleTime()
    .domain(dateRange)
    .range([0, width]);

  timeAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")");
  if(dateDiff < 10) {
    timeAxis.call(d3.axisBottom(x));
  } else {
    timeAxis.call(d3.axisBottom(x).ticks(4));
  }

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, scenes[currentSceneIndex].ymax])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));



  const makeAnnotations = d3.annotation()
    // .editMode(true)
    //also can set and override in the note.padding property
    //of the annotation object
    .notePadding(15)
    .type(type)
    //accessors & accessorsInverse not needed
    //if using x, y in annotations JSON
    .accessors({
      x: d => x(d[outerGroupField]),
      y: d => y(d.total)
    })
    .accessorsInverse({
      date: d => x.invert(d.x),
      total: d => y.invert(d.y)
    })
    .annotations(scenes[currentSceneIndex].annotations)

  d3.select("svg")
    .append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations)

  // Show the bars
  var rectData = svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData);

  rectDataSub = rectData.enter().append("g")
    .attr("fill", function (d) { return color(d.key); })
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(function (d) { return d; });

  rectDataSub.enter().append("rect")
    .filter(function (d) { return d[1] != 0; })
    .attr("x", function (d) { return x(parseTime(d.data['DateApproved'])); })
    .attr("y", function (d) { return y(d[1]); })
    .attr("height", function (d) { return y(d[0]) - y(d[1]); })
    .attr("width", x2.bandwidth())
    .on("mouseover", function (event, d) { 
      var date = d.data[outerGroupField];
      var label = Object.entries(d.data).filter(e => e[1] == d[1] - d[0])[0][0];
      var val = d[1];
      tooltip.text(date + ' [' + innerGroupField + ': ' + label + ']: $' + val); 
      return tooltip.style("visibility", "visible"); 
    })
    .on("mousemove", function (event, d) { 
      return tooltip.style("top", (event.clientY - 10) + "px")
        .style("left", (event.clientX + 10) + "px"); 
    })
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
}

function processData(dat) {
  data = dat.filter(g => { 
    return parseTime(g[outerGroupField]) >= parseTime(scenes[currentSceneIndex].dateRange[0]) 
      && parseTime(g[outerGroupField]) <= parseTime(scenes[currentSceneIndex].dateRange[1])
      && scenes[currentSceneIndex].filter(g);
    });

  var m = d3.map(data, function (d) { return (d[innerGroupField]) })
  var subgroups = m.filter((v, i, a) => a.indexOf(v) === i);
  console.log("subgroups", Array.from(subgroups));

  // the horizontal bar bins
  // List of groups = species here = value of the first column called group -> I show them on the X axis
  var m2 = d3.map(data, function (d) { return (d[outerGroupField]) })
  var groups = m2.filter((v, i, a) => a.indexOf(v) === i).filter(g => { 
    return parseTime(g) >= parseTime(scenes[currentSceneIndex].dateRange[0]) 
      && parseTime(g) <= parseTime(scenes[currentSceneIndex].dateRange[1])
    });
  console.log("groups", Array.from(groups));

  fdat = {};
  data.forEach(d => {
    if (!fdat[d[outerGroupField]]) {
      fdat[d[outerGroupField]] = {};
      fdat[d[outerGroupField]][outerGroupField] = d[outerGroupField];
      fdat[d[outerGroupField]][d[innerGroupField]] = Math.round(d[valueField]);
    } else {
      if (!fdat[d[outerGroupField]][d[innerGroupField]]) {
        fdat[d[outerGroupField]][d[innerGroupField]] = Math.round(d[valueField]);
      } else {
        fdat[d[outerGroupField]][d[innerGroupField]] += Math.round(d[valueField]);
      }
    }
  });
  console.log('fdat', fdat)
  fflat = Object.values(fdat);

  fflat.sort((a, b) => parseTime(b[outerGroupField]).getTime() - parseTime(a[outerGroupField]).getTime() );

  fflat.forEach(o => {
    var total = 0;
    subgroups.forEach(g => {
      if(!o[g]) {
        o[g] = 0;
      }
      total += o[g];
    })
    o.total = total;
  })

  console.log('fflat', fflat);

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(d3.schemeTableau10);

  d3.select('#legend').html('')
  subgroups.forEach(sg => {
    d3.select('#legend').append('p').text(sg).style('color', color(sg));
  })

  //stack the data? --> stack per subgroup
  var stackedData = d3.stack()
    .keys(subgroups)(fflat);

  console.log('stackedData', stackedData);

  return {
    data: stackedData,
    fflat: fflat,
    groups: groups,
    color: color
  }
}

function formSubmit() {
  var group = document.getElementById('groupFieldInput').value;
  var start = document.getElementById('dateRangeStartInput').value;
  var end = document.getElementById('dateRangeEndInput').value;
  var ymax = document.getElementById('ymaxInput').value;

  if(ymax != '') {
    scenes[currentSceneIndex].ymax = Number(ymax);
  }

  if(group != '') {
    innerGroupField = group;
    scenes[currentSceneIndex].groupField = group;
  }
  
  if(start != '' && end != '') {
    scenes[currentSceneIndex].dateRange = [start, end];
  }

  processData(origData);
  refresh();
}