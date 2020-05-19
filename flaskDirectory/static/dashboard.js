var rating_accident = ['Severity 1', 'Severity 2', 'Severity 3', 'Severity 4'];

var colors_accidents = ['orange', '#ADFF2F', '#43c0ac', 'white'];

function colorpicker(v) {
    if (v === 1) {
        return "orange";
    }
    if (v === 2) {
        return "#ADFF2F";
    }
    if (v === 3) {
        return "#43c0ac";
    }
    if (v === 4) {
        return "white";
    }
}

var data;
var navbar = document.getElementById("dashboard_title");
var logdisplay = d3.select("#logdisplay");
document.getElementById("logdisplay").style.display = "none";
document.getElementById("loglabel").style.display = "none";

function loadData(inputData) {
    data = inputData;
    usmap();
    var button = document.createElement("button");

    button.setAttribute("id", "reset");
    button.setAttribute("class", "reset");

    button.innerHTML = '<i class = "fa fa-refresh"></i> Reset to State View';

    var usmapelem = document.getElementById("usmap");
    usmapelem.appendChild(button);

    button.onclick = reset;

    document.getElementById("reset").style.display = "none";
}
// var data = {{ data.chart_data | safe}};

var us_state_fullform = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AS': 'American Samoa',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DE': 'Delaware',
    'DC': 'District of Columbia',
    'FL': 'Florida',
    'GA': 'Georgia',
    'GU': 'Guam',
    'HI': 'Hawaii',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'MP': 'Northern Mariana Islands',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'PR': 'Puerto Rico',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VI': 'Virgin Islands',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming'
};

var uri = "http://127.0.0.1:5000/";

var tooltip = d3.select("body").append("div").attr("class", "toolTip")
          				    .style("position", "absolute")
        		            .style("z-index", "10")
                            .style("visibility", "hidden")
                            .style("background", "#E0F8F1")
                            .style("border", "1px solid #6F257F")
                            .style("border-radius", "5px")
                              .style("padding", "5px");
                              
function reset() {
    document.getElementById("logdisplay").style.display = "none";
    document.getElementById("loglabel").style.display = "none";
    navbar.innerHTML = "US Accidents Statistics";
    showStateBars("USA");
}

function usmap() {

    //Width and height of map
    var width = 600;
    var height = 305;

    var lowColor = '#F6DDCC';
    var highColor = '#BA4A00';

    var projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2 ]) // translate to center of screen
        .scale([650]); // scale things down so see entire US

    // Define path generator
    var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use albersUsa projection


    //Create SVG element and append map to the SVG
    var svg_usmap = d3.select("#usmap")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var url = uri + "getstatesdata";

    // Load in my states data!
    var promise = new Promise((resolve) => {
        $.post(url, function (data) {
            data = JSON.parse(data.chart_data);
            var dataArray = [];
            for (var d = 0; d < data.length; d++) {
                dataArray.push(parseFloat(data[d].value))
            }
            var minVal2 = d3.min(dataArray);
            var maxVal2 = d3.max(dataArray);
            var minVal = Math.log(d3.min(dataArray));
            var maxVal = Math.log(d3.max(dataArray));
            var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor]);

            url = uri + "getusmapdata";
            // Load GeoJSON data and merge with states data
            $.post(url, function (json) {
                json = JSON.parse(json.chart_data);
                // Loop through each state data value in the .csv file
                for (var i = 0; i < data.length; i++) {
                    // Grab State Name
                    var dataState = data[i].state;
                    // Grab data value
                    var dataValue = data[i].value;

                    // Find the corresponding state inside the GeoJSON
                    for (var j = 0; j < json.features.length; j++) {
                        var jsonState = json.features[j].properties.name;

                        if (dataState === jsonState) {

                            // Copy the data value into the JSON
                            json.features[j].properties.value = dataValue;

                            // Stop looking through the JSON
                            break;
                        }
                    }
                }
                svg_usmap.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("stroke", "#fff")
                    .style("stroke-width", "1")
                    .style("fill", function (d) { return ramp(Math.log(d.properties.value)); })
                    .on("mousemove", function(d) {
                        var htm = d.properties.name + "<br>" + "Number of accidents: " + d.properties.value;
                        tooltip
                        .style("left", d3.event.pageX - 50 + "px")
                        .style("top", d3.event.pageY - 70 + "px")
                        .style("display", "inline-block")
                        .style("visibility", "visible")
                        .html(htm);
                    })
                    .on("mouseover", function(d,i) {
                        d3.select(this)
                        .style("stroke", "#BFC9CA")
                        .style("stroke-width", "5")
                        .style("fill", "#BFC9CA");
                    })
                    .on("mouseout", function(d, i) {
                        d3.select(this)
                        .style("stroke", "#fff")
                        .style("stroke-width", "1")
                        .style("fill", ramp(Math.log(d.properties.value)));
                        tooltip.style("display", "none")
                    })
                    .on('click', function (d) {
                        navbar.innerHTML = d.properties.name + " State Accidents Statistics";
                        showStateBars(d.properties.name);
                    });


		var w = 140, h = 300;

    		var key = d3.select("body")
    			.append("svg")
    			.attr("width", w)
    			.attr("height", h)
    			.attr("class", "legend");

    		var legend = key.append("defs")
    			.append("svg:linearGradient")
    			.attr("id", "gradient")
    			.attr("x1", "100%")
    			.attr("y1", "0%")
    			.attr("x2", "100%")
    			.attr("y2", "100%")
    			.attr("spreadMethod", "pad");

    		legend.append("stop")
    			.attr("offset", "0%")
    			.attr("stop-color", highColor)
    			.attr("stop-opacity", 1);

    		legend.append("stop")
    			.attr("offset", "100%")
    			.attr("stop-color", lowColor)
    			.attr("stop-opacity", 1);

    		key.append("rect")
    			.attr("width", w - 100)
    			.attr("height", h)
    			.style("fill", "url(#gradient)")
    			.attr("transform", "translate(30,50)");

    		var y = d3.scaleLinear()
    			.range([h, 0])
    			.domain([minVal2, maxVal2]);

    		var yAxis = d3.axisRight(y);

    		key.append("g")
    			.attr("class", "y axis")
    			.attr("transform", "translate(71,50)")
    			.call(yAxis)
                    resolve();

            });
        });
    }).then(function() {
        reset();
    });
}

function scatterplot(statedata) {
    var margin_sp = { top_sp: 20, right_sp: 50, bottom_sp: 40, left_sp: 40 };
    var width_sp = 600 - margin_sp.left_sp - margin_sp.right_sp;
    var height_sp = 350 - margin_sp.top_sp - margin_sp.bottom_sp;

    var svg_sp = d3.select('#scatterplot')
        .append('svg')
        .attr('width', width_sp + margin_sp.left_sp + margin_sp.right_sp)
        .attr('height', height_sp + margin_sp.top_sp + margin_sp.bottom_sp)
        .append('g')
        .attr('transform', 'translate(' + (margin_sp.left_sp + 10) + ',' + (margin_sp.top_sp - 10) + ')');

    var xScale_sp = d3.scaleLinear()
        .range([0, width_sp]);

    var yScale_sp = d3.scaleLinear()
        .range([height_sp, 0]);

    var xAxis_sp = d3.axisBottom()
        .scale(xScale_sp);

    var yAxis_sp = d3.axisLeft()
        .scale(yScale_sp);


    statedata.forEach(function (d) {
        d.PC1 = +d.PC1;
        d.PC2 = +d.PC2;
    });

    xScale_sp.domain(d3.extent(statedata, function (d) {
        return d.PC1;
    })).nice();

    yScale_sp.domain(d3.extent(statedata, function (d) {
        return d.PC2;
    })).nice();

    svg_sp.append('g')
        .attr('transform', 'translate(0,' + height_sp + ')')
        .attr('class', 'x axis')
        .call(xAxis_sp);

    svg_sp.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'y axis')
        .call(yAxis_sp);

    svg_sp.selectAll(".dot")
        .data(statedata)
        .enter().append('circle')
        .attr('cx', function (d) { return xScale_sp(d.PC1); })
        .attr('cy', function (d) { return yScale_sp(d.PC2); })
        .attr('r', 2.5)
        .style('fill', function (d) { return colorpicker(d.Severity); });

    svg_sp.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin_sp.left_sp -10)
                .attr("x",0 - (height_sp / 2))
                .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("font-size", "13px")
                .text("PC2");

    svg_sp.append("text")
                .attr("transform", "translate(" + (width_sp/2) + " ," + (height_sp + margin_sp.top_sp + 15) + ")")
                    .style("text-anchor", "middle")
                    .style("font-size", "13px")
                .text("PC1");

        //adding legend
        var legend = svg_sp.selectAll(".legend")
            .data(colors_accidents)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i*20 + ")"; });

        legend.append("rect")
            .data(colors_accidents)
            .attr("x", width_sp)
            .attr("y", 9)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d) { return d; });

        legend.append("text")
            .data(rating_accident)
            .attr("x", width_sp -10)
            .attr("y", 18)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });
}

function parallelcood(statedata) {
    // Parallel co-od
    var margin_pc = { top_pc: 18, right_pc: 10, bottom_pc: 10, left_pc: 10 },
        width_pc = 700 - margin_pc.left_pc - margin_pc.right_pc,
        height_pc = 300 - margin_pc.top_pc - margin_pc.bottom_pc;

    var svg_pc = d3.select("#parallelcood")
        .append("svg")
        .attr("width", width_pc + margin_pc.left_pc + margin_pc.right_pc)
        .attr("height", height_pc + margin_pc.top_pc + margin_pc.bottom_pc)
        .append("g")
        .attr("transform",
            "translate(" + margin_pc.left_pc + "," + margin_pc.top_pc + ")");

    var dimensions = ["Severity", "Temperature_F", "Humidity_per", "Pressure_in", "Visibility_mi", "Wind_Speed_mph", "Precipitation_in"];

    var names = "";
    var y = {};
    for (i in dimensions) {
        names = dimensions[i];
        y[names] = d3.scaleLinear()
            .domain(d3.extent(statedata, function (d) { return +d[names]; }))
            .range([height_pc, 0])
    }
    x_pc = d3.scalePoint()
        .range([0, width_pc])
        .padding(1)
        .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map(function (p) { return [x_pc(p), y[p](d[p])]; }));
    }

    svg_pc.selectAll("myPath")
        .data(statedata)
        .enter()
        .append("path")
        .attr("class", function (d) { return "line " + d.Species })
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", function (d) { return colorpicker(d.Severity); })
        .style("opacity", 3)
        .on("mouseover", function (d) {

            d3.selectAll(".line")
                .style("stroke", function (dl) {
                    if (dl.Severity === d.Severity) {
                        return colorpicker(dl.Severity);
                    }
                })
                .style("opacity", 1);
        })
        .on("mouseout", function () {
            d3.selectAll(".line")
                .style("stroke", function (d) { return colorpicker(d.Severity); })
                .style("opacity", 1);
        });

    svg_pc.selectAll("myAxis")
        .data(dimensions).enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + x_pc(d) + ")"; })
        .each(function (d) {
            d3.select(this).call(d3.axisLeft().scale(y[d]));
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) { return d; })
        .style("fill", "black")
        .style('font-size', 11 )
        .style('text-align', 'left');


    //adding legend
        var legend = svg_pc.selectAll(".legend")
            .data(colors_accidents)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i*20 + ")"; });

        legend.append("rect")
            .data(colors_accidents)
            .attr("x", width_pc -10)
            .attr("y", 9)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d) { return d; });

        legend.append("text")
            .data(rating_accident)
            .attr("x", width_pc -16)
            .attr("y", 18)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });
}

function scrollablebarchart(city_count) {
    var margin = { top: 30, right: 20, bottom: 50, left: 50 },
        margin2 = { top: 300, right: 20, bottom: 0, left: 50 },
        width = 600 - margin.left - margin.right,
        height = 220 - margin.top - margin.bottom,
        height2 = 350 - margin2.top - margin2.bottom;

    var svg_bc = d3.select("#barchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 150);

    var focus = svg_bc.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var context = svg_bc.append("g")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var maxHeight = d3.max(city_count, function (d) { return d.value });
    var minHeight = d3.max(city_count, function (d) { return d.value });

    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(city_count, function (d) { return d.value; })]);

    var xScale = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1)
        .domain(city_count.map(function (d) { return d.key; }));

    var yScale2 = d3.scaleLinear()
        .range([height2, 0])
        .domain([0, d3.max(city_count, function (d) { return d.value; })]);

    var xScale2 = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1)
        .domain(city_count.map(function (d) {
            return d.key; 
        }));

    var xAxis = d3.axisBottom(xScale).tickSize(-height);
    var xAxisGroup = focus.append("g").call(xAxis)
        .attr("transform", "translate(0," + height + ")");

    focus.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    var yAxis = d3.axisLeft(yScale)
        .tickSize(-width);

    var yAxisGroup = focus.append("g").call(yAxis);

    var xAxis2 = d3.axisBottom(xScale2);
    var xAxisGroup2 = context.append("g").call(xAxis2)
        .attr("transform", "translate(0," + height2 + ")")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)")
        .attr("fill", "none");

    svg_bc.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left + 50)
                .attr("x",0 - (height / 2) -30)
                .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("font-size", "13px")
                .text("Count");

    svg_bc.append("text")
                .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top+95) + ")")
                    .style("text-anchor", "middle")
                    .style("font-size", "13px")
                .text("Area");

    var bars1 = focus.selectAll("rect")
        .data(city_count)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return xScale(d.key);
        })
        .attr("y", function (d) {
            return yScale(d.value);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) {
            return height - yScale(d.value);
        })
        .attr("fill", function (d) { return "#FFFF66"; })
        .on("mousemove", function(d) {
            var htm = d.key + "<br>" + "Number of accidents: " + d.value;
            tooltip
            .style("left", d3.event.pageX - 50 + "px")
            .style("top", d3.event.pageY + 10 + "px")
            .style("display", "inline-block")
            .style("visibility", "visible")
            .html(htm);
        })
        .on("mouseover", function() {
            d3.select(this)
            .style("fill", "#7CFC00")
            .style("opacity", 1);
        })
        .on("mouseout", function(d, i) {
            d3.select(this)
            .attr("y", function(d) {
                return yScale(d.value);
            })
            .attr("height", function (d) {
                return height - yScale(d.value);
            })
            .style("fill", function (d) { return "#FFFF66"; })
            .style("opacity", 1);
            tooltip.style("display", "none");

        });

    var bars2 = context.selectAll("rect")
        .data(city_count)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return xScale2(d.key); 
        })
        .attr("y", function (d) { return yScale2(d.value); })
        .attr("width", xScale2.bandwidth())
        .attr("height", function (d) { return height2 - yScale2(d.value); })
        .attr("fill", function (d) { return "#FFFF66"; });

    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush", brushed)
        .on("end", brushend);
    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, xScale2.range());



    function brushed() {
        if (!d3.event.sourceEvent) return;
        if (!d3.event.selection) return;
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
        var newInput = [];
        var brushArea = d3.event.selection;
        if (brushArea === null) brushArea = xScale.range();

        xScale2.domain().forEach(function (d) {
            var pos = xScale2(d) + xScale2.bandwidth() / 2;
            if (pos >= brushArea[0] && pos <= brushArea[1]) {
                newInput.push(d);
            }
        });

        xScale.domain(newInput);
        bars1.attr("x", function (d, i) {
            return xScale(d.key);
        })
            .attr("y", function (d) {
                return yScale(d.value);
            })
            .attr("width", xScale.bandwidth())
            .attr("height", function (d, i) {
                if (xScale.domain().indexOf(d.key) === -1) {
                    return 0;
                }
                else
                    return height - yScale(d.value);
            });

        xAxisGroup.call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
    }
    function brushend() {
        if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) return; // Ignore empty selections.
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
        var newInput = [];
        var brushArea = d3.event.selection;
        if (brushArea === null) brushArea = xScale.range();


        xScale2.domain().forEach(function (d) {
            var pos = xScale2(d) + xScale2.bandwidth() / 2;
            if (pos >= brushArea[0] && pos <= brushArea[1]) {
                newInput.push(d);
            }
        });

        var increment = 0;
        var left = xScale2(d3.min(newInput));
        var right = xScale2(d3.max(newInput)) + xScale2.bandwidth();

        d3.select(this).transition().call(d3.event.target.move, [left, right]);
    }
    document.getElementById("logdisplay").style.display = "inline";
    document.getElementById("loglabel").style.display = "inline";
}

function screenplots(statedata, city_count) {
    scrollablebarchart(city_count);
    scatterplot(statedata);
    parallelcood(statedata);
}   

var graphdiv = d3.select("#usmap")
    .append("div")
    .attr("id", "graphdiv");

//Get state data
function showStateBars(state) {

    d3.select("#barchart").select("svg").remove();
    d3.select("#scatterplot").select("svg").remove();
    d3.select("#parallelcood").select("svg").remove();
    document.getElementById("graphdiv").innerHTML = "";
    document.getElementById("logdisplay").checked = false;
    var statedata = [],
        city_count,
        chartdata;

    if (state == "USA") {
        document.getElementById("reset").style.display = "none";
        url = uri + "getoverviewdata";
        city_count = [];
        $.post(url, function (overviewdata) {
            chartdata = JSON.parse(overviewdata.chart_data);
            for (var i = 0; i < chartdata.length; i++) {
                var entry = {};
                statedata.push(chartdata[i]);
                entry["key"] = us_state_fullform[chartdata[i].State];
                entry["value"] = chartdata[i].Num_Accidents;
                city_count.push(entry);
            }
            screenplots(statedata, city_count);
        });
    }
    else {
        for (var i = 0; i < data.length; i++) {
            var datastate = us_state_fullform[data[i].State];
            if (datastate === state) {
                statedata.push(data[i]);
            }
        }
        //citycount barchart
        city_count = d3.nest()
            .key(function (d) {
                return d.City;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(statedata)
            .sort(function (a, b) {
                return d3.descending(a.value, b.value);
            });

        var citycountlen = Object.keys(city_count).length;

        if (citycountlen > 35) {
            city_count.splice(35, citycountlen - 1);
        }
        screenplots(statedata, city_count);
        document.getElementById("reset").style.display = "inline";
    }

    logdisplay.on("click", function(d) {
        if(this.checked) {
            var logcity_count = JSON.parse(JSON.stringify(city_count));
            for(var i = 0; i < Object.keys(logcity_count).length; i++) {
                logcity_count[i].value = Math.log(logcity_count[i].value);
            }
            d3.select("#barchart").select("svg").remove();
            scrollablebarchart(logcity_count);
        }
        else {
            d3.select("#barchart").select("svg").remove();
            scrollablebarchart(city_count);
        }
    });
}
