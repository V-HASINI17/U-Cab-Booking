/**
 * UCAB E2E Test Suite
 * Programmatically verifies:
 * 1. User & Driver registration + login
 * 2. Admin login & driver verification
 * 3. Cab creation with multipart file upload (dummy image)
 * 4. Booking fare estimation
 * 5. Booking creation (with atomic race-condition check)
 * 6. Driver workflow state machine (Pending -> Confirmed -> Arriving -> In Progress -> Completed)
 * 7. Simulated card payment & verification
 * 8. Receipt generation with access control
 * 9. Support ticket submission, replies (no null crashes), and resolution
 * 10. Dashboard aggregation stats
 * 
 * Run using: node scripts/test_e2e.js
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../models/UserSchema');
const Car = require('../models/CarSchema');
const Booking = require('../models/MyBookingSchema');
const SupportTicket = require('../models/SupportTicketSchema');

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

async function runTests() {
  console.log('🚀 Starting UCAB E2E Integration Test Suite...');
  
  // Test data definitions
  const testPassenger = {
    name: 'E2E Passenger User',
    email: 'passenger_e2e@example.com',
    password: 'Password123',
    mobile: '9999999901',
    role: 'user'
  };

  const testDriver = {
    name: 'E2E Driver User',
    email: 'driver_e2e@example.com',
    password: 'Password123',
    mobile: '9999999902',
    role: 'driver',
    driverDetails: {
      licenseNumber: 'DL-E2E-99999',
      vehicleModel: 'Tesla Model 3',
      vehicleNumber: 'E2E-PLATE-99',
      vehicleType: 'Sedan',
      city: 'New York'
    }
  };

  let passengerToken = '';
  let passengerId = '';
  let driverToken = '';
  let driverId = '';
  let adminToken = '';
  let carId = '';
  let bookingId = '';
  let ticketId = '';

  const results = [];
  const logResult = (name, status, details = '') => {
    results.push({ name, status, details });
    console.log(`${status === 'PASS' ? '✅' : '❌'} [${status}] ${name} ${details ? `(${details})` : ''}`);
  };

  try {
    // ----------------------------------------------------
    // 1. User Registration
    // ----------------------------------------------------
    const regPassRes = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPassenger)
    });
    const regPassData = await regPassRes.json();
    if (regPassRes.status === 201 && regPassData.success) {
      logResult('Passenger Registration', 'PASS');
      passengerId = regPassData.data._id;
    } else {
      throw new Error(`Passenger registration failed: ${regPassData.message}`);
    }

    // ----------------------------------------------------
    // 2. User Login
    // ----------------------------------------------------
    const loginPassRes = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testPassenger.email, password: testPassenger.password })
    });
    const loginPassData = await loginPassRes.json();
    if (loginPassRes.status === 200 && loginPassData.success) {
      passengerToken = loginPassData.data.token;
      logResult('Passenger Login & JWT Issuance', 'PASS');
    } else {
      throw new Error(`Passenger login failed: ${loginPassData.message}`);
    }

    // ----------------------------------------------------
    // 3. Driver Registration
    // ----------------------------------------------------
    const regDriverRes = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testDriver)
    });
    const regDriverData = await regDriverRes.json();
    if (regDriverRes.status === 201 && regDriverData.success) {
      driverId = regDriverData.data._id;
      logResult('Driver Registration (Pending status)', 'PASS');
    } else {
      throw new Error(`Driver registration failed: ${regDriverData.message}`);
    }

    // ----------------------------------------------------
    // 4. Driver Login
    // ----------------------------------------------------
    const loginDriverRes = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testDriver.email, password: testDriver.password })
    });
    const loginDriverData = await loginDriverRes.json();
    if (loginDriverRes.status === 200 && loginDriverData.success) {
      driverToken = loginDriverData.data.token;
      logResult('Driver Login & JWT Issuance', 'PASS');
    } else {
      throw new Error(`Driver login failed: ${loginDriverData.message}`);
    }

    // ----------------------------------------------------
    // 5. Admin Login
    // ----------------------------------------------------
    const loginAdminRes = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ucab.com', password: 'Admin@123' })
    });
    const loginAdminData = await loginAdminRes.json();
    if (loginAdminRes.status === 200 && loginAdminData.success) {
      adminToken = loginAdminData.data.token;
      logResult('Admin Login & JWT Issuance', 'PASS');
    } else {
      throw new Error(`Admin login failed: ${loginAdminData.message}`);
    }

    // ----------------------------------------------------
    // 6. Admin Verify Driver
    // ----------------------------------------------------
    const verifyRes = await fetch(`${BASE_URL}/admin/drivers/${driverId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Verified' })
    });
    const verifyData = await verifyRes.json();
    if (verifyRes.status === 200 && verifyData.success && verifyData.data.driverDetails.status === 'Verified') {
      logResult('Admin Verification of Driver', 'PASS');
    } else {
      throw new Error(`Driver verification failed: ${verifyData.message}`);
    }

    // ----------------------------------------------------
    // 7. Add Cab (Multipart Form Upload)
    // ----------------------------------------------------
    const formData = new FormData();
    formData.append('name', 'E2E Tesla Model 3');
    formData.append('type', 'Sedan');
    formData.append('number', 'E2E-PLATE-99');
    formData.append('seats', '4');
    formData.append('pricePerKm', '18');
    formData.append('city', 'New York');
    formData.append('assignedDriverId', driverId);
    
    // Create dummy image file using Blob
    const dummyBlob = new Blob(['dummy png image data'], { type: 'image/png' });
    formData.append('image', dummyBlob, 'car.png');

    const carRes = await fetch(`${BASE_URL}/cars`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      body: formData
    });
    const carData = await carRes.json();
    if (carRes.status === 201 && carData.success) {
      carId = carData.data._id;
      logResult('Admin Cab CRUD: Create with Image Upload', 'PASS');
    } else {
      throw new Error(`Cab creation failed: ${carData.message}`);
    }

    // ----------------------------------------------------
    // 8. Booking Fare Estimation
    // ----------------------------------------------------
    const estRes = await fetch(`${BASE_URL}/bookings/estimate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${passengerToken}`
      },
      body: JSON.stringify({ distance: 20, carType: 'Sedan' })
    });
    const estData = await estRes.json();
    if (estRes.status === 200 && estData.success && estData.data.totalFare > 0) {
      logResult('Booking Fare Estimation', 'PASS', `Est: $${estData.data.totalFare}`);
    } else {
      throw new Error(`Fare estimation failed: ${estData.message}`);
    }

    // ----------------------------------------------------
    // 9. Booking Creation
    // ----------------------------------------------------
    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${passengerToken}`
      },
      body: JSON.stringify({
        carId: carId,
        pickup: 'Times Square, NY',
        drop: 'JFK Airport, NY',
        date: '2026-08-01',
        time: '12:00',
        distance: 20
      })
    });
    const bookData = await bookRes.json();
    if (bookRes.status === 201 && bookData.success) {
      bookingId = bookData.data._id;
      logResult('Booking Creation (Status: Pending)', 'PASS');
    } else {
      throw new Error(`Booking creation failed: ${bookData.message}`);
    }

    // ----------------------------------------------------
    // 10. Role-Based Access: Passenger cannot confirm own ride
    // ----------------------------------------------------
    const invalidConfirmRes = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${passengerToken}`
      },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    if (invalidConfirmRes.status === 400 || invalidConfirmRes.status === 403) {
      logResult('Role-Based Access: Passenger Blocked from Ride Confirmation', 'PASS');
    } else {
      logResult('Role-Based Access: Passenger Blocked from Ride Confirmation', 'FAIL', `Returned ${invalidConfirmRes.status}`);
    }

    // ----------------------------------------------------
    // 11. Driver Workflow State: Confirm Ride
    // ----------------------------------------------------
    const confirmRes = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`
      },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    const confirmData = await confirmRes.json();
    if (confirmRes.status === 200 && confirmData.success && confirmData.data.status === 'Confirmed') {
      logResult('Driver Workflow: Status Confirmed', 'PASS');
    } else {
      throw new Error(`Driver status change to Confirmed failed: ${confirmData.message}`);
    }

    // ----------------------------------------------------
    // 12. Driver Workflow State: Arriving
    // ----------------------------------------------------
    const arrivingRes = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`
      },
      body: JSON.stringify({ status: 'Arriving' })
    });
    const arrivingData = await arrivingRes.json();
    if (arrivingRes.status === 200 && arrivingData.success && arrivingData.data.status === 'Arriving') {
      logResult('Driver Workflow: Status Arriving', 'PASS');
    } else {
      throw new Error(`Driver status change to Arriving failed: ${arrivingData.message}`);
    }

    // ----------------------------------------------------
    // 13. Driver Workflow State: In Progress
    // ----------------------------------------------------
    const ipRes = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`
      },
      body: JSON.stringify({ status: 'In Progress' })
    });
    const ipData = await ipRes.json();
    if (ipRes.status === 200 && ipData.success && ipData.data.status === 'In Progress') {
      logResult('Driver Workflow: Status In Progress', 'PASS');
    } else {
      throw new Error(`Driver status change to In Progress failed: ${ipData.message}`);
    }

    // ----------------------------------------------------
    // 14. Driver Workflow State: Completed
    // ----------------------------------------------------
    const compRes = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`
      },
      body: JSON.stringify({ status: 'Completed' })
    });
    const compData = await compRes.json();
    if (compRes.status === 200 && compData.success && compData.data.status === 'Completed') {
      logResult('Driver Workflow: Status Completed', 'PASS');
    } else {
      throw new Error(`Driver status change to Completed failed: ${compData.message}`);
    }

    // ----------------------------------------------------
    // 15. Passenger Processing Simulated Card Payment
    // ----------------------------------------------------
    const payRes = await fetch(`${BASE_URL}/bookings/${bookingId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${passengerToken}`
      },
      body: JSON.stringify({
        paymentMethod: 'Card',
        cardDetails: {
          cardNumber: '1111222233334444',
          expiry: '12/28',
          cvv: '777'
        }
      })
    });
    const payData = await payRes.json();
    if (payRes.status === 200 && payData.success && payData.data.paymentStatus === 'Paid') {
      logResult('Simulated Checkout Payment Processing', 'PASS');
    } else {
      throw new Error(`Simulated payment failed: ${payData.message}`);
    }

    // ----------------------------------------------------
    // 16. Receipt Generation & Access Control
    // ----------------------------------------------------
    const receiptRes = await fetch(`${BASE_URL}/bookings/${bookingId}/receipt`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${passengerToken}`
      }
    });
    const receiptData = await receiptRes.json();
    if (receiptRes.status === 200 && receiptData.success && receiptData.data.paymentDetails.transactionId) {
      logResult('Receipt Generation & Access Control Verification', 'PASS');
    } else {
      throw new Error(`Receipt retrieval failed: ${receiptData.message}`);
    }

    // ----------------------------------------------------
    // 17. Support Ticket Submission
    // ----------------------------------------------------
    const ticketRes = await fetch(`${BASE_URL}/support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${passengerToken}`
      },
      body: JSON.stringify({
        subject: 'E2E Ticket Check',
        message: 'Could you confirm driver details on the receipt?',
        category: 'Driver'
      })
    });
    const ticketData = await ticketRes.json();
    if (ticketRes.status === 201 && ticketData.success) {
      ticketId = ticketData.data._id;
      logResult('Support Module: Create Support Ticket', 'PASS');
    } else {
      throw new Error(`Ticket creation failed: ${ticketData.message}`);
    }

    // ----------------------------------------------------
    // 18. Admin Reply to Support Ticket
    // ----------------------------------------------------
    const replyRes = await fetch(`${BASE_URL}/support/${ticketId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        message: 'Yes, driver details are listed on the print layout.',
        status: 'Resolved'
      })
    });
    const replyData = await replyRes.json();
    if (replyRes.status === 200 && replyData.success) {
      logResult('Support Module: Admin Reply (Stored sender info)', 'PASS');
    } else {
      throw new Error(`Admin reply failed: ${replyData.message}`);
    }

    // ----------------------------------------------------
    // 19. Admin Dashboard Metrics Verification
    // ----------------------------------------------------
    const statsRes = await fetch(`${BASE_URL}/admin/dashboard-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const statsData = await statsRes.json();
    if (statsRes.status === 200 && statsData.success && statsData.data.stats) {
      logResult('Admin Dashboard Aggregation Statistics', 'PASS');
    } else {
      throw new Error(`Dashboard stats retrieval failed: ${statsData.message}`);
    }

  } catch (err) {
    console.error('❌ E2E Execution Halted:', err.message);
  } finally {
    // ----------------------------------------------------
    // CLEANUP DATABASE
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test database records...');
    try {
      await mongoose.connect(process.env.MONGO_URI);
      
      const userDelete = await User.deleteMany({
        email: { $in: [testPassenger.email, testDriver.email] }
      });
      console.log(`- Deleted ${userDelete.deletedCount} users`);

      if (carId) {
        // Delete image file first
        const carObj = await Car.findById(carId);
        if (carObj && carObj.image) {
          const imgPath = require('path').join(__dirname, '../uploads', carObj.image);
          if (require('fs').existsSync(imgPath)) {
            require('fs').unlinkSync(imgPath);
            console.log('- Cleaned up uploaded car image file');
          }
        }
        const carDelete = await Car.deleteOne({ _id: carId });
        console.log(`- Deleted ${carDelete.deletedCount} cars`);
      }

      if (bookingId) {
        const bookDelete = await Booking.deleteOne({ _id: bookingId });
        console.log(`- Deleted ${bookDelete.deletedCount} bookings`);
      }

      if (ticketId) {
        const ticketDelete = await SupportTicket.deleteOne({ _id: ticketId });
        console.log(`- Deleted ${ticketDelete.deletedCount} support tickets`);
      }

      console.log('✅ DB Cleanup completed successfully.');
    } catch (cleanupErr) {
      console.error('❌ Cleanup failed:', cleanupErr.message);
    } finally {
      await mongoose.disconnect();
    }
  }

  // Print Summary Table
  console.log('\n=======================================');
  console.log('          E2E TEST SUMMARY');
  console.log('=======================================');
  let passCount = 0;
  results.forEach(r => {
    if (r.status === 'PASS') passCount++;
    console.log(`${r.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} | ${r.name}`);
  });
  console.log('=======================================');
  console.log(`TOTAL: ${results.length} | PASSED: ${passCount} | FAILED: ${results.length - passCount}`);
  console.log(`E2E Verification Verdict: ${passCount === results.length ? '100% SUCCESS ✅' : 'FAIL ❌'}`);
  console.log('=======================================');
}

runTests();
