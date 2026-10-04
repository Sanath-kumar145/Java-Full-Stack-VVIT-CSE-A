let arr=[10,20,30,40,50,60];
let str="Javascript";

//for-of loop 
for(let val of arr){
    console.log(val)
}

for(let ch of str){
    console.log(ch);
}

//for-in  loop
for(let  ind in arr){
    console.log(ind)
}

for(let ind in str){
    console.log(ind);
}

//forEach loop
arr.forEach((val,ind,a)=>{
    console.log(val,"-> ",ind,"->",a);
})


console.log("==================MAP Function==================");
let prices=[500,102,456,7812,1542,4512,510,12,741,41,54841];
console.log(prices);

let discountedPrices=prices.map((x)=>{
    return x-x/10;
})
console.log(discountedPrices);

let addedExtraAmount=prices.map((z)=>{
    return z+250;
})
console.log(addedExtraAmount);

console.log("==================FILTER Function==================");
let filteredPrices=discountedPrices.filter((x)=>{
    return x>=500&&x<=5000;
})
console.log(filteredPrices);


console.log("==================Reduce Function==================");

const totalPrice=filteredPrices.reduce((acl , val)=>{
   return acl+val 
},500)

console.log(totalPrice);
