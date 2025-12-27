export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-brand-gray-600">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center justify-between">
          <div>
            <div className="font-semibold text-brand-gray-800">Baol Academic Journal</div>
            <div>ISSN: XXXX-XXXX • Publication bimestrielle</div>
          </div>
          <div className="text-brand-gray-500">
            © {new Date().getFullYear()} Baol Academic Journal Platform. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}
