const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportDestinations() {
  console.log('Fetching destinations from Firestore...');
  
  const snapshot = await db.collection('destinations').get();
  
  const destinations = [];
  snapshot.forEach(doc => {
    destinations.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  const output = {
    exported_at: new Date().toISOString(),
    total: destinations.length,
    destinations: destinations
  };
  
  const outputPath = path.join(__dirname, 'destinations-export.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`Exported ${destinations.length} destinations`);
  process.exit(0);
}

exportDestinations().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});

