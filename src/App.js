import { Typography, Chip, Button, ButtonGroup, Slider} from '@material-ui/core';
import {useState, useEffect} from 'react'
import {sortBy, size, map, uniq, maxBy, filter} from 'lodash'
import {format, formatDistanceToNow} from 'date-fns'

import './App.css';
import {request, parseName} from './helper'

const sizeLimit = 250;

function App() {
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [page, setPage]=useState(0);
  const [priceRange, setPriceRange] = useState([0, 100]);

  useEffect(()=>{
    if(size(experiences)<sizeLimit){
      request({type: "experiences", method: "get", value:{page:page}}).then(({data:{data:{children=[], after}={}}={}})=>{
        const mappedData = children.map(({data:{title, thumbnail, url}={}})=>{
          const titleParsed = parseName(title);
          return {
            ...titleParsed,
            thumbnail,
            url
          }
        });
  
        setExperiences([...experiences, ...mappedData]);
        setPage(after)
      })
    }
  }, [page]);

  useEffect(()=>{
    const sorted = sortBy(experiences, ({isExpired})=>isExpired);
    setFilteredExperiences(sorted);
    setPriceRange([priceRange[0] || 0, maxBy(map(sorted, ({price})=>parseInt(price.replace('$', ''))))]);
  }, [experiences]);

  useEffect(()=>{
    const filtered = filter(sortBy(experiences, ({isExpired})=>isExpired), ({price})=>
      parseInt(price.replace('$', '')) > priceRange[0] && parseInt(price.replace('$', ''))<=priceRange[1]
    );
    setFilteredExperiences(filtered);
  }, [priceRange])

  const goToExperience = (url)=>{
    window.open(url, "_blank")
  }

  const getDeviceTypes = ()=> uniq(map(experiences, ({device})=>device))

  const changePriceRange = (e, value)=>{
    setPriceRange(value);
  };

  return (
    <div className="App">
      <div><Typography variant="h3">VR Promo Tracker</Typography></div>
      <hr/>
      <div className="filters">
        <Typography variant="h4">Filters</Typography>
        <div className="container">
          <div className="deviceType">
            <Typography>Device type</Typography>
            <ButtonGroup color="primary" aria-label="outlined primary button group">
              {getDeviceTypes().map((row)=><Button key={row}>{row}</Button>)}
            </ButtonGroup>
          </div>
          <div className="priceRange">
          <Typography>Price</Typography>
            <Slider
              value={priceRange}
              onChange={changePriceRange}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              getAriaValueText={""}
              className="slider"
              max={maxBy(map(experiences, ({price})=>parseInt(price.replace('$', ''))))}
            />
          </div>
        </div>
      </div>

      <div className="ExperienceContainer">
        {filteredExperiences.map(({device, thumbnail, title, url, isExpired, price, discount, endDate}, i)=>(
          <div className="Experience" onClick={goToExperience.bind(null, url)} key={url}>
            <img src={thumbnail} alt="" className={isExpired?"expired":""}/>
            {isExpired&&<Typography className="expiredLabel">Expired</Typography>}
            <div><Typography variant="caption">{title}</Typography></div>
            {price && discount && <Typography><s>${Math.round(price.replace("$", "")/(1-parseInt(discount.replace("%", "").replace("-", ""))/100)) || 0}</s> {price} ({discount!=="null"?discount : "0%"})</Typography>}
            <div><Typography variant="caption">{isExpired?"Ended":"Ends in"} {!isExpired? formatDistanceToNow(endDate) : format(endDate, "dd MMM yyyy")}</Typography></div>
            <Chip label={device} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
