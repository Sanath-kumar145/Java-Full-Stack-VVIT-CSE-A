//literal way 
let arr=[10,20,50,60];
console.log(arr);

//new keyword 
let skills=new Array("java","python","C")
console.log(skills);

console.log("-------------------------------");
//Array Inbuilt Functions

let arr1=[null , true,5000,'javascript'];
console.log(arr1);


arr1.push(41,"java")  //insert elements at last in array 
console.log(arr1);

arr1.pop() //removes element at last in array
console.log(arr1);


arr1.shift() //removes element at first in array
arr1.shift()
console.log(arr1);

arr1.unshift(4546,851,5511);//insert elements at first in array  
console.log(arr1);

arr1.splice(2,2); //Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
console.log(arr1);


arr1.splice(2,0 ,true , null , 5000); //Inserts new elements at the start of an array, and returns the new length of the array.
console.log(arr1);



arr1.splice(1,5,"Java");
console.log(arr1);


arr1.reverse()
console.log(arr1);
arr1.sort()
console.log(arr1);

