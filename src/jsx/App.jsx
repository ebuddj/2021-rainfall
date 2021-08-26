import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://www.npmjs.com/package/react-div-100vh
import Div100vh from 'react-div-100vh';

// https://vis4.net/chromajs/
import chroma from 'chroma-js';

// https://d3js.org/
import * as d3 from 'd3';

// https://github.com/d3/d3-geo-projection/
import {geoRobinson} from 'd3-geo-projection';

const yearStart = 1901,
      yearEnd = 2020,
      scaleMax = 10,
      scaleMin = -10,
      intervalTimeout = 300;
// Use chroma to make the color scale.
const f = chroma.scale('RdYlBu').domain([scaleMax,0,scaleMin]);

let scales = [], temperature = scaleMax;
while (temperature > scaleMin) {
  temperature = temperature - 0.2;
  scales.push(temperature);
}

let g, interval;
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      controls_text:'Play',
      current_year_average_temp:null,
      interval_play:false,
      year:yearStart
    }
  }
  componentDidMount() {
    // Get data.
    d3.json('./data/data.json').then((data) => {
      // temperature[0].data.reduce((total, current) => total + current.value, 0) / temperature[0].data.length
      this.setState((state, props) => ({
        current_data:data[yearStart],
        data:data
      }), this.loadMapData);
    });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {

  }
  loadMapData() {
    d3.json('./data/world_countries.json').then(data => {
      this.drawMap(data)
    });
  }
  value2color(value) {
    // Return color from chroma based on value.
    return f(value);
  }
  drawMap(data) {
    //  http://bl.ocks.org/micahstubbs/535e57a3a2954a129c13701fe61c681d
    const margin = {top: 0, right: 0, bottom: 0, left: 0};
    const width = window.innerWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;
    const svg = d3.select('.' + style.map_container)
      .append('svg')
        .attr('height', height)
        .attr('width', width)
      .append('g')
        .attr('class', style.map);

    // https://observablehq.com/@d3/robinson
    const path = d3.geoPath().projection(geoRobinson()
      .rotate([0, 0, 0])
      .scale((width * 300) / 1650)
      .translate([width / 2 - (width * 100) / 1650, height / 2 + (width * 50) / 1650]));

    g = svg.append('g');
    g.attr('class', 'countries')
      .selectAll('path')
      .data(data.features)
      .enter().append('path')
        .attr('d', path)
        .attr('fill', (d, i) => this.value2color(0))
        .style('opacity', 1)
        .style('stroke', '#fff')
        .style('stroke-width', 0.3);
    this.setPathColor();
    this.getCurrentYearAverageTemp();
    // Wait 2 seconds before starting the interval.
    setTimeout(() => {
      this.toggleInterval(yearStart);
    }, 2000);
  }
  toggleInterval(year) {
    if (parseInt(year) === yearEnd) {
      year = yearStart
    }
    // If interval is already running, stop it.
    if (this.state.interval === true) {
      clearInterval(interval);
      this.setState((state, props) => ({
        controls_text:'Play',
        interval:false,
      }));
    }
    else {
      interval = setInterval(() => {
        // If we are in the end.
        if (year > yearEnd) {
          clearInterval(interval);
          this.setState((state, props) => ({
            controls_text:'Play',
            interval:false,
          }));
        }
        else {
          this.setState((state, props) => ({
            controls_text:'Pause',
            current_data:this.state.data[year],
            interval:true,
            year:year
          }), this.setPathColor);
          year++;
        }
      }, intervalTimeout);
    }
  }
  setPathColor() {
    let data = this.state.data[this.state.year].map((values) => {
      return {
        country:values.country,
        data:values.data.reduce((total, current) => total + current.value, 0) / values.data.length
      }
    });
    g.selectAll('path')
      .attr('fill', (d, i) => {
        let country_data = data.filter(obj => {
          return obj.country === d.id
        });
        return (country_data[0]) ? this.value2color(country_data[0].data) : this.value2color(0);
      });
    this.getCurrentYearAverageTemp();
  }
  getCurrentYearAverageTemp() {
    let temperature = this.state.current_data.reduce((total, current) => total + (current.data.reduce((country_total, country_current) => country_total + country_current.value, 0)) / current.data.length, 0) / this.state.current_data.length;
    this.setState((state, props) => ({
      active_country_temp:temperature,
      current_year_average_temp:temperature
    }));
  }
  handleYearChange(event) {
    // If year is changed manually we stop the interval.
    clearInterval(interval);
    let year = event.target.value;
    this.setState((state, props) => ({
      controls_text:'Play',
      current_data:this.state.data[year],
      interval:false,
      year:year
    }), this.setPathColor);
  }
  
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app}>
        <Div100vh>
          <div className={style.title_container}>
            <h3>Temperature anomalies</h3>
            <div className={style.info_container}>
              <div>Data: <a href="https://climateknowledgeportal.worldbank.org/download-data">World Bank</a></div>
              <div>Author: <a href="https://twitter.com/teelmo">Teemo Tebest</a>, EBU</div>
              <div>Reference period: 1951–1980</div>
            </div>
          </div>
          <div className={style.map_container}></div>
          <div className={style.meta_container}>
            <div className={style.year_container}>{this.state.year}</div>
            <div className={style.range_container} ref={this.rangeContainerRef}>
              <input type="range" min={yearStart} value={this.state.year} max={yearEnd} onChange={(event) => this.handleYearChange(event)} />
            </div>
            <div className={style.controls_container} ref={this.controlsContainerRef} onClick={() => this.toggleInterval(this.state.year)}>{this.state.controls_text}</div>
          </div>
          <div className={style.scales_container}>
            {
              // The scale on the right.
              scales.map((scale, i) => {
                // Place the yearly marker.
                if (this.state.current_year_average_temp !== null && this.state.current_year_average_temp > scale  && this.state.current_year_average_temp < (scale + 0.2)) {
                  return (<div key={i} className={style.scale_container} style={{backgroundColor:'#fff'}}><div className={style.scale_text}><div className={style.year_text}>{this.state.year}</div><div>{(this.state.current_year_average_temp > 0 ? '+' : '') + this.state.current_year_average_temp.toFixed(1)}mm</div></div></div>);
                }
                // Place the zero point (disabled by css on default).
                else if (scale > -0.1 && scale < 0.1) {
                  return (<div key={i} className={style.scale_container} style={{backgroundColor:this.value2color(scale), borderBottom:'1px dashed rgba(255, 255, 255, 0.3)'}}><div className={style.scale_text_zero}><div>0mm</div></div></div>);
                }
                else {
                  return (<div key={i} className={style.scale_container} style={{backgroundColor:this.value2color(scale)}}></div>);
                }
              })
            }
          </div>
        </Div100vh>
      </div>
    );
  }
}
export default App;