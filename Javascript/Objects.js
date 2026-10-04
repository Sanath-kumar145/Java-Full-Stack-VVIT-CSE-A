//literal way 
let empDetails={
    name:"sai kumar",
    role:"developer",
    salary:250000,
    skills:["System design","Microservices","Monolithic Architecture", "Even driven","Database Design"], 
    address:{
        city:"Guntur",
        zipCode:541245
    }
}
console.log(empDetails);

//using new keyword
let emp2=new Object({name:"ravi",role:"Test Engineer"})
console.log(emp2);

//CRUD Operation
console.log("--------CRUD Operation------------------");
console.log(empDetails.name);
console.log(empDetails.skills[1]);
//print skills using map function
empDetails.skills.map((s)=>{
    console.log(s);
})

console.log(empDetails.address);


// Object.seal(empDetails)
// Object.freeze(empDetails)
console.log(Object.isFrozen(empDetails));
console.log(Object.isSealed(empDetails));

empDetails.email="ravi@tcs.com"
empDetails.phone=9874561230

delete empDetails.skills;
delete empDetails.name;
empDetails.salary=150000

console.log(empDetails);

//Object Inbuilt Function
console.log("**************Object Inbuilt Function*********************");

console.log(Object.keys(empDetails));
console.log(Object.values(empDetails));
console.log(Object.entries(empDetails));







