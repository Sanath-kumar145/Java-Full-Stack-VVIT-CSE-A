for(let i=0;i<=10;i++){
    console.log('***********************');
    console.log();
    console.log('***********************');
}

let arr=[10,20,30,40];
let str = "Javascript";
//for of loop
for( let val of arr){
    console.log(val);
}

for(let ch of str){
    console.log(ch);
}

//for in loop
for( let ind in arr){
    console.log(ind);
}

for(let ind in str){
    console.log(ind);
}

//foreach loop
arr.forEach((val,ind,a)=>{
    console.log(val,"->",ind,"->",a);
})

console.log("============Map functions=============");
let prices=[100,102,2456,345,898,3435,987,234567];
console.log(prices);
let discountedprices=prices.map((x)=>{
    // console.log(x);
    return x-x/10;
})
console.log(discountedprices);

// let Additionalprices=prices.map((x)=>{
//     // console.log(x);
//     return x+250;
// })
// console.log(Additionalprices);
let addedExtraAmount=prices.map((z)=>{
    return z+250;
})
console.log(addedExtraAmount);

console.log("============Filter functions=============");
let filteredPrices = prices.filter((x)=>{
    return x<5000 && x>500
})
console.log(filteredPrices);

console.log("============Reduce functions=============");

// filteredPrices.reduce((pre,curval,curind,a)=>{
//     console.log(pre,"->",curval,"->",curind,"->",a);
// })

const totalprices=filteredPrices.reduce((ar1,val)=>{
    return ar1+val;
})
console.log(totalprices);