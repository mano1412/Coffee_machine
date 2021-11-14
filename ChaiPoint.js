const logger = require('./utils/logger');
const config = require('./machine_config/config.json');
let data = require('./TestCase');

const outlets = config.machine["outlets"]["count_n"];
const gradinets_Capacity = config.machine["total_items_quantity"];
const beverages_Composition = config.machine["beverages"];

let availabale_ingredients = gradinets_Capacity ; // ingradients availibility for reach serve request
let compositionByBeverages = beverages_Composition ; // composition of ingradients for each beverages

logger.info('Opening Shop.....');
logger.info('Getting Machine Ready....');


function getListOfbeverages (){
  let temp=[];
  for(let key in compositionByBeverages){
    temp.push(key);
  }
  return temp;
}

function checkForIngradientsStock(stock,composition){
let check={
  status:true,
  item:[]
}
for(let i in composition){
  if(composition[i]>stock[i]){
    logger.warn(`${i} is running low`);
    check.status=false;
    check.item.push(i);
  }
}
return check;
}

function updatestock(stock,composition){
  for( let i in composition){
   stock[i]=stock[i]-composition[i];
  }
  return stock;
}


(function serve(){
  let beverages_list = getListOfbeverages();   //getList of available beverages
try{
  for(let i=0;i<data.length;i++)  {
    let requests = data[i];
    logger.info("Received Requests to serve :: ",requests);
    for(let j=0;j<outlets && requests.length>0;j++){
      let beverage_to_serve = requests[0];

      if(beverages_list.includes(beverage_to_serve)){
        //checking for ingradients Availibility
        let check = checkForIngradientsStock(availabale_ingredients,compositionByBeverages[beverage_to_serve]);
        if(check && check.status==true){
          availabale_ingredients = updatestock(availabale_ingredients,compositionByBeverages[beverage_to_serve]);
          logger.info(`${beverage_to_serve} is prepared`);
        }
        else{
        logger.error(`${beverage_to_serve} cannot be prepared because ${check.item} is not sufficient`);
        }
      }
      else{
        logger.warn(`${beverage_to_serve} cannot be prepared because ${beverage_to_serve} mixture is not available`);
      }
      requests.splice(0,1);
    }
    //Refilling the ingradients
    availabale_ingredients = gradinets_Capacity ;
  }
}
catch(err){
    logger.error('Error in Processing...',err);
}
})();
