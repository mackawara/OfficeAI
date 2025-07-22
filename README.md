# OfficeAI - AI-Powered Document Processing

A Next.js application that uses AI to extract text from scanned images and generate Word documents and PDFs.

## Features

- 📸 **Image Upload**: Drag and drop or click to upload scanned images
- 🤖 **AI Text Extraction**: Uses OpenAI's GPT-4 Vision API to extract text from images
- 📄 **Document Generation**: Automatically creates Word documents and PDFs
- 💾 **Database Storage**: MongoDB integration for storing processed documents
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- 📱 **Mobile Friendly**: Works seamlessly on all devices
- 🔒 **Security Features**: Rate limiting and email allowlisting for signup
- 👨‍💼 **Admin Dashboard**: Monitor allowed emails and rate limiting configuration

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI GPT-4 Vision API
- **Document Generation**: 
  - Word documents: `docx` library
  - PDFs: `pdf-lib` library
- **File Upload**: `react-dropzone`
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- OpenAI API key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OfficeAI
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/office-ai

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Next.js Configuration
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use a cloud service like MongoDB Atlas.

5. **Run the development server**
   ```bash
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload an Image**
   - Drag and drop a scanned image onto the upload area
   - Or click to select a file from your device
   - Supported formats: JPEG, PNG, GIF, BMP, TIFF

2. **AI Processing**
   - The application will use OpenAI's Vision API to extract text
   - Processing time depends on image complexity and size

3. **View Results**
   - Extracted text is displayed in the preview panel
   - Copy text to clipboard with one click

4. **Download Documents**
   - Download as Word document (.docx)
   - Download as PDF (.pdf)
   - Documents are automatically generated from the extracted text

## API Endpoints

- `POST /api/process-image` - Process uploaded image and extract text
- `GET /api/download/word/[id]` - Download Word document by ID
- `GET /api/download/pdf/[id]` - Download PDF document by ID
- `POST /api/auth/signup` - User registration (rate limited)
- `GET /api/admin/allowed-emails` - Get list of allowed emails (admin only)

## Security Features

### Rate Limiting
- Signup requests are rate limited per IP address
- Configurable via `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS` environment variables
- Default: 5 requests per 15 minutes per IP

### Email Allowlisting
- Only authorized email addresses can register for accounts
- Configured via `ALLOWED_EMAILS` environment variable (comma-separated)
- If no emails are configured, all emails are allowed
- Admin dashboard available at `/admin` to monitor configuration

## Database Schema

```javascript
Document {
  originalText: String,
  wordUrl: String,
  pdfUrl: String,
  createdAt: Date
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for vision processing | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum signup attempts per IP (default: 5) | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds (default: 900000) | No |
| `ALLOWED_EMAILS` | Comma-separated list of allowed email addresses for signup | No |

## Development

### Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── process-image/
│   │   └── download/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ImageUpload.tsx
│   └── DocumentPreview.tsx
└── lib/
    └── mongodb.ts
```

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn type-check` - Run TypeScript type checking

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.

## Acknowledgments

- OpenAI for providing the Vision API
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All the open-source libraries used in this project

## TODOs (QA/Code Review Action Items)

- [ ] Implement rate limiting on authentication endpoints to prevent brute-force and spam attacks.
- [ ] Centralize and import Mongoose schemas from `src/models` in all API routes (avoid schema duplication).
- [ ] Validate uploaded file type and size in image processing endpoints to prevent malicious uploads.
- [ ] Replace all `any[]` usages with explicit types for better type safety.
- [ ] Use generic error messages for authentication/signup to prevent user enumeration.
- [ ] Add email format validation (regex) to signup and authentication flows.
- [ ] Log client-side errors for easier debugging in production.
