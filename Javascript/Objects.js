//literal way

let empDetails={
    name:"sai kumar",
    role:"developer",
    salary:250000,
    skills:["System design","microservice","monolithic Architechture","Even driven"],
    address:{
        city:"Guntur",
        zipcode:534245
    }
}
console.log(empDetails);

//using new Keyword
let emp2=new Object({
    name:"sai kumar",
    role:"developer",
    salary:250000,
    skills:["System design","microservice","monolithic Architechture","Even driven"],
    address:{
        city:"Guntur",
        zipcode:534245
    }
})
console.log(emp2);

//CRUD operations
console.log("============CRUD========================");
console.log(empDetails.name);
console.log(empDetails.skills[1]);

empDetails.skills.map((s)=>{
    console.log(s);
})

console.log(empDetails.address);
console.log(empDetails.address.city.charAt(4));

// Object.seal(empDetails)
//Object.freeze(empDetails)
console.log(Object.isFrozen(empDetails));
console.log(Object.isSealed(empDetails));


empDetails.email="ravi@tcs.com"
empDetails.phoneno = 98765432

delete empDetails.skills
delete empDetails.name
empDetails.salary=150000
console.log(empDetails);

//Object inbuild functions
console.log("=====================Object Inbuilt functions===================");
// console.log(Object.keys(empDetails));
// console.log(Object.values(empDetails));
// console.log(Object.entries(empDetails));

// Object.seal()

