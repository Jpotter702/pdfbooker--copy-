import { PDFForm } from "@/components/pdf-form";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">PDFBooker</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Transform web content into beautifully formatted PDF books with just a few clicks.
        </p>
        <PDFForm />
      </div>
    </main>
  );
}