// submit-form.js (Node.js script for serverless function or webhook)
const { google } = require('googleapis');

// Replace with your Google Sheets API credentials and Spreadsheet ID
const GOOGLE_SHEET_ID = 'YOUR_SPREADSHEET_ID';
const GOOGLE_CREDENTIALS = require('./credentials.json'); // Service account JSON key

const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const formData = new URLSearchParams(event.body);
    const name = formData.get('name');
    const email = formData.get('email');
    const service = formData.get('service');
    const message = formData.get('message');
    const timestamp = new Date().toISOString();

    // Append data to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Sheet1!A:E', // Adjust range based on your sheet structure
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[timestamp, name, email, service, message]],
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Form submitted successfully' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

// For local testing with Express (optional, not needed for serverless)
if (require.main === module) {
  const express = require('express');
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.post('/submit-form', (req, res) => {
    exports.handler({ httpMethod: 'POST', body: req.body })
      .then(response => res.status(response.statusCode).json(JSON.parse(response.body)));
  });
  app.listen(3000, () => console.log('Server running on port 3000'));
}
