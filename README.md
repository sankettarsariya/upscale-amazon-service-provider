# Upscale Amazon Service Provider

Dynamic landing page for an Amazon seller account service provider.

## What is included

- Landing page at `/`
- Working contact form with Firebase Firestore
- Admin leads dashboard at `/admin`
- Admin login with Firebase Auth
- CSV export from the admin dashboard
- Editable Firebase and business settings in `public/firebase-config.js`
- Firebase Hosting config

## Run locally

Static Firebase version:

```bash
firebase emulators:start
```

Simple local preview without emulators:

```bash
node server.js
```

Open:

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin

## Project structure

```text
upscale-amazon-service-provider/
  firebase.json
  firestore.rules
  public/
    admin.html
    admin.js
    app.js
    firebase-config.js
    index.html
    styles.css
  server.js
  README.md
```

## Edit contact details

Open `public/firebase-config.js` and update the `businessSettings` object:

```js
export const businessSettings = {
  brand: "Upscale",
  whatsappNumber: "919999999999",
  displayPhone: "+91 99999 99999",
  email: "hello@upscale.in",
  location: "Surat, Gujarat, India"
};
```

## Firebase setup

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login:

```bash
firebase login
```

3. In Firebase Console, enable:

- Firestore Database
- Authentication > Sign-in method > Email/Password

4. Create one admin user in Firebase Authentication.

5. Deploy:

```bash
firebase deploy
```

Live URLs after deploy:

```text
https://upscale-da207.web.app
https://upscale-da207.firebaseapp.com
```

## Security note

Website visitors can only create leads. Reading leads requires Firebase Auth login because Firestore rules protect the `leads` collection.
