# NotePro

A beautiful, modern React application for managing projects and notes with Firebase integration. This application allows you to create projects, add notes to them, and automatically detects the format of your notes.

## Features

- **Project Management**: Create, edit, and delete projects
- **Note Organization**: Add notes to specific projects
- **Format Detection**: Automatically detects note formats (plain text, markdown, code, task lists, links)
- **Firebase Integration**: Cloud storage for notes and authentication
- **Beautiful UI**: Modern design with Material-UI components
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Google Authentication**: Secure sign-in with Google account

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Local Development Setup

1. Clone the repository
```
git clone https://github.com/johnsp3/notepro.git
cd notepro
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

4. Start the development server
```
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

1. Fork or push your code to GitHub

2. Log in to [Vercel](https://vercel.com) and create a new project

3. Import your GitHub repository

4. Configure the project:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

5. Add environment variables:
   - Add the same variables from your `.env` file to Vercel's Environment Variables section
   - These are the Firebase configuration values (do not include quotes)

6. Deploy the project

7. (Optional) Configure a custom domain in Vercel dashboard

## Usage

1. **Sign in**: Use Google authentication to sign in
2. **Create a Project**: Click the "New Project" button in the header
3. **Add Notes**: Select a project and click the "+" button in the notes panel
4. **Edit Notes**: Click on a note to edit its content
5. **Format Detection**: The app will automatically detect the format of your note based on its content
6. **Upload Images**: Add images to your notes using the image upload button

## Note Formats

The application can detect the following formats:

- **Plain Text**: Regular text
- **Markdown**: Text with Markdown syntax
- **Code**: Programming code snippets
- **Task List**: Lists with checkbox items
- **Link**: URLs and web links

## Firebase Setup

This application uses Firebase for:
- Authentication (Google sign-in)
- Cloud Storage (note images and attachments)
- Future integration with Firestore (coming soon)

### Firebase Storage Rules

For security, configure Firebase Storage rules to only allow authenticated users:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.token.email == "your_email@gmail.com";
    }
  }
}
```

## Technical Details

- Built with React and TypeScript
- Uses Material-UI for the component library
- State management with React Context API
- Firebase for authentication and storage
- Environment variables for secure configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details.