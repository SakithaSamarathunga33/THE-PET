/**
 * Sample Employee Information
 * 
 * This script displays the login credentials for the sample employee account.
 * No database connection required.
 */

// Sample employee credentials
const sampleCredentials = {
  username: 'employee',
  password: 'Password123!',
  userType: 'employee'
};

console.log('----------------------------------------');
console.log('Sample Employee Login Credentials:');
console.log('----------------------------------------');
console.log('Username:', sampleCredentials.username);
console.log('Password:', sampleCredentials.password);
console.log('User Type:', sampleCredentials.userType);
console.log('----------------------------------------');
console.log('To create this sample employee in the database:');
console.log('1. Make sure MongoDB is running');
console.log('2. Make sure the server is running');
console.log('3. Visit: http://localhost:3000/create-sample-employee');
console.log('4. Click the "Create Sample Employee" button');
console.log('----------------------------------------');
console.log('Or use the "Login as Sample Employee" button on the same page');
console.log('to directly log in with these credentials.');
console.log('----------------------------------------'); 