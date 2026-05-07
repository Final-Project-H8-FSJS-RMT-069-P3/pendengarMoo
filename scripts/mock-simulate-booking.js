// Mock simulation of booking -> payment confirm -> calendar sync
// Run with: node scripts/mock-simulate-booking.js

(function () {
  const now = new Date();

  // Simple in-memory collections
  const db = {
    Orders: [],
    UserBookings: [],
    Rooms: [],
    Users: [],
  };

  // Helper to generate ids
  let idCounter = 1;
  function genId(prefix) {
    return `${prefix || 'id'}-${(idCounter++).toString()}`;
  }

  // Seed users (patient + doctor)
  const patient = {
    _id: 'u-1',
    name: 'Alice Patient',
    email: 'alice@example.com',
    googleCalendar: {
      connected: true,
      provider: 'google',
      providerEmail: 'alice@example.com',
      accessToken: 'atk',
      refreshToken: 'rtk',
      scope: '',
      tokenType: 'Bearer',
      expiryDate: Date.now() + 3600 * 1000,
      updatedAt: new Date(),
    },
  };
  const doctor = {
    _id: 'u-2',
    name: 'Dr Bob',
    email: 'drbob@example.com',
    googleCalendar: {
      connected: true,
      provider: 'google',
      providerEmail: 'drbob@example.com',
      accessToken: 'atk2',
      refreshToken: 'rtk2',
      scope: '',
      tokenType: 'Bearer',
      expiryDate: Date.now() + 3600 * 1000,
      updatedAt: new Date(),
    },
  };

  db.Users.push(patient, doctor);

  // Simulate an incoming booking order created earlier (bookingPayload saved in Orders)
  const bookingPayload = {
    userId: patient._id,
    staffId: doctor._id,
    formBriefId: null,
    date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    sessionDuration: 50,
    amount: 120000,
    type: 'videocall',
    isPaid: false,
    isDone: false,
    createdAt: now.toISOString(),
  };

  const orderId = 'ORDER-MOCK-1';
  db.Orders.push({
    orderId,
    userId: patient._id,
    bookingId: null,
    bookingPayload,
    items: [],
    totalAmount: bookingPayload.amount,
    status: 'pending',
    paymentToken: 'tok-mock',
    customerDetails: { first_name: patient.name, email: patient.email },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  console.log('Initial DB state:');
  console.log(JSON.stringify(db, null, 2));

  // Mocked Midtrans status check -> treat as settlement
  const txStatus = 'settlement';

  (async function processConfirmation() {
    console.log('\n--- Running mocked confirm flow ---');
    // find order
    const order = db.Orders.find((o) => o.orderId === orderId);
    if (!order) {
      console.error('Order not found');
      return;
    }

    const successStates = ['settlement', 'capture', 'success'];
    if (!successStates.includes(txStatus)) {
      order.status = 'failed';
      order.updatedAt = new Date().toISOString();
      console.log('Payment not successful:', txStatus);
      return;
    }

    // create booking from payload
    const bookingPayloadToInsert = { ...order.bookingPayload };
    bookingPayloadToInsert.isPaid = true;
    bookingPayloadToInsert.createdAt = new Date().toISOString();
    const newBookingId = genId('booking');
    bookingPayloadToInsert._id = newBookingId;

    db.UserBookings.push(bookingPayloadToInsert);

    // create room
    const roomName = `room-${newBookingId}`;
    db.Rooms.push({
      userId: bookingPayloadToInsert.userId,
      staffId: bookingPayloadToInsert.staffId,
      roomName,
      createdAt: new Date().toISOString(),
    });

    // update order
    order.bookingId = newBookingId;
    order.status = 'success';
    order.updatedAt = new Date().toISOString();

    console.log('Booking created with id', newBookingId);

    // Mock calendar sync: check both users have googleCalendar connected
    const userData = db.Users.find(
      (u) => u._id === bookingPayloadToInsert.userId,
    );
    const doctorData = db.Users.find(
      (u) => u._id === bookingPayloadToInsert.staffId,
    );

    if (!userData || !doctorData) {
      console.warn('Missing user or doctor for calendar sync');
    } else if (
      !userData.googleCalendar?.refreshToken ||
      !doctorData.googleCalendar?.refreshToken
    ) {
      console.warn('One of parties not connected to Google Calendar');
      // mark sync failed
      const booking = db.UserBookings.find((b) => b._id === newBookingId);
      booking.googleCalendarSyncStatus = 'failed';
      booking.googleCalendarSyncError = 'Not connected';
    } else {
      // mock createPrimaryCalendarEvent returning eventId, eventLink, meetLink
      const calendarEvent = {
        eventId: genId('gcal'),
        eventLink: `https://calendar.google.com/event?eid=${genId('eid')}`,
        meetLink: `https://meet.google.com/${Math.random().toString(36).slice(2, 11)}`,
      };

      // update booking with calendar info
      const booking = db.UserBookings.find((b) => b._id === newBookingId);
      booking.googleCalendarEventId = calendarEvent.eventId;
      booking.googleCalendarEventLink = calendarEvent.eventLink;
      booking.googleMeetLink = calendarEvent.meetLink;
      booking.videoCallUrl = calendarEvent.meetLink;
      booking.googleCalendarSyncStatus = 'success';

      console.log('Mock calendar event created:', calendarEvent.meetLink);
    }

    console.log('\n--- Final DB state after confirm & calendar sync ---');
    console.log(JSON.stringify(db, null, 2));
  })();
})();
