import './globals.css'

export const metadata = {
  title: 'FoodDash MVP',
  description: 'A food delivery app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}