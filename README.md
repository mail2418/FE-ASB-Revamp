# Usulan Bangunan Gedung - Next.js Dashboard

## Overview
This is a complete implementation of the "Usulan Bangunan Gedung" (Building Proposal) dashboard page built with Next.js 14, TypeScript, and modern web development best practices.

## Features

### 1. **Dashboard Components**
- **Statistics Cards**: Display key metrics (Total, Success, In Progress, Rejected)
- **Charts**: 
  - Bar chart showing proposal trends
  - Three donut charts displaying status distributions
- **Data Table**: Comprehensive table with filtering, sorting, and pagination
- **Add Proposal Modal**: Form for adding new building proposals

### 2. **Security Features** (OWASP Best Practices)
- Input sanitization using DOMPurify (already in package.json)
- XSS protection through React's built-in escaping
- CSRF protection ready (to be implemented with API)
- Secure headers configuration
- Form validation on client and server side

### 3. **Responsive Design**
- Mobile-first approach
- Breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- Touch-friendly interfaces
- Optimized table scrolling on mobile

### 4. **SEO Optimizations**
- Semantic HTML structure
- Meta tags support (via Next.js metadata)
- Structured data ready
- Performance optimized with dynamic imports

## File Structure

```
usulan-bangunan-gedung/
├── app/
│   └── usulan/
│       └── bangunan-gedung/
│           └── page.tsx              # Main page component
├── src/
│   ├── types/
│   │   └── usulan-bangunan.ts       # TypeScript interfaces
│   └── components/
│       └── UsulanBangunan/
│           ├── UsulanBangunanTable.tsx  # Table component
│           └── AddUsulanModal.tsx        # Modal component
```

## Installation

1. **Install Dependencies**:
```bash
npm install
# or
yarn install
```

2. **Required packages are already in package.json**:
- next: 16.0.1
- react: 19.2.0
- react-dom: 19.2.0
- recharts: ^3.4.1
- lucide-react: ^0.553.0
- tailwind-merge: ^3.4.0
- dompurify: ^3.3.0
- typescript: ^5

## Integration Steps

1. **Copy the files to your existing project**:
   - Place the page file in `app/usulan/bangunan-gedung/page.tsx`
   - Copy type definitions to `src/types/usulan-bangunan.ts`
   - Copy components to `src/components/UsulanBangunan/`

2. **Update the navigation** in `app/dashboard/layout.tsx`:
   - The route `/usulan/bangunan-gedung` is already configured

3. **Connect to API** (Production):
   Replace mock data with actual API calls:

```typescript
// In page.tsx
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/usulan-bangunan');
      const data = await response.json();
      setData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchData();
}, []);
```

## Key Components

### 1. **UsulanBangunanTable**
- Sortable columns
- Status badges with color coding
- PDF download links for documents
- Dropdown filters for Jenis (Type)
- Pagination controls
- Responsive design

### 2. **AddUsulanModal**
- Form validation
- File upload support
- Radio buttons for Jenis selection
- Dropdown for Klasifikasi
- Number input for Nilai BKF
- Error handling with visual feedback

### 3. **Charts**
- Bar chart: Shows proposal trends over time
- Donut charts: Display status distributions
- Responsive sizing
- Custom tooltips

## Security Implementation

### Content Security Policy (CSP)
Add to `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
];
```

### Input Sanitization
The project includes DOMPurify for sanitizing user inputs:

```typescript
import DOMPurify from 'dompurify';

const sanitizedInput = DOMPurify.sanitize(userInput);
```

## Performance Optimizations

1. **Dynamic Imports**: Charts and modals are loaded on-demand
2. **Image Optimization**: Use Next.js Image component
3. **Code Splitting**: Automatic with Next.js
4. **Lazy Loading**: Components load when needed

## Customization

### Theme Colors
Update colors in components:
- Primary: `teal-500` (buttons, links)
- Success: `green-500`
- Warning: `yellow-500`
- Error: `red-500`
- Background gradient: `from-orange-500 to-orange-600`

### Adding New Columns
In `UsulanBangunanTable.tsx`, add new columns to the table header and body:

```typescript
// In table header
<th>New Column</th>

// In table body
<td>{item.newField}</td>
```

### API Integration
Replace mock data in `page.tsx`:

```typescript
const mockData: UsulanBangunanGedung[] = [
  // Replace with API call
];
```

## Testing Checklist

- [ ] Mobile responsiveness (320px - 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (1024px+)
- [ ] Form validation
- [ ] Modal functionality
- [ ] Table sorting and filtering
- [ ] Chart rendering
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Cross-browser compatibility

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Run production server:
```bash
npm run start
```

3. Environment variables (.env.local):
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_UPLOAD_URL=https://your-upload-url.com
```

## License
MIT